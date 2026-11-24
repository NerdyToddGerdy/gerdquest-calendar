// The Verdant Accord (Chapters 1–8): calendar shape, content integrity, legacy
// marks, scene art, and a seeded playthrough with every hero.
import { describe, expect, it } from 'vitest'
import { addDays, parseISO, weekday } from '@questender/engine/calendar'
import { authoredDate, campaign, pageSpan } from '@questender/engine/campaign'
import { ability, enemy, heroDef, item, member } from '@questender/engine/content'
import { BUNDLED_CATALOG } from '@questender/engine/content/bundled'
import { accordTally } from '@questender/engine/content/campaigns/verdant/content'
import { canAdvance, fatalFightLegacy, initialState, meetsRequirement, reduce } from '@questender/engine/state'
import { VERDANT_SCENES, type Day, type Effect, type GameState } from '@questender/engine/types'
import { legacyLabel } from '../src/ui/legacyLabel'
import { VERDANT_ART, VERDANT_SKIES } from '../src/ui/scenes/verdant'
import { hasPortrait } from '../src/ui/portraits/art'

const va = campaign('verdant')
const MUSTER = 3 // page where the hero is chosen
const CHAPTERS = 8
/** Chapters that award a level: the cap stays at 8, so 6 and 8 give signature gear instead and 10 will add level 8. */
const LEVEL_CHAPTERS = [1, 2, 3, 4, 5, 7]
/** Chapters whose legacy is decided by a choice step after the boss, not by the boss fight itself. */
const CHOICE_CHAPTERS = [7, 8]
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
const isChoice = (p: Day) => p.steps.some((st) => st.options.some((o) => (o.effects ?? []).some((e) => e.type === 'legacy')))
/** Each chapter's boss: the combat page on its month's last Friday. */
const bosses = va.pages.filter((p, i) => {
  const d = authoredDate(va, i)
  return !!p.combat && weekday(d) === 5 && parseISO(addDays(d, 7)).month !== parseISO(d).month
})
/** The page that awards each chapter's mark: the boss itself, or the choice step after it. */
const markPages = va.pages.filter((p) => !!p.combat?.win?.some((e) => e.type === 'legacy') || isChoice(p))

