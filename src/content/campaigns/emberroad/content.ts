// The Ember Road — original heroes, abilities, items, enemies and followers
// for a 2022-style (classic rules) campaign.
import type { AbilityDef, ContentPack, EnemyDef, HeroDef, ItemDef, MemberDef } from '../../../engine/types'
import { YEAR_ABILITIES, YEAR_ENEMIES, YEAR_ITEMS, YEAR_LEVELS, YEAR_MEMBERS } from './year'

const abilities: AbilityDef[] = [
  // Tamsin Reed (prologue)
  { id: 'er_ab_keeperlore', name: 'Keeper’s Lore', kind: 'passive', bonus: 2, tags: ['lore', 'perception'], text: '+2 to rolls about waystones, old lore and keen senses.' },
  { id: 'er_ab_lanternwatch', name: 'Lantern Watch', kind: 'heal', per: 'rest', uses: 1, die: 4, bonus: 1, text: 'Once per Rest: rest by the lantern and recover d4+1 health.' },

  // Garrick Vane — Shieldwright
  { id: 'er_ab_bulwark', name: 'Bulwark', kind: 'passive', bonus: 2, tags: ['physical'], text: '+2 to feats of strength and endurance.' },
  { id: 'er_ab_hammerfall', name: 'Hammerfall', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['damage'], text: 'Twice per Rest: add d6 to a Damage roll.' },
  { id: 'er_ab_unbroken', name: 'Unbroken', kind: 'heal', per: 'rest', uses: 1, die: 6, bonus: 2, text: 'Once per Rest: recover d6+2 health.' },

  // Ysolde Marrow — Frost-Witch (Spell points)
  { id: 'er_ab_hoarlore', name: 'Hoarlore', kind: 'passive', bonus: 2, tags: ['lore'], text: '+2 to rolls involving lore, runes and study.' },
  { id: 'er_ab_rimelance', name: 'Rime Lance', kind: 'addDie', per: 'rest', uses: 99, die: 8, slots: ['damage'], cost: { pool: 'spell', amount: 2 }, text: '2 Spell: add d8 to a Damage roll.' },
  { id: 'er_ab_glacialfocus', name: 'Glacial Focus', kind: 'reroll', per: 'page', uses: 1, cost: { pool: 'spell', amount: 1 }, text: 'Once per page, 1 Spell: reroll any d20.' },
  { id: 'er_ab_thaw', name: 'Thaw', kind: 'heal', per: 'rest', uses: 99, die: 6, bonus: 1, cost: { pool: 'spell', amount: 2 }, text: '2 Spell: recover d6+1 health.' },

  // Pell Quickfinger — Gutter Thief
  { id: 'pickpocket', name: 'Pickpocket', kind: 'passive', bonus: 0, tags: ['pickpocket'], text: 'You can lift purses at hidden pickpocket spots (d4 gold; on a 4, lose 1 Virtue).' },
  { id: 'er_ab_lightstep', name: 'Light Step', kind: 'passive', bonus: 2, tags: ['stealth', 'lockpick'], text: '+2 to sneaking and picking locks.' },
  { id: 'er_ab_slip', name: 'Slip Away', kind: 'reroll', per: 'page', uses: 1, text: 'Once per page: reroll any d20.' },
  { id: 'er_ab_backstab', name: 'Backstab', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['attack', 'damage'], text: 'Twice per Rest: add d6 to an Attack or Damage roll.' },

  // Sister Odalys — Lantern Cleric (Spell points)
  { id: 'er_ab_kindly', name: 'Kindly Word', kind: 'passive', bonus: 2, tags: ['social'], text: '+2 to persuading, comforting and bargaining.' },
  { id: 'er_ab_mend', name: 'Mend', kind: 'heal', per: 'rest', uses: 99, die: 4, bonus: 2, cost: { pool: 'spell', amount: 1 }, text: '1 Spell: recover d4+2 health.' },
  { id: 'er_ab_sunbrand', name: 'Sunbrand', kind: 'addDie', per: 'rest', uses: 99, die: 6, slots: ['damage'], cost: { pool: 'spell', amount: 2 }, text: '2 Spell: add d6 to a Damage roll.' },
  { id: 'er_ab_blessing', name: 'Blessing', kind: 'addDie', per: 'rest', uses: 99, die: 4, slots: ['check', 'attack'], cost: { pool: 'spell', amount: 1 }, text: '1 Spell: add d4 to a check or Attack roll.' },

  // Kesh of the Nine Winds — Wandering Monk (Chi points)
  { id: 'er_ab_fleet', name: 'Fleet', kind: 'passive', bonus: 2, tags: ['physical'], text: '+2 to running, climbing and balance.' },
  { id: 'er_ab_flurry', name: 'Flurry', kind: 'addDie', per: 'rest', uses: 99, die: 4, slots: ['attack'], cost: { pool: 'chi', amount: 1 }, text: '1 Chi: add d4 to an Attack roll.' },
  { id: 'er_ab_stillmind', name: 'Still Mind', kind: 'reroll', per: 'page', uses: 1, cost: { pool: 'chi', amount: 1 }, text: 'Once per page, 1 Chi: reroll any d20.' },
  { id: 'er_ab_openpalm', name: 'Open Palm', kind: 'addDie', per: 'rest', uses: 99, die: 8, slots: ['damage'], cost: { pool: 'chi', amount: 2 }, text: '2 Chi: add d8 to a Damage roll.' },

  // Wenna Harrowgate — Hunter
  { id: 'er_ab_trailwise', name: 'Trailwise', kind: 'passive', bonus: 2, tags: ['travel', 'perception'], text: '+2 to tracking, travel and spotting danger.' },
  { id: 'er_ab_calledshot', name: 'Called Shot', kind: 'reroll', per: 'page', uses: 1, text: 'Once per page: reroll any d20.' },
  { id: 'er_ab_volley', name: 'Volley', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['attack', 'damage'], text: 'Twice per Rest: add d6 to an Attack or Damage roll.' },
  { id: 'er_ab_snare', name: 'Snare', kind: 'addDie', per: 'page', uses: 1, die: 4, slots: ['check'], text: 'Once per page: add d4 to a non-combat check.' },

  // Lent by followers
  { id: 'er_ab_bless', name: 'Ambrose’s Blessing', kind: 'heal', per: 'rest', uses: 1, die: 4, bonus: 1, text: 'Once per Rest (from Brother Ambrose): recover d4+1 health.' },
  { id: 'er_ab_grit', name: 'Grit’s Lunge', kind: 'addDie', per: 'rest', uses: 2, die: 4, slots: ['attack'], text: 'Twice per Rest (from Grit): add d4 to an Attack roll.' },
  { id: 'er_ab_trapcraft', name: 'Trapcraft', kind: 'passive', bonus: 2, tags: ['travel', 'lockpick'], text: '+2 to travel and lock checks (from Lio).' },
]

