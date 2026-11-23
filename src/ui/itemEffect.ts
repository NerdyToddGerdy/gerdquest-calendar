import { TRAIT_NAMES, type ItemDef, type StatKey } from '../engine/types'

const STAT_LABELS: Record<StatKey, string> = {
  ...TRAIT_NAMES,
  atk: 'Attack',
  def: 'Defense',
  dmg: 'Damage',
  maxHp: 'Max Health',
  roll: 'all rolls',
}

const signed = (n: number) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`)
const bonuses = (b: Partial<Record<StatKey, number>>) =>
  Object.entries(b)
    .map(([k, v]) => `${signed(v ?? 0)} ${STAT_LABELS[k as StatKey]}`)
    .join(', ')

/** A one-line rules summary of what an item does, alongside its flavour text. */
export function itemEffect(it: ItemDef): string {
  switch (it.kind) {
    case 'heal':
      return `Heals d${it.die}${it.bonus ? `+${it.bonus}` : ''} health.`
    case 'slotDie':
      return `Adds d${it.die} to a ${it.slots.join(' / ')} roll after you see it.`
    case 'pageBonus':
      return `${signed(it.amount)}${it.die ? ` + d${it.die}` : ''} ${STAT_LABELS[it.stat]} for the rest of this page.`
    case 'boon':
      return 'Grants a Boon (+d4 to any d20 roll).'
    case 'ration':
      return '' // the item text already explains rations
    case 'cure':
      return 'Removes a wound.'
    case 'gear':
      return `${it.slot[0].toUpperCase()}${it.slot.slice(1)} gear${it.magical ? ' (magical)' : ''}: ${bonuses(it.bonus) || 'no bonus'}.`
    case 'upgrade':
      return `Upgrade: ${bonuses(it.bonus)} (stacks up to ${it.stackMax}).`
  }
}
