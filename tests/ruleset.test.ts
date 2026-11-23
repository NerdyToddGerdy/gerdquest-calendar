import { describe, expect, it } from 'vitest'
import { heroDef } from '../src/engine/content'
import { combatRounds, resolveRound, startCombat } from '../src/engine/combat'
import { resolveDeath } from '../src/engine/death'
import { createHero, maxHp } from '../src/engine/hero'
import { scriptedRng } from '../src/engine/rng'
import { CLASSIC, FRONTIER, MODERN, RULESETS, rules } from '../src/engine/ruleset'
import { canChangeGear, initialState, reduce, type Action } from '../src/engine/state'
import type { GameState, RollSlot, RulesetId } from '../src/engine/types'

const wren = () => createHero(heroDef('wren'))

function game(rulesetId?: RulesetId): GameState {
  const s = reduce(initialState(), { type: 'NEW_GAME', heroId: 'wren', seed: 7 })
  return rulesetId ? { ...s, rulesetId } : s
}
const act = (s: GameState, a: Action, rolls: number[] = []) => reduce(s, a, scriptedRng(rolls))

describe('presets', () => {
  it('has three presets, and older saves default to modern', () => {
    expect(Object.keys(RULESETS).sort()).toEqual(['classic', 'frontier', 'modern'])
    expect(rules({})).toBe(MODERN)
    expect(rules({ rulesetId: 'classic' })).toBe(CLASSIC)
  })

  it('death tables have one entry per die face, and wound tables match their dice', () => {
    for (const r of Object.values(RULESETS)) {
      expect(r.death.entries).toHaveLength(r.death.die)
      for (const e of r.death.entries) if (e.kind === 'wound') expect(e.table).toHaveLength(e.die)
    }
  })

  it('modern preset keeps the current rules', () => {
    expect(MODERN).toMatchObject({
      boons: true,
      gearSwap: 'restOrAcquire',
      shop: { sellRate: 0.5 },
      pickpocket: 'anyone',
      lootIcons: true,
      companions: 'party',
      combat: { defense: 'roll', groups: 'fixedRounds', soloStun: false },
    })
  })
})

describe('classic d6 death table', () => {
  const t = CLASSIC.death
  it('1: lose all gold', () => {
    expect(resolveDeath({ ...wren(), hp: 0, glint: 7 }, scriptedRng([1]), t, 'gold').hero.glint).toBe(0)
  })
  it('2/3/4: physical, mental and grievous wound tables', () => {
    expect(resolveDeath({ ...wren(), hp: 0 }, scriptedRng([2, 3]), t).hero.wounds).toEqual(['dex'])
    expect(resolveDeath({ ...wren(), hp: 0 }, scriptedRng([3, 6]), t).hero.wounds).toEqual(['cha'])
    expect(resolveDeath({ ...wren(), hp: 0 }, scriptedRng([4, 3]), t).hero.wounds).toEqual(['def'])
  })
  it('heals to half before rolling, then clamps to a lowered max', () => {
    const h = { ...wren(), hp: 0, baseMaxHp: 13 } // half = 7
    const r = resolveDeath(h, scriptedRng([4, 1]), t) // Max Health −2 → max 11
    expect(maxHp(r.hero)).toBe(11)
    expect(r.hero.hp).toBe(7)
    const small = resolveDeath({ ...wren(), hp: 0, baseMaxHp: 3 }, scriptedRng([4, 1]), t) // half 2, max 1
    expect(small.hero.hp).toBe(1)
  })
  it('5: only magical gear can be lost; ordinary gear rerolls', () => {
    const geared = { ...wren(), hp: 0, glint: 0, gear: { head: 'gullhelm' } }
    const r = resolveDeath(geared, scriptedRng([5, 6]), t)
    expect(r.hero.gear.head).toBe('gullhelm')
    expect(r.lines.some((l) => l.includes('rerolling'))).toBe(true)
  })
  it('6: drained', () => {
    expect(resolveDeath({ ...wren(), hp: 0 }, scriptedRng([6]), t).hero.usedRest.lanternFlare).toBe(2)
  })
  it('frontier uses the d4 table with its own currency name', () => {
    const r = resolveDeath({ ...wren(), hp: 0, glint: 4 }, scriptedRng([1]), FRONTIER.death, 'credits')
    expect(r.hero.glint).toBe(2)
    expect(r.lines.join(' ')).toContain('credits')
  })
})

