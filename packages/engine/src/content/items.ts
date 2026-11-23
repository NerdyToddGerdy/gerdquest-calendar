import type { ItemDef } from '../engine/types'

export const ITEMS: ItemDef[] = [
  // Consumables
  { id: 'ration', name: 'Trail Ration', kind: 'ration', price: 1, text: 'Eaten while traveling. Each missing ration costs 1 health.' },
  { id: 'mendwater', name: 'Mendwater Vial', kind: 'heal', die: 6, bonus: 2, price: 5, text: 'Recover d6+2 health. Not usable during combat rounds.' },
  { id: 'emberflask', name: 'Emberflask', kind: 'slotDie', die: 6, slots: ['damage'], price: 4, text: 'Hurl it: add d6 to a Damage roll.' },
  { id: 'ironbrew', name: 'Ironbrew Tonic', kind: 'slotDie', die: 4, slots: ['attack'], price: 3, text: 'Add d4 to an Attack roll.' },
  { id: 'wardsalve', name: 'Ward Salve', kind: 'slotDie', die: 4, slots: ['defense'], price: 3, text: 'Add d4 to a Defense roll.' },
  { id: 'bramblenut', name: 'Bramblenut', kind: 'pageBonus', stat: 'str', amount: 2, price: 3, text: '+2 Strength for the rest of today.' },
  { id: 'quickmoss', name: 'Quickmoss', kind: 'pageBonus', stat: 'dex', amount: 2, price: 3, text: '+2 Dexterity for the rest of today.' },
  { id: 'hearthroot', name: 'Hearthroot', kind: 'pageBonus', stat: 'con', amount: 2, price: 3, text: '+2 Constitution for the rest of today.' },
  { id: 'owlcap', name: 'Owlcap', kind: 'pageBonus', stat: 'int', amount: 2, price: 3, text: '+2 Intellect for the rest of today.' },
  { id: 'stillleaf', name: 'Stillwater Leaf', kind: 'pageBonus', stat: 'wis', amount: 2, price: 3, text: '+2 Wisdom for the rest of today.' },
  { id: 'luckglass', name: 'Luckglass', kind: 'boon', price: 8, text: 'Gain a Boon (if you don’t already hold one).' },
  { id: 'dawndew', name: 'Dawn Dew', kind: 'cure', price: 12, text: 'Heals one lingering Wound.' },

  // Equipment
  { id: 'gullhelm', name: 'Gullfeather Helm', kind: 'gear', slot: 'head', bonus: { def: 1 }, price: 10, text: '+1 Defense.' },
  { id: 'wardencoat', name: 'Warden’s Oilcoat', kind: 'gear', slot: 'body', bonus: { maxHp: 2 }, price: 12, text: '+2 max health.' },
  { id: 'tidewraps', name: 'Tidewraps', kind: 'gear', slot: 'hands', bonus: { atk: 1 }, price: 10, text: '+1 Attack.' },
  { id: 'saltboots', name: 'Saltstride Boots', kind: 'gear', slot: 'feet', bonus: { dex: 1 }, price: 8, text: '+1 Dexterity.' },
  { id: 'bellcharm', name: 'Sunken Bell Charm', kind: 'gear', slot: 'trinket', bonus: { wis: 1, cha: 1 }, price: 14, text: '+1 Wisdom, +1 Charisma.' },
]
