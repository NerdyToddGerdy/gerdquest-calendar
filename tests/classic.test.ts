import { describe, expect, it } from 'vitest'
import { weekday } from '@questender/engine/calendar'
import { authoredDate, campaign, pageDate } from '@questender/engine/campaign'
import { resolveRound, rollRound, startCombat } from '@questender/engine/combat'
import { heroDef, member } from '@questender/engine/content'
import { resolveDeath } from '@questender/engine/death'
import { createHero, levelUp, passiveBonus, stat, usesLeft } from '@questender/engine/hero'
import { hireFollower, releaseFollower } from '@questender/engine/followers'
import { bundleSaves, parseSaves } from '../src/save'
import { abilityReady } from '@questender/engine/pools'
import { CLASSIC } from '@questender/engine/ruleset'
import { makeRng, scriptedRng } from '@questender/engine/rng'
import { canChangeGear, initialState, newProgress, reduce, type Action } from '@questender/engine/state'
import { situationalMods } from '@questender/engine/upgrades'
import type { GameState, RollSlot } from '@questender/engine/types'
import { ability } from '@questender/engine/content'

const er = campaign('emberroad')

/** A classic-rules game on page `page` of the Ember Road, playing `heroId`. */
function at(page: number, heroId = 'er_garrick'): GameState {
  let s = reduce(initialState(), { type: 'NEW_GAME', seed: 5, campaignId: 'emberroad', startDate: '2026-01-03' })
  s = { ...s, dayIndex: page, progress: newProgress(er.pages[page]) }
  return { ...s, hero: { ...createHero(heroDef(heroId)), inventory: { ...s.hero!.inventory } } }
}
const act = (s: GameState, a: Action, rolls: number[] = []) => reduce(s, a, scriptedRng(rolls))

describe('Ember Road structure', () => {
  it('follows the 2022 layout: Jan 1 is a Saturday weekend page, then Mon–Fri + Sat/Sun pages', () => {
    expect(er.rulesetId).toBe('classic')
    expect(weekday(authoredDate(er, 0))).toBe(6)
    // (Full-year layout checks live in tests/emberroad.test.ts.)
    er.pages.slice(0, 25).forEach((p, i) => {
      const wd = weekday(authoredDate(er, i))
      if (p.span === 2) expect(wd).toBe(6)
      else expect(wd >= 1 && wd <= 5).toBe(true)
    })
    // A start date keeps the weekday alignment: page 0 lands on a Saturday.
    expect(weekday(pageDate(er, 0, '2026-01-03'))).toBe(6)
  })

  it('opens with the prologue hero and hands over at the muster', () => {
    let s = reduce(initialState(), { type: 'NEW_GAME', seed: 1, campaignId: 'emberroad', startDate: '2026-01-03' })
    expect(s.hero!.defId).toBe('er_tamsin')
    expect(s.rulesetId).toBe('classic')
    const muster = er.pages[3].steps[0].options
    expect(muster.map((o) => (o.effects![0] as { heroId: string }).heroId).sort()).toEqual([...er.heroIds!].sort())
    s = { ...s, dayIndex: 3, progress: newProgress(er.pages[3]) }
    s = act(s, { type: 'CHOOSE', step: 0, option: 1 })
    expect(s.hero!.defId).toBe('er_ysolde')
    expect(s.hero!.pools).toEqual({ spell: 4 })
    expect(s.hero!.inventory).toEqual({ ration: 3, er_draught: 1 }) // Tamsin's pack carries over
  })
})

