// Return rewards, achievements and per-campaign keepsakes and looks.
import { describe, expect, it } from 'vitest'
import { addDays, weekStart } from '@questender/engine/calendar'
import { BUNDLED_CATALOG } from '@questender/engine/content/bundled'
import { campaign, pageDate } from '@questender/engine/campaign'
import { item } from '@questender/engine/content'
import { chestLoot, CHEST_CURRENCY } from '@questender/engine/chest'
import { ACHIEVEMENTS, hasQuietStretch, newlyEarned, seenBothRoads, type AchievementContext } from '@questender/engine/achievements'
import {
  chestsAvailable,
  emptyProgress,
  mergeProgress,
  recordAchievements,
  recordChest,
  recordVisit,
  sanitizeProgress,
  syncProgress,
  welcomeDue,
  type Progress,
} from '@questender/engine/progress'
import { REWARDS, hasRerollKeepsake, keepsakesEarned, stylesUnlocked } from '@questender/engine/rewards'
import { canAdvance, initialState, playedDates, reduce } from '@questender/engine/state'
import type { GameState } from '@questender/engine/types'
import { bundleSaves, parseProgress, parseSaves } from '../src/save'

const TODAY = '2026-03-18' // a Wednesday
const START = '2026-03-11'

function game(campaignId = 'brightwatch', startDate = START, heroId = 'wren'): GameState {
  return reduce(initialState(), { type: 'NEW_GAME', heroId, seed: 3, campaignId, startDate })
}

/** The run with its first n pages already in the journal (no need to play them). */
function withPages(s: GameState, n: number): GameState {
  const c = campaign(s.campaignId)
  const journal = Array.from({ length: n }, (_, page) => ({ page, date: pageDate(c, page, s.startDate), lines: [] }))
  return { ...s, journal, dayIndex: n, finished: n >= c.pages.length }
}

function finishPage(s: GameState): GameState {
  for (let guard = 0; guard < 50 && !canAdvance(s); guard++) {
    if (s.pending) {
      s = s.pending.type === 'pickpocket' ? reduce(s, { type: 'PICKPOCKET', take: false }) : reduce(s, { type: 'CONFIRM' })
      continue
    }
    const next = s.progress.steps.findIndex((x) => x === null)
    s = next >= 0 ? reduce(s, { type: 'CHOOSE', step: next, option: 0 }) : reduce(s, { type: 'ROLL_ROUND' })
  }
  return s
}

const ctx = (states: GameState[], progress: Progress = emptyProgress(), today = TODAY): AchievementContext => ({
  states,
  progress: syncProgress(progress, states, today),
  today,
})
const earned = (c: AchievementContext) => newlyEarned(c)

describe('weeks and days played', () => {
  it('weeks run Monday to Sunday, across month, year and daylight-saving changes', () => {
    expect(weekStart('2026-03-18')).toBe('2026-03-16')
    expect(weekStart('2026-03-16')).toBe('2026-03-16')
    expect(weekStart('2026-03-22')).toBe('2026-03-16') // Sunday belongs to the week before it
    expect(weekStart('2026-03-23')).toBe('2026-03-23')
    expect(weekStart('2026-01-01')).toBe('2025-12-29')
    expect(weekStart('2026-03-09')).toBe('2026-03-09') // the day after US clocks changed
    expect(weekStart('2026-11-02')).toBe('2026-11-02')
  })

  it('counts a run’s own days: journal dates plus the page just completed, catch-up included', () => {
    const s = game()
    expect(playedDates(s)).toEqual([])
    const done = finishPage(s)
    expect(canAdvance(done)).toBe(true)
    expect(playedDates(done)).toEqual([START])
    // three pages caught up in one sitting still count as three days
    expect(playedDates(withPages(s, 3))).toEqual([START, addDays(START, 1), addDays(START, 2)])
  })

  it('keeps each campaign’s days separate', () => {
    const a = withPages(game('brightwatch'), 4)
    const b = withPages(game('halcyon', '2026-03-13'), 2)
    expect(playedDates(a)).toHaveLength(4)
    expect(playedDates(b)).toHaveLength(2)
    // the desk record sees the union of dates, never counting a date twice
    const p = syncProgress(emptyProgress(), [a, b], TODAY)
    expect(p.days.length).toBe(new Set([...playedDates(a), ...playedDates(b)]).size)
  })

  it('never records a date after today, and returns the same object when nothing changed', () => {
    const s = withPages(game(), 10) // pages stretch past today
    const p = syncProgress(emptyProgress(), [s], TODAY)
    expect(p.days.every((d) => d <= TODAY)).toBe(true)
    expect(syncProgress(p, [s], TODAY)).toBe(p)
  })

  it('recordVisit notes a return after 3 or more days away, and never punishes a gap', () => {
    let p = recordVisit(emptyProgress(), '2026-03-10')
    expect(p.lastVisit).toBe('2026-03-10')
    expect(p.returnedOn).toBeNull()
    p = recordVisit(p, '2026-03-12') // two days: not a return
    expect(p.returnedOn).toBeNull()
    p = recordVisit(p, '2026-03-15') // three days
    expect(p.returnedOn).toBe('2026-03-15')
    expect(welcomeDue(p, '2026-03-15')).toBe(true)
    expect(welcomeDue(p, '2026-03-16')).toBe(false)
    // another visit the same day keeps the welcome due
    expect(welcomeDue(recordVisit(p, '2026-03-15'), '2026-03-15')).toBe(true)
    // an earlier pinned date never rewinds lastVisit
    expect(recordVisit(p, '2026-03-01').lastVisit).toBe('2026-03-15')
  })
})

