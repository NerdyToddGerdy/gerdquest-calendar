// Pure, offline almanac: US holidays/observances and moon phases for a date.
import { addDays, toISO, weekday, type ISODate } from './calendar'

/** The date of the nth (1-based) given weekday (0 = Sun) in a month. */
function nthWeekday(year: number, month: number, dow: number, n: number): ISODate {
  const first = toISO(year, month, 1)
  return addDays(first, (dow - weekday(first) + 7) % 7 + (n - 1) * 7)
}

/** The last given weekday of a month. */
function lastWeekday(year: number, month: number, dow: number): ISODate {
  const next = month === 12 ? toISO(year + 1, 1, 1) : toISO(year, month + 1, 1)
  const last = addDays(next, -1)
  return addDays(last, -((weekday(last) - dow + 7) % 7))
}

/** Easter Sunday (Gregorian computus, Meeus/Jones/Butcher). */
export function easter(year: number): ISODate {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return toISO(year, month, day)
}

const holidayCache = new Map<number, Map<ISODate, string[]>>()

function holidayMap(year: number): Map<ISODate, string[]> {
  const hit = holidayCache.get(year)
  if (hit) return hit
  const map = new Map<ISODate, string[]>()
  const add = (d: ISODate, name: string) => map.set(d, [...(map.get(d) ?? []), name])
  add(toISO(year, 1, 1), "New Year's Day")
  add(nthWeekday(year, 1, 1, 3), 'Martin Luther King Jr. Day')
  add(toISO(year, 2, 14), "Valentine's Day")
  add(nthWeekday(year, 2, 1, 3), "Presidents' Day")
  add(toISO(year, 3, 17), "St. Patrick's Day")
  add(easter(year), 'Easter')
  add(nthWeekday(year, 5, 0, 2), "Mother's Day")
  add(lastWeekday(year, 5, 1), 'Memorial Day')
  add(nthWeekday(year, 6, 0, 3), "Father's Day")
  if (year >= 2021) add(toISO(year, 6, 19), 'Juneteenth')
  add(toISO(year, 7, 4), 'Independence Day')
  add(nthWeekday(year, 9, 1, 1), 'Labor Day')
  add(nthWeekday(year, 10, 1, 2), "Columbus / Indigenous Peoples' Day")
  add(toISO(year, 10, 31), 'Halloween')
  add(toISO(year, 11, 11), 'Veterans Day')
  add(nthWeekday(year, 11, 4, 4), 'Thanksgiving')
  add(toISO(year, 12, 25), 'Christmas')
  add(toISO(year, 12, 31), "New Year's Eve")
  holidayCache.set(year, map)
  return map
}

/** Holidays and observances falling on a date (usually zero or one). */
export function holidaysOn(d: ISODate): string[] {
  return holidayMap(Number(d.slice(0, 4))).get(d) ?? []
}

export type MoonPhase = 'new' | 'first' | 'full' | 'last'
export const MOON_NAME: Record<MoonPhase, string> = { new: 'New moon', first: 'First quarter', full: 'Full moon', last: 'Last quarter' }
export const MOON_GLYPH: Record<MoonPhase, string> = { new: '🌑', first: '🌓', full: '🌕', last: '🌗' }

const rad = (deg: number) => (deg * Math.PI) / 180

/** Julian date (UT) of a principal phase; k counts new moons since 2000-01-06 (quarters add .25 steps). Meeus ch. 49. */
export function phaseJD(k: number): number {
  const T = k / 1236.85
  const E = 1 - 0.002516 * T - 0.0000074 * T * T
  const M = rad(2.5534 + 29.1053567 * k)
  const Mp = rad(201.5643 + 385.81693528 * k)
  const F = rad(160.7108 + 390.67050284 * k)
  const frac = k - Math.floor(k)
  const jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T
  let c: number
  if (frac === 0 || frac === 0.5) {
    const full = frac === 0.5
    c =
      (full ? -0.40614 : -0.4072) * Math.sin(Mp) +
      (full ? 0.17302 : 0.17241) * E * Math.sin(M) +
      (full ? 0.01614 : 0.01608) * Math.sin(2 * Mp) +
      (full ? 0.01043 : 0.01039) * Math.sin(2 * F) +
      (full ? 0.00734 : 0.00739) * E * Math.sin(Mp - M) -
      (full ? 0.00515 : 0.00514) * E * Math.sin(Mp + M) +
      (full ? 0.00209 : 0.00208) * E * E * Math.sin(2 * M)
  } else {
    c =
      -0.62801 * Math.sin(Mp) +
      0.17172 * E * Math.sin(M) -
      0.01183 * E * Math.sin(Mp + M) +
      0.00862 * Math.sin(2 * Mp) +
      0.00804 * Math.sin(2 * F) +
      0.00454 * E * Math.sin(Mp - M) +
      0.00204 * E * E * Math.sin(2 * M) -
      0.0018 * Math.sin(Mp - 2 * F) -
      0.0007 * Math.sin(Mp + 2 * F)
    const W = 0.00306 - 0.00038 * E * Math.cos(M) + 0.00026 * Math.cos(Mp) - 0.00002 * Math.cos(Mp - M) + 0.00002 * Math.cos(Mp + M) + 0.00002 * Math.cos(2 * F)
    c += frac === 0.25 ? W : -W
  }
  return jde + c
}

const PHASES: MoonPhase[] = ['new', 'first', 'full', 'last']
const moonCache = new Map<number, Map<ISODate, MoonPhase>>()

function moonMap(year: number): Map<ISODate, MoonPhase> {
  const hit = moonCache.get(year)
  if (hit) return hit
  const map = new Map<ISODate, MoonPhase>()
  const k0 = Math.floor((year - 2000) * 12.3685) - 1
  for (let q = k0 * 4; q < (k0 + 14) * 4; q++) {
    const jd = phaseJD(q / 4)
    const t = new Date((jd - 2440587.5) * 86400000) // local calendar date of the instant
    const iso = toISO(t.getFullYear(), t.getMonth() + 1, t.getDate())
    if (iso.startsWith(String(year))) map.set(iso, PHASES[((q % 4) + 4) % 4])
  }
  moonCache.set(year, map)
  return map
}

/** The principal moon phase occurring on this local date, if any. */
export function moonOn(d: ISODate): MoonPhase | null {
  return moonMap(Number(d.slice(0, 4))).get(d) ?? null
}
