// Hero point pools (Spell, Chi, Charges, Surge). Abilities with a `cost`
// spend points; a Rest refills the pools the ruleset names.
import type { AbilityDef, Hero, PoolId } from './types'
import { usesLeft } from './hero'

export const POOL_NAMES: Record<PoolId, string> = { spell: 'Spell', chi: 'Chi', charges: 'Charges', surge: 'Surge' }

export function poolPoints(hero: Hero, pool: PoolId): number {
  return hero.pools?.[pool] ?? 0
}

export function canPay(hero: Hero, a: AbilityDef): boolean {
  return !a.cost || poolPoints(hero, a.cost.pool) >= a.cost.amount
}

/** Usable right now: has uses left (per page / per rest) and enough pool points. */
export function abilityReady(hero: Hero, a: AbilityDef): boolean {
  return usesLeft(hero, a) > 0 && canPay(hero, a)
}

export function pay(hero: Hero, a: AbilityDef): Hero {
  if (!a.cost) return hero
  return { ...hero, pools: { ...hero.pools, [a.cost.pool]: poolPoints(hero, a.cost.pool) - a.cost.amount } }
}

/** Refill the named pools to their maximum. */
export function refillPools(hero: Hero, which: PoolId[]): Hero {
  if (!hero.poolMax) return hero
  const pools = { ...hero.pools }
  for (const p of which) if (hero.poolMax[p] !== undefined) pools[p] = hero.poolMax[p]
  return { ...hero, pools }
}

/** Raise pool maximums (level up); current points rise by the same amount. */
export function growPools(hero: Hero, gain: Partial<Record<PoolId, number>> | undefined): Hero {
  if (!gain) return hero
  const poolMax = { ...hero.poolMax }
  const pools = { ...hero.pools }
  for (const [k, v] of Object.entries(gain) as [PoolId, number][]) {
    poolMax[k] = (poolMax[k] ?? 0) + v
    pools[k] = (pools[k] ?? 0) + v
  }
  return { ...hero, poolMax, pools }
}

/** Short label for an ability's cost, e.g. "2 Spell". */
export function costLabel(a: AbilityDef): string | null {
  if (!a.cost) return null
  const name = a.cost.pool === 'charges' && a.cost.amount === 1 ? 'Charge' : POOL_NAMES[a.cost.pool]
  return `${a.cost.amount} ${name}`
}
