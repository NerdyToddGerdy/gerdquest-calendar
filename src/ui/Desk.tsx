import { useState } from 'react'
import { formatLong, formatShort, formatSpan, parseISO, type ISODate } from '@questender/engine/calendar'
import { campaign } from '@questender/engine/campaign'
import { canGoForward, deskSpanEnd, earliestDate, pagesOwed, prevDeskDate, startingDate, tabView, type TabView } from '@questender/engine/desk'
import { canAdvance, currentDay, type Action } from '@questender/engine/state'
import type { GameState } from '@questender/engine/types'
import { allPayload, singlePayload } from '../save'
import { ExportDialog } from './ExportDialog'
import { markSeen, seenLatest } from '../changelog'
import { CAL_VIEWS, shortDate, type CalView } from '@questender/engine/calview'
import type { ThemePref } from '../theme'
import { CalendarView } from './CalendarView'
import { campColor } from './colors'
import { DayView } from './DayView'
import { turnPage } from './pageTurn'
import { Tutorial } from './Tutorial'
import { HeroSheet } from './HeroSheet'
import { Journal } from './Journal'
import { Log } from './Log'
import { Notes } from './Notes'
import { revealTab } from './revealTab'
import { TabStrip } from './TabStrip'
import { BackupNotice } from './BackupNotice'
import { Settings } from './Settings'
import { Shelf } from './Shelf'
import type { Progress } from '@questender/engine/progress'
import { styleAttrs } from './styleAttrs'
import { Token, TokenPicker, tokenLabel } from './Token'
import { recordExport } from '../deviceStorage'
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
  theme: ThemePref
  onTheme: (t: ThemePref) => void
  sound: boolean
  onToggleSound: () => void
  onDelete: (id: string) => void
  onTodayChanged: () => void
  progress: Progress
  onOpenChest: (week: ISODate, slotId: string) => void
  onToken: (token: Progress['token']) => void
}

/**
 * Every running campaign on one shared date: the date (with ‹ › arrows) on
 * top, a tab per campaign beneath it, and the selected campaign's page for
 * that date below.
 */
