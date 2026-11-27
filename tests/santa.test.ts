// Saving Santa, the December advent campaign: calendar shape, seasonal
// availability, content integrity, scene art, holiday rewards and
// achievements, and a seeded playthrough with every hero.
import { describe, expect, it } from 'vitest'
import { addDays } from '@questender/engine/calendar'
import {
  authoredDate,
  availableCatalog,
  campaign,
  defaultStartDate,
  eventsToStart,
  isInSeason,
  pageDate,
  pageSpan,
  seasonDaysLeft,
  seasonalEvents,
  startDateOptions,
  unlockedThrough,
} from '@questender/engine/campaign'
import { ability, enemy, heroDef, item } from '@questender/engine/content'
import { BUNDLED_CATALOG } from '@questender/engine/content/bundled'
import { ACHIEVEMENTS, adventYears, everyDoorOnItsDay, NICE_LIST_VIRTUE, type AchievementContext } from '@questender/engine/achievements'
import { emptyProgress } from '@questender/engine/progress'
import { keepsakesEarned, REWARDS } from '@questender/engine/rewards'
import { TOKEN_REWARDS } from '@questender/engine/tokens'
import { canAdvance, initialState, reduce } from '@questender/engine/state'
import { SANTA_SCENES, type Day, type Effect, type GameState } from '@questender/engine/types'
import { SANTA_ART, SANTA_SKIES } from '../src/ui/scenes/santa'
import { CAMPAIGN_THEMES } from '../src/ui/campaignThemes'
import { hasPortrait } from '../src/ui/portraits/art'

const ss = campaign('santa')
const entry = BUNDLED_CATALOG.find((e) => e.id === 'santa')!
const WEEKDAY_WORDS = /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)s?\b/

function effectsOf(p: Day): Effect[] {
  const out: Effect[] = []
  for (const st of p.steps) for (const o of st.options) {
    out.push(...(o.effects ?? []))
    for (const b of o.bands ?? []) out.push(...(b.effects ?? []))
  }
  if (p.combat) out.push(...(p.combat.win ?? []), ...(p.combat.lose ?? []))
  return out
}

function textsOf(p: Day): string[] {
  const out = [p.title, p.text, p.note ?? '']
  for (const st of p.steps) for (const o of st.options) {
    out.push(o.label, o.result ?? '')
    for (const b of o.bands ?? []) out.push(b.text)
  }
  if (p.combat) out.push(p.combat.intro, p.combat.winText, p.combat.loseText)
  return out
}

describe('Saving Santa: calendar shape', () => {
  it('has one door a day, December 1 to 25, no weekend pages', () => {
    expect(ss.pages).toHaveLength(25)
    for (let i = 0; i < 25; i++) {
      expect(authoredDate(ss, i)).toBe(addDays('2026-12-01', i))
      expect(pageSpan(ss, i)).toBe(1)
    }
  })

  it('lands each door on the same December date every year', () => {
    for (const year of [2026, 2027, 2031]) {
      const start = `${year}-12-01`
      expect(pageDate(ss, 0, start)).toBe(start)
      expect(pageDate(ss, 23, start)).toBe(`${year}-12-24`)
      expect(pageDate(ss, 24, start)).toBe(`${year}-12-25`)
    }
  })

  it('names doors, not dates, in the in-world label', () => {
    expect(ss.inWorldDate!(0)).toBe('The 1st door')
    expect(ss.inWorldDate!(1)).toBe('The 2nd door')
    expect(ss.inWorldDate!(10)).toBe('The 11th door')
    expect(ss.inWorldDate!(22)).toBe('The 23rd door')
    expect(ss.inWorldDate!(24)).toBe('Christmas morning')
  })

  it('puts the bosses on the 7th, 14th, 21st (the longest night) and the 24th', () => {
    const bosses = ss.pages.flatMap((p, i) => (p.combat?.enemies.length === 1 ? [i + 1] : []))
    expect(bosses).toEqual([7, 14, 21, 24])
  })

  it('rests and levels up twice, before the second and third bosses', () => {
    expect(ss.pages.flatMap((p, i) => (p.rest ? [i + 1] : []))).toEqual([6, 13, 20])
    expect(ss.pages.flatMap((p, i) => (effectsOf(p).some((e) => e.type === 'levelUp') ? [i + 1] : []))).toEqual([13, 20])
  })
})

