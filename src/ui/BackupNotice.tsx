import { useState } from 'react'
import type { ISODate } from '@questender/engine/calendar'
import { shouldRemindBackup, snoozeUntil } from '../backup'
import { lastExportDate, recordSnooze, snoozedUntilDate } from '../deviceStorage'

interface Props {
  campaigns: number
  playedDays: number
  today: ISODate
  /** Changes whenever the player exports, so the notice re-checks. */
  exportedAt: number
  onExportAll: () => void
}

/** A small, dismissible nudge to back up. Never blocks play. */
export function BackupNotice({ campaigns, playedDays, today, exportedAt, onExportAll }: Props) {
  const [snoozed, setSnoozed] = useState(0)
  void exportedAt
  void snoozed
  const show = shouldRemindBackup({ campaigns, playedDays, lastExport: lastExportDate(), snoozedUntil: snoozedUntilDate(), today })
  if (!show) return null
  return (
    <aside className="backup-notice"
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a live region holding block content (headings, paragraphs, buttons); <output> only allows phrasing content
      role="status" aria-label="Backup reminder">
      <p>
        <strong>Back up your progress.</strong> Export all makes one save code you can paste into Import on any device.
      </p>
      <div className="row">
        <button className="primary" onClick={onExportAll}>
          Export all
        </button>
        <button
          onClick={() => {
            recordSnooze(snoozeUntil(today))
            setSnoozed((n) => n + 1)
          }}
        >
          Remind me later
        </button>
      </div>
    </aside>
  )
}
