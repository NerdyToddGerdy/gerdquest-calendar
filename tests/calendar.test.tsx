import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, formatLong, formatSpan, weekday } from '@questender/engine/calendar'
import {
  alignedOnOrBefore,
  authoredDate,
  campaign,
  defaultStartDate,
  isLotteryPage,
  isPageUnlocked,
  pageDate,
  pageDates,
  pageEndDate,
  startDateOptions,
  unlockedThrough,
} from '@questender/engine/campaign'
import { canTurnPage, nextPageLockedUntil, pagesBehind, slotStatus } from '@questender/engine/status'
import { canAdvance, initialState, reduce } from '@questender/engine/state'
import type { Campaign, Day, GameState } from '@questender/engine/types'
import { normalizeState } from '../src/save'
import { canGoForward, dayComplete, dayStatus, startingDate, tabView, turnPast } from '@questender/engine/desk'
import { CalendarView } from '../src/ui/CalendarView'
import { Desk } from '../src/ui/Desk'

const bw = campaign('brightwatch')

/** Minimal page for synthetic campaigns. */
const page = (id: string, month: number, day: number): Day => ({
  id, title: `Title ${id}`, scene: 'harbor', text: `Text ${id}`, steps: [], month, day,
})

const leapCampaign: Campaign = {
  id: 'leap', title: 'Leap', blurb: '', authoredYear: 2024, rulesetId: 'modern',
  pages: [page('a', 2, 28), page('b', 2, 29), page('c', 3, 1)],
}

/**
 * Brightwatch is authored for 2024: Mon Jan 1 … Fri Jan 5, a Sat/Sun weekend
 * page (Jan 6–7), then Mon Jan 8. Most tests anchor it at Mon 2026-01-05:
 *   page 0 Jan 5 · 1 Jan 6 · 2 Jan 7 · 3 Jan 8 · 4 Jan 9 · 5 Sat Jan 10–Sun Jan 11 · 6 Mon Jan 12
 */
const START = '2026-01-05'

/** The day after Brightwatch's last page when anchored at START. */
const AFTER_END = addDays(pageEndDate(bw, bw.pages.length - 1, START), 1)

function newGame(startDate = START, heroId = 'wren'): GameState {
  return reduce(initialState(), { type: 'NEW_GAME', heroId, seed: 3, campaignId: 'brightwatch', startDate })
}

/** Finish whatever is on the current page (Brightwatch page 1 is three checks). */
function finishPage(s: GameState): GameState {
  for (let guard = 0; guard < 50 && !canAdvance(s); guard++) {
    if (s.pending) {
      s = s.pending.type === 'pickpocket' ? reduce(s, { type: 'PICKPOCKET', take: false }) : reduce(s, { type: 'CONFIRM' })
      continue
    }
    const next = s.progress.steps.findIndex((x) => x === null)
    if (next >= 0) s = reduce(s, { type: 'CHOOSE', step: next, option: 0 })
    else s = reduce(s, { type: 'ROLL_ROUND' })
  }
  return s
}

describe('calendar math', () => {
  it('weekdays, leap days and formatting', () => {
    expect(weekday('2024-01-07')).toBe(0) // Sunday
    expect(weekday('2026-01-05')).toBe(1) // Monday
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1)
    expect(formatLong('2024-01-07')).toBe('Sunday, Jan 7, 2024')
    expect(formatSpan('2026-01-10', '2026-01-11')).toBe('Sat, Jan 10 – Sun, Jan 11')
  })
})

describe('start dates', () => {
  it('a new campaign starts on page one’s weekday, 4–10 days back', () => {
    expect(weekday(authoredDate(bw, 0))).toBe(1) // Jan 1, 2024 was a Monday
    for (let i = 0; i < 14; i++) {
      const today = addDays('2026-11-16', i)
      const start = defaultStartDate(bw, today)
      expect(weekday(start)).toBe(1)
      const back = daysBetween(start, today)
      expect(back).toBeGreaterThanOrEqual(4)
      expect(back).toBeLessThanOrEqual(10)
    }
    expect(defaultStartDate(bw, '2026-11-22')).toBe('2026-11-16')
  })

  it('offers a week earlier/later, never starting after today', () => {
    const today = '2026-11-22'
    const opts = startDateOptions(bw, today)
    expect(opts).toEqual(['2026-11-16', '2026-11-09'])
    expect(opts.every((d) => d <= today && weekday(d) === 1)).toBe(true)
    // When the later option would still be in the past it's offered too.
    expect(startDateOptions(bw, '2026-11-26')).toEqual(['2026-11-23', '2026-11-16', '2026-11-09'])
  })

  it('alignedOnOrBefore finds the anchor weekday', () => {
    expect(alignedOnOrBefore(bw, '2026-01-01')).toBe('2025-12-29') // Thu → previous Mon
    expect(alignedOnOrBefore(bw, '2026-01-05')).toBe('2026-01-05')
  })
})

