// Backup reminder rules. Pure: dates are injected, nothing here touches storage.
import { addDays, daysBetween, type ISODate } from '@questender/engine/calendar'

/** Days after the last Export all (or after "Remind me later") before asking again. */
export const REMIND_AFTER_DAYS = 7
/** A player who has never exported is asked once they have played this many days. */
export const FIRST_REMINDER_PLAYED_DAYS = 3

export interface BackupFacts {
  /** Campaigns on the desk. */
  campaigns: number
  /** Pages completed across all campaigns. */
  playedDays: number
  /** Date of the last Export all, if any. */
  lastExport: ISODate | null
  /** The reminder stays hidden until this date, if the player snoozed it. */
  snoozedUntil: ISODate | null
  today: ISODate
}

export function shouldRemindBackup(f: BackupFacts): boolean {
  if (f.campaigns === 0) return false
  if (f.snoozedUntil && f.today < f.snoozedUntil) return false
  if (f.lastExport === null) return f.playedDays >= FIRST_REMINDER_PLAYED_DAYS
  return daysBetween(f.lastExport, f.today) >= REMIND_AFTER_DAYS
}

/** The date a "Remind me later" hides the notice until. */
export function snoozeUntil(today: ISODate): ISODate {
  return addDays(today, REMIND_AFTER_DAYS)
}

/** Settings line describing how long the browser promises to keep the data. */
export function persistenceMessage(persisted: boolean | null): string {
  if (persisted === true) return 'Your progress is stored on this device and kept until you clear it.'
  if (persisted === false) return 'Your progress is stored on this device. The browser may clear it, so export a backup now and then.'
  return 'Your progress is stored on this device.'
}
