// Works out which sound (if any) a game action should make, by comparing the
// state before and after it. Pure, so it can be tested without audio.
import { isNat1, isNat20 } from '@questender/engine/dice'
import type { GameState, RollSlot } from '@questender/engine/types'

export interface DiceSound {
  kind: 'roll' | 'card'
  /** How many dice tumble (1–6). */
  dice: number
  /** A natural 20 landed. */
  crit: boolean
  /** A natural 1 landed. */
  fumble: boolean
}

function pendingSlots(s: GameState): RollSlot[] {
  const p = s.pending
  if (!p) return []
  if (p.type === 'check') return [p.slot]
  if (p.type === 'combat' || p.type === 'dogfight') return p.slots
  return []
}

const modCount = (slots: RollSlot[]) => slots.reduce((n, s) => n + s.mods.length, 0)

export function diceSoundFor(prev: GameState, next: GameState): DiceSound | null {
  const before = pendingSlots(prev)
  const after = pendingSlots(next)
  const sameRoll = after.length > 0 && after.length === before.length && after.every((s, i) => s.id === before[i].id)

  let landed: RollSlot[] = []
  let dice = 0
  if (after.length && !sameRoll) {
    // A fresh roll: every die on the table tumbles.
    landed = after
    dice = after.length
  } else if (sameRoll) {
    landed = after.filter((s, i) => s.natural !== before[i].natural) // rerolls
    dice = landed.length + Math.max(0, modCount(after) - modCount(before)) // + extra dice added by abilities/items
  }

  if (dice === 0) {
    // Something random happened without a roll on screen (loot, lottery, healing dice…).
    if (next.rng !== prev.rng) return { kind: 'roll', dice: 1, crit: false, fumble: false }
    if (next.deck.length < prev.deck.length) return { kind: 'card', dice: 0, crit: false, fumble: false }
    return null
  }
  return {
    kind: 'roll',
    dice: Math.min(6, dice),
    crit: landed.some(isNat20),
    fumble: landed.some(isNat1),
  }
}