/** Defaults glint to 4 and adds the year's level 3–8 progression (year.ts). */
const hero = (h: Omit<HeroDef, 'glint'> & { glint?: number }): HeroDef => ({ glint: 4, ...h, levels: { ...h.levels, ...YEAR_LEVELS[h.id] } })

const heroes: HeroDef[] = [
  hero({
    id: 'er_tamsin', name: 'Tamsin Reed', title: 'Waystone Keeper’s Apprentice', color: '#d9a15b', weapon: 'Iron lantern-pole',
    blurb: 'Fourteen winters old, Tamsin has trimmed the wicks of the Ember Road’s waystones since she could reach them. Tonight one went out.',
    traits: { str: 0, dex: 1, con: 0, int: 1, wis: 2, cha: 0 }, maxHp: 8, atk: 1, def: 2, dmgDie: 6, glint: 2,
    abilities: ['er_ab_keeperlore', 'er_ab_lanternwatch'], levels: {},
  }),
  hero({
    id: 'er_garrick', name: 'Garrick Vane', title: 'Shieldwright', color: '#c9874a', weapon: 'Forge hammer and tower shield',
    blurb: 'A smith who forged shields for the road wardens until the wardens stopped coming home. Now he carries one himself.',
    traits: { str: 2, dex: -1, con: 2, int: 0, wis: 0, cha: -1 }, maxHp: 14, atk: 2, def: 4, dmgDie: 8,
    abilities: ['er_ab_bulwark', 'er_ab_hammerfall'],
    levels: { 2: { maxHp: 4, atk: 1, traits: { con: 1 }, ability: 'er_ab_unbroken' } },
  }),
  hero({
    id: 'er_ysolde', name: 'Ysolde Marrow', title: 'Frost-Witch', color: '#7fc4e0', weapon: 'Birch staff', glint: 6,
    blurb: 'Raised by the hill-witches who bargain with winter. She knows the Hush better than anyone — she nearly joined it.',
    traits: { str: -1, dex: 0, con: 0, int: 3, wis: 1, cha: 0 }, maxHp: 9, atk: 3, def: 1, dmgDie: 6, pools: { spell: 4 },
    abilities: ['er_ab_hoarlore', 'er_ab_rimelance', 'er_ab_glacialfocus'],
    levels: { 2: { maxHp: 3, def: 1, pools: { spell: 2 }, ability: 'er_ab_thaw' } },
  }),
  hero({
    id: 'er_pell', name: 'Pell Quickfinger', title: 'Gutter Thief', color: '#a78bd0', weapon: 'Hooked dagger', glint: 8,
    blurb: 'Cinderford’s most charming pickpocket volunteered for the muster an hour before the reeve noticed his purse was missing.',
    traits: { str: 0, dex: 3, con: 0, int: 1, wis: -1, cha: 2 }, maxHp: 10, atk: 3, def: 2, dmgDie: 6,
    abilities: ['pickpocket', 'er_ab_lightstep', 'er_ab_slip'],
    levels: { 2: { maxHp: 3, atk: 1, traits: { dex: 1 }, ability: 'er_ab_backstab' } },
  }),
  hero({
    id: 'er_odalys', name: 'Sister Odalys', title: 'Lantern Cleric', color: '#f0d27a', weapon: 'Censer-mace', glint: 5,
    blurb: 'A cleric of the Hearth who tends the shrine-lamps along the road. Gentle, patient, and frighteningly good with a mace.',
    traits: { str: 0, dex: -1, con: 1, int: 1, wis: 3, cha: 1 }, maxHp: 11, atk: 2, def: 3, dmgDie: 6, pools: { spell: 3 },
    abilities: ['er_ab_kindly', 'er_ab_mend', 'er_ab_sunbrand'],
    levels: { 2: { maxHp: 3, pools: { spell: 1 }, ability: 'er_ab_blessing' } },
  }),
  hero({
    id: 'er_kesh', name: 'Kesh of the Nine Winds', title: 'Wandering Monk', color: '#8fd3a8', weapon: 'Bare hands and a walking staff', glint: 3,
    blurb: 'A pilgrim walking every road in the north, one each year. This year the road he chose is going dark.',
    traits: { str: 1, dex: 2, con: 1, int: 0, wis: 2, cha: -1 }, maxHp: 11, atk: 3, def: 3, dmgDie: 6, pools: { chi: 3 },
    abilities: ['er_ab_fleet', 'er_ab_flurry', 'er_ab_stillmind'],
    levels: { 2: { maxHp: 3, pools: { chi: 1 }, ability: 'er_ab_openpalm' } },
  }),
  hero({
    id: 'er_wenna', name: 'Wenna Harrowgate', title: 'Fell Hunter', color: '#9bb86a', weapon: 'Yew longbow',
    blurb: 'She has hunted the fells above the Ember Road for twenty years and has never seen tracks like the ones in the snow this winter.',
    traits: { str: 1, dex: 2, con: 1, int: 0, wis: 2, cha: 0 }, maxHp: 12, atk: 3, def: 2, dmgDie: 8,
    abilities: ['er_ab_trailwise', 'er_ab_calledshot', 'er_ab_volley'],
    levels: { 2: { maxHp: 3, def: 1, ability: 'er_ab_snare' } },
  }),
]

