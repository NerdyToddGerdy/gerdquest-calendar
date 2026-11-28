// Campaign registry and page-date logic.
//
// A campaign is authored against a real year (e.g. 2024), with each page on a
// month/day and weekend pages covering Saturday + Sunday. When a player
// starts a campaign, it's anchored to a real `startDate` that falls on the
// same weekday as the campaign's first page. Every page then shifts by the
// same number of days, so weekdays, weekend pages and the Sunday lottery all
// line up with the real calendar — no need to wait for January.
import { registerContent } from './content'
import { addDays, daysBetween, parseISO, toISO, weekday, type ISODate } from './calendar'
import { packVersion } from './packVersion'
import { rulesFor } from './ruleset'
import type { Campaign, CampaignEntry, Day } from './types'

const entries = new Map<string, CampaignEntry>()
const loaded = new Map<string, Campaign>()
const loaders = new Map<string, () => Promise<Campaign>>()
const inFlight = new Map<string, Promise<Campaign>>()
const versions = new Map<string, string>()

/** Campaign a new game starts in when nothing else is chosen. */
export const DEFAULT_CAMPAIGN = 'brightwatch'

/** How many days back a new campaign aims to start, giving warm-up pages to catch up on. */
export const WARMUP_DAYS = 7

/** Add a catalog entry (idempotent for the same id; a different entry with a taken id throws). */
export function registerCatalog(entry: CampaignEntry): void {
  const prev = entries.get(entry.id)
  if (prev === entry) return
  if (prev) throw new Error(`Duplicate campaign id: ${entry.id}`)
  entries.set(entry.id, entry)
}

/**
 * Add a loaded campaign (pages and content). Idempotent for the same object; a
 * different campaign with a taken id throws. Also catalogs it if needed.
 */
export function registerCampaign(c: Campaign): void {
  if (loaded.get(c.id) === c) return
  if (loaded.has(c.id)) throw new Error(`Duplicate campaign id: ${c.id}`)
  if (!entries.has(c.id)) registerCatalog(c)
  registerContent(c.id, c.content ?? {})
  loaded.set(c.id, c)
  versions.set(c.id, packVersion(c))
}

/** Content version stamp of a loaded campaign pack (see packVersion.ts); '' if it isn't loaded. */
export function contentVersion(id: string): string {
  return versions.get(id) ?? ''
}

/** Say how to fetch a campaign's pack later. The loader may import() it. */
export function registerCampaignLoader(id: string, loader: () => Promise<Campaign>): void {
  loaders.set(id, loader)
}

/**
 * Fetch a campaign's pack (if it isn't loaded yet) and register it. Concurrent
 * calls share one fetch; a failed fetch can be retried by calling again.
 */
export function loadCampaign(id: string): Promise<Campaign> {
  const done = loaded.get(id)
  if (done) return Promise.resolve(done)
  const running = inFlight.get(id)
  if (running) return running
  const loader = loaders.get(id)
  if (!loader) return Promise.reject(new Error(`Unknown campaign: ${id}`))
  const p = loader()
    .then((c) => {
      registerCampaign(c)
      return c
    })
    .finally(() => inFlight.delete(id))
  inFlight.set(id, p)
  return p
}

export function loadCampaigns(ids: Iterable<string>): Promise<Campaign[]> {
  return Promise.all([...new Set(ids)].map(loadCampaign))
}

export function isCampaignLoaded(id: string): boolean {
  return loaded.has(id)
}

/** The small always-available entry for a campaign (throws if it isn't in the catalog). */
export function campaignEntry(id: string): CampaignEntry {
  const e = entries.get(id)
  if (!e) throw new Error(`Unknown campaign: ${id}`)
  return e
}

/** Every known campaign, loaded or not. */
export function listCatalog(): CampaignEntry[] {
  return [...entries.values()]
}

/** The full campaign. Throws if it isn't in the catalog, or its pack hasn't been loaded yet. */
export function campaign(id: string): Campaign {
  const c = loaded.get(id)
  if (c) return c
  if (entries.has(id)) throw new Error(`Campaign not loaded yet: ${id} (await loadCampaign first)`)
  throw new Error(`Unknown campaign: ${id}`)
}

export function campaignPages(id: string): Day[] {
  return campaign(id).pages
}

/** Campaigns whose packs are loaded. */
export function listCampaigns(): Campaign[] {
  return [...loaded.values()]
}

/** Calendar days a page covers (weekend pages cover 2). */
export function pageSpan(c: Campaign, index: number): number {
  return Math.max(1, c.pages[index]?.span ?? 1)
}

/**
 * The date a page was authored for. Pages without an explicit date follow
 * on from the previous page (after its span).
 */
export function authoredDate(c: Campaign, index: number): ISODate {
  const p = c.pages[index]
  if (p?.month && p.day) return toISO(c.authoredYear, p.month, p.day)
  if (index === 0) return toISO(c.authoredYear, 1, 1)
  return addDays(authoredDate(c, index - 1), pageSpan(c, index - 1))
}

/** Real date a page unlocks, for a campaign anchored at `startDate`. */
export function pageDate(c: Campaign, index: number, startDate: ISODate): ISODate {
  return addDays(startDate, daysBetween(authoredDate(c, 0), authoredDate(c, index)))
}

