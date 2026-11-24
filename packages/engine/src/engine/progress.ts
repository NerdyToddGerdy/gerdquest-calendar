// Desk-wide progress record (one per device): days played across every
// campaign, the last visit, weekly chests, achievements and the legacy marks
// seen. Rewards for length of play are NOT here: they belong to each campaign
// run (see rewards.ts). Everything takes its dates as arguments; nothing reads
// the clock. Days played reward showing up, never unbroken streaks.
import { addDays, daysBetween, weekStart, type ISODate } from './calendar'
import { playedDates } from './state'
import { DEFAULT_AVATAR, DEFAULT_BORDER, GILDED_ACHIEVEMENT, GILDED_BORDER, tokenUnlocksFor } from './tokens'
import type { GameState } from './types'

export interface Dated {
  id: string
  date: ISODate
}

export interface ChestRecord {
  /** Monday of the week the chest belongs to. */
  week: ISODate
  campaignId: string
  /** The day it was opened. */
  date: ISODate
}

export interface Progress {
  version: 1
  /** Distinct dates on which a page of any campaign was completed, sorted. */
  days: ISODate[]
  lastVisit: ISODate | null
  /** The date the player came back after a long absence (drives "Well rested"). */
  returnedOn: ISODate | null
  chests: ChestRecord[]
  achievements: Dated[]
  /** Legacy mark ids seen in any run, so "both endings across runs" survives deleting a run. */
  marks: string[]
  /** Hero tokens earned (by hero id) and when. */
  avatars: Dated[]
  /** Borders and emblem tokens earned and when. */
  borders: Dated[]
  /** The token shown top right: chosen avatar and border (ids). */
  token: { avatar: string; border: string }
}

export const AWAY_DAYS = 3
export const CHEST_DAYS = 5

export function emptyProgress(): Progress {
  return { version: 1, days: [], lastVisit: null, returnedOn: null, chests: [], achievements: [], marks: [], avatars: [], borders: [], token: { avatar: DEFAULT_AVATAR, border: DEFAULT_BORDER } }
}

const ISO = /^\d{4}-\d{2}-\d{2}$/
const isDate = (v: unknown): v is ISODate => typeof v === 'string' && ISO.test(v)
const uniqSorted = (xs: string[]) => [...new Set(xs)].sort()

/** Keep only well-formed fields (storage and imports are untrusted). */
export function sanitizeProgress(raw: unknown): Progress {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof Progress, unknown>>
  const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
  const dated = (v: unknown): Dated[] =>
    arr(v).flatMap((x) => {
      const d = x as Partial<Dated> | null
      return d && typeof d.id === 'string' && isDate(d.date) ? [{ id: d.id, date: d.date }] : []
    })
  return {
    version: 1,
    days: uniqSorted(arr(r.days).filter(isDate)),
    lastVisit: isDate(r.lastVisit) ? r.lastVisit : null,
    returnedOn: isDate(r.returnedOn) ? r.returnedOn : null,
    chests: arr(r.chests).flatMap((x) => {
      const c = x as Partial<ChestRecord> | null
      return c && isDate(c.week) && isDate(c.date) && typeof c.campaignId === 'string' ? [{ week: c.week, campaignId: c.campaignId, date: c.date }] : []
    }),
    achievements: dedupeEarliest(dated(r.achievements)),
    marks: uniqSorted(arr(r.marks).filter((m): m is string => typeof m === 'string')),
    avatars: dedupeEarliest(dated(r.avatars)),
    borders: dedupeEarliest(dated(r.borders)),
    token: sanitizeToken(r.token),
  }
}

function sanitizeToken(raw: unknown): Progress['token'] {
  const t = (raw && typeof raw === 'object' ? raw : {}) as Partial<Progress['token']>
  const id = (v: unknown, fallback: string) => (typeof v === 'string' && v.length > 0 && v.length <= 64 ? v : fallback)
  return { avatar: id(t.avatar, DEFAULT_AVATAR), border: id(t.border, DEFAULT_BORDER) }
}

function dedupeEarliest(list: Dated[]): Dated[] {
  const by = new Map<string, Dated>()
  for (const d of list) {
    const prev = by.get(d.id)
    if (!prev || d.date < prev.date) by.set(d.id, d)
  }
  return [...by.values()].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
}