const items: ItemDef[] = [
  { id: 'er_draught', name: 'Hearthwarm Draught', kind: 'heal', die: 6, bonus: 2, price: 5, text: 'Recover d6+2 health. Not usable during combat rounds.' },
  { id: 'er_firepot', name: 'Pitch Firepot', kind: 'slotDie', die: 6, slots: ['damage'], price: 4, text: 'Hurl it: add d6 to a Damage roll.' },
  { id: 'er_tonic', name: 'Bitter Tonic', kind: 'slotDie', die: 4, slots: ['attack'], price: 3, text: 'Add d4 to an Attack roll.' },
  { id: 'er_linen', name: 'Healer’s Linen', kind: 'cure', price: 6, text: 'Bind an old hurt: heals one lingering Injury, Trauma or Wound.' },
  { id: 'er_spicedwine', name: 'Spiced Wine', kind: 'pageBonus', stat: 'cha', amount: 0, die: 6, price: 3, text: '+d6 Charisma for the rest of today.' },
  { id: 'er_oakheart', name: 'Oak-Heart Brew', kind: 'pageBonus', stat: 'str', amount: 0, die: 6, price: 3, text: '+d6 Strength for the rest of today.' },
  { id: 'er_cleareye', name: 'Clear-Eye Drops', kind: 'pageBonus', stat: 'int', amount: 2, price: 2, text: '+2 Intellect for the rest of today.' },
  // Upgrades: passive while carried.
  { id: 'er_whetstone', name: 'Whetted Edge', kind: 'upgrade', bonus: { dmg: 1 }, stackMax: 3, price: 6, text: '+1 to Damage rolls. Stacks up to 3 times.' },
  { id: 'er_temper', name: 'Tempered Grip', kind: 'upgrade', bonus: { atk: 1 }, stackMax: 3, price: 7, text: '+1 Attack. Stacks up to 3 times.' },
  { id: 'er_mule', name: 'Pack Mule', kind: 'upgrade', bonus: { wis: 2 }, tags: ['travel'], stackMax: 1, price: 12, text: '+2 Wisdom on travel checks.' },
  { id: 'er_picks', name: 'Lockpick Roll', kind: 'upgrade', bonus: { roll: 2 }, tags: ['lockpick'], stackMax: 1, price: 5, text: '+2 to lock-picking checks.' },
  // Equipment
  { id: 'er_furcloak', name: 'Wolf-Fur Cloak', kind: 'gear', slot: 'body', bonus: { maxHp: 2 }, price: 10, text: '+2 max health.' },
  { id: 'er_wardhelm', name: 'Road-Warden’s Helm', kind: 'gear', slot: 'head', bonus: { def: 1 }, price: 9, text: '+1 Defense.' },
  { id: 'er_runering', name: 'Ring of the Fourth Light', kind: 'gear', slot: 'trinket', bonus: { atk: 1, wis: 1 }, magical: true, price: 20, text: 'Magical. +1 Attack, +1 Wisdom. Glows near the Hush.' },
]

