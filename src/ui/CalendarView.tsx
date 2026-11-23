import { useEffect, useState } from 'react'
import { addDays, formatLong, parseISO, toISO, weekday, type ISODate } from '@questender/engine/calendar'
import { campaign } from '@questender/engine/campaign'
import { dayStatus, earliestDate, pageIndexOn, type DayStatus } from '@questender/engine/desk'
import { holidaysOn, moonOn, MOON_GLYPH, MOON_NAME } from '@questender/engine/almanac'
import { monthCells, MONTHS, shiftCursor, UNIT, viewTitle, weekCells, type CalView } from '@questender/engine/calview'
import { CALENDAR_EVENT, entriesOn, loadEntries, saveEntries, type CalendarEntry } from '../calendarNotes'
import { campColor } from './colors'
import { DayPanel, type PanelCampaign } from './DayPanel'
import type { DeskSlot } from './Desk'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const LABEL: Record<DayStatus, string> = { none: '', completed: 'Completed', available: 'Available', locked: 'Locked' }
const GLYPH: Record<DayStatus, string> = { none: '', completed: '✓', available: '', locked: '' }

interface Props {
  slots: DeskSlot[]
  viewDate: ISODate
  today: ISODate
  /** Open the day view on this date. */
  onPick: (d: ISODate) => void
  /** Layout, when the parent controls it (the header switch); otherwise kept here. */
  view?: CalView
  onView?: (v: CalView) => void
  /** Starting layout / selected date (used by tests). */
  initialView?: CalView
  initialSelected?: ISODate | null
  /** Seed entries (tests); otherwise read from localStorage. */
  initialEntries?: CalendarEntry[]
}

/**
 * Calendar of page statuses for every campaign, plus the player's own
 * entries, holidays and moon phases. Page titles appear only for COMPLETED
 * pages (wall view and the day panel); available/locked pages show status
 * only, so nothing about future pages leaks.
 */