describe('Well rested (WELCOME_BACK)', () => {
  it('grants a Boon with a line in the log, once per return', () => {
    const s = game('brightwatch')
    const a = reduce(s, { type: 'WELCOME_BACK', date: TODAY })
    expect(a.hero!.boon).toBe(true)
    expect(a.log[0].text).toMatch(/Well rested/)
    expect(a.welcomedOn).toBe(TODAY)
    // idempotent: the same return again does nothing
    expect(reduce(a, { type: 'WELCOME_BACK', date: TODAY })).toBe(a)
    // a later return is a new welcome (Boon already held: noted, not stacked)
    const b = reduce(a, { type: 'WELCOME_BACK', date: '2026-04-02' })
    expect(b.hero!.boon).toBe(true)
    expect(b.log[0].text).toMatch(/already hold a Boon/)
  })

  it('gives rulesets without Boons a small bonus to every roll instead', () => {
    const s = game('emberroad', '2026-03-14', 'garrick')
    const a = reduce(s, { type: 'WELCOME_BACK', date: TODAY })
    expect(a.hero!.boon).toBe(false)
    expect(a.hero!.pageBonus.roll).toBe(1)
  })

  it('only applies to a page nothing has been done on', () => {
    let s = game()
    s = reduce(s, { type: 'CHOOSE', step: 0, option: 0 })
    if (s.pending) s = reduce(s, { type: 'CONFIRM' })
    expect(reduce(s, { type: 'WELCOME_BACK', date: TODAY })).toBe(s)
  })
})

describe('weekly chest', () => {
  const week = (n: number): Progress => ({ ...emptyProgress(), days: Array.from({ length: n }, (_, i) => addDays('2026-03-16', i)) })

  it('needs 5 distinct days within a Monday to Sunday week', () => {
    expect(chestsAvailable(week(4), TODAY)).toEqual([])
    expect(chestsAvailable(week(5), TODAY)).toEqual(['2026-03-16'])
    // days split across two weeks don't add up
    const split = { ...emptyProgress(), days: ['2026-03-13', '2026-03-14', '2026-03-15', '2026-03-16', '2026-03-17'] }
    expect(chestsAvailable(split, TODAY)).toEqual([])
  })

  it('stays available for last week, not older ones', () => {
    const p = week(5)
    expect(chestsAvailable(p, '2026-03-25')).toEqual(['2026-03-16'])
    expect(chestsAvailable(p, '2026-04-01')).toEqual([])
  })

  it('can be opened once a week, in the campaign chosen', () => {
    let p = week(5)
    p = recordChest(p, '2026-03-16', 'halcyon', TODAY)
    expect(p.chests).toEqual([{ week: '2026-03-16', campaignId: 'halcyon', date: TODAY }])
    expect(chestsAvailable(p, TODAY)).toEqual([])
    expect(recordChest(p, '2026-03-16', 'brightwatch', TODAY)).toBe(p)
  })

  it('pays a small purse and one healing item, and the reducer opens each week once', () => {
    for (const e of BUNDLED_CATALOG) {
      const loot = chestLoot(e.id)
      expect(item(loot.itemId).kind, e.id).toBe('heal')
      expect(loot.currency).toBe(CHEST_CURRENCY)
      expect(loot.currency).toBeLessThanOrEqual(10)
    }
    const s = game('halcyon', '2026-03-13', 'marisol')
    const before = s.hero!.glint
    const potions = s.hero!.inventory[chestLoot('halcyon').itemId] ?? 0
    const a = reduce(s, { type: 'OPEN_CHEST', week: '2026-03-16' })
    expect(a.hero!.glint).toBe(before + CHEST_CURRENCY)
    expect(a.hero!.inventory[chestLoot('halcyon').itemId]).toBe(potions + 1)
    expect(a.log[0].text).toMatch(/credits/)
    expect(reduce(a, { type: 'OPEN_CHEST', week: '2026-03-16' })).toBe(a)
    expect(reduce(a, { type: 'OPEN_CHEST', week: '2026-03-23' }).hero!.glint).toBe(before + 2 * CHEST_CURRENCY)
  })
})