const enemies: EnemyDef[] = [
  { id: 'er_frosthound', name: 'Frost Hound', ac: 11, toughness: 4, hits: 12, dmg: 2, text: 'A lean grey hound with ice in its fur and no breath in its lungs.' },
  { id: 'er_cultist', name: 'Hush Cultist', ac: 12, toughness: 5, hits: 13, dmg: 3, text: 'Robed in white, lips sewn shut, carrying a snuffer-pole like a spear.' },
  { id: 'er_wisp', name: 'Ice Wisp', ac: 13, toughness: 3, hits: 13, dmg: 2, text: 'A drifting light that leaves frost wherever it passes.' },
  { id: 'er_bandit', name: 'Pine-Road Bandit', ac: 12, toughness: 5, hits: 12, dmg: 2, text: 'Hungry, desperate, and better armed than you’d like.' },
  { id: 'er_warden', name: 'The Hollow Warden', ac: 13, toughness: 6, hits: 15, dmg: 4, text: 'The last road warden, hollowed out by the Hush and set to guard the dark it serves.' },
]

const followers = (m: Omit<MemberDef, 'kind' | 'maxHp' | 'abilities'>): MemberDef => ({ kind: 'critter', maxHp: 1, abilities: [], ...m })

const members: MemberDef[] = [
  followers({ id: 'er_f_ambrose', name: 'Brother Ambrose', fee: 6, follower: { upkeep: 2, grants: ['er_ab_bless'] }, text: 'A hedge-priest who walks the road blessing travelers for a coin and a bowl of soup.' }),
  followers({ id: 'er_f_grit', name: 'Grit', fee: 4, follower: { upkeep: 1, grants: ['er_ab_grit'] }, text: 'A scarred war-dog who has decided you are her person.' }),
  followers({ id: 'er_f_lio', name: 'Lio the Trapper', fee: 7, follower: { upkeep: 2, grants: ['er_ab_trapcraft'] }, text: 'Knows every snare, shortcut and stuck lock between Cinderford and the fells.' }),
]

export const EMBER_ROAD_CONTENT: ContentPack = {
  abilities: [...abilities, ...YEAR_ABILITIES],
  heroes,
  items: [...items, ...YEAR_ITEMS],
  enemies: [...enemies, ...YEAR_ENEMIES],
  members: [...members, ...YEAR_MEMBERS],
}
export const EMBER_ROAD_HEROES = ['er_garrick', 'er_ysolde', 'er_pell', 'er_odalys', 'er_kesh', 'er_wenna']
