import { useState } from 'react'
import { formatLong, formatShort, formatSpan, parseISO, type ISODate } from '@questender/engine/calendar'
import { campaign } from '@questender/engine/campaign'
import { canGoForward, deskSpanEnd, earliestDate, pagesOwed, prevDeskDate, startingDate, tabView, type TabView } from '@questender/engine/desk'
import { canAdvance, currentDay, type Action } from '@questender/engine/state'
import type { GameState } from '@questender/engine/types'
import { exportSave } from '../save'
import { markSeen, seenLatest } from '../changelog'
import { CAL_VIEWS, shortDate, type CalView } from '@questender/engine/calview'
import type { ThemePref } from '../theme'
import { CalendarView } from './CalendarView'
import { campColor } from './colors'
import { DayView } from './DayView'
import { turnPage } from './pageTurn'
import { HeroSheet } from './HeroSheet'
import { Journal } from './Journal'
import { Log } from './Log'
import { Notes } from './Notes'
import { revealTab } from './revealTab'
import { Settings } from './Settings'
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
  theme: ThemePref
  onTheme: (t: ThemePref) => void
  sound: boolean
  onToggleSound: () => void
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
  const [calView, setCalView] = useState<CalView>('month')
  const [settings, setSettings] = useState(false)
  const [news, setNews] = useState(() => !seenLatest())
  const openSettings = () => {
    setSettings(true)
    markSeen()
    setNews(false)
  }
  const states = p.slots.map((s) => s.state)
  const active = p.slots.find((s) => s.id === p.selected) ?? p.slots[0]
  const earliest = earliestDate(states, p.today)
  // A weekend page shows as one date range (Sat – Sun) rather than two stops.
  const spanEnd = deskSpanEnd(states, p.viewDate)
  // Nothing new until the day after the range, so › waits until then.
  const forward = canGoForward(active?.state, p.viewDate, p.today) && spanEnd < p.today
  const catchUp = startingDate(states, p.today)

  // Campaigns other than the selected one that still owe pages as of this date.
  const lagging = p.slots
    .filter((s) => s !== active)
    .map((s) => ({ title: campaign(s.state.campaignId).title, owed: pagesOwed(s.state, p.viewDate) }))
    .filter((l) => l.owed > 0)
  const laggingText = lagging.map((l) => `${l.title} is ${l.owed} ${l.owed === 1 ? 'page' : 'pages'} behind`).join('; ')
  let forwardHint = ''
  if (!forward) {
    if (spanEnd >= p.today) forwardHint = 'Tomorrow’s pages unlock at midnight.'
    else if (active) forwardHint = `Finish this page in ${campaign(active.state.campaignId).title} to move on.`
  } else if (laggingText) {
    forwardHint = `${laggingText}; you can catch up any time.`
  }

  return (
    <div className="desk">
      <nav className="topbar">
        <span className="brand">Questender</span>
        {p.slots.length > 0 && (
          <div className="view-switch">
            <div className="segmented" role="tablist" aria-label="View">
              <button role="tab" aria-selected={mode === 'day'} className={mode === 'day' ? 'active' : ''} onClick={() => setMode('day')}>
                Day
              </button>
              <button role="tab" aria-selected={mode === 'calendar'} className={mode === 'calendar' ? 'active' : ''} onClick={() => setMode('calendar')}>
                Calendar
              </button>
            </div>
            {mode === 'calendar' && (
              <div className="segmented" role="tablist" aria-label="Calendar layout">
                {CAL_VIEWS.map((v) => (
                  <button key={v.id} role="tab" aria-selected={calView === v.id} className={calView === v.id ? 'active' : ''} onClick={() => setCalView(v.id)}>
                    {v.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="row">
          <button
            className="icon-btn sound-toggle"
            aria-pressed={p.sound}
            aria-label={p.sound ? 'Dice sounds on' : 'Dice sounds off'}
            title={p.sound ? 'Dice sounds on (click to mute)' : 'Dice sounds off (click to unmute)'}
            onClick={p.onToggleSound}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
              {p.sound ? (
                <>
                  <path d="M15.5 9.2a4 4 0 0 1 0 5.6" />
                  <path d="M18 6.8a7.5 7.5 0 0 1 0 10.4" />
                </>
              ) : (
                <path d="M16 9.5l5 5M21 9.5l-5 5" />
              )}
            </svg>
          </button>
          <button className="new-btn" onClick={p.onNew} aria-label="New campaign" title="New campaign">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="new-label">New campaign</span>
          </button>
          <button className="icon-btn settings-toggle" aria-label={news ? 'Settings (new updates)' : 'Settings'} title={news ? 'Settings · see what’s new' : 'Settings'} onClick={openSettings}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="8.6" strokeWidth="3" strokeDasharray="3 3.67" />
              <circle cx="12" cy="12" r="6.6" />
              <circle cx="12" cy="12" r="2.6" />
            </svg>
            {news && <span className="news-dot" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {settings && (
        <Settings
          theme={p.theme}
          onTheme={p.onTheme}
          campaigns={p.slots.length}
          onImport={() => {
            setSettings(false)
            p.onImport()
          }}
          onExportAll={p.onExportAll}
          onClose={() => setSettings(false)}
        />
      )}

      {p.slots.length === 0 ? (
        <main className="title-screen">
          <div className="sealed-page" role="img" aria-label={`A calendar page for ${formatLong(p.today)}, not yet opened`}>
            <div className="sp-rings" aria-hidden="true"><i /><i /><i /></div>
            <div className="sp-month">{formatLong(p.today).split(', ')[1].split(' ')[0]}</div>
            <div className="sp-day">{formatLong(p.today).split(', ')[1].split(' ')[1]}</div>
            <div className="sp-week">{formatLong(p.today).split(',')[0]}</div>
            <div className="sp-seal" aria-hidden="true">Page one is waiting</div>
          </div>
          <h1>Questender</h1>
          <p className="tagline">One page of adventure for every day on the calendar. Tear off today’s, play it, and the next stays sealed until tomorrow.</p>
          <button className="primary big" onClick={p.onNew}>
            Start your first campaign
          </button>
          <button className="linkish" onClick={p.onImport}>
            or import a saved file
          </button>
        </main>
      ) : mode === 'calendar' ? (
        <CalendarView
          slots={p.slots}
          viewDate={p.viewDate}
          today={p.today}
          view={calView}
          onView={setCalView}
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
              onClick={() => p.onDate(prevDeskDate(states, p.viewDate, earliest))}
            >
              ‹
            </button>
            <div className="datebar-date">
              <h2>{spanEnd === p.viewDate ? formatLong(p.viewDate) : `${formatSpan(p.viewDate, spanEnd)}, ${parseISO(spanEnd).year}`}</h2>
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
              onClick={() => {
                turnPage()
                p.onForward()
              }}
            >
              ›
            </button>
          </header>

          {forwardHint && <p className="forward-hint small muted">{forwardHint}</p>}

          <div className="tabs" role="tablist">
            {p.slots.map((s) => {
              const v = tabView(s.state, p.viewDate)
              const c = campaign(s.state.campaignId)
              return (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={s.id === active.id}
                  className={`tab ${s.id === active.id ? 'selected' : ''} ${v.kind === 'notStarted' ? 'not-started' : ''}`}
                  title={v.kind === 'notStarted' ? `${c.title} begins ${formatLong(v.begins)}` : undefined}
                  style={{ ['--camp' as string]: campColor(p.slots, s) }}
                  onClick={() => p.onSelect(s.id)}
                  ref={s.id === active.id ? revealTab : undefined}
                >
                  <TabMark view={v} state={s.state} owed={pagesOwed(s.state, p.viewDate)} />
                  {v.kind === 'notStarted' && <span className="tab-when">starts {shortDate(v.begins)}</span>}
                  <span>{c.title}</span>
                  {v.kind === 'blocked' && <span className="tab-behind">{pagesOwed(s.state, p.viewDate)} behind</span>}
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

/** Small status mark on each tab; the words live in the title and aria-label. */
function TabMark({ view, state, owed }: { view: TabView; state: GameState; owed: number }) {
  const mark = (cls: string, glyph: string, label: string) => (
    <span className={`mark ${cls}`} role="img" aria-label={label} title={label}>
      {glyph}
    </span>
  )
  if (view.kind === 'play') {
    return canAdvance(state) ? mark('done', '✓', 'Done for this day') : mark('todo', '●', 'Ready to play')
  }
  if (view.kind === 'blocked') return mark('behind', '!', `Behind by ${owed} ${owed === 1 ? 'page' : 'pages'}: catch up any time`)
  if (view.kind === 'past') return mark('done', '✓', 'Completed')
  if (view.kind === 'finished') return mark('done', '★', 'Campaign finished')
  return mark('none', '○', `Not started: begins ${formatLong(view.begins)}`)
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
  const [panel, setPanel] = useState<'page' | 'journal' | 'notes'>('page')
  const state = slot.state
  const c = campaign(state.campaignId)
  const view = tabView(state, viewDate)

  let main
  if (panel === 'journal') {
    main = <Journal state={state} onBack={() => setPanel('page')} />
  } else if (panel === 'notes') {
    main = <Notes key={slot.id} title={c.title} text={state.notes ?? ''} onSave={(text) => dispatch({ type: 'SET_NOTES', text, date: viewDate })} />
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
        <p className="narrative">This campaign is {pagesOwed(state, viewDate)} {pagesOwed(state, viewDate) === 1 ? 'page' : 'pages'} behind. You can catch up any time.</p>
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
            {state.hero!.name}: page {Math.min(state.dayIndex + 1, c.pages.length)} of {c.pages.length}, begun {formatLong(state.startDate).replace(/, \d{4}$/, '')}
          </span>
          <span className="spacer" />
          {panel !== 'page' && <button onClick={() => setPanel('page')}>Back to page</button>}
          <button className={panel === 'journal' ? 'active' : ''} aria-pressed={panel === 'journal'} onClick={() => setPanel(panel === 'journal' ? 'page' : 'journal')}>
            Journal
          </button>
          <button className={panel === 'notes' ? 'active' : ''} aria-pressed={panel === 'notes'} onClick={() => setPanel(panel === 'notes' ? 'page' : 'notes')}>
            Notes{state.notes?.trim() ? ' •' : ''}
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
      <fieldset className="sheet-wrap" disabled={view.kind !== 'play' || panel !== 'page'}>
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