describe('Saving Santa: only in December, every year', () => {
  it('can be started in December only', () => {
    expect(isInSeason(entry, '2026-11-30')).toBe(false)
    expect(isInSeason(entry, '2026-12-01')).toBe(true)
    expect(isInSeason(entry, '2026-12-31')).toBe(true)
    expect(isInSeason(entry, '2027-01-01')).toBe(false)
    expect(availableCatalog('2026-11-27').map((c) => c.id)).not.toContain('santa')
    expect(availableCatalog('2026-12-01').map((c) => c.id)).toContain('santa')
    expect(seasonalEvents('2026-11-27')).toEqual([])
    expect(seasonalEvents('2026-12-12').map((c) => c.id)).toEqual(['santa'])
  })

  it('keeps every year-round campaign available all year', () => {
    for (const today of ['2026-03-04', '2026-12-25']) {
      const ids = availableCatalog(today).map((c) => c.id)
      for (const e of BUNDLED_CATALOG.filter((x) => !x.season)) expect(ids).toContain(e.id)
    }
  })

  it('always begins on December 1 of the current year, however late you start', () => {
    expect(defaultStartDate(entry, '2026-12-01')).toBe('2026-12-01')
    expect(defaultStartDate(entry, '2026-12-19')).toBe('2026-12-01')
    expect(startDateOptions(entry, '2026-12-19')).toEqual(['2026-12-01'])
    expect(startDateOptions(entry, '2027-12-03')).toEqual(['2027-12-01'])
    expect(startDateOptions(entry, '2026-11-30')).toEqual([])
    // Starting on the 10th leaves ten doors already open to catch up on.
    expect(unlockedThrough(ss, '2026-12-01', '2026-12-10') + 1).toBe(10)
    expect(unlockedThrough(ss, '2026-12-01', '2026-11-30')).toBe(-1)
  })

  it('counts the days left to start, and none out of season', () => {
    expect(seasonDaysLeft(entry, '2026-12-01')).toBe(31)
    expect(seasonDaysLeft(entry, '2026-12-31')).toBe(1)
    expect(seasonDaysLeft(entry, '2026-11-30')).toBe(0)
    expect(seasonDaysLeft(BUNDLED_CATALOG[0], '2026-12-01')).toBe(0)
  })

  it('flags the event until this year’s run is on the desk, and again next December', () => {
    expect(eventsToStart('2026-11-30', [])).toEqual([])
    expect(eventsToStart('2026-12-01', []).map((c) => c.id)).toEqual(['santa'])
    const thisYear = [{ campaignId: 'santa', startDate: '2026-12-01' }]
    expect(eventsToStart('2026-12-01', thisYear)).toEqual([])
    expect(eventsToStart('2027-12-01', thisYear).map((c) => c.id)).toEqual(['santa'])
    expect(eventsToStart('2026-12-01', [{ campaignId: 'brightwatch', startDate: '2026-12-01' }]).map((c) => c.id)).toEqual(['santa'])
  })
})

describe('Saving Santa: content', () => {
  it('references only content that exists', () => {
    for (const h of ss.heroIds!) {
      const def = heroDef(h)
      for (const a of def.abilities) expect(() => ability(a), a).not.toThrow()
      for (const lvl of Object.values(def.levels)) if (lvl.ability) expect(() => ability(lvl.ability!), lvl.ability).not.toThrow()
    }
    for (const id of Object.keys(entry.startItems ?? {})) expect(() => item(id), id).not.toThrow()
    for (const p of ss.pages) {
      for (const e of p.combat?.enemies ?? []) expect(() => enemy(e), `${p.title}: ${e}`).not.toThrow()
      for (const s of p.shop?.items ?? []) expect(() => item(s.id), `${p.title}: ${s.id}`).not.toThrow()
      for (const e of effectsOf(p)) if (e.type === 'item') expect(() => item(e.id), `${p.title}: ${e.id}`).not.toThrow()
    }
  })

  it('draws every scene it uses, and only Saving Santa scenes', () => {
    for (const s of SANTA_SCENES) {
      expect(SANTA_ART[s], s).toBeDefined()
      expect(SANTA_SKIES[s], s).toHaveLength(2)
    }
    for (const p of ss.pages) expect(SANTA_SCENES as readonly string[], p.title).toContain(p.scene)
    expect(SANTA_SCENES).toContain(CAMPAIGN_THEMES.santa.scene)
  })

  it('has a portrait for every hero and boss', () => {
    for (const h of ss.heroIds!) expect(hasPortrait(h), h).toBe(true)
    for (const p of ss.pages) if (p.combat?.enemies.length === 1) expect(hasPortrait(p.combat.enemies[0]), p.combat.enemies[0]).toBe(true)
  })

  it('never names a weekday (doors land on different weekdays each year)', () => {
    for (const p of ss.pages) for (const t of textsOf(p)) expect(t, p.title).not.toMatch(WEEKDAY_WORDS)
  })

  it('offers enough kind deeds to make the Nice List, but not by accident', () => {
    const kind = ss.pages.filter((p) => effectsOf(p).some((e) => e.type === 'virtue' && e.amount > 0)).length
    expect(kind).toBeGreaterThanOrEqual(NICE_LIST_VIRTUE + 3)
    expect(kind).toBeLessThan(ss.pages.length)
  })
})