describe('static Defense (2022 rules)', () => {
  const slot = (id: string, kind: RollSlot['kind'], natural: number): RollSlot => ({ id, label: id, kind, die: 20, natural, mods: [] })

  it('rolls no Defense dice', () => {
    const slots = rollRound(createHero(heroDef('er_garrick')), startCombat(['er_frosthound']), makeRng(1), { staticDefense: true })
    expect(slots.map((s) => s.id)).toEqual(['0:atk', '0:dmg'])
  })

  it('10 + Defense at or above the enemy’s attack halves damage; below takes it all', () => {
    const c = startCombat(['er_cultist', 'er_cultist']) // hits 13, dmg 3
    const miss = [slot('0:atk', 'attack', 2), slot('0:dmg', 'damage', 1), slot('1:atk', 'attack', 2), slot('1:dmg', 'damage', 1)]
    expect(resolveRound(c, miss, 2, { staticDefense: 13 }).damageTaken).toBe(2) // 1 + 1
    expect(resolveRound(c, miss, 2, { staticDefense: 12 }).damageTaken).toBe(6)
  })

  it('the reducer uses static Defense under classic rules', () => {
    let s = at(2) // two frost hounds (hits 12, dmg 2); Garrick Def 4 → 14 ≥ 12
    s = act(s, { type: 'ROLL_ROUND' }, [2, 1, 2, 1]) // both attacks miss
    expect(s.pending?.type === 'combat' && s.pending.slots.length).toBe(4) // attack + damage per hound, no Defense
    s = act(s, { type: 'CONFIRM' })
    expect(s.hero!.hp).toBe(14 - 2) // each hound's 2 damage halved
  })
})

describe('point pools', () => {
  it('abilities spend pool points and are refused when short', () => {
    let s = at(8, 'er_ysolde')
    s = act(s, { type: 'ROLL_ROUND' }, [15, 3, 15, 3]) // two cultists
    const lance = ability('er_ab_rimelance')
    s = act(s, { type: 'USE_ABILITY', ability: 'er_ab_rimelance', slot: '0:dmg' }, [5])
    expect(s.hero!.pools!.spell).toBe(2)
    s = act(s, { type: 'USE_ABILITY', ability: 'er_ab_rimelance', slot: '1:dmg' }, [5])
    expect(s.hero!.pools!.spell).toBe(0)
    expect(abilityReady(s.hero!, lance)).toBe(false)
    expect(act(s, { type: 'USE_ABILITY', ability: 'er_ab_rimelance', slot: '1:dmg' }, [5])).toBe(s)
  })

  it('a Rest refills the ruleset’s pools; level-ups raise them', () => {
    let s = at(6, 'er_odalys') // Thornwick Inn (rest)
    s = { ...s, hero: { ...s.hero!, pools: { spell: 0 } } }
    s = act(s, { type: 'REST' })
    expect(s.hero!.pools!.spell).toBe(3)
    let s2 = at(24, 'er_ysolde')
    s2 = { ...s2, hero: { ...s2.hero!, pools: { spell: 1 } } }
    s2 = act(s2, { type: 'CHOOSE', step: 0, option: 0 }) // level up
    expect(s2.hero!.poolMax).toEqual({ spell: 6 })
    expect(s2.hero!.pools).toEqual({ spell: 3 })
    expect(levelUp(createHero(heroDef('er_kesh')), heroDef('er_kesh').levels[2]).hp).toBe(14)
  })
})

describe('followers', () => {
  it('hiring pays the fee and lends abilities; calling them does nothing', () => {
    let s = at(6)
    s = { ...s, hero: { ...s.hero!, glint: 10 } }
    s = act(s, { type: 'HIRE', member: 'er_f_grit' })
    expect(s.hero!.glint).toBe(6)
    expect(s.hero!.abilities).toContain('er_ab_grit')
    expect(act(s, { type: 'CALL_MEMBER', index: 0 })).toBe(s)
  })

  it('upkeep is paid at each Rest; unpaid followers leave and take their abilities', () => {
    let s = at(6)
    s = { ...s, hero: { ...s.hero!, glint: 10 } }
    s = act(s, { type: 'HIRE', member: 'er_f_ambrose' }) // fee 6, upkeep 2
    s = act(s, { type: 'HIRE', member: 'er_f_grit' }) // fee 4, upkeep 1
    expect(s.hero!.glint).toBe(0)
    s = { ...s, hero: { ...s.hero!, glint: 2 } }
    s = act(s, { type: 'REST' })
    expect(s.hero!.glint).toBe(0)
    expect(s.party.map((p) => p.defId)).toEqual(['er_f_ambrose'])
    expect(s.hero!.abilities).not.toContain('er_ab_grit')
    expect(s.hero!.abilities).toContain('er_ab_bless')
    s = act(s, { type: 'DISMISS', index: 0 })
    expect(s.hero!.abilities).not.toContain('er_ab_bless')
  })
})

