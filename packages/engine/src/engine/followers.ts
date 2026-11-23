// Followers (2022-style companions): a hiring fee, upkeep paid at every Rest,
// and abilities they lend the hero while they stay.
import { member } from './content'
import type { Hero, MemberDef, PartyMember } from './types'

export function isFollower(def: MemberDef): boolean {
  return !!def.follower
}

/** Hire: pay the fee, add the follower, and lend the hero any abilities they don't already have. */
export function hireFollower(hero: Hero, party: PartyMember[], def: MemberDef): { hero: Hero; party: PartyMember[] } {
  const granted = (def.follower?.grants ?? []).filter((id) => !hero.abilities.includes(id))
  return {
    hero: { ...hero, glint: hero.glint - def.fee, abilities: [...hero.abilities, ...granted] },
    party: [...party, { defId: def.id, hp: def.maxHp, usedPage: false, granted }],
  }
}

/** A follower leaves: take back the abilities they lent. */
export function releaseFollower(hero: Hero, m: PartyMember): Hero {
  const lent = new Set(m.granted ?? [])
  return { ...hero, abilities: hero.abilities.filter((id) => !lent.has(id)) }
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
