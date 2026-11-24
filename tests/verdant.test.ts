// The Verdant Accord (Chapters 1–4): calendar shape, content integrity, legacy
// marks, scene art, and a seeded playthrough with every hero.
import { describe, expect, it } from 'vitest'
import { addDays, weekday } from '@questender/engine/calendar'
import { authoredDate, campaign, pageSpan } from '@questender/engine/campaign'
import { ability, enemy, heroDef, item, member } from '@questender/engine/content'
import { canAdvance, fatalFightLegacy, initialState, meetsRequirement, reduce } from '@questender/engine/state'
import { VERDANT_SCENES, type Day, type Effect, type GameState } from '@questender/engine/types'
import { legacyLabel } from '../src/ui/legacyLabel'
import { VERDANT_ART, VERDANT_SKIES } from '../src/ui/scenes/verdant'

const va = campaign('verdant')
const MUSTER = 3 // page where the hero is chosen
const CHAPTERS = 4
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

const levelUps = va.pages.slice(MUSTER + 1).filter((p) => effectsOf(p).some((e) => e.type === 'levelUp')).length
const bosses = va.pages.filter((p) => p.note?.startsWith('A single foe'))

describe('Verdant Accord: calendar shape', () => {
  it('runs from Sat Jan 1 to Sat Apr 30, 2022 with no gaps', () => {
    expect(authoredDate(va, 0)).toBe('2022-01-01')
    for (let i = 1; i < va.pages.length; i++) {
      expect(authoredDate(va, i)).toBe(addDays(authoredDate(va, i - 1), pageSpan(va, i - 1)))
    }
    expect(authoredDate(va, va.pages.length - 1)).toBe('2022-04-30')
    expect(va.pages).toHaveLength(103)
  })

  it('weekend pages cover Sat + Sun; every other page is a weekday', () => {
    va.pages.forEach((p, i) => {
      const wd = weekday(authoredDate(va, i))
      if (p.span === 2) expect(wd).toBe(6)
      else expect(wd >= 1 && wd <= 5).toBe(true)
    })
  })

  it('page ids are unique and no page names a weekday', () => {
    expect(new Set(va.pages.map((p) => p.id)).size).toBe(va.pages.length)
    for (const p of va.pages) for (const t of textsOf(p)) expect(t, p.title).not.toMatch(WEEKDAY_WORDS)
  })

  it('in-world dates follow the Fernreach months', () => {
    expect(va.inWorldDate!(0)).toBe('Firstleaf 1–2')
    expect(va.inWorldDate!(va.pages.length - 1)).toBe('Blossomtide 30–31')
  })

  it('has one boss per chapter, on its month’s last Friday', () => {
    expect(bosses.map((p) => p.month)).toEqual([1, 2, 3, 4])
    for (const b of bosses) expect(weekday(authoredDate(va, va.pages.indexOf(b)))).toBe(5)
  })

  it('levels up once per chapter, the weekend after its boss', () => {
    expect(levelUps).toBe(CHAPTERS)
    for (const b of bosses) {
      const after = va.pages[va.pages.indexOf(b) + 1]
      expect(effectsOf(after).some((e) => e.type === 'levelUp'), after.title).toBe(true)
    }
  })
})

describe('Verdant Accord: content integrity', () => {
  it('every referenced hero, item, enemy, follower and ability exists', () => {
    for (const p of va.pages) {
      for (const e of effectsOf(p)) {
        if (e.type === 'item') expect(() => item(e.id)).not.toThrow()
        if (e.type === 'setHero') expect(() => heroDef(e.heroId)).not.toThrow()
      }
      for (const id of p.combat?.enemies ?? []) expect(() => enemy(id)).not.toThrow()
      for (const s of p.shop?.items ?? []) expect(() => item(s.id)).not.toThrow()
      for (const h of p.shop?.hires ?? []) expect(() => member(h)).not.toThrow()
    }
    for (const id of va.heroIds!) {
      const h = heroDef(id)
      for (const a of h.abilities) expect(() => ability(a)).not.toThrow()
      for (let lvl = 2; lvl <= 1 + CHAPTERS; lvl++) {
        expect(h.levels[lvl], `${id} level ${lvl}`).toBeDefined()
        if (h.levels[lvl].ability) expect(() => ability(h.levels[lvl].ability!)).not.toThrow()
      }
    }
  })

  it('the muster page offers all six heroes', () => {
    const ids = effectsOf(va.pages[MUSTER]).flatMap((e) => (e.type === 'setHero' ? [e.heroId] : []))
    expect(ids).toEqual(va.heroIds)
  })

  it('no hero gains the same ability twice', () => {
    for (const id of va.heroIds!) {
      const h = heroDef(id)
      const all = [...h.abilities, ...Object.values(h.levels).flatMap((l) => (l.ability ? [l.ability] : []))]
      expect(new Set(all).size, id).toBe(all.length)
    }
  })
})