/** Combine two records (import onto this device): union of days, marks and achievements; earliest dates win. */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const chests = new Map<ISODate, ChestRecord>()
  for (const c of [...a.chests, ...b.chests]) {
    const prev = chests.get(c.week)
    if (!prev || c.date < prev.date) chests.set(c.week, c)
  }
  const later = (x: ISODate | null, y: ISODate | null) => (x && y ? (x > y ? x : y) : (x ?? y))
  return {
    version: 1,
    days: uniqSorted([...a.days, ...b.days]),
    lastVisit: later(a.lastVisit, b.lastVisit),
    returnedOn: later(a.returnedOn, b.returnedOn),
    chests: [...chests.values()].sort((x, y) => x.week.localeCompare(y.week)),
    achievements: dedupeEarliest([...a.achievements, ...b.achievements]),
    marks: uniqSorted([...a.marks, ...b.marks]),
    avatars: dedupeEarliest([...a.avatars, ...b.avatars]),
    borders: dedupeEarliest([...a.borders, ...b.borders]),
    // The choice on this device wins; a device still on the plain token takes the imported choice.
    token: a.token.avatar === DEFAULT_AVATAR && a.token.border === DEFAULT_BORDER ? b.token : a.token,
  }
}

/**
 * Fold the campaigns' own days, legacy marks and token unlocks into the record
 * (never future dates). Same object when nothing changed.
 */
export function syncProgress(p: Progress, states: GameState[], today: ISODate): Progress {
  const days = uniqSorted([...p.days, ...states.flatMap(playedDates)].filter((d) => d <= today))
  const marks = uniqSorted([...p.marks, ...states.flatMap((s) => s.legacy ?? [])])
  // A hero's token is earned by playing that hero, however they came to the run (start, hero pick, prologue).
  const heroes = states.flatMap((s) => (s.hero ? [s.hero.defId] : []))
  const unlocked = states.flatMap((s) => tokenUnlocksFor(s.campaignId, playedDates(s).length))
  if (p.achievements.some((a) => a.id === GILDED_ACHIEVEMENT)) unlocked.push(GILDED_BORDER)
  const isEmblem = (id: string) => id.endsWith('-emblem')
  const avatars = addDated(p.avatars, [...heroes, ...unlocked.filter(isEmblem)], today)
  const borders = addDated(p.borders, unlocked.filter((id) => !isEmblem(id)), today)
  const same = days.length === p.days.length && marks.length === p.marks.length && avatars === p.avatars && borders === p.borders
  return same ? p : { ...p, days, marks, avatars, borders }
}

function addDated(list: Dated[], ids: string[], today: ISODate): Dated[] {
  const fresh = [...new Set(ids)].filter((id) => !list.some((d) => d.id === id))
  return fresh.length ? [...list, ...fresh.map((id) => ({ id, date: today }))] : list
}

/** Note a visit. Coming back after AWAY_DAYS or more records the return date. */
export function recordVisit(p: Progress, today: ISODate): Progress {
  const away = p.lastVisit !== null && daysBetween(p.lastVisit, today) >= AWAY_DAYS
  const lastVisit = p.lastVisit && p.lastVisit > today ? p.lastVisit : today
  const returnedOn = away ? today : p.returnedOn
  if (lastVisit === p.lastVisit && returnedOn === p.returnedOn) return p
  return { ...p, lastVisit, returnedOn }
}

/** Is the player owed a "Well rested" welcome today? */
export function welcomeDue(p: Progress, today: ISODate): boolean {
  return p.returnedOn === today
}

export function daysInWeek(p: Progress, week: ISODate): number {
  return p.days.filter((d) => weekStart(d) === week).length
}

/**
 * Weeks whose chest may be opened now: this week and last (so catching up on
 * last week's pages still counts), each with CHEST_DAYS days played and not
 * yet opened. Oldest first.
 */
export function chestsAvailable(p: Progress, today: ISODate): ISODate[] {
  const thisWeek = weekStart(today)
  const weeks = [addDays(thisWeek, -7), thisWeek]
  return weeks.filter((w) => daysInWeek(p, w) >= CHEST_DAYS && !p.chests.some((c) => c.week === w))
}

/** Record an opened chest (no-op when that week's chest is already open or not earned). */
export function recordChest(p: Progress, week: ISODate, campaignId: string, today: ISODate): Progress {
  if (!chestsAvailable(p, today).includes(week)) return p
  return { ...p, chests: [...p.chests, { week, campaignId, date: today }] }
}

export function recordAchievements(p: Progress, ids: string[], today: ISODate): Progress {
  const fresh = ids.filter((id) => !p.achievements.some((a) => a.id === id))
  return fresh.length ? { ...p, achievements: [...p.achievements, ...fresh.map((id) => ({ id, date: today }))] } : p
}