describe('boons toggle', () => {
  it('without boons a natural 1 is not an automatic failure and a natural 20 gives no Boon', () => {
    let s = game('classic')
    s = act(s, { type: 'CHOOSE', step: 1, option: 0 }, [1]) // Oil Yard: str+2 +2 Steadfast = 5
    s = act(s, { type: 'CONFIRM' })
    expect(s.progress.results[1]).toMatch(/^You rolled 5\./)
    s = act(s, { type: 'CHOOSE', step: 0, option: 0 }, [20])
    s = act(s, { type: 'CONFIRM' })
    expect(s.hero!.boon).toBe(false)
  })
  it('a Boon cannot be spent or gained from items', () => {
    let s = game('classic')
    s = { ...s, hero: { ...s.hero!, boon: true, inventory: { luckglass: 1 } } }
    s = act(s, { type: 'CHOOSE', step: 0, option: 0 }, [5])
    expect(act(s, { type: 'USE_BOON', slot: 'check' }, [3])).toBe(s)
  })
})

describe('classic combat', () => {
  const slot = (id: string, kind: RollSlot['kind'], natural: number): RollSlot => ({
    id, label: id, kind, die: kind === 'damage' ? 8 : 20, natural, mods: [],
  })
  const killing = [slot('0:atk', 'attack', 18), slot('0:dmg', 'damage', 8), slot('0:def', 'defense', 2)]

  it('single enemy: an early kill only Stuns (no damage), the final round kills', () => {
    const c = startCombat(['fogmite'])
    const early = resolveRound(c, killing, 3, { soloStun: true })
    expect(early.combat.enemies[0].defeated).toBe(false)
    expect(early.damageTaken).toBe(0)
    const last = resolveRound({ ...c, round: 3 }, killing, 3, { soloStun: true })
    expect(last.combat.won).toBe(true)
  })

  it('soloStun has no effect on group fights', () => {
    const c = startCombat(['fogmite', 'fogmite'])
    const res = resolveRound(c, [...killing, slot('1:atk', 'attack', 18), slot('1:dmg', 'damage', 8), slot('1:def', 'defense', 2)], 3, { soloStun: true })
    expect(res.combat.won).toBe(true)
  })

  it('groups get one round per monster', () => {
    expect(combatRounds(3, 2, 'roundPerMonster')).toBe(2)
    expect(combatRounds(4, 1, 'roundPerMonster')).toBe(4)
    expect(combatRounds(3, 5, 'fixedRounds')).toBe(3)
  })
})

describe('classic shops, gear and icons', () => {
  it('sells back at full price', () => {
    const modern = act({ ...game(), hero: { ...game().hero!, glint: 0, inventory: { mendwater: 1 } } }, { type: 'SELL', item: 'mendwater' })
    const classic = act({ ...game('classic'), hero: { ...game().hero!, glint: 0, inventory: { mendwater: 1 } } }, { type: 'SELL', item: 'mendwater' })
    expect(modern.hero!.glint).toBe(2)
    expect(classic.hero!.glint).toBe(5)
  })

  it('gear can only be swapped on a Rest', () => {
    let s = { ...game('classic'), hero: { ...game().hero!, glint: 20 } }
    s = act(s, { type: 'BUY', item: 'saltboots' })
    expect(canChangeGear(s)).toBe(false)
    expect(canChangeGear({ ...s, rulesetId: 'modern' })).toBe(true)
    expect(canChangeGear({ ...s, progress: { ...s.progress, rested: true } })).toBe(true)
  })

  it('loot icons are off and pickpocketing needs the ability', () => {
    const s = game('classic')
    expect(act(s, { type: 'ICON', index: 0 }, [3])).toBe(s) // day 1 loot icon
    const day2 = { ...s, dayIndex: 1, progress: { ...s.progress, steps: [null, null, null], results: [null, null, null], icons: [false] } }
    expect(act(day2, { type: 'ICON', index: 0 }, [2])).toBe(day2)
    const thief = { ...day2, hero: { ...day2.hero!, abilities: [...day2.hero!.abilities, 'pickpocket'] } }
    expect(act(thief, { type: 'ICON', index: 0 }, [2]).pending?.type).toBe('pickpocket')
  })
})

describe('condition labels', () => {
  it('frontier names the conditions Infected / Malfunction', () => {
    let s = game('frontier')
    s = { ...s, dayIndex: 2, progress: { ...s.progress, steps: [null, null, null], results: [null, null, null], icons: [false] } }
    s = act(s, { type: 'CHOOSE', step: 0, option: 1 })
    s = act(s, { type: 'CHOOSE', step: 1, option: 0 }, [2]) // fogweed fail → poisoned
    s = act(s, { type: 'CONFIRM' })
    expect(s.log.some((l) => l.text.startsWith('You are Infected'))).toBe(true)
  })
})