/** Last real date a page covers (same as pageDate unless it's a weekend page). */
export function pageEndDate(c: Campaign, index: number, startDate: ISODate): ISODate {
  return addDays(pageDate(c, index, startDate), pageSpan(c, index) - 1)
}

/** Every real date a page covers. */
export function pageDates(c: Campaign, index: number, startDate: ISODate): ISODate[] {
  const first = pageDate(c, index, startDate)
  return Array.from({ length: pageSpan(c, index) }, (_, i) => addDays(first, i))
}

export function isPageUnlocked(c: Campaign, index: number, startDate: ISODate, today: ISODate): boolean {
  return index >= 0 && index < c.pages.length && pageDate(c, index, startDate) <= today
}

/** Index of the last page unlocked by `today`, or −1 if none yet. */
export function unlockedThrough(c: Campaign, startDate: ISODate, today: ISODate): number {
  let last = -1
  for (let i = 0; i < c.pages.length; i++) {
    if (pageDate(c, i, startDate) <= today) last = i
    else break
  }
  return last
}

/** Does `today` fall within the page's dates (e.g. Sunday of a weekend page)? */
export function pageCovers(c: Campaign, index: number, startDate: ISODate, date: ISODate): boolean {
  return pageDate(c, index, startDate) <= date && date <= pageEndDate(c, index, startDate)
}

/** The lottery is offered on any page that covers the ruleset's lottery weekday. */
export function isLotteryPage(c: Campaign, index: number, startDate: ISODate): boolean {
  if (index < 0 || index >= c.pages.length) return false
  const lot = rulesFor(c.rulesetId).lottery
  if (lot?.afterPrologue && index < (c.prologuePages ?? 0)) return false
  return !!lot && pageDates(c, index, startDate).some((d) => weekday(d) === lot.weekday)
}

/** Weekday (0 = Sunday) a campaign's first page was authored on. */
export function anchorWeekday(c: CampaignEntry): number {
  return weekday(c.firstDate)
}

/** The latest date on or before `date` that falls on the campaign's anchor weekday. */
export function alignedOnOrBefore(c: CampaignEntry, date: ISODate): ISODate {
  return addDays(date, -((weekday(date) - anchorWeekday(c) + 7) % 7))
}

// ---------- seasonal campaigns ----------

/** Is a seasonal campaign's month the month `today` is in? (Always true for year-round campaigns.) */
export function isInSeason(c: CampaignEntry, today: ISODate): boolean {
  return !c.season || parseISO(today).month === c.season.month
}

/** Day 1 of the campaign's season in `today`'s year (only for seasonal campaigns). */
export function seasonStart(c: CampaignEntry & { season: NonNullable<CampaignEntry['season']> }, today: ISODate): ISODate {
  return toISO(parseISO(today).year, c.season.month, 1)
}

/** Campaigns that can be started today: every year-round campaign, plus seasonal ones in their month. */
export function availableCatalog(today: ISODate): CampaignEntry[] {
  return listCatalog().filter((c) => isInSeason(c, today))
}

/** Seasonal campaigns in season today, for the New Campaign highlight. */
export function seasonalEvents(today: ISODate): CampaignEntry[] {
  return listCatalog().filter((c) => !!c.season && isInSeason(c, today))
}

/**
 * Seasonal campaigns in season today that have no run started this season
 * among `runs` (e.g. the desk's campaigns). Drives the festive New Campaign button.
 */
export function eventsToStart(today: ISODate, runs: { campaignId: string; startDate: ISODate }[]): CampaignEntry[] {
  return seasonalEvents(today).filter((c) => !runs.some((r) => r.campaignId === c.id && r.startDate === defaultStartDate(c, today)))
}

/** Days left in a seasonal campaign's month, counting today (0 out of season). */
export function seasonDaysLeft(c: CampaignEntry, today: ISODate): number {
  if (!c.season || !isInSeason(c, today)) return 0
  const { year, month } = parseISO(today)
  const last = toISO(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, 1)
  return daysBetween(today, last)
}

/**
 * Start date for a new campaign: the anchor-weekday date nearest to
 * WARMUP_DAYS ago, so there are 4–10 warm-up pages to catch up on. A seasonal
 * campaign always starts on day 1 of its month this year.
 */
export function defaultStartDate(c: CampaignEntry, today: ISODate): ISODate {
  if (c.season) return seasonStart(c as CampaignEntry & { season: NonNullable<CampaignEntry['season']> }, today)
  const target = addDays(today, -WARMUP_DAYS)
  const before = alignedOnOrBefore(c, target)
  const after = addDays(before, 7)
  return daysBetween(before, target) <= daysBetween(target, after) ? before : after
}

/** Start dates to offer: the default plus a week earlier / later (never after today). */
export function startDateOptions(c: CampaignEntry, today: ISODate): ISODate[] {
  if (c.season) return isInSeason(c, today) ? [defaultStartDate(c, today)] : []
  const d = defaultStartDate(c, today)
  return [addDays(d, 7), d, addDays(d, -7)].filter((x) => x <= today)
}