describe('page mapping', () => {
  it('every page keeps its authored weekday', () => {
    for (let i = 0; i < bw.pages.length; i++) {
      expect(weekday(pageDate(bw, i, START))).toBe(weekday(authoredDate(bw, i)))
    }
    expect(pageDate(bw, 0, START)).toBe('2026-01-05')
    expect(pageDate(bw, 6, START)).toBe('2026-01-12')
  })

  it('weekend pages cover Saturday and Sunday and unlock on Saturday', () => {
    expect(pageDates(bw, 5, START)).toEqual(['2026-01-10', '2026-01-11'])
    expect(isPageUnlocked(bw, 5, START, '2026-01-09')).toBe(false)
    expect(isPageUnlocked(bw, 5, START, '2026-01-10')).toBe(true)
    expect(unlockedThrough(bw, START, '2026-01-11')).toBe(5)
    expect(unlockedThrough(bw, START, '2026-01-12')).toBe(6)
  })

  it('Feb 29 is just another day: no gaps or doubled pages in any year', () => {
    const start = alignedOnOrBefore(leapCampaign, '2026-03-10') // a Wednesday, like Feb 28, 2024
    const dates = [0, 1, 2].map((i) => pageDate(leapCampaign, i, start))
    expect(daysBetween(dates[0], dates[1])).toBe(1)
    expect(daysBetween(dates[1], dates[2])).toBe(1)
  })

  it('undated pages follow on after the previous page’s span', () => {
    const undated: Campaign = {
      ...leapCampaign,
      pages: [page('x', 1, 6), { ...page('y', 1, 1), month: undefined, day: undefined }],
    }
    undated.pages[0] = { ...undated.pages[0], span: 2 }
    expect(authoredDate(undated, 1)).toBe('2024-01-08')
  })

  it('lock boundary is the page date itself (local midnight)', () => {
    expect(isPageUnlocked(bw, 2, START, '2026-01-06')).toBe(false)
    expect(isPageUnlocked(bw, 2, START, '2026-01-07')).toBe(true)
    expect(unlockedThrough(bw, START, '2026-01-04')).toBe(-1)
  })
})

describe('weekday rules follow the real calendar', () => {
  it('the lottery is offered on the page covering Sunday', () => {
    expect([0, 1, 2, 3, 4, 5, 6].filter((i) => isLotteryPage(bw, i, START))).toEqual([5])
    expect([0, 1, 2, 3, 4, 5, 6].filter((i) => isLotteryPage(bw, i, '2026-11-16'))).toEqual([5])
  })

  it('LOTTERY is refused on a weekday page and allowed on the weekend page', () => {
    let s = newGame()
    expect(reduce(s, { type: 'LOTTERY' })).toBe(s)
    s = { ...s, dayIndex: 5 } // Sat 10 / Sun 11 — still allowed while catching up later
    const after = reduce(s, { type: 'LOTTERY' })
    expect(after.progress.lottery).toBe(true)
    expect(after.log[0].text).toMatch(/Sunday lottery/)
  })
})