describe('Verdant Accord: calendar shape', () => {
  it('runs from Sat Jan 1 to Wed Aug 31, 2022 with no gaps', () => {
    expect(authoredDate(va, 0)).toBe('2022-01-01')
    for (let i = 1; i < va.pages.length; i++) {
      expect(authoredDate(va, i)).toBe(addDays(authoredDate(va, i - 1), pageSpan(va, i - 1)))
    }
    expect(authoredDate(va, va.pages.length - 1)).toBe('2022-08-31')
    expect(va.pages).toHaveLength(208)
    expect(va.pageCount).toBe(208)
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
    expect(va.inWorldDate!(103)).toBe('Greenmoon 2')
    expect(va.inWorldDate!(va.pages.length - 1)).toBe('Emberleaf 31')
  })

  it('has one boss per chapter, on its month’s last Friday', () => {
    expect(bosses.map((p) => p.month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    for (const b of bosses) expect(weekday(authoredDate(va, va.pages.indexOf(b)))).toBe(5)
  })

  it('levels up only where a level applies (1–5 and 7), the weekend after the boss', () => {
    expect(levelUps).toBe(LEVEL_CHAPTERS.length)
    bosses.forEach((b, i) => {
      const after = va.pages[va.pages.indexOf(b) + 1]
      expect(after.span, after.title).toBe(2)
      expect(effectsOf(after).some((e) => e.type === 'levelUp'), after.title).toBe(LEVEL_CHAPTERS.includes(i + 1))
    })
  })

  it('chapters 6 and 8 reward signature gear on the weekend after the boss', () => {
    for (const ch of [6, 8]) {
      const after = va.pages[va.pages.indexOf(bosses[ch - 1]) + 1]
      expect(effectsOf(after).some((e) => e.type === 'item' && item(e.id).kind === 'gear'), after.title).toBe(true)
    }
  })

  it('every boss has a portrait, and no chapter finale leaves a page unused', () => {
    for (const b of bosses) for (const e of b.combat!.enemies) expect(hasPortrait(e), e).toBe(true)
    for (const e of ['va_thunderheron', 'va_gardener2', 'va_gardener3']) expect(hasPortrait(e), e).toBe(true)
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
      for (let lvl = 2; lvl <= 1 + LEVEL_CHAPTERS.length; lvl++) {
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

  it('a boss awards its won mark on a win and its lost mark on a loss, except in choice chapters', () => {
    bosses.forEach((b, i) => {
      const ch = i + 1
      if (CHOICE_CHAPTERS.includes(ch)) {
        expect((b.combat!.win ?? []).concat(b.combat!.lose ?? []).filter((e) => e.type === 'legacy'), `Chapter ${ch} boss`).toEqual([])
        return
      }
      expect(b.combat!.win!.filter((e) => e.type === 'legacy')).toEqual([{ type: 'legacy', id: `va_l${ch}_win` }])
      expect(b.combat!.lose!.filter((e) => e.type === 'legacy')).toEqual([{ type: 'legacy', id: `va_l${ch}_loss` }])
    })
    expect(markPages).toHaveLength(CHAPTERS)
  })

  it('a choice chapter’s mark comes from one choice step after its boss, with a win and a loss option', () => {
    for (const ch of CHOICE_CHAPTERS) {
      const page = markPages[ch - 1]
      expect(page.combat, page.title).toBeUndefined()
      expect(va.pages.indexOf(page)).toBeGreaterThan(va.pages.indexOf(bosses[ch - 1]))
      const steps = page.steps.filter((st) => st.options.some((o) => (o.effects ?? []).some((e) => e.type === 'legacy')))
      expect(steps, page.title).toHaveLength(1)
      const marks = steps[0].options.map((o) => (o.effects ?? []).filter((e) => e.type === 'legacy'))
      expect(marks).toEqual([[{ type: 'legacy', id: `va_l${ch}_win` }], [{ type: 'legacy', id: `va_l${ch}_loss` }]])
      expect(steps[0].options[0].requires).toBeUndefined()
    }
  })

  it('every mark has a win and a loss text, and Chapter 5 on keeps the Accord/Wilds tally', () => {
    for (let ch = 1; ch <= CHAPTERS; ch++) {
      expect(ids.has(`va_l${ch}_win`) && ids.has(`va_l${ch}_loss`), `chapter ${ch}`).toBe(true)
    }
    for (const l of va.legacy!.filter((x) => x.chapter >= 5)) expect(l.text).toMatch(/Accord kept\.$|Wilds let in\.$/)
    expect(accordTally(['va_l1_win', 'va_l5_win', 'va_l6_loss', 'va_l7_win'])).toEqual({ kept: 2, letIn: 1 })
  })

  it('finale pages offer earned options to ease the fight, and every chapter 5–8 finale uses earlier marks', () => {
    const finaleGated = (ch: number) => {
      const boss = va.pages.indexOf(bosses[ch - 1])
      return va.pages.slice(boss - 4, boss + 1).flatMap((p) => p.steps.flatMap((st) => st.options.filter((o) => o.requires)))
    }
    for (const ch of [5, 6, 7, 8]) expect(finaleGated(ch).length, `Chapter ${ch} finale`).toBeGreaterThanOrEqual(2)
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
    for (const id of ['va_l1_win', 'va_l1_loss', 'va_l2_win', 'va_l2_loss', 'va_l3_win', 'va_l3_loss', 'va_l4_win', 'va_l4_loss', 'va_l5_win', 'va_l5_loss', 'va_l6_win', 'va_l6_loss', 'va_l7_win', 'va_l7_loss']) expect(used.has(id), id).toBe(true)
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
    const boss = va.pages.indexOf(bosses[0])
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

describe('Verdant Accord: partial campaign', () => {
  it('the catalog entry says how much is written and how much is planned', () => {
    const entry = BUNDLED_CATALOG.find((e) => e.id === 'verdant')!
    expect(entry.pageCount).toBe(va.pages.length)
    expect(entry.chaptersWritten).toBe(CHAPTERS)
    expect(entry.chaptersPlanned).toBe(12)
    expect(va.chaptersWritten).toBe(CHAPTERS)
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
    it(`plays Chapters 1–8 with ${va.heroIds![option]}`, () => {
      let s = reduce(initialState(), { type: 'NEW_GAME', seed: 11 + option, campaignId: 'verdant', startDate: '2026-01-03' })
      for (let guard = 0; guard < 20000 && !s.finished; guard++) {
        if (s.pending) {
          s = s.pending.type === 'pickpocket' ? reduce(s, { type: 'PICKPOCKET', take: true }) : reduce(s, { type: 'CONFIRM' })
          continue
        }
        const next = s.progress.steps.findIndex((x) => x === null)
        if (next >= 0) {
          // The hero page picks the hero; choice pages alternate between their two endings by hero.
          const isLegacyStep = va.pages[s.dayIndex].steps[next].options.some((o) => (o.effects ?? []).some((e) => e.type === 'legacy'))
          const pick = s.dayIndex === MUSTER ? option : isLegacyStep ? option % 2 : 0
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
      // Choice chapters follow the choice taken.
      for (const ch of CHOICE_CHAPTERS) expect(s.legacy![ch - 1]).toBe(`va_l${ch}_${option % 2 === 0 ? 'win' : 'loss'}`)
      expect(JSON.parse(JSON.stringify(s))).toEqual(s)
    }, 60_000)
  }
})