describe('followers who duplicate a skill the hero already has', () => {
  const withSkills = (ids: string[], glint = 40) => {
    const s = at(6)
    return { ...s, hero: { ...s.hero!, glint, abilities: [...s.hero!.abilities, ...ids] } }
  }

  it('adds +1 to a limited ability instead of nothing, and dismissing removes exactly that', () => {
    let s = withSkills(['er_ab_grit'])
    const before = s.hero!.abilities.length
    s = act(s, { type: 'HIRE', member: 'er_f_grit' })
    expect(s.hero!.abilities.length).toBe(before) // nothing lent twice
    expect(s.party[0].granted).toEqual([])
    expect(s.party[0].boosted).toEqual(['er_ab_grit'])
    expect(usesLeft(s.hero!, ability('er_ab_grit'))).toBe(3)
    s = act(s, { type: 'REST' }) // upkeep paid, boost stays
    expect(s.party).toHaveLength(1)
    expect(usesLeft(s.hero!, ability('er_ab_grit'))).toBe(3)
    s = act(s, { type: 'DISMISS', index: 0 })
    expect(s.hero!.abilities).toContain('er_ab_grit')
    expect(s.hero!.abilityBoost ?? {}).toEqual({})
    expect(usesLeft(s.hero!, ability('er_ab_grit'))).toBe(2)
  })

  it('adds +1 to a passive bonus on checks', () => {
    const trap = ability('er_ab_trapcraft')
    expect(trap.kind === 'passive' && trap.bonus).toBe(2)
    const s = withSkills(['er_ab_trapcraft'])
    const hired = hireFollower(s.hero!, s.party, member('er_f_lio'))
    expect(passiveBonus(hired.hero, trap)).toBe(3)
    expect(passiveBonus(releaseFollower(hired.hero, hired.party[0]), trap)).toBe(2)
  })

  it('an unpaid follower leaves and takes only their boost', () => {
    let s = withSkills(['er_ab_grit'], 40)
    s = act(s, { type: 'HIRE', member: 'er_f_grit' })
    s = { ...s, hero: { ...s.hero!, glint: 0 } }
    s = act(s, { type: 'REST' })
    expect(s.party).toHaveLength(0)
    expect(s.hero!.abilities).toContain('er_ab_grit')
    expect(usesLeft(s.hero!, ability('er_ab_grit'))).toBe(2)
  })

  it('the extra use survives death drain, and the boost survives a save round trip', () => {
    let s = act(withSkills(['er_ab_grit']), { type: 'HIRE', member: 'er_f_grit' })
    const drained = resolveDeath(s.hero!, scriptedRng([6, 1]), CLASSIC.death, 'gold').hero
    expect(usesLeft(drained, ability('er_ab_grit'))).toBe(0) // all three uses (including the boosted one) are spent
    s = parseSaves(JSON.stringify(bundleSaves([s], '2026-11-23')), '2026-11-23')[0]
    expect(s.party[0].boosted).toEqual(['er_ab_grit'])
    expect(usesLeft(s.hero!, ability('er_ab_grit'))).toBe(3)
    s = act(act(s, { type: 'REST' }), { type: 'DISMISS', index: 0 })
    expect(usesLeft(s.hero!, ability('er_ab_grit'))).toBe(2)
  })
})