export function Desk(p: Props) {
  const [mode, setMode] = useState<'day' | 'calendar' | 'shelf'>('day')
  const [calView, setCalView] = useState<CalView>('month')
  const [settings, setSettings] = useState(false)
  const [tokenOpen, setTokenOpen] = useState(false)
  const [news, setNews] = useState(() => !seenLatest())
  const openSettings = () => {
    setSettings(true)
    markSeen()
    setNews(false)
  }
  const [exportedAt, setExportedAt] = useState(0)
  const [exporting, setExporting] = useState<{ title: string; name: string; payload: unknown } | null>(null)
  const exportAll = () => {
    setSettings(false)
    setExporting({ title: 'Export all campaigns', name: 'all', payload: allPayload(p.slots.map((s) => s.state), p.today) })
  }
  const exportOne = (state: GameState) =>
    setExporting({ title: `Export ${campaign(state.campaignId).title}`, name: `${state.campaignId}-${state.startDate}`, payload: singlePayload(state) })
  const exported = () => {
    recordExport(p.today)
    setExportedAt((n) => n + 1)
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

  const goForward = () => {
    turnPage()
    p.onForward()
  }

  return (
    <div className="desk">
      <nav className="topbar">
        {/* The game lives in play/; ?stay keeps the start page from sending a returning player straight back. */}
        <a className="brand" href="../?stay" title="Back to the start page">
          GerdQuest Calendar
        </a>
        <a className="home-link" href="../?stay" aria-label="Back to the start page" title="Back to the start page">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11.5 12 4l9 7.5" />
            <path d="M5.5 10v9.5h13V10" />
            <path d="M10 19.5v-5h4v5" />
          </svg>
        </a>
        {p.slots.length > 0 && (
          <div className="view-switch">
            <div className="segmented" role="tablist" aria-label="View">
              <button role="tab" aria-selected={mode === 'day'} className={mode === 'day' ? 'active' : ''} onClick={() => setMode('day')}>
                Day
              </button>
              <button role="tab" aria-selected={mode === 'calendar'} className={mode === 'calendar' ? 'active' : ''} onClick={() => setMode('calendar')}>
                Calendar
              </button>
              <button role="tab" aria-selected={mode === 'shelf'} className={mode === 'shelf' ? 'active' : ''} onClick={() => setMode('shelf')}>
                Shelf
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
          <button className="icon-btn token-btn" aria-label={tokenLabel(p.progress.token.avatar, p.progress.token.border)} title="Your token" onClick={() => setTokenOpen(true)}>
            <Token avatar={p.progress.token.avatar} border={p.progress.token.border} size={36} />
          </button>
        </div>
      </nav>

      {tokenOpen && <TokenPicker progress={p.progress} onChoose={p.onToken} onClose={() => setTokenOpen(false)} />}

      {exporting && <ExportDialog {...exporting} date={p.today} onExported={exported} onClose={() => setExporting(null)} />}

      {settings && (
        <Settings
          theme={p.theme}
          onTheme={p.onTheme}
          campaigns={p.slots.length}
          slots={p.slots}
          onDispatch={p.onDispatch}
          onImport={() => {
            setSettings(false)
            p.onImport()
          }}
          onExportAll={exportAll}
          onClose={() => setSettings(false)}
        />
      )}

      {p.slots.length > 0 && (
        <BackupNotice
          campaigns={p.slots.length}
          playedDays={states.reduce((n, s) => n + s.journal.length, 0)}
          today={p.today}
          exportedAt={exportedAt}
          onExportAll={exportAll}
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
          <h1>GerdQuest Calendar</h1>
          <p className="tagline">One page of adventure for every day on the calendar. Tear off today’s, play it, and the next stays sealed until tomorrow.</p>
          <button className="primary big" onClick={p.onNew}>
            Start your first campaign
          </button>
          <button className="linkish" onClick={p.onImport}>
            or import a save code or file
          </button>
        </main>
      ) : mode === 'shelf' ? (
        <Shelf slots={p.slots} progress={p.progress} today={p.today} onOpenChest={p.onOpenChest} />
      ) : mode === 'calendar' ? (
        <div className="skin" {...styleAttrs(active.state)}>
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
        </div>
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
              data-tour="next-arrow"
              disabled={!forward}
              title={forward ? 'Next day' : forwardHint}
              onClick={goForward}
            >
              ›
            </button>
          </header>

          {forwardHint && <p className="forward-hint small muted">{forwardHint}</p>}

          <TabStrip>
            {p.slots.map((s) => {
              const v = tabView(s.state, p.viewDate)
              const c = campaign(s.state.campaignId)
              return (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={s.id === active.id}
                  className={`tab ${s.id === active.id ? 'selected' : ''} ${v.kind === 'notStarted' ? 'not-started' : ''}`}
                  title={v.kind === 'notStarted' ? `${c.title} begins ${formatLong(v.begins)}` : c.title}
                  style={{ ['--camp' as string]: campColor(p.slots, s) }}
                  onClick={() => p.onSelect(s.id)}
                  ref={s.id === active.id ? revealTab : undefined}
                >
                  <TabMark view={v} state={s.state} owed={pagesOwed(s.state, p.viewDate)} />
                  {v.kind === 'notStarted' && <span className="tab-when">starts {shortDate(v.begins)}</span>}
                  <span className="tab-title">{c.title}</span>
                  {v.kind === 'blocked' && <span className="tab-behind">{pagesOwed(s.state, p.viewDate)} behind</span>}
                  <span className="tab-hero">{s.state.hero?.name.split(' ')[0]}</span>
                </button>
              )
            })}
          </TabStrip>
          </div>

          <CampaignPanel
            key={active.id}
            slot={active}
            viewDate={p.viewDate}
            today={p.today}
            dispatch={(a) => p.onDispatch(active.id, a)}
            onDate={p.onDate}
            onDelete={() => p.onDelete(active.id)}
            onExport={() => exportOne(active.state)}
            onNext={forward ? goForward : undefined}
            nextHint={forwardHint}
          />
        </>
      )}

      {p.slots.length > 0 && mode === 'day' && <Tutorial today={p.today} veteran={p.progress.days.length > 10} />}

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
  onExport: () => void
  /** Turn to the next page (undefined when › is unavailable). */
  onNext?: () => void
  /** Why › is unavailable, or a note about other campaigns. */
  nextHint?: string
}

/** One campaign's page for the viewed date, plus its hero sheet. */
export function CampaignPanel({ slot, viewDate, today, dispatch, onDate, onDelete, onExport, onNext, nextHint }: PanelProps) {
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
        <DayView state={state} day={day} dispatch={dispatch} today={today} onNext={onNext} nextHint={nextHint} />
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
    const partial = !!c.chaptersWritten && !!c.chaptersPlanned && c.chaptersWritten < c.chaptersPlanned
    // The Verdant Accord's running tally from Chapter 5: marks that kept the Accord against marks that let the Wilds in.
    const late = c.id === 'verdant' ? (state.legacy ?? []).filter((m) => Number(/^va_l(\d+)_/.exec(m)?.[1] ?? 0) >= 5) : []
    const kept = late.filter((m) => m.endsWith('_win')).length
    main = partial ? (
      <article className="day notice">
        <h2>The story so far</h2>
        <p className="narrative">
          {c.title} is still being written: {c.chaptersWritten} of {c.chaptersPlanned} chapters are ready. {state.hero!.name}’s tale continues when the next chapter arrives. Look back through the Journal in the meantime.
        </p>
        {late.length > 0 && (
          <p className="muted small">
            The tally since Chapter 5: Accord kept {kept}, Wilds let in {late.length - kept}.
          </p>
        )}
      </article>
    ) : (
      <article className="day notice">
        <h2>The end of {c.title}</h2>
        <p className="narrative">{state.hero!.name}’s story in this campaign is complete. Look back through the Journal.</p>
      </article>
    )
  }

  return (
    <div className="layout skin" {...styleAttrs(state)}>
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
          <button onClick={onExport}>Export</button>
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
