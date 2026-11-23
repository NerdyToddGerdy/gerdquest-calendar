// Multiple save slots: one per campaign run (campaign + start date).
//   questender.slots          → SlotMeta[] index
//   questender.slot.<slotId>  → GameState
// The single-save format from v1 (questender.save.v1) is migrated on first load.
import { toISO, type ISODate } from '@questender/engine/calendar'
import { alignedOnOrBefore, campaign, DEFAULT_CAMPAIGN, defaultStartDate, pageDate } from '@questender/engine/campaign'
import type { GameState, JournalEntry } from '@questender/engine/types'
import { loadEntries, sanitizeEntries, type CalendarEntry } from './calendarNotes'

const INDEX_KEY = 'questender.slots'
const SLOT_PREFIX = 'questender.slot.'
const LEGACY_KEY = 'questender.save.v1'

export interface SlotMeta {
  slotId: string
  campaignId: string
  startDate: string
  heroName: string
  updated: number
}

export function slotIdFor(campaignId: string, startDate: string): string {
  return `${campaignId}-${startDate}`
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable (private mode etc.) — play continues unsaved */
  }
}

function remove(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/** Shape of saves from before start dates replaced play years. */
type LegacyFields = { playYear?: number }

/**
 * Fill in fields added since v1 (campaign, start date, ruleset, journal).
 * - Saves with a play year start on the anchor weekday on/before Jan 1 of
 *   that year (keeps everything they'd unlocked, and aligns weekdays).
 * - Saves with neither start a week back from `today`, like a new campaign.
 * The journal is rebuilt from whatever log history survived.
 */
export function normalizeState(raw: GameState, today: ISODate): GameState {
  const s = { ...raw } as GameState & LegacyFields
  if (!s.campaignId) s.campaignId = DEFAULT_CAMPAIGN
  if (!s.startDate) {
    const c = campaign(s.campaignId)
    s.startDate = s.playYear ? alignedOnOrBefore(c, toISO(s.playYear, 1, 1)) : defaultStartDate(c, today)
  }
  delete s.playYear
  if (!s.rulesetId) s.rulesetId = campaign(s.campaignId).rulesetId
  if (!Array.isArray(s.journal)) {
    const c = campaign(s.campaignId)
    const journal: JournalEntry[] = []
    for (let page = 0; page < Math.min(s.dayIndex, c.pages.length); page++) {
      journal.push({
        page,
        date: pageDate(c, page, s.startDate),
        lines: s.log.filter((e) => e.day === page).map((e) => e.text).reverse(),
      })
    }
    s.journal = journal
  }
  return s
}

function validState(s: GameState | null): s is GameState {
  return !!s && s.version === 1 && !!s.hero
}

export function listSlots(): SlotMeta[] {
  return (read<SlotMeta[]>(INDEX_KEY) ?? []).sort((a, b) => b.updated - a.updated)
}

export function loadSlot(slotId: string, today: ISODate): GameState | null {
  const s = read<GameState>(SLOT_PREFIX + slotId)
  return validState(s) ? normalizeState(s, today) : null
}

export function saveSlot(s: GameState): string | null {
  if (!s.hero) return null
  const slotId = slotIdFor(s.campaignId, s.startDate)
  write(SLOT_PREFIX + slotId, s)
  const meta: SlotMeta = { slotId, campaignId: s.campaignId, startDate: s.startDate, heroName: s.hero.name, updated: Date.now() }
  write(INDEX_KEY, [meta, ...listSlots().filter((m) => m.slotId !== slotId)])
  return slotId
}

export function deleteSlot(slotId: string) {
  remove(SLOT_PREFIX + slotId)
  write(INDEX_KEY, listSlots().filter((m) => m.slotId !== slotId))
}

/** A campaign can run more than once, but only once per start date. */
export function slotExists(campaignId: string, startDate: string): boolean {
  return listSlots().some((m) => m.slotId === slotIdFor(campaignId, startDate))
}

/** Re-key slots saved under the old campaign-year ids. Run once at startup. */
export function migrateYearSlots(today: ISODate) {
  for (const m of listSlots() as (SlotMeta & LegacyFields)[]) {
    if (m.startDate) continue
    const s = read<GameState>(SLOT_PREFIX + m.slotId)
    remove(SLOT_PREFIX + m.slotId)
    write(INDEX_KEY, listSlots().filter((x) => x.slotId !== m.slotId))
    if (validState(s)) saveSlot(normalizeState(s, today))
  }
}

/** Move a v1 single save into a slot (once). Returns the slot id if migrated. */
export function migrateLegacySave(today: ISODate): string | null {
  migrateYearSlots(today)
  const legacy = read<GameState>(LEGACY_KEY)
  if (!validState(legacy)) return null
  const s = normalizeState(legacy, today)
  const id = slotExists(s.campaignId, s.startDate) ? null : saveSlot(s)
  remove(LEGACY_KEY)
  return id
}

function download(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

export function exportSave(s: GameState) {
  download(s, `questender-${s.campaignId}-${s.startDate}-page${s.dayIndex + 1}.json`)
}

/** One file holding every campaign on the desk. */
export interface SaveBundle {
  format: 'questender.bundle'
  version: 1
  exportedOn: ISODate
  campaigns: GameState[]
  /** The player's desk-wide calendar entries (optional; older bundles lack it). */
  calendar?: CalendarEntry[]
}

export function bundleSaves(states: GameState[], exportedOn: ISODate, calendar: CalendarEntry[] = []): SaveBundle {
  const bundle: SaveBundle = { format: 'questender.bundle', version: 1, exportedOn, campaigns: states }
  if (calendar.length) bundle.calendar = calendar
  return bundle
}

export function exportAll(states: GameState[], today: ISODate) {
  download(bundleSaves(states, today, loadEntries()), `questender-all-${today}.json`)
}

/** Calendar entries carried by an export file (none for single-campaign files). */
export function parseCalendar(text: string): CalendarEntry[] {
  try {
    const raw = JSON.parse(text) as Partial<SaveBundle> | null
    return raw?.format === 'questender.bundle' ? sanitizeEntries(raw.calendar) : []
  } catch {
    return []
  }
}

/**
 * Parse an export: either a single campaign or an all-campaigns bundle.
 * Throws if the file (or any campaign in it) isn't a valid save.
 */
export function parseSaves(text: string, today: ISODate): GameState[] {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('Not a Questender save file.')
  }
  const bundle = raw as Partial<SaveBundle> | null
  const list = bundle?.format === 'questender.bundle' && Array.isArray(bundle.campaigns) ? bundle.campaigns : [raw as GameState]
  if (!list.length) throw new Error('This export has no campaigns in it.')
  return list.map((s) => {
    if (!validState(s)) throw new Error('Not a Questender save file.')
    const n = normalizeState(s, today)
    campaign(n.campaignId) // throws for unknown campaigns
    return n
  })
}

export async function importSaves(file: File, today: ISODate): Promise<GameState[]> {
  return parseSaves(await file.text(), today)
}

/** Read an export file: its campaigns plus any calendar entries. */
export async function importFile(file: File, today: ISODate): Promise<{ states: GameState[]; calendar: CalendarEntry[] }> {
  const text = await file.text()
  return { states: parseSaves(text, today), calendar: parseCalendar(text) }
}
