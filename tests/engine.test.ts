import { describe, expect, it } from 'vitest'
import { heroDef, member } from '@questender/engine/content'
import { resolveRound, startCombat } from '@questender/engine/combat'
import { resolveDeath } from '@questender/engine/death'
import { pickBand, rollD100 } from '@questender/engine/dice'
import { sellPrice, travel } from '@questender/engine/economy'
import { createHero, levelUp, maxHp, stat } from '@questender/engine/hero'
import { activateWithCard, activateWithDice, freshDeck } from '@questender/engine/party'
import { rest } from '@questender/engine/rest'
import { makeRng, scriptedRng } from '@questender/engine/rng'
import { canAdvance, initialState, reduce, type Action } from '@questender/engine/state'
import type { GameState, RollSlot } from '@questender/engine/types'

const wren = () => createHero(heroDef('wren'))
/** A date after every page has unlocked. */
const FAR_FUTURE = '2999-12-31'

describe('rng & dice', () => {
  it('seeded rng is reproducible', () => {
    const a = makeRng(42)
    const b = makeRng(42)
    expect([1, 2, 3, 4, 5].map(() => a.int(20))).toEqual([1, 2, 3, 4, 5].map(() => b.int(20)))
  })

  it('d100: 00 + 0 is 100, 00 + 5 is 5, 60 + 5 is 65', () => {
    expect(rollD100(scriptedRng([10, 10]))).toBe(100)
    expect(rollD100(scriptedRng([10, 5]))).toBe(5)
    expect(rollD100(scriptedRng([6, 5]))).toBe(65)
  })

  it('natural 1 takes the lowest band regardless of total', () => {
    const bands = [{ max: 10, text: 'low' }, { min: 11, text: 'high' }]
    expect(pickBand(bands, 25, true).text).toBe('low')
    expect(pickBand(bands, 11, false).text).toBe('high')
    expect(pickBand(bands, 10, false).text).toBe('low')
  })
})

/** Start a game on day 1 and resolve a check with a scripted d20. */
function startGame(): GameState {
  return reduce(initialState(), { type: 'NEW_GAME', heroId: 'wren', seed: 7 })
}
function act(s: GameState, a: Action, rolls: number[] = []) {
  return reduce(s, a, scriptedRng(rolls))
}

describe('checks and boons', () => {
  it('natural 20 grants a boon, but only one at a time', () => {
    let s = startGame()
    s = act(s, { type: 'CHOOSE', step: 0, option: 0 }, [20])
    s = act(s, { type: 'CONFIRM' })
    expect(s.hero!.boon).toBe(true)
    s = act(s, { type: 'CHOOSE', step: 1, option: 0 }, [20])
    s = act(s, { type: 'CONFIRM' })
    expect(s.hero!.boon).toBe(true)
    expect(s.log.some((l) => l.text.includes('already hold a Boon'))).toBe(true)
  })

  it('spending a boon adds d4 to a pending d20 and clears the boon', () => {
    let s = startGame()
    s = { ...s, hero: { ...s.hero!, boon: true } }
    s = act(s, { type: 'CHOOSE', step: 0, option: 0 }, [5])
    s = act(s, { type: 'USE_BOON', slot: 'check' }, [3])
    expect(s.hero!.boon).toBe(false)
    expect(s.pending?.type === 'check' && s.pending.slot.mods.find((m) => m.label === 'Boon')?.value).toBe(3)
  })

  it('passive abilities apply when check tags match', () => {
    let s = startGame()
    s = act(s, { type: 'CHOOSE', step: 1, option: 0 }, [10]) // Oil Yard, str, physical
    expect(s.pending?.type === 'check' && s.pending.slot.mods.map((m) => m.label)).toContain('Steadfast')
  })

  it('pick-one steps and ordered steps are enforced', () => {
    let s = reduce(startGame(), { type: 'NEXT_DAY', today: FAR_FUTURE })
    expect(s.dayIndex).toBe(0) // day 1 not finished
    s = startGame()
    for (let i = 0; i < 3; i++) {
      s = act(s, { type: 'CHOOSE', step: i, option: 0 }, [12])
      s = act(s, { type: 'CONFIRM' })
    }
    expect(canAdvance(s)).toBe(true)
    s = act(s, { type: 'NEXT_DAY', today: FAR_FUTURE })
    expect(s.dayIndex).toBe(1)
    // Day 2 is ordered: step 2 not available before step 0
    expect(act(s, { type: 'CHOOSE', step: 2, option: 0 }, [12])).toBe(s)
  })
})