describe('Verdant Accord: legacy', () => {
  const ids = new Set(va.legacy!.map((l) => l.id))

  it('each chapter boss awards its won mark on a win and its lost mark on a loss', () => {
    bosses.forEach((b, i) => {
      const ch = i + 1
      expect(b.combat!.win!.filter((e) => e.type === 'legacy')).toEqual([{ type: 'legacy', id: `va_l${ch}_win` }])
      expect(b.combat!.lose!.filter((e) => e.type === 'legacy')).toEqual([{ type: 'legacy', id: `va_l${ch}_loss` }])
    })
    expect(va.pages.filter((p) => effectsOf(p).some((e) => e.type === 'legacy'))).toHaveLength(CHAPTERS)
  })

  it('every requirement names a defined mark awarded on an earlier page', () => {
    const awardedAt = new Map<string, number>()
    va.pages.forEach((p, i) => effectsOf(p).forEach((e) => e.type === 'legacy' && !awardedAt.has(e.id) && awardedAt.set(e.id, i)))
    va.pages.forEach((p, i) => {
      for (const st of p.steps) for (const o of st.options) {
        if (!o.requires) continue
        const id = o.requires.replace(/^!/, '')
        expect(ids.has(id), `${p.title}: ${o.requires}`).toBe(true)
        expect(awardedAt.get(id), `${p.title}: ${o.requires}`).toBeLessThan(i)
      }
    })
  })

  it('the first option of every step is never gated, so no outcome can lock a page', () => {
    for (const p of va.pages) for (const st of p.steps) expect(st.options[0].requires, p.title).toBeUndefined()
  })

  it('later chapters actually use both outcomes of earlier ones', () => {
    const used = new Set(va.pages.flatMap((p) => p.steps.flatMap((st) => st.options.flatMap((o) => (o.requires ? [o.requires] : [])))))
    for (const id of ['va_l1_win', 'va_l1_loss', 'va_l2_win', 'va_l2_loss', 'va_l3_win', 'va_l3_loss']) expect(used.has(id), id).toBe(true)
  })
})

describe('Legacy marks in the engine', () => {
  it('meetsRequirement handles marks and negated marks', () => {
    expect(meetsRequirement({ legacy: [] }, undefined)).toBe(true)
    expect(meetsRequirement({ legacy: ['a'] }, 'a')).toBe(true)
    expect(meetsRequirement({ legacy: [] }, 'a')).toBe(false)
    expect(meetsRequirement({}, '!a')).toBe(true)
    expect(meetsRequirement({ legacy: ['a'] }, '!a')).toBe(false)
  })

  it('a gated option cannot be chosen without its mark, and can with it', () => {
    const start = reduce(initialState(), { type: 'NEW_GAME', seed: 3, campaignId: 'verdant', startDate: '2026-01-03' })
    const page = va.pages.findIndex((p) => p.steps.some((st) => st.options.some((o) => o.requires === 'va_l1_win')))
    const step = va.pages[page].steps.findIndex((st) => st.options.some((o) => o.requires === 'va_l1_win'))
    const option = va.pages[page].steps[step].options.findIndex((o) => o.requires === 'va_l1_win')
    const at = (legacy: string[]): GameState => ({ ...start, dayIndex: page, legacy, progress: { ...start.progress, steps: va.pages[page].steps.map(() => null), results: va.pages[page].steps.map(() => null) } })

    const blocked = reduce(at([]), { type: 'CHOOSE', step, option })
    expect(blocked.progress.steps[step]).toBeNull()
    expect(blocked.pending).toBeNull()

    const allowed = reduce(at(['va_l1_win']), { type: 'CHOOSE', step, option })
    expect(allowed.progress.steps[step] === option || allowed.pending !== null).toBe(true)
  })
})

