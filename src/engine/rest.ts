import { member } from './content'
import { maxHp, woundName } from './hero'
import type { Hero, PartyMember, WoundKind } from './types'

/**
 * A Rest: full health for hero and party, refresh every ability, clear
 * Poisoned/Cursed, and remove one type of Wound (all stacks of that type).
 */
export function rest(
  hero: Hero,
  party: PartyMember[],
  woundToHeal?: WoundKind,
  conditionLabels: [string, string] = ['Poisoned', 'Cursed'],
): { hero: Hero; party: PartyMember[]; lines: string[] } {
  const lines = [`You rest. Health and abilities are restored; ${conditionLabels[0]} and ${conditionLabels[1]} are cleared.`]
  let wounds = hero.wounds
  const target = woundToHeal && wounds.includes(woundToHeal) ? woundToHeal : wounds[0]
  if (target) {
    wounds = wounds.filter((w) => w !== target)
    lines.push(`Your Wound heals (${woundName(target)} removed).`)
  }
  const h: Hero = { ...hero, wounds, usedRest: {}, usedPage: {}, poisoned: false, cursed: false }
  return {
    hero: { ...h, hp: maxHp(h) },
    party: party.map((p) => ({ ...p, hp: member(p.defId).maxHp })),
    lines,
  }
}
