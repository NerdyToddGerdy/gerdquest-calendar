// Page-writing helpers for The Verdant Accord. The compact helpers are shared
// with the Ember Road; this file adds the Verdant Accord's dater and a helper
// for legacy marks.
//
// Drafts carry no dates: `datePages` walks the real 2022 calendar from Jan 1,
// gives each draft the next date, and makes Saturday pages cover Saturday +
// Sunday. It throws (so every test fails loudly) if a draft lands in the
// wrong month, or a weekend draft (`wk`) misses a Saturday.
import { addDays, parseISO, weekday } from '../../../../engine/calendar'
import type { Day, Effect, Option } from '../../../../engine/types'
import type { Draft } from '../../emberroad/days/build'

export { boss, buff, check, check3, curse, dmg, fight, gold, haven, heal, item, levelUp, page, pick, plain, poison, task, travel, virtue, weekend } from '../../emberroad/days/build'
export type { Draft, Outcome } from '../../emberroad/days/build'

export const YEAR = 2022

/** Record a legacy mark. */
export const legacy = (id: string): Effect => ({ type: 'legacy', id })

/** Gate an option on a legacy mark ("va_l1_win", or "!va_l1_win" for its absence). */
export const needs = (requires: string, option: Option): Option => ({ ...option, requires })

export function datePages(start: string, months: [number, Draft[]][]): Day[] {
  const out: Day[] = []
  let d = start
  let n = 1
  for (const [month, drafts] of months) {
    for (const draft of drafts) {
      const { year, month: m, day } = parseISO(d)
      const sat = weekday(d) === 6
      if (year !== YEAR || m !== month) throw new Error(`Verdant Accord: "${draft.title}" lands on ${d}, not in month ${month}`)
      if (sat !== !!draft.wk) throw new Error(`Verdant Accord: "${draft.title}" lands on ${d}; weekend pages must fall on Saturdays and only there`)
      const { wk: _wk, ...rest } = draft
      void _wk
      out.push({ ...rest, id: `va-${n++}`, month: m, day, ...(sat ? { span: 2 } : {}) })
      d = addDays(d, sat ? 2 : 1)
    }
  }
  return out
}