describe('locking and catch-up', () => {
  it('NEXT_DAY is refused when the next page is still locked', () => {
    let s = finishPage(newGame())
    expect(canAdvance(s)).toBe(true)
    expect(reduce(s, { type: 'NEXT_DAY', today: '2026-01-05' })).toBe(s)
    expect(nextPageLockedUntil(s, '2026-01-05')).toBe('2026-01-06')
    expect(canTurnPage(s, '2026-01-05')).toBe(false)
    s = reduce(s, { type: 'NEXT_DAY', today: '2026-01-06' })
    expect(s.dayIndex).toBe(1)
    expect(s.journal).toHaveLength(1)
    expect(s.journal[0]).toMatchObject({ page: 0, date: '2026-01-05' })
    expect(s.journal[0].lines.length).toBeGreaterThan(0)
  })

  it('counts pages to catch up, excluding the page covering today', () => {
    const s = newGame()
    expect(pagesBehind(s, '2026-01-05')).toBe(0)
    expect(pagesBehind(s, '2026-01-08')).toBe(3) // Jan 5–7 owed, Jan 8 is today's
    expect(slotStatus(s, '2026-01-08')).toEqual({ kind: 'behind', behind: 3, ready: true })
    // Sunday: the weekend page (Sat–Sun) is today's page, not a missed one.
    expect(pagesBehind(s, '2026-01-11')).toBe(5)
    expect(slotStatus(s, '2026-01-11')).toEqual({ kind: 'behind', behind: 5, ready: true })
    expect(pagesBehind(s, AFTER_END)).toBe(bw.pages.length)
    expect(slotStatus(s, '2026-01-05')).toEqual({ kind: 'ready' })
    const done = finishPage(s)
    expect(slotStatus(done, '2026-01-05')).toEqual({ kind: 'done', next: '2026-01-06' })
  })

  it('a fresh campaign has warm-up pages to catch up on', () => {
    const today = '2026-11-22'
    const s = newGame(defaultStartDate(bw, today))
    expect(pagesBehind(s, today)).toBe(5) // Mon–Fri behind; the weekend page is today's
    expect(slotStatus(s, today)).toEqual({ kind: 'behind', behind: 5, ready: true })
  })

  it('a campaign starting in the future is not started yet', () => {
    expect(slotStatus(newGame('2026-11-30'), '2026-11-22')).toEqual({ kind: 'notStarted', unlocks: '2026-11-30' })
  })

  it('the last page can always be turned (finishes the campaign)', () => {
    const last = bw.pages.length - 1
    let s = { ...newGame(), dayIndex: last }
    s = {
      ...s,
      progress: {
        ...s.progress,
        steps: bw.pages[last].steps.map(() => 0),
        results: bw.pages[last].steps.map(() => 'x'),
        combat: { enemies: [], round: 9, done: true, won: true },
      },
    }
    s = reduce(s, { type: 'NEXT_DAY', today: AFTER_END })
    expect(s.finished).toBe(true)
  })
})

describe('no peeking', () => {
  const html = (states: GameState[], viewDate: string, today: string) =>
    renderToStaticMarkup(
      <Desk
        slots={states.map((state, i) => ({ id: `s${i}`, state }))}
        viewDate={viewDate}
        today={today}
        selected={null}
        onSelect={() => {}}
        onDate={() => {}}
        onForward={() => {}}
        onDispatch={() => {}}
        onNew={() => {}}
        onImport={() => {}}
        onDelete={() => {}}
        onTodayChanged={() => {}}
      />,
    )

  it('a campaign that has not begun renders nothing of its first page', () => {
    const out = html([newGame('2026-11-30')], '2026-11-22', '2026-11-22')
    expect(out).not.toContain(`>${bw.pages[0].title}<`)
    expect(out).not.toContain(bw.pages[0].text.slice(0, 30))
    expect(out).toContain('Not yet')
  })

  it("after finishing today's page, the next page's title never appears", () => {
    const s = finishPage(newGame())
    const out = html([s], '2026-01-05', '2026-01-05')
    expect(out).toContain(`>${bw.pages[0].title}<`)
    expect(out).not.toContain(bw.pages[1].title)
    expect(out).not.toContain(bw.pages[1].text.slice(0, 30))
    expect(out).toContain('The next page unlocks')
  })

  it('viewing a later date than a campaign has reached shows nothing of that page', () => {
    const out = html([newGame()], '2026-01-08', '2026-01-08')
    expect(out).toContain('Catch up first')
    expect(out).not.toContain(bw.pages[3].title)
  })
})

