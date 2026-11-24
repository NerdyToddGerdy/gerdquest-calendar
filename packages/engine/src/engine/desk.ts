// The "desk": every running campaign viewed on one shared date.
//
// The player moves a single date back and forth. For each campaign, the
// desk works out what that date shows (the page to play, a finished page,
// nothing yet, …). Moving forward is allowed when the SELECTED campaign
// is finished with the current date and the next date isn't in the future.
// Other campaigns may lag: moving forward turns the page only in campaigns
// that completed their page, and the rest show as "behind" until caught up.
import { addDays, type ISODate } from './calendar'
import { campaign, pageDate, pageEndDate } from './campaign'
import { canAdvance, reduce } from './state'
import type { GameState } from './types'

export type TabView =
  /** The campaign's first page comes after this date. */
  | { kind: 'notStarted'; begins: ISODate }
  /** The campaign's pages ended before this date (or the campaign is finished). */
  | { kind: 'finished' }
  /** A page already completed — shown read-only from the journal. */
  | { kind: 'past'; page: number }
  /** The page the campaign is on; playable. */
  | { kind: 'play'; page: number }
  /** Earlier pages are still unfinished; play those first. */
  | { kind: 'blocked'; page: number; catchUp: ISODate }

/** Index of the page covering `date`: −1 before the campaign, pages.length after it. */
export function pageIndexOn(s: GameState, date: ISODate): number {
  const c = campaign(s.campaignId)
  if (date < pageDate(c, 0, s.startDate)) return -1
  for (let i = 0; i < c.pages.length; i++) {
    if (date <= pageEndDate(c, i, s.startDate)) return i
  }
  return c.pages.length
}

export function tabView(s: GameState, date: ISODate): TabView {
  const c = campaign(s.campaignId)
  const i = pageIndexOn(s, date)
  if (i < 0) return { kind: 'notStarted', begins: pageDate(c, 0, s.startDate) }
  if (i < s.dayIndex) return { kind: 'past', page: i }
  if (i >= c.pages.length || s.finished) return { kind: 'finished' }
  if (i === s.dayIndex) return { kind: 'play', page: i }
  return { kind: 'blocked', page: i, catchUp: pageDate(c, s.dayIndex, s.startDate) }
}

/** Is this campaign finished with `date`? */
export function tabDone(s: GameState, date: ISODate): boolean {
  const v = tabView(s, date)
  if (v.kind === 'play') return canAdvance(s)
  return v.kind !== 'blocked'
}

/** Every campaign is finished with `date`. */
export function dayComplete(states: GameState[], date: ISODate): boolean {
  return states.every((s) => tabDone(s, date))
}

/**
 * The › arrow: the selected campaign has nothing left to do on `date` and the
 * next date isn't in the future. Other campaigns may lag behind.
 */
export function canGoForward(selected: GameState | undefined, date: ISODate, today: ISODate): boolean {
  return !!selected && date < today && tabDone(selected, date)
}

/**
 * Unfinished pages a campaign owes as of `date`: pages that start on or before
 * `date` and aren't completed. Never counts pages after `date`.
 */
export function pagesOwed(s: GameState, date: ISODate): number {
  if (s.finished) return 0
  const c = campaign(s.campaignId)
  const last = Math.min(pageIndexOn(s, date), c.pages.length - 1)
  let n = 0
  for (let i = s.dayIndex; i <= last; i++) {
    if (i === s.dayIndex && canAdvance(s)) continue
    n++
  }
  return n
}

/** Every campaign shows the same page on both dates (e.g. Saturday and Sunday of a weekend page). */
function samePages(states: GameState[], a: ISODate, b: ISODate): boolean {
  return states.every((s) => pageIndexOn(s, a) === pageIndexOn(s, b))
}

/**
 * The date the › arrow moves to: the next day, skipping days that only
 * continue a page already showing in every campaign (the Sunday half of a
 * weekend page). Never past `today`.
 */
export function nextDeskDate(states: GameState[], date: ISODate, today: ISODate): ISODate {
  let d = addDays(date, 1)
  while (d < today && samePages(states, d, addDays(d, -1))) d = addDays(d, 1)
  return d
}

