import { useState } from 'react'
import { addDays, formatLong, formatShort, type ISODate } from '../engine/calendar'
import { campaign } from '../engine/campaign'
import { canGoForward, earliestDate, startingDate, tabDone, tabView, type TabView } from '../engine/desk'
import { canAdvance, currentDay, type Action } from '../engine/state'
import type { GameState } from '../engine/types'
import { exportSave } from '../save'
import { CalendarView } from './CalendarView'
import { campColor } from './colors'
import { DayView } from './DayView'
import { HeroSheet } from './HeroSheet'
import { Journal } from './Journal'
import { Log } from './Log'
import { readDevOverride, writeDevOverride } from './today'

export interface DeskSlot {
  id: string
  state: GameState
}

interface Props {
  slots: DeskSlot[]
  viewDate: ISODate
  today: ISODate
  selected: string | null
  onSelect: (id: string) => void
  onDate: (d: ISODate) => void
  onForward: () => void
  onDispatch: (id: string, a: Action) => void
  onNew: () => void
  onImport: () => void
  onExportAll: () => void
  onDelete: (id: string) => void
  onTodayChanged: () => void
}

/**
 * Every running campaign on one shared date: the date (with ‹ › arrows) on
 * top, a tab per campaign beneath it, and the selected campaign's page for
 * that date below.
 */
