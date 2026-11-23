// The Ember Road across the whole year: calendar shape, content integrity,
// and a seeded playthrough with every hero.
import { describe, expect, it } from 'vitest'
import { addDays, weekday } from '@questender/engine/calendar'
import { authoredDate, campaign, pageSpan } from '@questender/engine/campaign'
import { ability, enemy, heroDef, item, member } from '@questender/engine/content'
import { canAdvance, initialState, reduce } from '@questender/engine/state'
import type { Day, Effect } from '@questender/engine/types'

const er = campaign('emberroad')
const MUSTER = 3 // page where the hero is chosen
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

describe('Ember Road year: calendar shape', () => {
  it('runs from Sat Jan 1 to Sat Dec 31, 2022 with no gaps', () => {
    expect(authoredDate(er, 0)).toBe('2022-01-01')
    for (let i = 1; i < er.pages.length; i++) {
      expect(authoredDate(er, i)).toBe(addDays(authoredDate(er, i - 1), pageSpan(er, i - 1)))
    }
    const last = er.pages.length - 1
    expect(authoredDate(er, last)).toBe('2022-12-31')
    expect(pageSpan(er, last)).toBe(1)
    expect(er.pages).toHaveLength(313)
  })

  it('weekend pages cover Sat + Sun; every other page is a weekday', () => {
    er.pages.forEach((p, i) => {
      const wd = weekday(authoredDate(er, i))
      if (p.span === 2) expect(wd).toBe(6)
      else if (i === er.pages.length - 1) expect(wd).toBe(6) // Dec 31, the year’s last Saturday
      else expect(wd >= 1 && wd <= 5).toBe(true)
    })
  })

  it('page ids are unique and no page names a weekday', () => {
    expect(new Set(er.pages.map((p) => p.id)).size).toBe(er.pages.length)
    for (const p of er.pages) for (const t of textsOf(p)) expect(t).not.toMatch(WEEKDAY_WORDS)
  })

  it('in-world dates follow the northern months', () => {
    expect(er.inWorldDate!(0)).toBe('Hearthmoon 1–2')
    const lastFeb = er.pages.findIndex((p) => p.month === 3) - 1
    expect(er.inWorldDate!(lastFeb)).toMatch(/^Deepsnow /)
  })
})

describe('Ember Road year: content integrity', () => {
  it('every referenced hero, item, enemy, follower and ability exists', () => {
    for (const p of er.pages) {
      for (const e of effectsOf(p)) {
        if (e.type === 'item') expect(() => item(e.id)).not.toThrow()
        if (e.type === 'setHero') expect(() => heroDef(e.heroId)).not.toThrow()
      }
      for (const id of p.combat?.enemies ?? []) expect(() => enemy(id)).not.toThrow()
      for (const s of p.shop?.items ?? []) expect(() => item(s.id)).not.toThrow()
      for (const h of p.shop?.hires ?? []) expect(() => member(h)).not.toThrow()
    }
    for (const id of er.heroIds!) {
      const h = heroDef(id)
      for (const lvl of [2, 3, 4, 5, 6, 7, 8]) {
        expect(h.levels[lvl], `${id} level ${lvl}`).toBeDefined()
        if (h.levels[lvl].ability) expect(() => ability(h.levels[lvl].ability!)).not.toThrow()
      }
    }
  })

  it('each hero reaches level 8 over the year', () => {
    const levelUps = er.pages.slice(MUSTER + 1).filter((p) => effectsOf(p).some((e) => e.type === 'levelUp')).length
    expect(levelUps).toBe(7)
  })
})

describe('Ember Road year: seeded playthrough', () => {
  const levelUps = er.pages.slice(MUSTER + 1).filter((p) => effectsOf(p).some((e) => e.type === 'levelUp')).length

  for (const option of [0, 1, 2, 3, 4, 5]) {
    it(`plays the whole year with ${er.heroIds![option]}`, () => {
      let s = reduce(initialState(), { type: 'NEW_GAME', seed: 99 + option, campaignId: 'emberroad', startDate: '2026-01-03' })
      for (let guard = 0; guard < 20000 && !s.finished; guard++) {
        if (s.pending) {
          s = s.pending.type === 'pickpocket' ? reduce(s, { type: 'PICKPOCKET', take: true }) : reduce(s, { type: 'CONFIRM' })
          continue
        }
        const next = s.progress.steps.findIndex((x) => x === null)
        if (next >= 0) {
          const pick = s.dayIndex === MUSTER ? option : 0
          s = reduce(s, { type: 'CHOOSE', step: next, option: pick })
          continue
        }
        if (!canAdvance(s)) {
          s = reduce(s, { type: 'ROLL_ROUND' })
          continue
        }
        if (er.pages[s.dayIndex].rest && !s.progress.rested) {
          s = reduce(s, { type: 'REST' })
          continue
        }
        s = reduce(s, { type: 'NEXT_DAY', today: '2030-01-01' })
      }
      expect(s.finished).toBe(true)
      expect(s.hero!.defId).toBe(er.heroIds![option])
      expect(s.hero!.level).toBe(1 + levelUps)
      expect(s.journal).toHaveLength(er.pages.length)
      expect(JSON.parse(JSON.stringify(s))).toEqual(s)
    }, 60_000) // ~313 pages of play per hero
  }
})
