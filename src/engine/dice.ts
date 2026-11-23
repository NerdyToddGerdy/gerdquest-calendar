import type { Rng } from './rng'
import type { Band, Mod, RollSlot, SlotKind } from './types'
import { D20_KINDS } from './types'

export function roll(rng: Rng, sides: number): number {
  return rng.int(sides)
}

/**
 * Percentile roll from two d10s: tens die (00–90) plus ones die (0–9).
 * "00" + "0" counts as 100.
 */
export function rollD100(rng: Rng): number {
  const tens = (rng.int(10) % 10) * 10
  const ones = rng.int(10) % 10
  return tens === 0 && ones === 0 ? 100 : tens + ones
}

export function isD20(slot: RollSlot): boolean {
  return D20_KINDS.includes(slot.kind)
}

export function slotTotal(slot: RollSlot): number {
  return slot.natural + slot.mods.reduce((sum, m) => sum + m.value, 0)
}

export function isNat1(slot: RollSlot): boolean {
  return isD20(slot) && slot.natural === 1
}

export function isNat20(slot: RollSlot): boolean {
  return isD20(slot) && slot.natural === 20
}

export function makeSlot(
  rng: Rng,
  id: string,
  label: string,
  kind: SlotKind,
  die: number,
  mods: Mod[],
): RollSlot {
  return { id, label, kind, die, natural: roll(rng, die), mods: mods.filter((m) => m.value !== 0) }
}

/**
 * Pick the outcome band for a check. A natural 1 always takes the lowest band.
 * Bands are authored lowest-first.
 */
export function pickBand(bands: Band[], total: number, nat1: boolean): Band {
  if (bands.length === 0) throw new Error('no bands')
  if (nat1) return bands[0]
  const found = bands.find(
    (b) => (b.min === undefined || total >= b.min) && (b.max === undefined || total <= b.max),
  )
  if (found) return found
  return total < (bands[0].min ?? -Infinity) ? bands[0] : bands[bands.length - 1]
}

export function bandLabel(b: Band): string {
  if (b.min !== undefined && b.max !== undefined) return `${b.min}–${b.max}`
  if (b.max !== undefined) return `${b.max} or less`
  if (b.min !== undefined) return `${b.min}+`
  return 'any'
}
