import type { AbilityDef } from '../engine/types'

export const ABILITIES: AbilityDef[] = [
  // Wren Ashvale — Lantern Warden
  { id: 'steadfast', name: 'Steadfast', kind: 'passive', bonus: 2, tags: ['physical'], text: '+2 to physical feats of strength and endurance.' },
  { id: 'lanternFlare', name: 'Lantern Flare', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['damage'], text: 'Twice per Rest: add d6 to a Damage roll.' },
  { id: 'secondWind', name: 'Second Wind', kind: 'heal', per: 'rest', uses: 1, die: 6, bonus: 2, text: 'Once per Rest: recover d6+2 health.' },
  { id: 'beaconGuard', name: 'Beacon Guard', kind: 'addDie', per: 'rest', uses: 2, die: 4, slots: ['defense'], text: 'Twice per Rest: add d4 to a Defense roll.' },

  // Isolde Brack — Tidecaller
  { id: 'tidelore', name: 'Tidelore', kind: 'passive', bonus: 2, tags: ['lore', 'perception'], text: '+2 to rolls involving lore, study or keen senses.' },
  { id: 'undertow', name: 'Undertow', kind: 'reroll', per: 'page', uses: 1, text: 'Once per page: reroll any d20 and take the new result.' },
  { id: 'riptide', name: 'Riptide', kind: 'addDie', per: 'rest', uses: 3, die: 4, slots: ['check', 'attack', 'defense'], text: 'Three times per Rest: add d4 to any d20 roll.' },
  { id: 'brineBolt', name: 'Brine Bolt', kind: 'addDie', per: 'rest', uses: 2, die: 8, slots: ['damage'], text: 'Twice per Rest: add d8 to a Damage roll.' },

  // Corin Vale — Gutter Charmer
  { id: 'silverTongue', name: 'Silver Tongue', kind: 'passive', bonus: 2, tags: ['social', 'stealth'], text: '+2 to persuasion, deception and sneaking.' },
  { id: 'quickHands', name: 'Quick Hands', kind: 'reroll', per: 'page', uses: 1, text: 'Once per page: reroll any d20 and take the new result.' },
  { id: 'lowBlow', name: 'Low Blow', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['damage', 'attack'], text: 'Twice per Rest: add d6 to an Attack or Damage roll.' },
  { id: 'luckyCoin', name: 'Lucky Coin', kind: 'addDie', per: 'page', uses: 1, die: 4, slots: ['check'], text: 'Once per page: add d4 to a non-combat check.' },

  // Levels 4/6/8 for Wren, Isolde and Corin (used by the Brightwatch year)
  { id: 'bw-bulwark', name: 'Bulwark', kind: 'addDie', per: 'rest', uses: 2, die: 8, slots: ['defense'], text: 'Twice per Rest: add d8 to a Defense roll.' },
  { id: 'bw-lampSweep', name: 'Lamp Sweep', kind: 'addDie', per: 'page', uses: 1, die: 6, slots: ['damage'], text: 'Once per page: add d6 to a Damage roll.' },
  { id: 'bw-undimmed', name: 'Undimmed', kind: 'heal', per: 'rest', uses: 1, die: 10, bonus: 5, text: 'Once per Rest: recover d10+5 health.' },
  { id: 'bw-tideTurn', name: 'Turn of the Tide', kind: 'reroll', per: 'rest', uses: 2, text: 'Twice per Rest: reroll any d20 and take the new result.' },
  { id: 'bw-maelstrom', name: 'Maelstrom', kind: 'addDie', per: 'rest', uses: 2, die: 10, slots: ['damage'], text: 'Twice per Rest: add d10 to a Damage roll.' },
  { id: 'bw-highTide', name: 'High Tide', kind: 'addDie', per: 'page', uses: 1, die: 6, slots: ['check', 'attack', 'defense'], text: 'Once per page: add d6 to any d20 roll.' },
  { id: 'bw-dirtyTrick', name: 'Dirty Trick', kind: 'addDie', per: 'page', uses: 1, die: 6, slots: ['attack'], text: 'Once per page: add d6 to an Attack roll.' },
  { id: 'bw-vanish', name: 'Vanish', kind: 'addDie', per: 'rest', uses: 2, die: 8, slots: ['defense'], text: 'Twice per Rest: add d8 to a Defense roll.' },
  { id: 'bw-allIn', name: 'All In', kind: 'addDie', per: 'rest', uses: 1, die: 12, slots: ['damage'], text: 'Once per Rest: add d12 to a Damage roll.' },
]