describe('death', () => {
  it('1: loses half glint rounded up', () => {
    const h = { ...wren(), hp: 0, glint: 5 }
    const r = resolveDeath(h, scriptedRng([1]))
    expect(r.hero.glint).toBe(2)
    expect(r.hero.hp).toBe(Math.ceil(maxHp(h) / 2))
  })

  it('1 with no glint rerolls', () => {
    const h = { ...wren(), hp: 0, glint: 0 }
    const r = resolveDeath(h, scriptedRng([1, 4]))
    expect(r.lines.some((l) => l.includes('rerolling'))).toBe(true)
  })

  it('2: wound from d10 table (7 = max health −2)', () => {
    const h = { ...wren(), hp: 0 }
    const r = resolveDeath(h, scriptedRng([2, 7]))
    expect(r.hero.wounds).toEqual(['maxHp'])
    expect(maxHp(r.hero)).toBe(maxHp(h) - 2)
    expect(r.hero.hp).toBe(Math.ceil((maxHp(h) - 2) / 2))
  })

  it('3: loses gear; with no gear rerolls', () => {
    const geared = { ...wren(), hp: 0, gear: { head: 'gullhelm' } }
    expect(resolveDeath(geared, scriptedRng([3, 1])).hero.gear.head).toBeUndefined()
    const bare = { ...wren(), hp: 0, glint: 3 }
    const r = resolveDeath(bare, scriptedRng([3, 1]))
    expect(r.hero.glint).toBe(1)
  })

  it('4: marks per-rest abilities used, clears conditions', () => {
    const h = { ...wren(), hp: 0, poisoned: true, cursed: true }
    const r = resolveDeath(h, scriptedRng([4]))
    expect(r.hero.usedRest.lanternFlare).toBe(2)
    expect(r.hero.usedRest.secondWind).toBe(1)
    expect(r.hero.poisoned || r.hero.cursed).toBe(false)
  })
})

describe('rest & level up', () => {
  it('rest heals fully, refreshes, and removes exactly one wound type', () => {
    const h = { ...wren(), hp: 1, wounds: ['str', 'str', 'dex'] as const, usedRest: { lanternFlare: 2 } }
    const r = rest({ ...h, wounds: [...h.wounds] }, [])
    expect(r.hero.wounds).toEqual(['dex'])
    expect(r.hero.usedRest).toEqual({})
    expect(r.hero.hp).toBe(maxHp(r.hero))
  })

  it('level up raises current hp by the same amount and does not refresh', () => {
    const h = { ...wren(), hp: 5, usedRest: { lanternFlare: 1 } }
    const up = levelUp(h, heroDef('wren').levels[2])
    expect(up.baseMaxHp).toBe(h.baseMaxHp + 4)
    expect(up.hp).toBe(9)
    expect(up.usedRest.lanternFlare).toBe(1)
    expect(up.abilities).toContain('beaconGuard')
  })
})

describe('combat', () => {
  const slot = (id: string, kind: RollSlot['kind'], natural: number, mod = 0): RollSlot => ({
    id,
    label: id,
    kind,
    die: kind === 'damage' ? 8 : 20,
    natural,
    mods: [{ label: 'm', value: mod }],
  })

  it('hit + enough damage defeats; otherwise defense halves damage', () => {
    const c = startCombat(['fogmite', 'fogmite'])
    const res = resolveRound(
      c,
      [
        slot('0:atk', 'attack', 10, 2), slot('0:dmg', 'damage', 4), slot('0:def', 'defense', 1),
        slot('1:atk', 'attack', 3, 2), slot('1:dmg', 'damage', 8), slot('1:def', 'defense', 12, 0),
      ],
      3,
    )
    expect(res.combat.enemies.map((e) => e.defeated)).toEqual([true, false])
    expect(res.damageTaken).toBe(1) // fog-mite dmg 2, blocked → 1
    expect(res.combat.done).toBe(false)
  })

  it('natural 1 on attack always misses', () => {
    const c = startCombat(['fogmite'])
    const res = resolveRound(c, [slot('0:atk', 'attack', 1, 30), slot('0:dmg', 'damage', 8), slot('0:def', 'defense', 2)], 3)
    expect(res.combat.enemies[0].defeated).toBe(false)
    expect(res.damageTaken).toBe(2)
  })

  it('combat ends after the last round', () => {
    const c = { ...startCombat(['fogmite']), round: 3 }
    const res = resolveRound(c, [slot('0:atk', 'attack', 2), slot('0:dmg', 'damage', 1), slot('0:def', 'defense', 2)], 3)
    expect(res.combat.done).toBe(true)
    expect(res.combat.won).toBe(false)
  })
})