/** The last date the page(s) showing on `date` cover, across every campaign (a weekend page runs to Sunday). */
export function deskSpanEnd(states: GameState[], date: ISODate): ISODate {
  let d = date
  // Past every campaign's last page all dates look alike (index = pages.length), so the range ends there.
  const live = (day: ISODate) => states.some((s) => pageIndexOn(s, day) < campaign(s.campaignId).pages.length)
  while (states.length && live(d) && samePages(states, addDays(d, 1), d)) d = addDays(d, 1)
  return d
}

/** The date the ‹ arrow moves to: the previous day, landing on the first day of a multi-day page. Never before `earliest`. */
export function prevDeskDate(states: GameState[], date: ISODate, earliest: ISODate): ISODate {
  let d = addDays(date, -1)
  while (d > earliest && samePages(states, d, addDays(d, -1))) d = addDays(d, -1)
  return d
}

/** Earliest date a campaign still needs played, or null when it's caught up / finished. */
export function firstOpenDate(s: GameState): ISODate | null {
  if (s.finished) return null
  const c = campaign(s.campaignId)
  if (s.dayIndex >= c.pages.length) return null
  if (canAdvance(s)) return addDays(pageEndDate(c, s.dayIndex, s.startDate), 1)
  return pageDate(c, s.dayIndex, s.startDate)
}

/** Where the desk opens: the earliest date anything still needs playing, never after today. */
export function startingDate(states: GameState[], today: ISODate): ISODate {
  let d = today
  for (const s of states) {
    const open = firstOpenDate(s)
    if (open && open < d) d = open
  }
  return d
}

/** Earliest date worth showing (the earliest campaign start). */
export function earliestDate(states: GameState[], today: ISODate): ISODate {
  let d = today
  for (const s of states) {
    const first = pageDate(campaign(s.campaignId), 0, s.startDate)
    if (first < d) d = first
  }
  return d
}

/**
 * Move one campaign past `date`: if its current page ends on `date` and is
 * complete, turn the page (recording the journal entry).
 */
export function turnPast(s: GameState, date: ISODate): GameState {
  const v = tabView(s, date)
  if (v.kind !== 'play' || !canAdvance(s)) return s
  const c = campaign(s.campaignId)
  if (pageEndDate(c, v.page, s.startDate) !== date) return s
  return reduce(s, { type: 'NEXT_DAY', today: addDays(date, 1) })
}

/** Turn pages for every date from `from` up to (not including) `to`, as the › arrow passes them. */
export function turnThrough(s: GameState, from: ISODate, to: ISODate): GameState {
  for (let d = from; d < to; d = addDays(d, 1)) s = turnPast(s, d)
  return s
}

/** Does this campaign have something to play on `date`? */
export function needsPlay(s: GameState, date: ISODate): boolean {
  return tabView(s, date).kind === 'play' && !canAdvance(s)
}

/** Keep the chosen tab if it has work on `date`, otherwise pick the first tab that does. */
export function pickTab<T extends { id: string; state: GameState }>(slots: T[], date: ISODate, preferred: string | null): string | null {
  const pref = slots.find((s) => s.id === preferred)
  if (pref && needsPlay(pref.state, date)) return pref.id
  return slots.find((s) => needsPlay(s.state, date))?.id ?? pref?.id ?? slots[0]?.id ?? null
}

/** What the calendar shows for one campaign on one date. */
export type DayStatus = 'none' | 'completed' | 'available' | 'locked'

/**
 * - none: the campaign has no page on this date (before it starts / after it ends)
 * - completed: that page is done
 * - available: the page's date has arrived but it isn't done yet
 * - locked: the page's date is still in the future
 */
export function dayStatus(s: GameState, date: ISODate, today: ISODate): DayStatus {
  const c = campaign(s.campaignId)
  const i = pageIndexOn(s, date)
  if (i < 0 || i >= c.pages.length) return 'none'
  if (i < s.dayIndex || s.finished || (i === s.dayIndex && canAdvance(s))) return 'completed'
  return pageDate(c, i, s.startDate) <= today ? 'available' : 'locked'
}
