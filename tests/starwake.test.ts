// The Starwake (the full year): calendar shape, content integrity, scene art,
// and a seeded playthrough with every hero.
import { describe, expect, it } from 'vitest'
import { addDays, weekday } from '@questender/engine/calendar'
import { authoredDate, campaign, pageSpan } from '@questender/engine/campaign'
import { ability, enemy, heroDef, item, member } from '@questender/engine/content'
import { canAdvance, initialState, reduce } from '@questender/engine/state'
import { STARWAKE_SCENES, type Day, type Effect } from '@questender/engine/types'
import { STARWAKE_ART, STARWAKE_SKIES } from '../src/ui/scenes/starwake'
import { STARWAKE_HEROES } from '@questender/engine/content/campaigns/starwake/content'
import { PORTRAITS } from '../src/ui/portraits/specs'

const sw = campaign('starwake')
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

const levelUps = sw.pages.slice(MUSTER + 1).filter((p) => effectsOf(p).some((e) => e.type === 'levelUp')).length

describe('Starwake: calendar shape', () => {
  it('runs from Sat Jan 1 to Sat Dec 31, 2022 with no gaps', () => {
    expect(authoredDate(sw, 0)).toBe('2022-01-01')
    for (let i = 1; i < sw.pages.length; i++) {
      expect(authoredDate(sw, i)).toBe(addDays(authoredDate(sw, i - 1), pageSpan(sw, i - 1)))
    }
    const last = sw.pages.length - 1
    expect(authoredDate(sw, last)).toBe('2022-12-31')
    expect(pageSpan(sw, last)).toBe(1)
    expect(sw.pages).toHaveLength(313)
    expect(sw.pages).toHaveLength(sw.pageCount)
  })

  it('weekend pages cover Sat + Sun; every other page is a weekday', () => {
    sw.pages.forEach((p, i) => {
      const wd = weekday(authoredDate(sw, i))
      if (p.span === 2) expect(wd).toBe(6)
      else if (i === sw.pages.length - 1) expect(wd).toBe(6) // Dec 31, the year’s last Saturday
      else expect(wd >= 1 && wd <= 5).toBe(true)
    })
  })

  it('page ids are unique and no page names a weekday', () => {
    expect(new Set(sw.pages.map((p) => p.id)).size).toBe(sw.pages.length)
    for (const p of sw.pages) for (const t of textsOf(p)) expect(t).not.toMatch(WEEKDAY_WORDS)
  })

  it('in-world dates follow the Saltreach months', () => {
    expect(sw.inWorldDate!(0)).toBe('Driftmoon 1–2')
    expect(sw.inWorldDate!(sw.pages.length - 1)).toBe('Longnight 31')
    const lastSep = sw.pages.findIndex((p) => p.month === 10) - 1
    expect(sw.inWorldDate!(lastSep)).toBe('Rimmoon 30')
    expect(sw.inWorldDate!(lastSep + 1)).toBe('Skymoon 1–2')
  })

  it('has one boss per month, and two in December (Ashe, then the longest night)', () => {
    const bosses = sw.pages.filter((p) => p.note?.startsWith('A single foe') || p.note?.startsWith('The final battle'))
    expect(bosses.map((p) => p.month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12])
    const dec = bosses.slice(-2).map((p) => `${p.month}-${p.day}`)
    expect(dec).toEqual(['12-16', '12-21'])
  })

  it('every weekend page after the prologue is a Rest, including the last page of the year', () => {
    for (const p of sw.pages.slice(1)) if (p.span === 2) expect(p.rest, p.title).toBe(true)
    expect(sw.pages[sw.pages.length - 1].rest).toBe(true)
  })
})

describe('Starwake: content integrity', () => {
  it('every referenced hero, item, enemy, follower and ability exists', () => {
    for (const p of sw.pages) {
      for (const e of effectsOf(p)) {
        if (e.type === 'item') expect(() => item(e.id)).not.toThrow()
        if (e.type === 'setHero') expect(() => heroDef(e.heroId)).not.toThrow()
      }
      for (const id of p.combat?.enemies ?? []) expect(() => enemy(id)).not.toThrow()
      for (const s of p.shop?.items ?? []) expect(() => item(s.id)).not.toThrow()
      for (const h of p.shop?.hires ?? []) expect(() => member(h)).not.toThrow()
    }
    for (const id of sw.heroIds!) {
      const h = heroDef(id)
      for (const a of h.abilities) expect(() => ability(a)).not.toThrow()
      for (const lvl of [2, 3, 4, 5, 6, 7, 8]) {
        expect(h.levels[lvl], `${id} level ${lvl}`).toBeDefined()
        if (h.levels[lvl].ability) expect(() => ability(h.levels[lvl].ability!)).not.toThrow()
      }
    }
  })

  it('each hero reaches level 8 by the end of November, with no level 9', () => {
    expect(levelUps).toBe(7)
    const lastLevelUp = sw.pages.map((p, i) => (effectsOf(p).some((e) => e.type === 'levelUp') ? i : -1)).filter((i) => i >= 0).pop()!
    expect(sw.pages[lastLevelUp].month).toBe(11)
    for (const id of sw.heroIds!) expect(heroDef(id).levels[9], id).toBeUndefined()
  })

  it('the catalog entry matches the pack', () => {
    expect(sw.pageCount).toBe(sw.pages.length)
    expect(sw.heroIds).toEqual(STARWAKE_HEROES)
    expect(sw.firstDate).toBe(authoredDate(sw, 0))
  })

  it('every enemy used in the final quarter has a portrait for bosses', () => {
    for (const p of sw.pages.filter((d) => d.month >= 10 && d.note?.match(/^(A single foe|The final battle)/))) {
      for (const id of p.combat!.enemies) expect(PORTRAITS[id], id).toBeDefined()
    }
  })

  it('the muster page offers all six heroes', () => {
    const ids = effectsOf(sw.pages[MUSTER]).flatMap((e) => (e.type === 'setHero' ? [e.heroId] : []))
    expect(ids).toEqual(sw.heroIds)
  })
})

describe('Starwake: scenes', () => {
  it('every Starwake kind has a sky and a drawing, and all are used', () => {
    for (const k of STARWAKE_SCENES) {
      expect(STARWAKE_SKIES[k], k).toHaveLength(2)
      expect(STARWAKE_ART[k], k).toBeTruthy()
    }
    const used = new Set(sw.pages.map((d) => d.scene))
    for (const p of sw.pages) expect(STARWAKE_SCENES as readonly string[]).toContain(p.scene)
    expect(used.size).toBe(STARWAKE_SCENES.length)
  })
})

describe('Starwake: seeded playthrough', () => {
  for (const option of [0, 1, 2, 3, 4, 5]) {
    it(`plays the whole year with ${sw.heroIds![option]}`, () => {
      let s = reduce(initialState(), { type: 'NEW_GAME', seed: 7 + option, campaignId: 'starwake', startDate: '2026-01-03' })
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
        if (sw.pages[s.dayIndex].rest && !s.progress.rested) {
          s = reduce(s, { type: 'REST' })
          continue
        }
        s = reduce(s, { type: 'NEXT_DAY', today: '2030-01-01' })
      }
      expect(s.finished).toBe(true)
      expect(s.hero!.defId).toBe(sw.heroIds![option])
      expect(s.hero!.level).toBe(1 + levelUps)
      expect(s.journal).toHaveLength(sw.pages.length)
      expect(JSON.parse(JSON.stringify(s))).toEqual(s)
    }, 60_000)
  }
})