export function CalendarView({ slots, viewDate, today, onPick, view: viewProp, onView, initialView = 'month', initialSelected = null, initialEntries }: Props) {
  const [ownView, setOwnView] = useState<CalView>(initialView)
  const view = viewProp ?? ownView
  const setView = (v: CalView) => (onView ? onView(v) : setOwnView(v))
  const [cursor, setCursor] = useState<ISODate>(viewDate)
  const [only, setOnly] = useState<string | null>(null)
  const [selected, setSelected] = useState<ISODate | null>(initialSelected)
  const [entries, setEntries] = useState<CalendarEntry[]>(() => initialEntries ?? loadEntries())

  useEffect(() => {
    const reload = () => setEntries(loadEntries())
    window.addEventListener(CALENDAR_EVENT, reload)
    return () => window.removeEventListener(CALENDAR_EVENT, reload)
  }, [])

  const shown = only ? slots.filter((s) => s.id === only) : slots
  const earliest = earliestDate(
    slots.map((s) => s.state),
    today,
  )
  const cur = parseISO(cursor)

  const persist = (next: CalendarEntry[]) => {
    setEntries(next)
    saveEntries(next)
  }
  const saveEntry = (e: CalendarEntry) => persist(entries.some((x) => x.id === e.id) ? entries.map((x) => (x.id === e.id ? e : x)) : [...entries, e])

  const statusesOn = (d: ISODate) => shown.map((s) => ({ s, st: dayStatus(s.state, d, today) })).filter((x) => x.st !== 'none')
  const notesOn = (d: ISODate) => shown.filter((s) => s.state.noteDates?.includes(d))
  const campName = (s: DeskSlot) => `${campaign(s.state.campaignId).title} (${s.state.hero?.name.split(' ')[0]})`

  // Totals for the legend, over the dates the view is about.
  const range: ISODate[] =
    view === 'week'
      ? weekCells(cursor)
      : view === 'year'
        ? Array.from({ length: 366 }, (_, i) => addDays(toISO(cur.year, 1, 1), i)).filter((d) => parseISO(d).year === cur.year)
        : monthCells(cur.year, cur.month).filter((d) => parseISO(d).month === cur.month)
  const totals: Record<DayStatus, number> = { none: 0, completed: 0, available: 0, locked: 0 }
  for (const d of range) for (const s of shown) totals[dayStatus(s.state, d, today)]++

  const select = (d: ISODate) => setSelected(selected === d ? null : d)
  const goMonth = (year: number, month: number) => {
    setCursor(toISO(year, month, 1))
    setView('month')
  }

  const panelCampaigns = (d: ISODate): PanelCampaign[] =>
    slots
      .map((s) => {
        const status = dayStatus(s.state, d, today)
        const idx = pageIndexOn(s.state, d)
        // Titles only for completed pages.
        const title = status === 'completed' ? campaign(s.state.campaignId).pages[idx]?.title : undefined
        return { id: s.id, color: campColor(slots, s), label: campName(s), status, title }
      })
      .filter((c) => c.status !== 'none')

  const renderCell = (d: ISODate, mode: 'month' | 'wall' | 'week', inMonth = true) => {
    const statuses = statusesOn(d)
    const hol = holidaysOn(d)
    const moon = moonOn(d)
    const mine = entriesOn(entries, d)
    const showTitles = mode === 'wall'
    const perCell = mode === 'month' ? 1 : 2
    const label = [
      formatLong(d),
      ...hol,
      moon ? MOON_NAME[moon] : '',
      ...statuses.map(({ s, st }) => `${campName(s)}: ${LABEL[st]}`),
      ...notesOn(d).map((s) => `Note taken: ${campaign(s.state.campaignId).title}`),
      mine.length ? `${mine.length} ${mine.length === 1 ? 'entry' : 'entries'}` : '',
    ]
      .filter(Boolean)
      .join('. ')
    return (
      <button
        key={d}
        role="gridcell"
        aria-label={label}
        aria-selected={selected === d}
        className={`cal-cell ${mode} ${inMonth ? '' : 'other-month'} ${d === today ? 'today' : ''} ${d === viewDate ? 'viewing' : ''} ${selected === d ? 'selected' : ''}`}
        title={label.split('. ').join('\n')}
        onClick={() => select(d)}
      >
        <span className="cal-top">
          <span className="cal-num">{parseISO(d).day}</span>
          <span className="cal-wd">{DOW[weekday(d)]}</span>
          {moon && (
            <span className="cal-moon" aria-hidden="true" title={MOON_NAME[moon]}>
              {MOON_GLYPH[moon]}
            </span>
          )}
        </span>
        {hol.length > 0 && (
          <>
            <span className="cal-hol">{hol[0]}</span>
            <span className="cal-star" aria-hidden="true">
              ★
            </span>
          </>
        )}
        <span className="cal-marks">
          {statuses.map(({ s, st }) => (
            <span key={s.id} className={`cal-mark ${st}`} style={{ ['--camp' as string]: campColor(slots, s) }} aria-hidden="true">
              {GLYPH[st]}
            </span>
          ))}
        </span>
        {showTitles &&
          statuses.map(({ s, st }) => {
            if (st !== 'completed') return null
            const title = campaign(s.state.campaignId).pages[pageIndexOn(s.state, d)]?.title
            return title ? (
              <span key={s.id} className="cal-page" style={{ ['--camp' as string]: campColor(slots, s) }}>
                {title}
              </span>
            ) : null
          })}
        {notesOn(d).length > 0 && (
          <span className="cal-notes">
            {notesOn(d).map((s) => (
              <span
                key={s.id}
                className="cal-note"
                style={{ ['--camp' as string]: campColor(slots, s) }}
                title={`Note taken: ${campaign(s.state.campaignId).title}`}
                aria-hidden="true"
              >
                ✎
              </span>
            ))}
          </span>
        )}
        {mine.slice(0, perCell).map((e) => (
          <span key={e.id} className="cal-entry">
            {e.time && <b>{e.time} </b>}
            {e.text}
          </span>
        ))}
        {mine.length > perCell && <span className="cal-more">+{mine.length - perCell}</span>}
        {mine.length > 0 && <span className="cal-count">+{mine.length}</span>}
      </button>
    )
  }

  const dots = (d: ISODate) => {
    const st = statusesOn(d).map((x) => x.st)
    return st.includes('available') ? 'available' : st.includes('completed') ? 'completed' : st.includes('locked') ? 'locked' : ''
  }

  return (
    <section className={`calendar ${selected ? 'with-panel' : ''}`}>
      <div className="cal-main">
        <header className="cal-head">
          <button className="arrow" aria-label={`Previous ${UNIT[view]}`} onClick={() => setCursor(shiftCursor(cursor, view, -1))}>
            ‹
          </button>
          <h2>{viewTitle(cursor, view)}</h2>
          <button className="arrow" aria-label={`Next ${UNIT[view]}`} onClick={() => setCursor(shiftCursor(cursor, view, 1))}>
            ›
          </button>
        </header>

        <div className="cal-tools row center">
          <button onClick={() => setCursor(today)}>Today</button>
        </div>

        <div className="cal-filters row center">
          <button className={only === null ? 'active' : ''} onClick={() => setOnly(null)}>
            All campaigns
          </button>
          {slots.map((s) => (
            <button
              key={s.id}
              className={only === s.id ? 'active' : ''}
              style={{ ['--camp' as string]: campColor(slots, s) }}
              onClick={() => setOnly(only === s.id ? null : s.id)}
            >
              <span className="swatch" /> {campaign(s.state.campaignId).title} · {s.state.hero?.name.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="cal-legend row center small">
          <span className="legend-item"><i className="cal-mark completed legend-mark" aria-hidden="true">✓</i>Completed ({totals.completed})</span>
          <span className="legend-item"><i className="cal-mark available legend-mark" aria-hidden="true" />Available now ({totals.available})</span>
          <span className="legend-item"><i className="cal-mark locked legend-mark" aria-hidden="true" />Locked until its day ({totals.locked})</span>
          <span className="legend-item noted">✎ Note taken</span>
          <span className="legend-item"><i className="legend-today" aria-hidden="true">{parseISO(today).day}</i>Today</span>
          <span className="legend-item"><i className="legend-viewing" aria-hidden="true">{parseISO(viewDate).day}</i>Date you are viewing</span>
        </div>

        {view === 'year' ? (
          <div className="cal-year">
            {MONTHS.map((name, mi) => {
              const cells = monthCells(cur.year, mi + 1)
              return (
                <section key={name} className="mini-month">
                  <button className="mini-title" onClick={() => goMonth(cur.year, mi + 1)} aria-label={`Open ${name} ${cur.year}`}>
                    {name}
                  </button>
                  <div className="mini-grid" aria-hidden="true">
                    {DOW.map((d, i) => (
                      <span key={i} className="mini-dow">
                        {d[0]}
                      </span>
                    ))}
                    {cells.map((d) => {
                      const inMonth = parseISO(d).month === mi + 1
                      if (!inMonth) return <span key={d} />
                      const dot = dots(d)
                      return (
                        <span key={d} className={`mini-day ${d === today ? 'today' : ''} ${d === viewDate ? 'viewing' : ''}`}>
                          {parseISO(d).day}
                          {dot && <i className={`dot ${dot}`} />}
                          {entriesOn(entries, d).length > 0 && <i className="dot note" />}
                          {notesOn(d).map((sl) => (
                            <b key={sl.id} className="mini-note" style={{ ['--camp' as string]: campColor(slots, sl) }} title={`Note taken: ${campaign(sl.state.campaignId).title}`}>
                              ✎
                            </b>
                          ))}
                        </span>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        ) : view === 'week' ? (
          <div className="cal-grid week" role="grid">
            {DOW.map((d) => (
              <div key={d} className="cal-dow">
                {d}
              </div>
            ))}
            {weekCells(cursor).map((d) => renderCell(d, 'week'))}
          </div>
        ) : (
          <div className={`cal-grid ${view}`} role="grid">
            {DOW.map((d) => (
              <div key={d} className="cal-dow">
                {d}
              </div>
            ))}
            {monthCells(cur.year, cur.month).map((d) => renderCell(d, view, parseISO(d).month === cur.month))}
          </div>
        )}
        <p className="muted small center-text">Pick a date to read or write on it. Future dates take your own notes; their pages stay sealed until the day.</p>
      </div>

      {selected && (
        <DayPanel
          key={selected}
          date={selected}
          entries={entriesOn(entries, selected)}
          campaigns={panelCampaigns(selected)}
          notedBy={notesOn(selected).map((s) => ({ id: s.id, color: campColor(slots, s), name: campName(s) }))}
          canOpen={selected <= today && selected >= earliest}
          onOpen={() => onPick(selected)}
          onClose={() => setSelected(null)}
          onSave={saveEntry}
          onDelete={(id) => persist(entries.filter((e) => e.id !== id))}
        />
      )}
    </section>
  )
}