describe('per-campaign keepsakes and looks', () => {
  it('unlocks at each campaign’s own milestones', () => {
    for (const [cid, theme] of Object.entries(REWARDS)) {
      expect(theme.keepsakes.length, cid).toBe(5)
      const days = theme.keepsakes.map((k) => k.days)
      expect(days).toEqual([...days].sort((a, b) => a - b))
      expect(keepsakesEarned(cid, 0)).toHaveLength(0)
      expect(keepsakesEarned(cid, days[0] - 1)).toHaveLength(0)
      expect(keepsakesEarned(cid, days[0])).toHaveLength(1)
      expect(keepsakesEarned(cid, days[4])).toHaveLength(5)
      expect(stylesUnlocked(cid, days[2]).map((s) => s.category).sort()).toEqual(['dice', 'edge', 'paper'])
    }
    expect(REWARDS.brightwatch.keepsakes.map((k) => k.days)).toEqual([7, 30, 100, 200, 365])
    // Verdant is a partial year, so every milestone is reachable
    expect(Math.max(...REWARDS.verdant.keepsakes.map((k) => k.days))).toBeLessThanOrEqual(campaign('verdant').pages.length)
  })

  it('one run reaching a milestone unlocks nothing for another', () => {
    const a = withPages(game('brightwatch'), 7)
    const b = withPages(game('halcyon', '2026-03-13'), 6)
    expect(stylesUnlocked(a.campaignId, playedDates(a).length).map((s) => s.id)).toEqual(['brightwatch-edge'])
    expect(stylesUnlocked(b.campaignId, playedDates(b).length)).toEqual([])
  })

  it('SET_STYLE only accepts unlocked looks, and null returns to default', () => {
    const young = withPages(game('brightwatch'), 3)
    expect(reduce(young, { type: 'SET_STYLE', category: 'paper', id: 'brightwatch-paper' })).toBe(young)
    const s = withPages(game('brightwatch'), 7)
    const a = reduce(s, { type: 'SET_STYLE', category: 'edge', id: 'brightwatch-edge' })
    expect(a.style).toEqual({ edge: 'brightwatch-edge' })
    expect(reduce(a, { type: 'SET_STYLE', category: 'edge', id: 'halcyon-edge' })).toBe(a)
    expect(reduce(a, { type: 'SET_STYLE', category: 'edge', id: null }).style).toEqual({})
  })

  it('the 30-day keepsake gives one free d20 reroll per week', () => {
    expect(hasRerollKeepsake('brightwatch', 29)).toBe(false)
    expect(hasRerollKeepsake('brightwatch', 30)).toBe(true)
    const base = withPages(game('brightwatch'), 30)
    const slot = { id: 'check', label: 'A check', kind: 'check' as const, die: 20, natural: 5, mods: [] }
    let p = reduce({ ...base, pending: { type: 'check', step: 0, option: 0, slot } }, { type: 'KEEPSAKE_REROLL', slot: 'check', today: TODAY })
    expect(p.perkWeek).toBe(weekStart(TODAY))
    expect(reduce(p, { type: 'KEEPSAKE_REROLL', slot: 'check', today: addDays(TODAY, 1) })).toBe(p)
    expect(reduce(p, { type: 'KEEPSAKE_REROLL', slot: 'check', today: addDays(TODAY, 7) })).not.toBe(p)
  })

  it('refuses the reroll before the keepsake is earned', () => {
    const s = game()
    expect(reduce(s, { type: 'KEEPSAKE_REROLL', slot: 'x', today: TODAY })).toBe(s)
  })
})

