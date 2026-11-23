import { useState } from 'react'
import { addDays, formatLong, parseISO, toISO, weekday, type ISODate } from '../engine/calendar'
import { campaign } from '../engine/campaign'
import { dayStatus, earliestDate, type DayStatus } from '../engine/desk'
import { campColor } from './colors'
import type { DeskSlot } from './Desk'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const LABEL: Record<DayStatus, string> = { none: '', completed: 'Completed', available: 'Available', locked: 'Locked' }
const GLYPH: Record<DayStatus, string> = { none: '', completed: '✓', available: '●', locked: '🔒' }

interface Props {
  slots: DeskSlot[]
  viewDate: ISODate
  today: ISODate
  /** Open the day view on this date. */
  onPick: (d: ISODate) => void
}

/**
 * Month grid showing, for every campaign, which days are completed, available
 * to play, or still locked. Only statuses — never page titles — so nothing
 * about future pages leaks.
 */
export function CalendarView({ slots, viewDate, today, onPick }: Props) {
  const start = parseISO(viewDate)
  const [month, setMonth] = useState({ year: start.year, month: start.month })
  const [only, setOnly] = useState<string | null>(null)
  const shown = only ? slots.filter((s) => s.id === only) : slots
  const earliest = earliestDate(
    slots.map((s) => s.state),
    today,
  )

  const first = toISO(month.year, month.month, 1)
  const gridStart = addDays(first, -weekday(first))
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  // Drop a trailing week that's entirely next month.
  const visible = parseISO(cells[35]).month !== month.month ? cells.slice(0, 35) : cells

  const shift = (n: number) => {
    const m = month.month - 1 + n
    setMonth({ year: month.year + Math.floor(m / 12), month: (((m % 12) + 12) % 12) + 1 })
  }

  // Month totals for the summary line.
  const totals: Record<DayStatus, number> = { none: 0, completed: 0, available: 0, locked: 0 }
  for (const d of visible) {
    if (parseISO(d).month !== month.month) continue
    for (const s of shown) totals[dayStatus(s.state, d, today)]++
  }

  return (
    <section className="calendar">
      <header className="cal-head">
        <button className="arrow" aria-label="Previous month" onClick={() => shift(-1)}>
          ‹
        </button>
        <h2>
          {MONTHS[month.month - 1]} {month.year}
        </h2>
        <button className="arrow" aria-label="Next month" onClick={() => shift(1)}>
          ›
        </button>
      </header>

      <div className="cal-filters row center">
        <button className={only === null ? 'active' : ''} onClick={() => setOnly(null)}>
          All campaigns
        </button>
        {slots.map((s, i) => (
          <button
            key={s.id}
            className={only === s.id ? 'active' : ''}
            style={{ ['--camp' as string]: campColor(i) }}
            onClick={() => setOnly(only === s.id ? null : s.id)}
          >
            <span className="swatch" /> {campaign(s.state.campaignId).title} · {s.state.hero?.name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="cal-legend row center small">
        <span className="legend-item completed">✓ Completed ({totals.completed})</span>
        <span className="legend-item available">● Available ({totals.available})</span>
        <span className="legend-item locked">🔒 Locked ({totals.locked})</span>
      </div>

      <div className="cal-grid" role="grid">
        {DOW.map((d) => (
          <div key={d} className="cal-dow">
            {d}
          </div>
        ))}
        {visible.map((d) => {
          const inMonth = parseISO(d).month === month.month
          const statuses = shown.map((s) => ({ s, st: dayStatus(s.state, d, today) })).filter((x) => x.st !== 'none')
          const pickable = d <= today && d >= earliest
          const title = [formatLong(d), ...statuses.map(({ s, st }) => `${campaign(s.state.campaignId).title} (${s.state.hero?.name.split(' ')[0]}): ${LABEL[st]}`)].join('\n')
          return (
            <button
              key={d}
              role="gridcell"
              className={`cal-cell ${inMonth ? '' : 'other-month'} ${d === today ? 'today' : ''} ${d === viewDate ? 'viewing' : ''}`}
              disabled={!pickable}
              title={title}
              onClick={() => onPick(d)}
            >
              <span className="cal-num">{parseISO(d).day}</span>
              <span className="cal-marks">
                {statuses.map(({ s, st }) => (
                  <span
                    key={s.id}
                    className={`cal-mark ${st}`}
                    style={{ ['--camp' as string]: campColor(slots.indexOf(s)) }}
                    aria-label={`${campaign(s.state.campaignId).title}: ${LABEL[st]}`}
                  >
                    {GLYPH[st]}
                  </span>
                ))}
              </span>
            </button>
          )
        })}
      </div>
      <p className="muted small center-text">Pick an available or completed day to open it. Locked days open on their date.</p>
    </section>
  )
}
