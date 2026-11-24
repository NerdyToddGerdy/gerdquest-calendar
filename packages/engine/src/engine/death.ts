import { ability, item } from './content'
import { maxHp, maxUses, woundName } from './hero'
import type { Rng } from './rng'
import { MODERN } from './ruleset'
import type { DeathTable, GearSlot, Hero, ItemDef, WoundKind } from './types'

/** The modern d10 wound table (kept for callers that index it directly). */
export const WOUND_TABLE: WoundKind[] = ['str', 'dex', 'con', 'int', 'wis', 'cha', 'maxHp', 'def', 'atk', 'dmg']

/** Gear counts as magical when its definition sets `magical: true`. */
export function isMagical(def: ItemDef): boolean {
  return def.kind === 'gear' && def.magical === true
}

/**
 * The hero has fallen. Roll on the ruleset's death table, rerolling results
 * that don't apply (no currency to lose / no qualifying gear). The hero
 * returns at half max health (rounded up) with conditions cleared.
 */
export function resolveDeath(
  hero: Hero,
  rng: Rng,
  table: DeathTable = MODERN.death,
  currency = 'glint',
): { hero: Hero; lines: string[] } {
  const lines = [`${hero.name} has fallen. The tide-spirits draw them back — for a price.`]
  let h = { ...hero }
  if (table.healFirst) h = { ...h, hp: Math.ceil(maxHp(h) / 2) }
  for (let guard = 0; guard < 50; guard++) {
    const r = rng.int(table.die)
    const e = table.entries[r - 1]
    if (e.kind === 'loseCurrency') {
      if (h.glint <= 0) {
        lines.push(`Rolled ${r} (lose ${currency}), but you have none — rerolling.`)
        continue
      }
      const lost = Math.ceil(h.glint * e.fraction)
      h = { ...h, glint: h.glint - lost }
      lines.push(`Rolled ${r}: ${e.text} (−${lost} ${currency})`)
      break
    }
    if (e.kind === 'wound') {
      const w = e.table[rng.int(e.die) - 1]
      h = { ...h, wounds: [...h.wounds, w] }
      lines.push(`Rolled ${r}: ${e.text} (${e.group}: ${woundName(w)})`)
      break
    }
    if (e.kind === 'loseGear') {
      const slots = (Object.keys(h.gear) as GearSlot[]).filter((s) => {
        const id = h.gear[s]
        return id && (e.filter === 'any' || isMagical(item(id)))
      })
      if (slots.length === 0) {
        lines.push(`Rolled ${r} (lose ${e.filter === 'magical' ? 'a magical item' : 'equipment'}), but you have none equipped — rerolling.`)
        continue
      }
      const slot = slots[rng.int(slots.length) - 1]
      const lostId = h.gear[slot]!
      const gear = { ...h.gear }
      delete gear[slot]
      h = { ...h, gear }
      lines.push(`Rolled ${r}: ${e.text} You lose your ${item(lostId).name}.`)
      break
    }
    // drain
    const usedRest = { ...h.usedRest }
    for (const id of h.abilities) {
      const a = ability(id)
      if (a.kind !== 'passive' && a.per === 'rest') usedRest[id] = maxUses(h, a)
    }
    // Pool-costed abilities are "spent" by emptying the pools.
    const pools = h.pools ? Object.fromEntries(Object.keys(h.pools).map((k) => [k, 0])) : h.pools
    h = { ...h, usedRest, ...(pools ? { pools } : {}) }
    lines.push(`Rolled ${r}: ${e.text}`)
    break
  }
  const hp = table.healFirst ? Math.min(h.hp, maxHp(h)) : Math.ceil(maxHp(h) / 2)
  h = { ...h, hp: Math.max(1, hp), poisoned: false, cursed: false }
  lines.push(`You return with ${h.hp} health.`)
  return { hero: h, lines }
}
