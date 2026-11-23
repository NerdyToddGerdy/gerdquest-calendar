import { useState, type FormEvent } from 'react'
import { formatLong, type ISODate } from '@questender/engine/calendar'
import { holidaysOn, moonOn, MOON_GLYPH, MOON_NAME } from '@questender/engine/almanac'
import { newEntryId, type CalendarEntry } from '../calendarNotes'
import type { DayStatus } from '@questender/engine/desk'

export interface PanelCampaign {
  id: string
  color: string
  label: string
  status: DayStatus
  /** Only ever set for completed pages. */
  title?: string
}

interface Props {
  date: ISODate
  entries: CalendarEntry[]
  campaigns: PanelCampaign[]
  /** Campaigns whose notes were written/edited on this date (names only). */
  notedBy: { id: string; color: string; name: string }[]
  canOpen: boolean
  onOpen: () => void
  onClose: () => void
  onSave: (e: CalendarEntry) => void
  onDelete: (id: string) => void
}

const STATUS_TEXT: Record<DayStatus, string> = { none: '', completed: 'Completed', available: 'Available', locked: 'Locked' }

export function DayPanel({ date, entries, campaigns, notedBy, canOpen, onOpen, onClose, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [time, setTime] = useState('')
  const holidays = holidaysOn(date)
  const moon = moonOn(date)

  const reset = () => {
    setEditing(null)
    setText('')
    setTime('')
  }
  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    const t = text.trim()
    if (!t) return
    onSave({ id: editing ?? newEntryId(), date, text: t, ...(time ? { time } : {}) })
    reset()
  }
  const edit = (e: CalendarEntry) => {
    setEditing(e.id)
    setText(e.text)
    setTime(e.time ?? '')
  }

  return (
    <aside className="day-panel" aria-label={`Notes for ${formatLong(date)}`}>
      <header className="dp-head">
        <h3>{formatLong(date)}</h3>
        <button className="arrow" aria-label="Close day panel" onClick={onClose}>
          ×
        </button>
      </header>

      {(holidays.length > 0 || moon) && (
        <p className="dp-almanac small">
          {holidays.map((h) => (
            <span key={h} className="cal-hol-tag">
              ★ {h}
            </span>
          ))}
          {moon && (
            <span className="muted">
              {MOON_GLYPH[moon]} {MOON_NAME[moon]}
            </span>
          )}
        </p>
      )}

      {campaigns.length > 0 && (
        <ul className="dp-camps">
          {campaigns.map((c) => (
            <li key={c.id} style={{ ['--camp' as string]: c.color }}>
              <span className="swatch" /> <span className="small">{c.label}</span>
              <span className="dp-status">
                <i className={`cal-mark ${c.status} legend-mark`} aria-hidden="true">
                  {c.status === 'completed' ? '✓' : ''}
                </i>
                {STATUS_TEXT[c.status]}
              </span>
              {c.title && <em className="dp-title"> {c.title}</em>}
            </li>
          ))}
        </ul>
      )}

      {notedBy.length > 0 && (
        <>
          <h4>Notes taken that day</h4>
          <ul className="dp-camps">
            {notedBy.map((n) => (
              <li key={n.id} style={{ ['--camp' as string]: n.color }}>
                <span className="cal-note" aria-hidden="true">
                  ✎
                </span>{' '}
                <span className="small">{n.name}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {canOpen && (
        <button className="primary" onClick={onOpen}>
          Open this day’s pages
        </button>
      )}

      <h4>Your entries</h4>
      {entries.length === 0 && <p className="muted small">Nothing written for this day yet.</p>}
      <ul className="dp-entries">
        {entries.map((e) => (
          <li key={e.id}>
            <span className="dp-entry-text">
              {e.time && <strong>{e.time} </strong>}
              {e.text}
            </span>
            <button className="small" onClick={() => edit(e)} aria-label={`Edit entry: ${e.text}`}>
              Edit
            </button>
            <button
              className="small"
              onClick={() => {
                onDelete(e.id)
                if (editing === e.id) reset()
              }}
              aria-label={`Delete entry: ${e.text}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <form className="dp-form" onSubmit={submit}>
        <label>
          <span className="small muted">{editing ? 'Edit entry' : 'New entry'}</span>
          <input type="text" value={text} maxLength={200} placeholder="Write something…" onChange={(e) => setText(e.target.value)} />
        </label>
        <label>
          <span className="small muted">Time (optional)</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <div className="row">
          <button type="submit" disabled={!text.trim()}>
            {editing ? 'Save changes' : 'Add entry'}
          </button>
          {editing && (
            <button type="button" onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </aside>
  )
}
