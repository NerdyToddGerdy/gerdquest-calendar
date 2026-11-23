import { describe, expect, it } from 'vitest'
import type { GameState, RollSlot } from '../src/engine/types'
import { initialState, reduce } from '../src/engine/state'
import { diceSoundFor } from '../src/sound/diceEvents'

const base = () => reduce(initialState(), { type: 'NEW_GAME', heroId: 'wren', seed: 5, campaignId: 'brightwatch', startDate: '2026-11-16' })
const slot = (id: string, natural: number, mods = 0): RollSlot => ({
  id, label: id, kind: 'attack', die: 20, natural, mods: Array.from({ length: mods }, () => ({ label: 'x', value: 1 })),
})
const withSlots = (s: GameState, slots: RollSlot[]): GameState => ({ ...s, pending: { type: 'combat', slots } })

describe('dice sounds', () => {
  it('rolls every die on a fresh roll and flags naturals', () => {
    const s = base()
    expect(diceSoundFor(s, withSlots(s, [slot('a', 20), slot('d', 7)]))).toEqual({ kind: 'roll', dice: 2, crit: true, fumble: false })
    expect(diceSoundFor(s, { ...s, pending: { type: 'check', step: 0, option: 0, slot: slot('c', 1) } })?.fumble).toBe(true)
  })

  it('rolls only the rerolled or added dice', () => {
    const s = withSlots(base(), [slot('a', 5), slot('d', 7)])
    expect(diceSoundFor(s, withSlots(s, [slot('a', 20), slot('d', 7)]))).toEqual({ kind: 'roll', dice: 1, crit: true, fumble: false })
    expect(diceSoundFor(s, withSlots(s, [slot('a', 5, 1), slot('d', 7)]))).toEqual({ kind: 'roll', dice: 1, crit: false, fumble: false })
  })

  it('is silent when nothing random happened, and clicks for hidden randomness', () => {
    const s = base()
    expect(diceSoundFor(s, { ...s, notes: 'hi' })).toBeNull()
    expect(diceSoundFor(s, { ...s, rng: s.rng + 1 })?.dice).toBe(1)
  })

  it('makes a sound for a real check in the first page', () => {
    const s = base()
    const day = s.progress
    expect(day).toBeTruthy()
    // Try each option of the first step until one rolls a check.
    for (let o = 0; o < 4; o++) {
      const next = reduce(s, { type: 'CHOOSE', step: 0, option: o })
      if (next.pending) {
        expect(diceSoundFor(s, next)?.kind).toBe('roll')
        return
      }
    }
  })
})