describe('Saving Santa: holiday rewards', () => {
  it('unlocks its keepsakes and looks within one December', () => {
    const days = REWARDS.santa.keepsakes.map((k) => k.days)
    expect(days).toEqual([3, 7, 12, 18, 25])
    expect(keepsakesEarned('santa', 25)).toHaveLength(5)
    expect(REWARDS.santa.styles.map((s) => s.name).sort()).toEqual(['Candy-cane dice', 'Tinsel edge', 'Wrapping paper'])
    expect(TOKEN_REWARDS.filter((t) => t.campaignId === 'santa').map((t) => t.name)).toEqual(['Holly rim', 'Candy-stripe rim', 'Star-topper emblem'])
  })
})

/** Play a whole run, taking option `pick` wherever there's a choice. */
function play(heroId: string, seed: number, pick = 0, year = 2026): GameState {
  let s = reduce(initialState(), { type: 'NEW_GAME', seed, campaignId: 'santa', heroId, startDate: `${year}-12-01` })
  for (let guard = 0; guard < 5000 && !s.finished; guard++) {
    if (s.pending) {
      s = s.pending.type === 'pickpocket' ? reduce(s, { type: 'PICKPOCKET', take: true }) : reduce(s, { type: 'CONFIRM' })
      continue
    }
    const next = s.progress.steps.findIndex((x) => x === null)
    if (next >= 0) {
      const n = ss.pages[s.dayIndex].steps[next].options.length
      s = reduce(s, { type: 'CHOOSE', step: next, option: Math.min(pick, n - 1) })
      continue
    }
    if (!canAdvance(s)) {
      s = reduce(s, { type: 'ROLL_ROUND' })
      continue
    }
    if (ss.pages[s.dayIndex].rest && !s.progress.rested) {
      s = reduce(s, { type: 'REST' })
      continue
    }
    s = reduce(s, { type: 'NEXT_DAY', today: `${year}-12-31` })
  }
  return s
}

describe('Saving Santa: seeded playthrough', () => {
  it.each(entry.heroIds!)('%s reaches Christmas morning at level 3', (heroId) => {
    for (const pick of [0, 1]) {
      const s = play(heroId, 40 + pick, pick)
      expect(s.finished, `${heroId} pick ${pick}`).toBe(true)
      expect(s.journal).toHaveLength(25)
      expect(s.hero!.level).toBe(3)
    }
  })

  it('stops at today: no door opens early', () => {
    let s = reduce(initialState(), { type: 'NEW_GAME', seed: 2, campaignId: 'santa', heroId: 'ss_nell', startDate: '2026-12-01' })
    const before = s
    for (let i = 0; i < 40 && !canAdvance(s); i++) {
      if (s.pending) s = reduce(s, { type: 'CONFIRM' })
      else s = reduce(s, { type: 'CHOOSE', step: s.progress.steps.findIndex((x) => x === null), option: 0 })
    }
    expect(s).not.toBe(before)
    expect(reduce(s, { type: 'NEXT_DAY', today: '2026-12-01' }).dayIndex).toBe(0)
    expect(reduce(s, { type: 'NEXT_DAY', today: '2026-12-02' }).dayIndex).toBe(1)
  })
})

describe('Saving Santa: holiday achievements', () => {
  const ctx = (states: GameState[], days: string[] = []): AchievementContext => ({ states, progress: { ...emptyProgress(), days }, today: '2026-12-31' })
  const earned = (c: AchievementContext) => ACHIEVEMENTS.filter((a) => a.check(c)).map((a) => a.id)
  const done = play('ss_marigold', 7, 0)
  const december = Array.from({ length: 25 }, (_, i) => addDays('2026-12-01', i))

  it('awards Santa saved for finishing', () => {
    expect(earned(ctx([done]))).toContain('finish-santa')
    expect(earned(ctx([{ ...done, finished: false }]))).not.toContain('finish-santa')
  })

  it('awards Every door on its day only for 25 days in a row at the desk', () => {
    expect(everyDoorOnItsDay(done, december)).toBe(true)
    expect(everyDoorOnItsDay(done, december.slice(1))).toBe(false)
    expect(everyDoorOnItsDay({ ...done, finished: false }, december)).toBe(false)
    expect(earned(ctx([done], december))).toContain('every-door')
    expect(earned(ctx([done], december.slice(0, 24)))).not.toContain('every-door')
  })

  it('awards On the Nice List for enough virtue by Christmas morning', () => {
    const nice = { ...done, hero: { ...done.hero!, virtue: NICE_LIST_VIRTUE } }
    const naughty = { ...done, hero: { ...done.hero!, virtue: NICE_LIST_VIRTUE - 1 } }
    expect(earned(ctx([nice]))).toContain('nice-list')
    expect(earned(ctx([naughty]))).not.toContain('nice-list')
  })

  it('awards Back next December for runs in two different years', () => {
    const next = { ...done, startDate: '2027-12-01' }
    expect(adventYears([done, done])).toBe(1)
    expect(adventYears([done, next])).toBe(2)
    expect(earned(ctx([done]))).not.toContain('back-next-year')
    expect(earned(ctx([done, next]))).toContain('back-next-year')
  })
})
