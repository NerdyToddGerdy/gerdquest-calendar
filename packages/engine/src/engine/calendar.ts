// Pure date math. Dates are ISO strings ('YYYY-MM-DD') in the player's local
// calendar; nothing here reads the clock — "today" is always passed in.

export type ISODate = string

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad = (n: number, w = 2) => String(n).padStart(w, '0')

export function toISO(year: number, month: number, day: number): ISODate {
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`
}

export function parseISO(d: ISODate): { year: number; month: number; day: number } {
  const [year, month, day] = d.split('-').map(Number)
  return { year, month, day }
}

/** The local date of a JS Date (used by the UI to produce "today"). */
export function localISO(date: Date): ISODate {
  return toISO(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(d: ISODate): number {
  const { year, month, day } = parseISO(d)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

export function addDays(d: ISODate, n: number): ISODate {
  const { year, month, day } = parseISO(d)
  const t = new Date(Date.UTC(year, month - 1, day + n))
  return toISO(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate())
}

/** Whole days from a to b (b − a). */
export function daysBetween(a: ISODate, b: ISODate): number {
  const pa = parseISO(a)
  const pb = parseISO(b)
  return Math.round((Date.UTC(pb.year, pb.month - 1, pb.day) - Date.UTC(pa.year, pa.month - 1, pa.day)) / 86400000)
}

/** "Sunday, Jan 7, 2024" */
export function formatLong(d: ISODate): string {
  const { year, month, day } = parseISO(d)
  return `${WEEKDAY_NAMES[weekday(d)]}, ${MONTH_NAMES[month - 1]} ${day}, ${year}`
}

/** "Sun, Jan 7" */
export function formatShort(d: ISODate): string {
  const { month, day } = parseISO(d)
  return `${WEEKDAY_NAMES[weekday(d)].slice(0, 3)}, ${MONTH_NAMES[month - 1]} ${day}`
}

/** "Sat, Jan 6 – Sun, Jan 7" for weekend pages, otherwise formatShort. */
export function formatSpan(first: ISODate, last: ISODate): string {
  return first === last ? formatShort(first) : `${formatShort(first)} – ${formatShort(last)}`
}
