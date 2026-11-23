// Campaign registry and page-date logic.
//
// A campaign is authored against a real year (e.g. 2024), with each page on a
// month/day and weekend pages covering Saturday + Sunday. When a player
// starts a campaign, it's anchored to a real `startDate` that falls on the
// same weekday as the campaign's first page. Every page then shifts by the
// same number of days, so weekdays, weekend pages and the Sunday lottery all
// line up with the real calendar — no need to wait for January.
import { CAMPAIGNS } from '../content/campaigns'
import { addDays, daysBetween, toISO, weekday, type ISODate } from './calendar'
import { rulesFor } from './ruleset'
import type { Campaign, Day } from './types'

const byId = new Map(CAMPAIGNS.map((c) => [c.id, c]))

export const DEFAULT_CAMPAIGN = CAMPAIGNS[0].id

/** How many days back a new campaign aims to start, giving warm-up pages to catch up on. */
export const WARMUP_DAYS = 7

export function campaign(id: string): Campaign {
  const c = byId.get(id)
  if (!c) throw new Error(`Unknown campaign: ${id}`)
  return c
}

export function campaignPages(id: string): Day[] {
  return campaign(id).pages
}

export function listCampaigns(): Campaign[] {
  return CAMPAIGNS
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
export function anchorWeekday(c: Campaign): number {
  return weekday(authoredDate(c, 0))
}

/** The latest date on or before `date` that falls on the campaign's anchor weekday. */
export function alignedOnOrBefore(c: Campaign, date: ISODate): ISODate {
  return addDays(date, -((weekday(date) - anchorWeekday(c) + 7) % 7))
}

/**
 * Start date for a new campaign: the anchor-weekday date nearest to
 * WARMUP_DAYS ago, so there are 4–10 warm-up pages to catch up on.
 */
export function defaultStartDate(c: Campaign, today: ISODate): ISODate {
  const target = addDays(today, -WARMUP_DAYS)
  const before = alignedOnOrBefore(c, target)
  const after = addDays(before, 7)
  return daysBetween(before, target) <= daysBetween(target, after) ? before : after
}

/** Start dates to offer: the default plus a week earlier / later (never after today). */
export function startDateOptions(c: Campaign, today: ISODate): ISODate[] {
  const d = defaultStartDate(c, today)
  return [addDays(d, 7), d, addDays(d, -7)].filter((x) => x <= today)
}