export function Desk(p: Props) {
  const [mode, setMode] = useState<'day' | 'calendar'>('day')
  const states = p.slots.map((s) => s.state)
  const active = p.slots.find((s) => s.id === p.selected) ?? p.slots[0]
  const earliest = earliestDate(states, p.today)
  const forward = canGoForward(states, p.viewDate, p.today)
  const catchUp = startingDate(states, p.today)

  let forwardHint = ''
  if (!forward) {
    if (p.viewDate >= p.today) forwardHint = 'Tomorrow’s pages unlock at midnight.'
    else {
      const open = p.slots.filter((s) => !tabDone(s.state, p.viewDate)).map((s) => campaign(s.state.campaignId).title)
      forwardHint = `Finish today’s page in: ${open.join(', ')}`
    }
  }

  return (
    <div className="desk">
      <nav className="topbar">
        <span className="brand">Questender</span>
        {p.slots.length > 0 && (
          <div className="segmented" role="tablist" aria-label="View">
            <button role="tab" aria-selected={mode === 'day'} className={mode === 'day' ? 'active' : ''} onClick={() => setMode('day')}>
              Day
            </button>
            <button
              role="tab"
              aria-selected={mode === 'calendar'}
              className={mode === 'calendar' ? 'active' : ''}
              onClick={() => setMode('calendar')}
            >
              Calendar
            </button>
          </div>
        )}
        <div className="row">
          <button onClick={p.onNew}>+ New campaign</button>
          {p.slots.length > 0 && (
            <button onClick={p.onExportAll} title="Download one file with every campaign (import it on another device or browser)">
              Export all
            </button>
          )}
          <button onClick={p.onImport} title="Load a single-campaign or Export all file">
            Import
          </button>
        </div>
      </nav>

      {p.slots.length === 0 ? (
        <main className="title-screen">
          <h1>Questender</h1>
          <p className="tagline">A solo adventure, one page at a time.</p>
          <button className="primary big" onClick={p.onNew}>
            Start your first campaign
          </button>
        </main>
      ) : mode === 'calendar' ? (
        <CalendarView
          slots={p.slots}
          viewDate={p.viewDate}
          today={p.today}
          onPick={(d) => {
            p.onDate(d)
            setMode('day')
          }}
        />
      ) : (
        <>
          <div className="desk-head">
          <header className="datebar">
            <button
              className="arrow"
              aria-label="Previous day"
              disabled={p.viewDate <= earliest}
              onClick={() => p.onDate(addDays(p.viewDate, -1))}
            >
              ‹
            </button>
            <div className="datebar-date">
              <h2>{formatLong(p.viewDate)}</h2>
              <div className="small muted">
                {p.viewDate === p.today ? 'Today' : p.viewDate < p.today ? 'Earlier day' : ''}
                {catchUp < p.viewDate && (
                  <>
                    {' · '}
                    <button className="linkish" onClick={() => p.onDate(catchUp)}>
                      Unfinished pages from {formatShort(catchUp)}
                    </button>
                  </>
                )}
                {p.viewDate < p.today && catchUp >= p.viewDate && (
                  <>
                    {' · '}
                    <button className="linkish" onClick={() => p.onDate(p.today)}>
                      Jump to today
                    </button>
                  </>
                )}
              </div>
            </div>
            <button
              className="arrow"
              aria-label="Next day"
              disabled={!forward}
              title={forward ? 'Next day' : forwardHint}
              onClick={p.onForward}
            >
              ›
            </button>
          </header>

          <div className="tabs" role="tablist">
            {p.slots.map((s) => {
              const v = tabView(s.state, p.viewDate)
              const c = campaign(s.state.campaignId)
              return (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={s.id === active.id}
                  className={`tab ${s.id === active.id ? 'selected' : ''}`}
                  style={{ ['--camp' as string]: campColor(p.slots.indexOf(s)) }}
                  onClick={() => p.onSelect(s.id)}
                >
                  <TabMark view={v} state={s.state} />
                  <span>{c.title}</span>
                  <span className="tab-hero">{s.state.hero?.name.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
          </div>

          <CampaignPanel
            key={active.id}
            slot={active}
            viewDate={p.viewDate}
            today={p.today}
            dispatch={(a) => p.onDispatch(active.id, a)}
            onDate={p.onDate}
            onDelete={() => p.onDelete(active.id)}
          />
        </>
      )}

      {import.meta.env.DEV && <DevDate today={p.today} onChanged={p.onTodayChanged} />}
    </div>
  )
}

/** Small status mark on each tab. */
function TabMark({ view, state }: { view: TabView; state: GameState }) {
  if (view.kind === 'play') {
    return canAdvance(state) ? <span className="mark done" title="Done for this day">✓</span> : <span className="mark todo" title="Ready to play">●</span>
  }
  if (view.kind === 'blocked') return <span className="mark behind" title="Earlier pages unfinished">!</span>
  if (view.kind === 'past') return <span className="mark done" title="Completed">✓</span>
  if (view.kind === 'finished') return <span className="mark done" title="Campaign complete">★</span>
  return <span className="mark none" title="Not started yet">–</span>
}

interface PanelProps {
  slot: DeskSlot
  viewDate: ISODate
  today: ISODate
  dispatch: (a: Action) => void
  onDate: (d: ISODate) => void
  onDelete: () => void
}

/** One campaign's page for the viewed date, plus its hero sheet. */
export function CampaignPanel({ slot, viewDate, today, dispatch, onDate, onDelete }: PanelProps) {
  const [showJournal, setShowJournal] = useState(false)
  const state = slot.state
  const c = campaign(state.campaignId)
  const view = tabView(state, viewDate)

  let main
  if (showJournal) {
    main = <Journal state={state} />
  } else if (view.kind === 'play') {
    const day = currentDay(state)!
    main = (
      <>
        <DayView state={state} day={day} dispatch={dispatch} today={today} />
        <Log entries={state.log} />
      </>
    )
  } else if (view.kind === 'past') {
    main = <PastPage state={state} page={view.page} />
  } else if (view.kind === 'blocked') {
    // Never render anything about this page — it's ahead of where the player is.
    main = (
      <article className="day notice">
        <h2>Catch up first</h2>
        <p className="narrative">This campaign still has unfinished pages from earlier days.</p>
        <button className="primary" onClick={() => onDate(view.catchUp)}>
          Go to {formatLong(view.catchUp)}
        </button>
      </article>
    )
  } else if (view.kind === 'notStarted') {
    main = (
      <article className="day notice">
        <h2>Not yet</h2>
        <p className="narrative">
          {c.title} begins on {formatLong(view.begins)}.
        </p>
      </article>
    )
  } else {
    main = (
      <article className="day notice">
        <h2>The end of {c.title}</h2>
        <p className="narrative">{state.hero!.name}’s story in this campaign is complete. Look back through the Journal.</p>
      </article>
    )
  }

  return (
    <div className="layout">
      <div className="main-col">
        <div className="panel-tools row">
          <span className="muted small">
            {state.hero!.name} · began {formatShort(state.startDate)} · page {Math.min(state.dayIndex + 1, c.pages.length)} of {c.pages.length}
          </span>
          <span className="spacer" />
          <button className={showJournal ? 'active' : ''} onClick={() => setShowJournal(!showJournal)}>
            {showJournal ? 'Back to page' : 'Journal'}
          </button>
          <button onClick={() => exportSave(state)}>Export</button>
          <button
            onClick={() => {
              if (confirm(`Delete this ${c.title} save? This can't be undone.`)) onDelete()
            }}
          >
            Delete
          </button>
        </div>
        {main}
      </div>
      {/* The sheet is only interactive on the page being played. */}
      <fieldset className="sheet-wrap" disabled={view.kind !== 'play' || showJournal}>
        <HeroSheet state={state} dispatch={dispatch} />
      </fieldset>
    </div>
  )
}

/** A completed page, read back from the journal. */
function PastPage({ state, page }: { state: GameState; page: number }) {
  const c = campaign(state.campaignId)
  const day = c.pages[page]
  const entry = state.journal.find((j) => j.page === page)
  return (
    <article className="day past">
      <header className="day-header">
        <div>
          <div className="date">Completed{entry ? ` · ${formatLong(entry.date)}` : ''}</div>
          <h2>{day.title}</h2>
        </div>
      </header>
      <p className="narrative">{day.text}</p>
      {entry && (
        <ul className="past-lines">
          {entry.lines.map((l, i) => (
            <li key={i} className={l.startsWith('  ') ? 'indent' : ''}>
              {l.trim()}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

function DevDate({ today, onChanged }: { today: ISODate; onChanged: () => void }) {
  const [value, setValue] = useState(readDevOverride() ?? today)
  return (
    <div className="dev-date">
      <span className="small muted">Dev: pretend today is</span>
      <input type="date" value={value} onChange={(e) => setValue(e.target.value)} />
      <button
        onClick={() => {
          writeDevOverride(value || null)
          onChanged()
        }}
      >
        Apply
      </button>
      <button
        onClick={() => {
          writeDevOverride(null)
          onChanged()
        }}
      >
        Use real date
      </button>
    </div>
  )
}
