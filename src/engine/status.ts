// Where a save stands relative to the real calendar: ready, behind, done for today, or not started.
import type { ISODate } from './calendar'
import { campaign, isPageUnlocked, pageCovers, pageDate, pageEndDate, unlockedThrough } from './campaign'
import { canAdvance } from './state'
import type { GameState } from './types'

export type SlotStatus =
  | { kind: 'complete' }
  | { kind: 'notStarted'; unlocks: ISODate }
  | { kind: 'behind'; behind: number; ready: boolean }
  | { kind: 'ready' }
  | { kind: 'done'; next: ISODate | null }

/** Is the page the save is sitting on unlocked (i.e. may it be shown at all)? */
export function currentPageUnlocked(s: GameState, today: ISODate): boolean {
  return isPageUnlocked(campaign(s.campaignId), s.dayIndex, s.startDate, today)
}

/** Date of the next page, if it exists and is still locked. */
export function nextPageLockedUntil(s: GameState, today: ISODate): ISODate | null {
  const c = campaign(s.campaignId)
  const next = s.dayIndex + 1
  if (next >= c.pages.length || isPageUnlocked(c, next, s.startDate, today)) return null
  return pageDate(c, next, s.startDate)
}

/** May the player turn the page right now? */
export function canTurnPage(s: GameState, today: ISODate): boolean {
  return canAdvance(s) && nextPageLockedUntil(s, today) === null
}

/**
 * Pages whose dates have fully passed but aren't completed yet.
 * The page covering today (e.g. a weekend page on Sunday) doesn't count.
 */
export function pagesBehind(s: GameState, today: ISODate): number {
  if (s.finished) return 0
  const c = campaign(s.campaignId)
  const last = unlockedThrough(c, s.startDate, today)
  const currentDone = canAdvance(s)
  let behind = 0
  for (let i = s.dayIndex; i <= last; i++) {
    if (i === s.dayIndex && currentDone) continue
    if (pageEndDate(c, i, s.startDate) < today) behind++
  }
  return behind
}

export function slotStatus(s: GameState, today: ISODate): SlotStatus {
  if (s.finished) return { kind: 'complete' }
  const c = campaign(s.campaignId)
  if (!currentPageUnlocked(s, today)) return { kind: 'notStarted', unlocks: pageDate(c, s.dayIndex, s.startDate) }
  const last = unlockedThrough(c, s.startDate, today)
  const behind = pagesBehind(s, today)
  const todayPending =
    last >= s.dayIndex &&
    pageCovers(c, last, s.startDate, today) &&
    !(last === s.dayIndex && canAdvance(s))
  if (behind > 0) return { kind: 'behind', behind, ready: todayPending }
  if (todayPending) return { kind: 'ready' }
  const next = s.dayIndex + 1 < c.pages.length ? pageDate(c, s.dayIndex + 1, s.startDate) : null
  return { kind: 'done', next }
}

export function statusLabel(st: SlotStatus): string {
  switch (st.kind) {
    case 'complete':
      return 'Complete'
    case 'notStarted':
      return 'Not started yet'
    case 'behind':
      return `${st.behind} to catch up`
    case 'ready':
      return 'Ready'
    case 'done':
      return 'Done for today'
  }
}