describe('desk: one date, every campaign', () => {
  it('each campaign shows what the date holds for it', () => {
    let s = finishPage(newGame())
    s = reduce(s, { type: 'NEXT_DAY', today: '2026-01-06' })
    expect(tabView(s, '2026-01-04')).toEqual({ kind: 'notStarted', begins: '2026-01-05' })
    expect(tabView(s, '2026-01-05')).toEqual({ kind: 'past', page: 0 })
    expect(tabView(s, '2026-01-06')).toEqual({ kind: 'play', page: 1 })
    expect(tabView(s, '2026-01-08')).toEqual({ kind: 'blocked', page: 3, catchUp: '2026-01-06' })
    expect(tabView(s, '2026-01-11')).toEqual({ kind: 'blocked', page: 5, catchUp: '2026-01-06' }) // Sunday half of the weekend page
    expect(tabView(s, AFTER_END)).toEqual({ kind: 'finished' })
  })

  it('› needs every campaign done with the date, and the next date not in the future', () => {
    const a = newGame()
    const b = newGame('2026-01-06') // a second run that starts a day later
    expect(dayComplete([a, b], '2026-01-05')).toBe(false) // a still has page 1 to play
    const aDone = finishPage(a)
    expect(dayComplete([aDone, b], '2026-01-05')).toBe(true) // b hasn't started yet
    expect(canGoForward([aDone, b], '2026-01-05', '2026-01-06')).toBe(true)
    expect(canGoForward([aDone, b], '2026-01-05', '2026-01-05')).toBe(false) // tomorrow is in the future
  })

  it('› turns the page only where the page ends that day (weekend pages span two)', () => {
    let s = { ...newGame(), dayIndex: 5 } // Sat Jan 10 – Sun Jan 11
    s = { ...s, progress: { ...s.progress, steps: [0, 0], results: ['x', 'y'], combat: { enemies: [], round: 5, done: true, won: true } } }
    expect(turnPast(s, '2026-01-10')).toBe(s) // Saturday → Sunday: same page
    const mon = turnPast(s, '2026-01-11')
    expect(mon.dayIndex).toBe(6)
    expect(mon.journal.at(-1)).toMatchObject({ page: 5, date: '2026-01-10' })
  })

  it('opens on the earliest date anything still needs playing', () => {
    const a = finishPage(newGame()) // needs Jan 6 next
    const b = newGame('2026-01-12') // starts later
    expect(startingDate([a, b], '2026-01-20')).toBe('2026-01-06')
    expect(startingDate([], '2026-01-20')).toBe('2026-01-20')
    expect(startingDate([a], '2026-01-05')).toBe('2026-01-05') // never past today
  })
})

describe('save migration', () => {
  it('v1 saves (no campaign, no dates) start a week back, with a rebuilt journal', () => {
    const v1 = { ...newGame(), dayIndex: 2 } as Partial<GameState>
    delete v1.campaignId
    delete v1.startDate
    delete v1.journal
    v1.log = [
      { day: 1, text: 'second' },
      { day: 0, text: 'first b' },
      { day: 0, text: 'first a' },
    ]
    const s = normalizeState(v1 as GameState, '2026-11-22')
    expect(s.campaignId).toBe('brightwatch')
    expect(s.startDate).toBe('2026-11-16')
    expect(s.journal.map((j) => j.date)).toEqual(['2026-11-16', '2026-11-17'])
    expect(s.journal[0].lines).toEqual(['first a', 'first b'])
  })

  it('play-year saves keep their progress and gain weekday alignment', () => {
    const old = { ...newGame() } as GameState & { playYear?: number }
    delete (old as Partial<GameState>).startDate
    old.playYear = 2026
    const s = normalizeState(old, '2026-11-22') as GameState & { playYear?: number }
    expect(s.startDate).toBe('2025-12-29') // Monday on/before Jan 1, 2026
    expect(s.playYear).toBeUndefined()
  })
})

describe('calendar × ruleset integration', () => {
  it('rulesets without a lottery never offer one, even on weekends', () => {
    const classic: Campaign = { ...bw, id: 'classic-test', rulesetId: 'classic' }
    expect([0, 1, 2, 3, 4, 5, 6].filter((i) => isLotteryPage(classic, i, START))).toEqual([])
  })

  it('a new game takes its ruleset from the campaign', () => {
    expect(newGame().rulesetId).toBe('modern')
  })
})

describe('calendar view statuses', () => {
  it('completed / available / locked / none per date', () => {
    let s = finishPage(newGame()) // page 0 (Jan 5) done, not yet turned
    const today = '2026-01-08'
    expect(dayStatus(s, '2026-01-04', today)).toBe('none') // before the campaign
    expect(dayStatus(s, '2026-01-05', today)).toBe('completed')
    expect(dayStatus(s, '2026-01-06', today)).toBe('available')
    expect(dayStatus(s, '2026-01-08', today)).toBe('available') // today
    expect(dayStatus(s, '2026-01-09', today)).toBe('locked')
    expect(dayStatus(s, '2026-01-11', today)).toBe('locked') // Sunday half of the weekend page
    expect(dayStatus(s, AFTER_END, today)).toBe('none') // after the last page
    s = reduce(s, { type: 'NEXT_DAY', today: '2026-01-06' })
    expect(dayStatus(s, '2026-01-05', today)).toBe('completed')
    expect(dayStatus(s, '2026-01-06', today)).toBe('available')
  })

  it('the calendar never shows page titles', () => {
    const s = finishPage(newGame())
    const out = renderToStaticMarkup(<CalendarView slots={[{ id: 'a', state: s }]} viewDate="2026-01-05" today="2026-01-08" onPick={() => {}} />)
    // (Page 1's title, "Brightwatch", is also part of the campaign name, so it's skipped.)
    for (const p of bw.pages) if (!bw.title.includes(p.title)) expect(out).not.toContain(p.title)
    for (const p of bw.pages) expect(out).not.toContain(p.text.slice(0, 30))
    expect(out).toContain('Completed')
    expect(out).toContain('Locked')
  })
})

