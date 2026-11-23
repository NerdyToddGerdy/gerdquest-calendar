// Pure helpers for the calendar's Month / Wall / Week / Year navigation.
import { addDays, parseISO, toISO, weekday, type ISODate } from './calendar'

export type CalView = 'month' | 'wall' | 'week' | 'year'

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** Move a date by whole months, clamping the day (Jan 31 + 1 month = Feb 28/29). */
export function addMonths(d: ISODate, n: number): ISODate {
  const { year, month, day } = parseISO(d)
  const m = month - 1 + n
  const y = year + Math.floor(m / 12)
  const mo = ((m % 12) + 12) % 12 + 1
  return toISO(y, mo, Math.min(day, daysInMonth(y, mo)))
}

export function daysInMonth(year: number, month: number): number {
  return parseISO(addDays(toISO(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, 1), -1)).day
}

/** Step the cursor by one unit of the current view. */
export function shiftCursor(cursor: ISODate, view: CalView, n: number): ISODate {
  if (view === 'week') return addDays(cursor, 7 * n)
  if (view === 'year') return addMonths(cursor, 12 * n)
  return addMonths(cursor, n)
}

export function weekStart(d: ISODate): ISODate {
  return addDays(d, -weekday(d))
}

/** Dates shown in a month grid: whole weeks, 5 or 6 of them. */
export function monthCells(year: number, month: number): ISODate[] {
  const first = toISO(year, month, 1)
  const start = addDays(first, -weekday(first))
  const weeks = Math.ceil((weekday(first) + daysInMonth(year, month)) / 7)
  return Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i))
}

export function weekCells(d: ISODate): ISODate[] {
  const s = weekStart(d)
  return Array.from({ length: 7 }, (_, i) => addDays(s, i))
}

/** Heading text for the current view. */
export function viewTitle(cursor: ISODate, view: CalView): string {
  const { year, month } = parseISO(cursor)
  if (view === 'year') return String(year)
  if (view === 'week') {
    const a = parseISO(weekStart(cursor))
    const b = parseISO(addDays(weekStart(cursor), 6))
    const left = `${MONTHS[a.month - 1].slice(0, 3)} ${a.day}`
    const right = a.month === b.month ? `${b.day}` : `${MONTHS[b.month - 1].slice(0, 3)} ${b.day}`
    return `${left} – ${right}, ${b.year}`
  }
  return `${MONTHS[month - 1]} ${year}`
}

/** The unit's name for button labels. */
export const UNIT: Record<CalView, string> = { month: 'month', wall: 'month', week: 'week', year: 'year' }
