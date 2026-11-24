// Browser glue for save safety: persistent-storage request and backup bookkeeping.
// Every call is feature-detected and wrapped; none of it may block play.
import type { ISODate } from '@questender/engine/calendar'

const EXPORT_KEY = 'questender.lastExport'
const SNOOZE_KEY = 'questender.backupSnooze'

function getDate(key: string): ISODate | null {
  try {
    const v = localStorage.getItem(key)
    return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null
  } catch {
    return null
  }
}

function setDate(key: string, d: ISODate) {
  try {
    localStorage.setItem(key, d)
  } catch {
    /* storage unavailable: the reminder just reappears next visit */
  }
}

export const lastExportDate = () => getDate(EXPORT_KEY)
export const snoozedUntilDate = () => getDate(SNOOZE_KEY)
export const recordExport = (today: ISODate) => setDate(EXPORT_KEY, today)
export const recordSnooze = (until: ISODate) => setDate(SNOOZE_KEY, until)

/** True/false when the browser says; null when persistence is unsupported or unknown. */
export async function isPersisted(): Promise<boolean | null> {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.persisted) return null
    return await navigator.storage.persisted()
  } catch {
    return null
  }
}

/** Ask the browser not to evict our data. Resolves to its answer, or null if unsupported. */
export async function requestPersistence(): Promise<boolean | null> {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.persist) return null
    return await navigator.storage.persist()
  } catch {
    return null
  }
}