describe('calendar views never reveal non-completed pages', () => {
  const today = '2026-01-08'
  const s = finishPage(newGame()) // page 0 completed; pages 1+ available/locked
  const render = (view: 'month' | 'wall' | 'week' | 'year', selected: string | null = null, date = '2026-01-05') =>
    renderToStaticMarkup(
      <CalendarView
        slots={[{ id: 'a', state: s }]}
        viewDate={date}
        today={today}
        onPick={() => {}}
        initialView={view}
        initialSelected={selected}
        initialEntries={[{ id: 'e1', date: '2026-01-09', text: 'Pay rent', time: '08:00' }]}
      />,
    )
  const hidden = bw.pages.filter((p) => !bw.title.includes(p.title) && p !== bw.pages[0])

  for (const view of ['month', 'wall', 'week', 'year'] as const) {
    it(`${view} view hides titles and text of pages not yet completed`, () => {
      const out = render(view)
      for (const p of hidden) expect(out).not.toContain(p.title)
      for (const p of bw.pages) expect(out).not.toContain(p.text.slice(0, 30))
    })
  }

  it('wall shows the title of completed pages only', () => {
    const out = render('wall')
    expect(out).toContain(`>${bw.pages[0].title}<`)
    for (const p of hidden) expect(out).not.toContain(p.title)
    expect(render('month')).not.toContain(`>${bw.pages[0].title}<`)
  })

  it('the day panel shows a completed title, but nothing for available or locked days', () => {
    expect(render('month', '2026-01-05')).toContain(bw.pages[0].title)
    for (const day of ['2026-01-06', '2026-01-08', '2026-01-09', '2026-01-11']) {
      const out = render('wall', day)
      for (const p of hidden) expect(out).not.toContain(p.title)
    }
  })

  it('entries render in cells and the panel; future dates allow entries but not opening', () => {
    expect(render('week')).toContain('Pay rent')
    const future = render('month', '2026-01-09')
    expect(future).toContain('Pay rent')
    expect(future).toContain('Add entry')
    expect(future).not.toContain('Open this day')
    expect(render('month', '2026-01-06')).toContain('Open this day')
  })

  it('week view shows holidays and moon phases; year view has twelve months', () => {
    const wk = renderToStaticMarkup(<CalendarView slots={[{ id: 'a', state: s }]} viewDate="2026-01-19" today={today} onPick={() => {}} initialView="week" initialEntries={[]} />)
    expect(wk).toContain('Martin Luther King Jr. Day')
    const yr = render('year')
    for (const m of ['January', 'June', 'December']) expect(yr).toContain(`>${m}<`)
    expect(yr.match(/class="mini-month"/g)).toHaveLength(12)
  })

  it('marks note-taken dates per campaign (names only, never the notes text) and respects the layout', () => {
    const noted = { ...s, notes: 'SECRET NOTE TEXT', noteDates: ['2026-01-06'] }
    for (const view of ['month', 'wall', 'week', 'year'] as const) {
      const out = renderToStaticMarkup(
        <CalendarView slots={[{ id: 'a', state: noted }]} viewDate="2026-01-05" today={today} onPick={() => {}} initialView={view} initialEntries={[]} />,
      )
      expect(out).toContain('Note taken')
      expect(out).not.toContain('SECRET NOTE TEXT')
    }
    const panel = renderToStaticMarkup(
      <CalendarView slots={[{ id: 'a', state: noted }]} viewDate="2026-01-05" today={today} onPick={() => {}} initialSelected="2026-01-06" initialEntries={[]} />,
    )
    expect(panel).toContain('Notes taken that day')
    expect(panel).not.toContain('SECRET NOTE TEXT')
    const none = renderToStaticMarkup(<CalendarView slots={[{ id: 'a', state: s }]} viewDate="2026-01-05" today={today} onPick={() => {}} initialSelected="2026-01-06" initialEntries={[]} />)
    expect(none).not.toContain('Notes taken that day')
  })
})
