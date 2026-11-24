// Followers (2022-style companions): a hiring fee, upkeep paid at every Rest,
// and abilities they lend the hero while they stay.
import { member } from './content'
import type { Hero, MemberDef, PartyMember } from './types'

export function isFollower(def: MemberDef): boolean {
  return !!def.follower
}

/**
 * Hire: pay the fee and add the follower. Abilities the hero lacks are lent;
 * abilities the hero already has get +1 instead (a bigger passive bonus, or one
 * extra use for limited abilities).
 */
export function hireFollower(hero: Hero, party: PartyMember[], def: MemberDef): { hero: Hero; party: PartyMember[] } {
  const grants = def.follower?.grants ?? []
  const granted = grants.filter((id) => !hero.abilities.includes(id))
  const boosted = grants.filter((id) => hero.abilities.includes(id))
  const abilityBoost = { ...hero.abilityBoost }
  for (const id of boosted) abilityBoost[id] = (abilityBoost[id] ?? 0) + 1
  return {
    hero: {
      ...hero,
      glint: hero.glint - def.fee,
      abilities: [...hero.abilities, ...granted],
      ...(boosted.length ? { abilityBoost } : {}),
    },
    party: [...party, { defId: def.id, hp: def.maxHp, usedPage: false, granted, ...(boosted.length ? { boosted } : {}) }],
  }
}

/** A follower leaves: take back exactly what they lent or added. */
export function releaseFollower(hero: Hero, m: PartyMember): Hero {
  const lent = new Set(m.granted ?? [])
  let h: Hero = { ...hero, abilities: hero.abilities.filter((id) => !lent.has(id)) }
  if (m.boosted?.length) {
    const abilityBoost = { ...hero.abilityBoost }
    for (const id of m.boosted) {
      const n = (abilityBoost[id] ?? 0) - 1
      if (n > 0) abilityBoost[id] = n
      else delete abilityBoost[id]
    }
    h = { ...h, abilityBoost }
  }
  return h
}

/**
 * Pay upkeep at a Rest, in party order. Anyone the hero can't afford leaves
 * (and takes their lent abilities with them).
 */
export function payUpkeep(hero: Hero, party: PartyMember[], currency: string): { hero: Hero; party: PartyMember[]; lines: string[] } {
  let h = hero
  const kept: PartyMember[] = []
  const lines: string[] = []
  for (const m of party) {
    const def = member(m.defId)
    const upkeep = def.follower?.upkeep
    if (upkeep === undefined) {
      kept.push(m)
      continue
    }
    if (h.glint >= upkeep) {
      h = { ...h, glint: h.glint - upkeep }
      kept.push(m)
      lines.push(`You pay ${def.name} ${upkeep} ${currency} in upkeep.`)
    } else {
      h = releaseFollower(h, m)
      lines.push(`You can't pay ${def.name}'s upkeep (${upkeep} ${currency}). They leave your party.`)
    }
  }
  return { hero: h, party: kept, lines }
}