describe('dying in combat', () => {
  it('ends the fight without also applying the lose outcome', () => {
    let s = startGame()
    s = { ...s, dayIndex: 4, progress: { ...s.progress, steps: [], results: [], icons: [false] } } // Day 5: fog-mites
    s = { ...s, hero: { ...s.hero!, hp: 1, glint: 4 } }
    // 3 enemies × (atk, dmg, def): all miss, all fail to block
    s = act(s, { type: 'ROLL_ROUND' }, [2, 1, 2, 2, 1, 2, 2, 1, 2])
    s = act(s, { type: 'CONFIRM' }, [1]) // death table: lose half glint
    expect(s.progress.combat?.done).toBe(true)
    expect(s.hero!.hp).toBe(Math.ceil(maxHp(s.hero!) / 2)) // no extra lose damage
    expect(s.hero!.glint).toBe(2)
    expect(s.log.some((l) => l.text.includes('scatter into side passages'))).toBe(false)
  })
})

describe('party', () => {
  const pip = member('pip')
  it('face cards count as 10 and hurt the member; jokers match both suits of their color', () => {
    const act = activateWithCard(pip, { suit: 'joker', rank: 0, color: 'red' })
    expect(act.hurt).toBe(true)
    expect(act.triggered.map((a) => a.name)).toEqual(['Warm Glow', 'Dazzle'])
    expect(activateWithCard(pip, { suit: 'spades', rank: 13, color: 'black' }).triggered).toEqual([])
  })

  it('dice fallback: single suit needs 4, two suits need 3+, d12 ≥ 10 hurts', () => {
    const r3 = activateWithDice(pip, scriptedRng([3, 9]))
    expect(r3.triggered.map((a) => a.name)).toEqual(['Dazzle'])
    expect(r3.hurt).toBe(false)
    const r4 = activateWithDice(pip, scriptedRng([4, 10]))
    expect(r4.triggered.map((a) => a.name)).toEqual(['Warm Glow', 'Dazzle'])
    expect(r4.hurt).toBe(true)
  })

  it('deck has 54 cards', () => {
    expect(freshDeck()).toHaveLength(54)
  })
})

describe('economy', () => {
  it('sells at half price rounded down', () => {
    expect(sellPrice(5)).toBe(2)
    expect(sellPrice(12)).toBe(6)
  })
  it('missing rations are counted', () => {
    expect(travel(2, 1)).toEqual({ eaten: 1, missing: 1 })
  })
})

describe('stats', () => {
  it('gear, page bonus and wounds combine', () => {
    const h = { ...wren(), gear: { feet: 'saltboots' }, pageBonus: { dex: 2 }, wounds: ['dex' as const] }
    expect(stat(h, 'dex')).toBe(0 + 1 + 2 - 1)
  })
})

describe('full playthrough', () => {
  it('a seeded random run reaches the end of the default campaign', () => {
    let s = reduce(initialState(), { type: 'NEW_GAME', heroId: 'corin', seed: 1234 })
    for (let guard = 0; guard < 50000 && !s.finished; guard++) {
      if (s.pending) {
        s = s.pending.type === 'pickpocket' ? reduce(s, { type: 'PICKPOCKET', take: true }) : reduce(s, { type: 'CONFIRM' })
        continue
      }
      const next = s.progress.steps.findIndex((x) => x === null)
      if (next >= 0) {
        s = reduce(s, { type: 'CHOOSE', step: next, option: 0 })
        continue
      }
      const before = s
      s = reduce(s, { type: 'ROLL_ROUND' })
      if (s === before) s = reduce(s, { type: 'NEXT_DAY', today: FAR_FUTURE })
    }
    expect(s.finished).toBe(true)
    expect(s.hero!.level).toBeGreaterThanOrEqual(2)
    // save/load roundtrip
    expect(JSON.parse(JSON.stringify(s))).toEqual(s)
  })
})
