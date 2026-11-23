// Owned upgrades (2022-style): passive bonuses from items in the pack, e.g. a
// sharpened weapon (+1 Damage, stacks to 3) or a mule (+2 Wis on travel checks).
import { item } from './content'
import type { Check, Hero, Mod, StatKey } from './types'

function upgrades(hero: Hero) {
  return Object.entries(hero.inventory).flatMap(([id, n]) => {
    const it = item(id)
    return it.kind === 'upgrade' ? [{ it, n: Math.min(n, it.stackMax) }] : []
  })
}

/** Always-on bonus to a stat from untagged upgrades (capped at each item's stackMax). */
export function upgradeBonus(hero: Hero, key: StatKey): number {
  let sum = 0
  for (const { it, n } of upgrades(hero)) if (!it.tags?.length) sum += (it.bonus[key] ?? 0) * n
  return sum
}

/** Situational upgrades: apply to checks whose tags match (e.g. 'travel', 'lockpick'). */
export function situationalMods(hero: Hero, check: Check): Mod[] {
  const mods: Mod[] = []
  for (const { it, n } of upgrades(hero)) {
    if (!it.tags?.some((t) => check.tags?.includes(t))) continue
    const v = ((it.bonus[check.trait] ?? 0) + (it.bonus.roll ?? 0)) * n
    if (v) mods.push({ label: it.name, value: v })
  }
  return mods
}
