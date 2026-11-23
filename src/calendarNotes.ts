// The player's own calendar entries. Desk-wide (not per campaign), kept in
// localStorage under one key. Entries may sit on any date, including future
// ones; they never touch campaign content.
import type { ISODate } from './engine/calendar'

const KEY = 'questender.calendar'
export const CALENDAR_EVENT = 'questender:calendar'

export interface CalendarEntry {
  id: string
  date: ISODate
  text: string
  /** Optional 'HH:MM' (24h). */
  time?: string
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

/** Keep only well-formed entries (storage and imports are untrusted). */
export function sanitizeEntries(raw: unknown): CalendarEntry[] {
  if (!Array.isArray(raw)) return []
  const out: CalendarEntry[] = []
  for (const r of raw) {
    const e = r as Partial<CalendarEntry> | null
    if (!e || typeof e.id !== 'string' || typeof e.date !== 'string' || typeof e.text !== 'string') continue
    if (!e.id || !DATE_RE.test(e.date) || !e.text.trim()) continue
    const entry: CalendarEntry = { id: e.id, date: e.date, text: e.text.trim().slice(0, 500) }
    if (typeof e.time === 'string' && TIME_RE.test(e.time)) entry.time = e.time
    out.push(entry)
  }
  return out
}

/** Union by id; existing entries win over incoming duplicates. */
export function mergeEntries(existing: CalendarEntry[], incoming: CalendarEntry[]): CalendarEntry[] {
  const seen = new Set(existing.map((e) => e.id))
  const out = [...existing]
  for (const e of incoming) {
    if (seen.has(e.id)) continue
    seen.add(e.id)
    out.push(e)
  }
  return out
}

/** Entries on a date, timed ones in clock order after untimed ones. */
export function entriesOn(list: CalendarEntry[], date: ISODate): CalendarEntry[] {
  return list.filter((e) => e.date === date).sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
}

export function newEntryId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function loadEntries(): CalendarEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? sanitizeEntries(JSON.parse(raw)) : []
  } catch {
    return []
  }
}

export function saveEntries(list: CalendarEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* storage unavailable — entries last for this session only */
  }
  try {
    window.dispatchEvent(new Event(CALENDAR_EVENT))
  } catch {
    /* no window (tests/SSR) */
  }
}

/** Merge entries from an import into storage; returns the merged list. */
export function importEntries(incoming: unknown): CalendarEntry[] {
  const merged = mergeEntries(loadEntries(), sanitizeEntries(incoming))
  saveEntries(merged)
  return merged
}