describe('achievements', () => {
  const ids = (c: AchievementContext) => earned(c)

  it('has about fifteen, all with a hint that does not use meta strings or all caps', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(15)
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length)
    for (const a of ACHIEVEMENTS) {
      for (const t of [a.name, a.hint, a.text]) {
        expect(t).not.toMatch(/·/)
        expect(t).not.toMatch(/\b[A-Z]{4,}\b/)
      }
    }
  })

  it('nothing is earned on a fresh desk', () => {
    expect(ids(ctx([]))).toEqual([])
    expect(ids(ctx([game()]))).toEqual([])
  })

  it('First light: the first completed page', () => {
    expect(ids(ctx([finishPage(game())]))).toContain('first-light')
    expect(ids(ctx([withPages(game(), 1)]))).toContain('first-light')
  })

  it('A week of pages: seven days played', () => {
    expect(ids(ctx([withPages(game(), 6)]))).not.toContain('week-of-pages')
    expect(ids(ctx([withPages(game(), 7)]))).toContain('week-of-pages')
  })

  it('Juggler: three campaigns on the desk', () => {
    const two = [game('brightwatch'), game('halcyon', '2026-03-13')]
    expect(ids(ctx(two))).not.toContain('juggler')
    expect(ids(ctx([...two, game('starwake', '2026-03-13')]))).toContain('juggler')
  })

  it('All caught up: seven days played with no campaign behind', () => {
    const start = '2026-03-04'
    const caughtUp = withPages(game('brightwatch', start), 15) // pages through today
    expect(ids(ctx([caughtUp]))).toContain('all-caught-up')
    const behind = withPages(game('brightwatch', start), 8)
    expect(ids(ctx([behind]))).not.toContain('all-caught-up')
    expect(ids(ctx([withPages(game('brightwatch', START), 3)]))).not.toContain('all-caught-up')
  })

  it('Fortune’s favourite and Snake eyes survivor read the run’s feats', () => {
    const s = game()
    expect(ids(ctx([{ ...s, feats: ['bossCrit'] }]))).toContain('fortunes-favourite')
    expect(ids(ctx([{ ...s, feats: ['nat1Won'] }]))).toContain('snake-eyes-survivor')
    expect(ids(ctx([s]))).not.toContain('snake-eyes-survivor')
  })

  it('Lottery fool: five lost lotteries across runs', () => {
    const a = { ...game(), lotteryLosses: 3 }
    const b = { ...game('halcyon', '2026-03-13'), lotteryLosses: 1 }
    expect(ids(ctx([a, b]))).not.toContain('lottery-fool')
    expect(ids(ctx([a, { ...b, lotteryLosses: 2 }]))).toContain('lottery-fool')
  })

  it('Hoarder: 200 currency in one purse', () => {
    const s = game()
    expect(ids(ctx([{ ...s, hero: { ...s.hero!, glint: 199 } }]))).not.toContain('hoarder')
    expect(ids(ctx([{ ...s, hero: { ...s.hero!, glint: 200 } }]))).toContain('hoarder')
  })

  it('A quiet stretch: seven fight-free pages in a row', () => {
    const c = campaign('brightwatch')
    const first = c.pages.findIndex((_, i) => c.pages.slice(i, i + 7).length === 7 && c.pages.slice(i, i + 7).every((p) => !p.combat))
    expect(first).toBeGreaterThanOrEqual(0)
    const s = game()
    const upTo = (n: number): GameState => {
      const journal = Array.from({ length: n }, (_, page) => ({ page, date: pageDate(c, page, s.startDate), lines: [] }))
      return { ...s, journal, dayIndex: n }
    }
    expect(hasQuietStretch(upTo(first + 6))).toBe(false)
    expect(hasQuietStretch(upTo(first + 7))).toBe(true)
  })

  it('Both roads: both outcomes of one Verdant chapter across runs', () => {
    expect(seenBothRoads(['va_l1_win', 'va_l2_loss'])).toBe(false)
    expect(seenBothRoads(['va_l2_win', 'va_l2_loss'])).toBe(true)
    // remembered after a run is deleted: the record keeps the marks
    const a = { ...game('verdant', '2026-03-13', 'va_brannoc'), legacy: ['va_l1_win'] }
    let p = syncProgress(emptyProgress(), [a], TODAY)
    const b = { ...a, legacy: ['va_l1_loss'] }
    p = syncProgress(p, [b], TODAY)
    expect(ids({ states: [], progress: p, today: TODAY })).toContain('both-roads')
  })

  it('Keepsake keeper: every keepsake of one campaign', () => {
    const s = game('brightwatch')
    const c = campaign('brightwatch')
    const journal = Array.from({ length: 365 }, (_, i) => ({ page: Math.min(i, c.pages.length - 1), date: addDays(START, i), lines: [] }))
    expect(ids(ctx([{ ...s, journal: journal.slice(0, 364) }]))).not.toContain('keepsake-keeper')
    expect(ids(ctx([{ ...s, journal }]))).toContain('keepsake-keeper')
  })

  it('Completionist and the per-campaign finish achievements', () => {
    const s = withPages(game('halcyon', '2026-03-13'), campaign('halcyon').pages.length)
    expect(s.finished).toBe(true)
    const got = ids(ctx([s]))
    expect(got).toContain('completionist')
    expect(got).toContain('finish-halcyon')
    expect(got).not.toContain('finish-brightwatch')
  })

  it('Homecoming: a Well rested welcome was received', () => {
    expect(ids(ctx([reduce(game(), { type: 'WELCOME_BACK', date: TODAY })]))).toContain('homecoming')
  })

  it('First chest', () => {
    const p = recordChest({ ...emptyProgress(), days: Array.from({ length: 5 }, (_, i) => addDays('2026-03-16', i)) }, '2026-03-16', 'brightwatch', TODAY)
    expect(ids({ states: [], progress: p, today: TODAY })).toContain('first-chest')
  })

  it('recording keeps the earliest date and never duplicates', () => {
    let p = recordAchievements(emptyProgress(), ['first-light'], '2026-03-10')
    p = recordAchievements(p, ['first-light', 'juggler'], '2026-03-12')
    expect(p.achievements).toEqual([
      { id: 'first-light', date: '2026-03-10' },
      { id: 'juggler', date: '2026-03-12' },
    ])
    expect(newlyEarned({ states: [withPages(game(), 1)], progress: syncProgress(p, [withPages(game(), 1)], TODAY), today: TODAY })).not.toContain('first-light')
  })
})