describe('gear, shops and upgrades', () => {
  it('gear only changes on a Rest under classic rules', () => {
    let s = at(9) // reliquary
    s = act(s, { type: 'CHOOSE', step: 0, option: 1 }, [18]) // break it open → helm
    s = act(s, { type: 'CONFIRM' })
    expect(s.hero!.inventory.er_wardhelm).toBe(1)
    expect(canChangeGear(s)).toBe(false)
    expect(act(s, { type: 'EQUIP', item: 'er_wardhelm' })).toBe(s)
  })

  it('sells at full price; a shop is gone once you turn the page', () => {
    let s = at(4) // the reeve's charge: shop
    s = { ...s, hero: { ...s.hero!, glint: 10 } }
    s = act(s, { type: 'BUY', item: 'er_firepot' })
    s = act(s, { type: 'SELL', item: 'er_firepot' })
    expect(s.hero!.glint).toBe(10)
    s = act(s, { type: 'CHOOSE', step: 0, option: 0 }, [12])
    s = act(s, { type: 'CONFIRM' })
    s = act(s, { type: 'CHOOSE', step: 1, option: 0 }, [12])
    s = act(s, { type: 'CONFIRM' })
    s = act(s, { type: 'NEXT_DAY', today: '2030-01-01' })
    expect(act(s, { type: 'BUY', item: 'er_firepot' })).toBe(s)
  })

  it('stacking upgrades add up to their cap, and the shop won’t sell past it', () => {
    let s = at(12) // Mossgate market
    s = { ...s, hero: { ...s.hero!, glint: 100 } }
    for (let i = 0; i < 4; i++) s = act(s, { type: 'BUY', item: 'er_whetstone' })
    expect(s.hero!.inventory.er_whetstone).toBe(3)
    expect(stat(s.hero!, 'dmg')).toBe(3)
    const h = { ...s.hero!, inventory: { er_whetstone: 5 } }
    expect(stat(h, 'dmg')).toBe(3)
  })

  it('situational upgrades only apply to matching checks', () => {
    const h = { ...createHero(heroDef('er_wenna')), inventory: { er_mule: 1, er_picks: 1 } }
    expect(situationalMods(h, { trait: 'wis', tags: ['travel'] })).toEqual([{ label: 'Pack Mule', value: 2 }])
    expect(situationalMods(h, { trait: 'wis' })).toEqual([])
    expect(situationalMods(h, { trait: 'dex', tags: ['lockpick'] })).toEqual([{ label: 'Lockpick Roll', value: 2 }])
    expect(stat(h, 'wis')).toBe(2) // no always-on bonus
  })

  it('die-based page buffs roll their bonus', () => {
    let s = at(12)
    s = { ...s, hero: { ...s.hero!, inventory: { er_spicedwine: 1 } } }
    s = act(s, { type: 'USE_ITEM', item: 'er_spicedwine' }, [5])
    expect(s.hero!.pageBonus.cha).toBe(5)
  })
})

describe('classic death table and magical items', () => {
  it('result 5 takes only magical gear (rerolls without it)', () => {
    const base = { ...createHero(heroDef('er_garrick')), hp: 0, glint: 4 }
    const plain = { ...base, gear: { head: 'er_wardhelm' } }
    const r1 = resolveDeath(plain, scriptedRng([5, 1]), CLASSIC.death, 'gold')
    expect(r1.hero.gear.head).toBe('er_wardhelm')
    expect(r1.hero.glint).toBe(0) // rerolled into "lose all gold"
    const magic = { ...base, gear: { head: 'er_wardhelm', trinket: 'er_runering' } }
    const r2 = resolveDeath(magic, scriptedRng([5, 1]), CLASSIC.death, 'gold')
    expect(r2.hero.gear.trinket).toBeUndefined()
    expect(r2.hero.gear.head).toBe('er_wardhelm')
  })

  it('pickpocketing needs the ability under classic rules', () => {
    const s = at(6, 'er_garrick')
    expect(act(s, { type: 'ICON', index: 0 }, [3])).toBe(s)
    const p = act(at(6, 'er_pell'), { type: 'ICON', index: 0 }, [3])
    expect(p.pending).toEqual({ type: 'pickpocket', icon: 0, amount: 3 })
  })
})

// The seeded full-year playthrough for every hero lives in tests/emberroad.test.ts.
