// Storage seam for cloud saves (#2, ADR 0004).
//
// `SaveStore` mirrors the functions in save.ts / calendarNotes.ts but async, so a
// cloud implementation (DynamoDB or Postgres behind an API) can slot in beside the
// localStorage one. App.tsx still calls save.ts directly; nothing is wired in yet.
// Engine logic stays synchronous: only the load/save edges become async.
import type { ISODate } from './engine/calendar'
import type { GameState } from './engine/types'
import { loadEntries, saveEntries, type CalendarEntry } from './calendarNotes'
import { deleteSlot, listSlots, loadSlot, saveSlot, type SlotMeta } from './save'

export interface SaveStore {
  listSlots(): Promise<SlotMeta[]>
  /** Null when the slot is missing or invalid. Returned state is already normalized. */
  loadSlot(slotId: string, today: ISODate): Promise<GameState | null>
  /** Returns the slot id, or null when there is nothing to save (no hero). */
  saveSlot(state: GameState): Promise<string | null>
  deleteSlot(slotId: string): Promise<void>
  loadCalendar(): Promise<CalendarEntry[]>
  saveCalendar(entries: CalendarEntry[]): Promise<void>
}

/** The existing localStorage behavior behind the async interface. */
export const localSaveStore: SaveStore = {
  async listSlots() {
    return listSlots()
  },
  async loadSlot(slotId, today) {
    return loadSlot(slotId, today)
  },
  async saveSlot(state) {
    return saveSlot(state)
  },
  async deleteSlot(slotId) {
    deleteSlot(slotId)
  },
  async loadCalendar() {
    return loadEntries()
  },
  async saveCalendar(entries) {
    saveEntries(entries)
  },
}