describe('progress export, import and merge', () => {
  const a: Progress = {
    ...emptyProgress(),
    days: ['2026-03-10', '2026-03-12'],
    lastVisit: '2026-03-12',
    achievements: [{ id: 'first-light', date: '2026-03-10' }],
    chests: [{ week: '2026-03-09', campaignId: 'brightwatch', date: '2026-03-13' }],
    marks: ['va_l1_win'],
  }
  const b: Progress = {
    ...emptyProgress(),
    days: ['2026-03-11', '2026-03-12'],
    lastVisit: '2026-03-17',
    achievements: [
      { id: 'first-light', date: '2026-03-08' },
      { id: 'juggler', date: '2026-03-15' },
    ],
    chests: [{ week: '2026-03-09', campaignId: 'halcyon', date: '2026-03-11' }],
    marks: ['va_l1_loss'],
  }

  it('merges as a union: days, marks and achievements, earliest dates winning', () => {
    const m = mergeProgress(a, b)
    expect(m.days).toEqual(['2026-03-10', '2026-03-11', '2026-03-12'])
    expect(m.marks).toEqual(['va_l1_loss', 'va_l1_win'])
    expect(m.achievements).toEqual([
      { id: 'first-light', date: '2026-03-08' },
      { id: 'juggler', date: '2026-03-15' },
    ])
    expect(m.chests).toEqual([{ week: '2026-03-09', campaignId: 'halcyon', date: '2026-03-11' }])
    expect(m.lastVisit).toBe('2026-03-17')
    expect(mergeProgress(a, b)).toEqual(mergeProgress(b, a))
  })

  it('round-trips in an Export all bundle and ignores junk', () => {
    const text = JSON.stringify(bundleSaves([game()], TODAY, [], a))
    expect(parseProgress(text)).toEqual(a)
    expect(parseSaves(text, TODAY)).toHaveLength(1)
    expect(sanitizeProgress({ days: ['nope', '2026-03-10', 4], achievements: [{ id: 3 }], lastVisit: 'x' })).toEqual({ ...emptyProgress(), days: ['2026-03-10'] })
  })

  it('old bundles and single-campaign files still import, with no progress', () => {
    const old = JSON.stringify(bundleSaves([game()], TODAY))
    expect(parseProgress(old)).toBeNull()
    expect(parseSaves(old, TODAY)).toHaveLength(1)
    expect(parseProgress(JSON.stringify(game()))).toBeNull()
    expect(parseSaves(JSON.stringify(game()), TODAY)).toHaveLength(1)
    expect(parseProgress('not json')).toBeNull()
  })

  it('a run’s looks and welcome date travel with its own export', () => {
    const s = reduce(withPages(game('brightwatch'), 7), { type: 'SET_STYLE', category: 'edge', id: 'brightwatch-edge' })
    const back = parseSaves(JSON.stringify(s), TODAY)[0]
    expect(back.style).toEqual({ edge: 'brightwatch-edge' })
    expect(playedDates(back)).toHaveLength(7)
    expect(stylesUnlocked(back.campaignId, playedDates(back).length).map((x) => x.id)).toContain('brightwatch-edge')
  })
})