describe('Locked option label', () => {
  const start = reduce(initialState(), { type: 'NEW_GAME', seed: 3, campaignId: 'verdant', startDate: '2026-01-03' })

  it('names only the chapter, never the outcome the player did not get', () => {
    expect(legacyLabel(start, 'va_l1_win', true)).toBe('Needs a different Chapter 1 ending')
    expect(legacyLabel(start, 'va_l3_loss', true)).toBe('Needs a different Chapter 3 ending')
    for (const l of va.legacy!) expect(legacyLabel(start, l.id, true)).not.toContain(l.name)
  })

  it('names the mark you hold once the option is open', () => {
    expect(legacyLabel(start, 'va_l1_win', false)).toBe('Legacy: Hero of the Greenway')
  })
})

describe('Legacy on a fatal boss fight', () => {
  it('falling to a chapter boss still records the chapter’s lost mark', () => {
    const boss = va.pages.findIndex((p) => p.note?.startsWith('A single foe'))
    let s = reduce(initialState(), { type: 'NEW_GAME', seed: 5, campaignId: 'verdant', startDate: '2026-01-03' })
    s = { ...s, dayIndex: boss, hero: { ...s.hero!, hp: 1 }, progress: { ...s.progress, steps: va.pages[boss].steps.map(() => null), results: va.pages[boss].steps.map(() => null) } }
    for (let g = 0; g < 200 && !(s.legacy?.length); g++) {
      if (s.pending) s = reduce(s, { type: 'CONFIRM' })
      else if (s.progress.combat?.done) break
      else s = reduce(s, { type: 'ROLL_ROUND' })
    }
    // Either the hero fell (loss) or, rarely, won outright (win); a mark must be recorded.
    expect(s.legacy?.[0]).toMatch(/^va_l1_(win|loss)$/)
  })

  // The last foe can fall the same round the hero drops: the fight is won, so only
  // the WIN list's marks apply (never the lose mark, and no other win effects).
  const combat = {
    win: [{ type: 'legacy', id: 'va_l1_win' }, { type: 'glint', amount: 50 }] as Effect[],
    lose: [{ type: 'legacy', id: 'va_l1_loss' }, { type: 'glint', amount: 7 }] as Effect[],
  }

  it('a fight lost while the hero falls records only the lose list’s legacy marks', () => {
    expect(fatalFightLegacy(combat, false)).toEqual([{ type: 'legacy', id: 'va_l1_loss' }])
  })

  it('a fight won on the very round the hero falls records only the win list’s legacy marks', () => {
    expect(fatalFightLegacy(combat, true)).toEqual([{ type: 'legacy', id: 'va_l1_win' }])
    expect(fatalFightLegacy({}, true)).toEqual([])
  })
})

describe('Verdant Accord: scenes', () => {
  it('every Verdant kind has a sky and a drawing, and all are used', () => {
    for (const k of VERDANT_SCENES) {
      expect(VERDANT_SKIES[k], k).toHaveLength(2)
      expect(VERDANT_ART[k], k).toBeTruthy()
    }
    const used = new Set(va.pages.map((d) => d.scene))
    for (const p of va.pages) expect(VERDANT_SCENES as readonly string[]).toContain(p.scene)
    expect(used.size).toBe(VERDANT_SCENES.length)
  })
})

describe('Verdant Accord: seeded playthrough', () => {
  for (const option of [0, 1, 2, 3, 4, 5]) {
    it(`plays Chapters 1–4 with ${va.heroIds![option]}`, () => {
      let s = reduce(initialState(), { type: 'NEW_GAME', seed: 11 + option, campaignId: 'verdant', startDate: '2026-01-03' })
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
        if (va.pages[s.dayIndex].rest && !s.progress.rested) {
          s = reduce(s, { type: 'REST' })
          continue
        }
        s = reduce(s, { type: 'NEXT_DAY', today: '2030-01-01' })
      }
      expect(s.finished).toBe(true)
      expect(s.hero!.defId).toBe(va.heroIds![option])
      expect(s.hero!.level).toBe(1 + levelUps)
      expect(s.journal).toHaveLength(va.pages.length)
      // Exactly one outcome per chapter.
      expect(s.legacy).toHaveLength(CHAPTERS)
      s.legacy!.forEach((id, i) => expect(id).toMatch(new RegExp(`^va_l${i + 1}_(win|loss)$`)))
      expect(JSON.parse(JSON.stringify(s))).toEqual(s)
    }, 60_000)
  }
})
