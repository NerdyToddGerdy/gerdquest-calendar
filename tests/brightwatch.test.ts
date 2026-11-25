import { describe, expect, it } from 'vitest'
import { TRIAL_HEROES } from '@questender/engine/content/campaigns/brightwatch/content'
import { addDays, weekday, WEEKDAY_NAMES } from '@questender/engine/calendar'
import { authoredDate, campaign, pageEndDate, pageSpan } from '@questender/engine/campaign'
import { ability, campaignHeroes, enemy, heroDef, item, member } from '@questender/engine/content'
import { turnPast } from '@questender/engine/desk'
import { canAdvance, currentDay, initialState, reduce } from '@questender/engine/state'
import type { Effect, GameState } from '@questender/engine/types'

const bw = campaign('brightwatch')
const START = '2026-01-05' // a Monday, like Jan 1, 2024

describe('Brightwatch year', () => {
  it('covers every date from Jan 1 to Dec 31, 2024 (314 pages)', () => {
    expect(authoredDate(bw, 0)).toBe('2024-01-01')
    const last = bw.pages.length - 1
    expect(addDays(authoredDate(bw, last), pageSpan(bw, last) - 1)).toBe('2024-12-31')
    expect(bw.pages).toHaveLength(314)
  })

  it('page ids are unique', () => {
    const ids = bw.pages.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every weekend page is a Rest with a market, except the final battle', () => {
    const weekends = bw.pages.filter((_, i) => pageSpan(bw, i) === 2)
    expect(weekends).toHaveLength(52)
    const noRest = weekends.filter((p) => !p.rest).map((p) => p.id)
    expect(noRest).toEqual(['d21-longest-night'])
  })

  it('every warden can reach level 8', () => {
    for (const id of TRIAL_HEROES) {
      const levels = heroDef(id).levels
      for (let l = 2; l <= 8; l++) expect(levels[l], `${id} level ${l}`).toBeDefined()
    }
  })
})

describe('Brightwatch structure', () => {
  it('Mon–Fri pages plus a Sat/Sun weekend page, no gaps', () => {
    for (let i = 0; i < bw.pages.length; i++) {
      const d = authoredDate(bw, i)
      const wd = weekday(d)
      if (pageSpan(bw, i) === 2) expect(wd).toBe(6) // weekend pages start Saturday
      else expect(wd).toBeGreaterThanOrEqual(1) // weekday pages
      if (i > 0) expect(addDays(authoredDate(bw, i - 1), pageSpan(bw, i - 1))).toBe(d)
    }
  })

  it('each trial week opens by handing the story to that week’s warden', () => {
    for (let w = 1; w < 6; w++) {
      const monday = bw.pages[w * 6]
      const effects = monday.steps[0].options[0].effects ?? []
      expect(effects[0]).toEqual({ type: 'setHero', heroId: TRIAL_HEROES[w] })
    }
    expect(bw.startHero).toBe(TRIAL_HEROES[0])
  })

  it('the choice page offers all six wardens', () => {
    const choice = bw.pages[36]
    const picked = choice.steps[0].options.map((o) => {
      const e = o.effects?.[0]
      return e?.type === 'setHero' ? e.heroId : null
    })
    expect(picked).toEqual(TRIAL_HEROES)
    expect(campaignHeroes(bw).map((h) => h.id)).toEqual(TRIAL_HEROES)
  })

  it('page text never names a weekday (weekdays come from the real calendar)', () => {
    for (const p of bw.pages) {
      for (const name of WEEKDAY_NAMES) {
        expect(`${p.text} ${p.note ?? ''}`).not.toContain(name)
      }
    }
  })

  it('every referenced hero, ability, item, enemy and companion exists', () => {
    const effects: Effect[] = []
    for (const p of bw.pages) {
      for (const st of p.steps) for (const o of st.options) effects.push(...(o.effects ?? []), ...(o.bands ?? []).flatMap((b) => b.effects ?? []))
      if (p.combat) {
        p.combat.enemies.forEach((id) => expect(() => enemy(id)).not.toThrow())
        effects.push(...(p.combat.win ?? []), ...(p.combat.lose ?? []))
      }
      p.shop?.items.forEach((x) => expect(() => item(x.id)).not.toThrow())
      p.shop?.hires?.forEach((id) => expect(() => member(id)).not.toThrow())
    }
    for (const e of effects) {
      if (e.type === 'item') expect(() => item(e.id)).not.toThrow()
      if (e.type === 'setHero') expect(() => heroDef(e.heroId)).not.toThrow()
    }
    for (const id of TRIAL_HEROES) {
      const h = heroDef(id)
      h.abilities.forEach((a) => expect(() => ability(a)).not.toThrow())
      Object.values(h.levels).forEach((l) => l.ability && expect(() => ability(l.ability!)).not.toThrow())
    }
  })
})

/** Play the current page with first-option choices (or `pick` on the choice page). */
function playPage(s: GameState, pick: number): GameState {
  for (let guard = 0; guard < 200 && !canAdvance(s); guard++) {
    if (s.pending) {
      s = s.pending.type === 'pickpocket' ? reduce(s, { type: 'PICKPOCKET', take: true }) : reduce(s, { type: 'CONFIRM' })
      continue
    }
    const step = s.progress.steps.findIndex((x) => x === null)
    if (step >= 0) {
      const day = currentDay(s)!
      const option = day.steps[step].options.length === 6 ? pick : 0
      s = reduce(s, { type: 'CHOOSE', step, option })
      continue
    }
    s = reduce(s, { type: 'ROLL_ROUND' })
  }
  if (currentDay(s)?.rest && !s.progress.rested) s = reduce(s, { type: 'REST' })
  return s
}

describe('Brightwatch playthrough', () => {
  it('a seeded run plays every warden in turn, then the chosen one to the end', () => {
    let s = reduce(initialState(), { type: 'NEW_GAME', seed: 2024, campaignId: 'brightwatch', startDate: START })
    expect(s.hero!.defId).toBe('wren') // no hero pick: the campaign opens with week 1's warden
    const weekHeroes: string[] = []
    let date = START
    for (let guard = 0; guard < 400 && !s.finished; guard++) {
      const page = s.dayIndex
      s = playPage(s, 4) // choose Hask on the choice page
      if (page % 6 === 0 && page < 36) weekHeroes.push(s.hero!.defId)
      expect(canAdvance(s)).toBe(true)
      // Walk the date forward like the › arrow does.
      const end = pageEndDate(bw, page, START)
      while (date < end) date = addDays(date, 1)
      s = turnPast(s, date)
      date = addDays(date, 1)
    }
    expect(weekHeroes).toEqual(TRIAL_HEROES)
    expect(s.finished).toBe(true)
    expect(s.hero!.defId).toBe('bw-hask')
    // One level for the captain's commission, plus every later commendation.
    const levelUps = bw.pages.slice(36).filter((p) => p.steps.some((st) => st.options.some((o) => o.effects?.some((e) => e.type === 'levelUp')))).length
    expect(s.hero!.level).toBe(1 + levelUps)
    expect(s.hero!.level).toBe(8)
    expect(s.hero!.abilities).toEqual(expect.arrayContaining(['bw-volley', 'bw-pinningShot', 'bw-eagleEye', 'bw-rainOfArrows']))
    expect(s.journal).toHaveLength(bw.pages.length)
  }, 60_000)
})
