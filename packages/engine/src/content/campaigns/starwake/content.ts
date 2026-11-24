// The Starwake — original heroes, abilities, items, enemies and followers for
// a classic-rules sea campaign (Months 1–9; Months 10–13 come later).
import type { AbilityDef, ContentPack, EnemyDef, HeroDef, ItemDef, LevelSpec, MemberDef } from '../../../engine/types'

const abilities: AbilityDef[] = [
  // Greta Holloway (prologue)
  { id: 'sw_ab_chartlore', name: 'Chart Lore', kind: 'passive', bonus: 2, tags: ['lore', 'travel'], text: '+2 to rolls about charts, stars and sea-lanes.' },
  { id: 'sw_ab_oldsalt', name: 'Old Salt', kind: 'heal', per: 'rest', uses: 1, die: 4, bonus: 1, text: 'Once per Rest: a mug of something strong — recover d4+1 health.' },

  // Bram Hollis — Dockside Brawler
  { id: 'sw_ab_haul', name: 'Haul Away', kind: 'passive', bonus: 2, tags: ['physical'], text: '+2 to feats of strength and endurance.' },
  { id: 'sw_ab_haymaker', name: 'Haymaker', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['damage'], text: 'Twice per Rest: add d6 to a Damage roll.' },
  { id: 'sw_ab_secondwind', name: 'Second Wind', kind: 'heal', per: 'rest', uses: 1, die: 6, bonus: 2, text: 'Once per Rest: recover d6+2 health.' },
  { id: 'sw_ab_bellow', name: 'Bosun’s Bellow', kind: 'passive', bonus: 2, tags: ['social'], text: '+2 to commanding, rallying and intimidating.' },
  { id: 'sw_ab_anchorblow', name: 'Anchor Blow', kind: 'addDie', per: 'rest', uses: 1, die: 10, slots: ['damage'], text: 'Once per Rest: add d10 to a Damage roll.' },

  // Isadora Wren — Tide-Witch (Spell points)
  { id: 'sw_ab_tidelore', name: 'Tide Lore', kind: 'passive', bonus: 2, tags: ['lore'], text: '+2 to rolls involving lore, currents and old magic.' },
  { id: 'sw_ab_undertow', name: 'Undertow', kind: 'addDie', per: 'rest', uses: 99, die: 8, slots: ['damage'], cost: { pool: 'spell', amount: 2 }, text: '2 Spell: add d8 to a Damage roll.' },
  { id: 'sw_ab_foresight', name: 'Read the Swell', kind: 'reroll', per: 'page', uses: 1, cost: { pool: 'spell', amount: 1 }, text: 'Once per page, 1 Spell: reroll any d20.' },
  { id: 'sw_ab_seabalm', name: 'Sea Balm', kind: 'heal', per: 'rest', uses: 99, die: 6, bonus: 1, cost: { pool: 'spell', amount: 2 }, text: '2 Spell: recover d6+1 health.' },
  { id: 'sw_ab_kelpwrap', name: 'Kelp Wrap', kind: 'heal', per: 'rest', uses: 99, die: 4, bonus: 3, cost: { pool: 'spell', amount: 1 }, text: '1 Spell: bind wounds in living kelp — recover d4+3 health.' },
  { id: 'sw_ab_maelstrom', name: 'Maelstrom', kind: 'addDie', per: 'rest', uses: 99, die: 12, slots: ['damage'], cost: { pool: 'spell', amount: 3 }, text: '3 Spell: add d12 to a Damage roll.' },

  // Kip Saltfinger — Harbor Rat (uses the shared Pickpocket ability)
  { id: 'sw_ab_quickfingers', name: 'Quick Fingers', kind: 'passive', bonus: 2, tags: ['stealth', 'lockpick'], text: '+2 to sneaking and picking locks.' },
  { id: 'sw_ab_duck', name: 'Duck!', kind: 'reroll', per: 'page', uses: 1, text: 'Once per page: reroll any d20.' },
  { id: 'sw_ab_lowblow', name: 'Low Blow', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['attack', 'damage'], text: 'Twice per Rest: add d6 to an Attack or Damage roll.' },
  { id: 'sw_ab_dirtytrick', name: 'Sand in the Eyes', kind: 'addDie', per: 'page', uses: 1, die: 4, slots: ['attack'], text: 'Once per page: add d4 to an Attack roll.' },
  { id: 'sw_ab_knifework', name: 'Knifework', kind: 'addDie', per: 'rest', uses: 1, die: 10, slots: ['damage'], text: 'Once per Rest: add d10 to a Damage roll.' },

  // Mother Sel — Sea-Chaplain (Spell points)
  { id: 'sw_ab_calmword', name: 'Calm Word', kind: 'passive', bonus: 2, tags: ['social'], text: '+2 to persuading, comforting and bargaining.' },
  { id: 'sw_ab_tidemend', name: 'Tide-Mend', kind: 'heal', per: 'rest', uses: 99, die: 4, bonus: 2, cost: { pool: 'spell', amount: 1 }, text: '1 Spell: recover d4+2 health.' },
  { id: 'sw_ab_dawnbell', name: 'Dawn Bell', kind: 'addDie', per: 'rest', uses: 99, die: 6, slots: ['damage'], cost: { pool: 'spell', amount: 2 }, text: '2 Spell: add d6 to a Damage roll.' },
  { id: 'sw_ab_fairwind', name: 'Fair Wind', kind: 'addDie', per: 'rest', uses: 99, die: 4, slots: ['check', 'attack'], cost: { pool: 'spell', amount: 1 }, text: '1 Spell: add d4 to a check or Attack roll.' },
  { id: 'sw_ab_harborhymn', name: 'Harbor Hymn', kind: 'heal', per: 'rest', uses: 99, die: 8, bonus: 2, cost: { pool: 'spell', amount: 2 }, text: '2 Spell: recover d8+2 health.' },
  { id: 'sw_ab_starsong', name: 'Starsong', kind: 'addDie', per: 'rest', uses: 99, die: 10, slots: ['damage'], cost: { pool: 'spell', amount: 3 }, text: '3 Spell: add d10 to a Damage roll.' },

  // Tanu of the Long Swim — Pearl-Diver (Chi points)
  { id: 'sw_ab_longbreath', name: 'Long Breath', kind: 'passive', bonus: 2, tags: ['physical'], text: '+2 to swimming, climbing and balance.' },
  { id: 'sw_ab_currentstrike', name: 'Current Strike', kind: 'addDie', per: 'rest', uses: 99, die: 4, slots: ['attack'], cost: { pool: 'chi', amount: 1 }, text: '1 Chi: add d4 to an Attack roll.' },
  { id: 'sw_ab_stillwater', name: 'Still Water', kind: 'reroll', per: 'page', uses: 1, cost: { pool: 'chi', amount: 1 }, text: 'Once per page, 1 Chi: reroll any d20.' },
  { id: 'sw_ab_riptide', name: 'Riptide', kind: 'addDie', per: 'rest', uses: 99, die: 8, slots: ['damage'], cost: { pool: 'chi', amount: 2 }, text: '2 Chi: add d8 to a Damage roll.' },
  { id: 'sw_ab_deepbreath', name: 'Deep Breath', kind: 'heal', per: 'rest', uses: 99, die: 6, bonus: 2, cost: { pool: 'chi', amount: 1 }, text: '1 Chi: recover d6+2 health.' },
  { id: 'sw_ab_greatwave', name: 'Great Wave', kind: 'addDie', per: 'rest', uses: 99, die: 10, slots: ['damage'], cost: { pool: 'chi', amount: 3 }, text: '3 Chi: add d10 to a Damage roll.' },

  // Reyna Galt — Harpooner
  { id: 'sw_ab_weatherwise', name: 'Weatherwise', kind: 'passive', bonus: 2, tags: ['travel', 'perception'], text: '+2 to sailing, travel and spotting danger.' },
  { id: 'sw_ab_steadyaim', name: 'Steady Aim', kind: 'reroll', per: 'page', uses: 1, text: 'Once per page: reroll any d20.' },
  { id: 'sw_ab_harpoon', name: 'Harpoon Throw', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['attack', 'damage'], text: 'Twice per Rest: add d6 to an Attack or Damage roll.' },
  { id: 'sw_ab_lashline', name: 'Lash Line', kind: 'addDie', per: 'page', uses: 1, die: 4, slots: ['check'], text: 'Once per page: add d4 to a non-combat check.' },
  { id: 'sw_ab_patchup', name: 'Patch Up', kind: 'heal', per: 'rest', uses: 1, die: 6, bonus: 2, text: 'Once per Rest: stitch yourself up — recover d6+2 health.' },
  { id: 'sw_ab_whaleshot', name: 'Whale-Shot', kind: 'addDie', per: 'rest', uses: 1, die: 10, slots: ['damage'], text: 'Once per Rest: add d10 to a Damage roll.' },

  // Lent by followers
  { id: 'sw_ab_mouser', name: 'Biscuit’s Nose', kind: 'passive', bonus: 2, tags: ['perception'], text: '+2 to spotting danger (from Biscuit).' },
  { id: 'sw_ab_hotmeal', name: 'Hot Meal', kind: 'heal', per: 'rest', uses: 1, die: 4, bonus: 1, text: 'Once per Rest (from Fenwick): recover d4+1 health.' },
  { id: 'sw_ab_pickswing', name: 'Pick Swing', kind: 'addDie', per: 'rest', uses: 2, die: 4, slots: ['attack'], text: 'Twice per Rest (from Jory): add d4 to an Attack roll.' },
  { id: 'sw_ab_otterpilot', name: 'Otter Pilot', kind: 'passive', bonus: 2, tags: ['travel'], text: '+2 to travel and sailing checks (from Tully).' },
  { id: 'sw_ab_divelore', name: 'Diver’s Notes', kind: 'passive', bonus: 2, tags: ['lore'], text: '+2 to lore checks (from Vessa).' },
  { id: 'sw_ab_springtrap', name: 'Spring-Loaded', kind: 'addDie', per: 'rest', uses: 1, die: 6, slots: ['damage'], text: 'Once per Rest (from Aunt Calibra): add d6 to a Damage roll.' },
]

/** Levels 2–6 (Months 1–9). Months 10–13 will add 7+. */
const LEVELS: Record<string, Record<number, LevelSpec>> = {
  sw_bram: {
    2: { maxHp: 4, atk: 1, traits: { con: 1 }, ability: 'sw_ab_secondwind' },
    3: { maxHp: 4, def: 1 },
    4: { maxHp: 4, traits: { str: 1 }, ability: 'sw_ab_bellow' },
    5: { maxHp: 4, atk: 1, dmgDie: 10 },
    6: { maxHp: 4, def: 1, ability: 'sw_ab_anchorblow' },
  },
  sw_isadora: {
    2: { maxHp: 3, def: 1, pools: { spell: 2 }, ability: 'sw_ab_seabalm' },
    3: { maxHp: 3, pools: { spell: 1 } },
    4: { maxHp: 3, traits: { int: 1 }, ability: 'sw_ab_kelpwrap' },
    5: { maxHp: 3, atk: 1, dmgDie: 8, pools: { spell: 1 } },
    6: { maxHp: 3, def: 1, pools: { spell: 2 }, ability: 'sw_ab_maelstrom' },
  },
  sw_kip: {
    2: { maxHp: 3, atk: 1, traits: { dex: 1 }, ability: 'sw_ab_lowblow' },
    3: { maxHp: 3, def: 1 },
    4: { maxHp: 3, traits: { cha: 1 }, ability: 'sw_ab_dirtytrick' },
    5: { maxHp: 3, atk: 1, dmgDie: 8 },
    6: { maxHp: 3, def: 1, ability: 'sw_ab_knifework' },
  },
  sw_sel: {
    2: { maxHp: 3, pools: { spell: 1 }, ability: 'sw_ab_fairwind' },
    3: { maxHp: 3, pools: { spell: 1 } },
    4: { maxHp: 3, traits: { wis: 1 }, ability: 'sw_ab_harborhymn' },
    5: { maxHp: 4, atk: 1, dmgDie: 8, pools: { spell: 1 } },
    6: { maxHp: 3, def: 1, pools: { spell: 2 }, ability: 'sw_ab_starsong' },
  },
  sw_tanu: {
    2: { maxHp: 3, pools: { chi: 1 }, ability: 'sw_ab_riptide' },
    3: { maxHp: 3, pools: { chi: 1 } },
    4: { maxHp: 3, traits: { dex: 1 }, ability: 'sw_ab_deepbreath' },
    5: { maxHp: 4, atk: 1, dmgDie: 8, pools: { chi: 1 } },
    6: { maxHp: 3, def: 1, pools: { chi: 2 }, ability: 'sw_ab_greatwave' },
  },
  sw_reyna: {
    2: { maxHp: 3, def: 1, ability: 'sw_ab_lashline' },
    3: { maxHp: 3, atk: 1 },
    4: { maxHp: 3, traits: { wis: 1 }, ability: 'sw_ab_patchup' },
    5: { maxHp: 4, def: 1, dmgDie: 10 },
    6: { maxHp: 3, atk: 1, ability: 'sw_ab_whaleshot' },
  },
}

const hero = (h: Omit<HeroDef, 'glint' | 'levels'> & { glint?: number }): HeroDef => ({ glint: 4, ...h, levels: LEVELS[h.id] ?? {} })

const heroes: HeroDef[] = [
  hero({
    id: 'sw_greta', name: 'Greta Holloway', title: 'Retired Chart-Maker', color: '#c9a86a', weapon: 'Brass-tipped walking cane', glint: 3,
    blurb: 'Forty years drawing the Saltreach’s charts, one good eye, and a sloop she swore she’d never sail again. Tonight the stars she drew are moving.',
    traits: { str: -1, dex: 0, con: 0, int: 2, wis: 2, cha: 1 }, maxHp: 8, atk: 1, def: 2, dmgDie: 6,
    abilities: ['sw_ab_chartlore', 'sw_ab_oldsalt'],
  }),
  hero({
    id: 'sw_bram', name: 'Bram Hollis', title: 'Dockside Brawler', color: '#c47a4a', weapon: 'Belaying pin and bare fists',
    blurb: 'A stevedore who has lifted every crate on Saltmere Quay twice. His ship went down when the stars slipped; he swam home angry.',
    traits: { str: 2, dex: 0, con: 2, int: -1, wis: 0, cha: 0 }, maxHp: 14, atk: 2, def: 4, dmgDie: 8,
    abilities: ['sw_ab_haul', 'sw_ab_haymaker'],
  }),
  hero({
    id: 'sw_isadora', name: 'Isadora Wren', title: 'Tide-Witch', color: '#6fc3c9', weapon: 'Driftwood wand', glint: 6,
    blurb: 'She learned magic from the tide-pools and the moon. Since Wend fell, the tides have been answering her strangely.',
    traits: { str: -1, dex: 0, con: 0, int: 3, wis: 1, cha: 0 }, maxHp: 9, atk: 3, def: 1, dmgDie: 6, pools: { spell: 4 },
    abilities: ['sw_ab_tidelore', 'sw_ab_undertow', 'sw_ab_foresight'],
  }),
  hero({
    id: 'sw_kip', name: 'Kip Saltfinger', title: 'Harbor Rat', color: '#a98bd0', weapon: 'Gutting knife', glint: 8,
    blurb: 'Kip grew up under the piers and knows every loose plank on the quay. Signing on with a chart-maker beats being caught by the harbor watch.',
    traits: { str: 0, dex: 3, con: 0, int: 1, wis: -1, cha: 2 }, maxHp: 10, atk: 3, def: 2, dmgDie: 6,
    abilities: ['pickpocket', 'sw_ab_quickfingers', 'sw_ab_duck'],
  }),
  hero({
    id: 'sw_sel', name: 'Mother Sel', title: 'Sea-Chaplain', color: '#e8cf86', weapon: 'Bronze ship’s bell on a chain', glint: 5,
    blurb: 'She blesses boats before they leave and rings the bell for those who don’t come back. This year she has rung it too often.',
    traits: { str: 0, dex: -1, con: 1, int: 1, wis: 3, cha: 1 }, maxHp: 11, atk: 2, def: 3, dmgDie: 6, pools: { spell: 3 },
    abilities: ['sw_ab_calmword', 'sw_ab_tidemend', 'sw_ab_dawnbell'],
  }),
  hero({
    id: 'sw_tanu', name: 'Tanu of the Long Swim', title: 'Pearl-Diver', color: '#7fd0a6', weapon: 'Bare hands and a diving knife', glint: 3,
    blurb: 'Tanu can hold a breath longer than most people can hold a grudge. The pearl beds went dark the night Wend fell.',
    traits: { str: 1, dex: 2, con: 1, int: 0, wis: 2, cha: -1 }, maxHp: 11, atk: 3, def: 3, dmgDie: 6, pools: { chi: 3 },
    abilities: ['sw_ab_longbreath', 'sw_ab_currentstrike', 'sw_ab_stillwater'],
  }),
  hero({
    id: 'sw_reyna', name: 'Reyna Galt', title: 'Harpooner', color: '#9bb86a', weapon: 'Barbed harpoon on a line',
    blurb: 'Twenty years on whaling decks taught her to read weather, waves and people. All three have gone strange.',
    traits: { str: 1, dex: 2, con: 1, int: 0, wis: 2, cha: 0 }, maxHp: 12, atk: 3, def: 2, dmgDie: 8,
    abilities: ['sw_ab_weatherwise', 'sw_ab_steadyaim', 'sw_ab_harpoon'],
  }),
]

const items: ItemDef[] = [
  { id: 'sw_kelptea', name: 'Kelp Tea', kind: 'heal', die: 6, bonus: 2, price: 5, text: 'Recover d6+2 health. Not usable during combat rounds.' },
  { id: 'sw_pearltonic', name: 'Pearl Tonic', kind: 'heal', die: 10, bonus: 3, price: 10, text: 'Recover d10+3 health. Not usable during combat rounds.' },
  { id: 'sw_powder', name: 'Powder Flask', kind: 'slotDie', die: 6, slots: ['damage'], price: 4, text: 'Light it and throw: add d6 to a Damage roll.' },
  { id: 'sw_keg', name: 'Blasting Keg', kind: 'slotDie', die: 10, slots: ['damage'], price: 9, text: 'Add d10 to a Damage roll.' },
  { id: 'sw_rum', name: 'Bosun’s Rum', kind: 'slotDie', die: 4, slots: ['attack'], price: 3, text: 'Add d4 to an Attack roll.' },
  { id: 'sw_sharkoil', name: 'Shark-Liver Oil', kind: 'slotDie', die: 6, slots: ['attack'], price: 6, text: 'Add d6 to an Attack roll.' },
  { id: 'sw_bandage', name: 'Sailcloth Bandage', kind: 'cure', price: 6, text: 'Bind an old hurt: heals one lingering Injury, Trauma or Wound.' },
  { id: 'sw_coralsalve', name: 'Coral Salve', kind: 'cure', price: 9, text: 'Draws out an old hurt: heals one lingering Injury, Trauma or Wound.' },
  { id: 'sw_honeybun', name: 'Harbor Honeybun', kind: 'pageBonus', stat: 'cha', amount: 0, die: 6, price: 3, text: '+d6 Charisma for the rest of today.' },
  { id: 'sw_saltpork', name: 'Salt Pork', kind: 'pageBonus', stat: 'str', amount: 0, die: 6, price: 3, text: '+d6 Strength for the rest of today.' },
  { id: 'sw_coffee', name: 'Black Galley Coffee', kind: 'pageBonus', stat: 'wis', amount: 0, die: 6, price: 4, text: '+d6 Wisdom for the rest of today.' },
  { id: 'sw_limes', name: 'Bag of Limes', kind: 'pageBonus', stat: 'dex', amount: 0, die: 6, price: 4, text: '+d6 Dexterity for the rest of today.' },
  { id: 'sw_stardrops', name: 'Starlight Drops', kind: 'pageBonus', stat: 'int', amount: 2, price: 2, text: '+2 Intellect for the rest of today.' },
  // Upgrades: passive while carried.
  { id: 'sw_hone', name: 'Honed Edge', kind: 'upgrade', bonus: { dmg: 1 }, stackMax: 3, price: 6, text: '+1 to Damage rolls. Stacks up to 3 times.' },
  { id: 'sw_tarredgrip', name: 'Tarred Grip', kind: 'upgrade', bonus: { atk: 1 }, stackMax: 3, price: 7, text: '+1 Attack. Stacks up to 3 times.' },
  { id: 'sw_spyglass', name: 'Brass Spyglass', kind: 'upgrade', bonus: { wis: 2 }, tags: ['travel'], stackMax: 1, price: 12, text: '+2 Wisdom on travel and sailing checks.' },
  { id: 'sw_picks', name: 'Oilskin Lockpicks', kind: 'upgrade', bonus: { roll: 2 }, tags: ['lockpick'], stackMax: 1, price: 5, text: '+2 to lock-picking checks.' },
  { id: 'sw_galekite', name: 'Gale Kite', kind: 'upgrade', bonus: { roll: 2 }, tags: ['physical'], stackMax: 1, price: 16, text: 'A folding hermit’s kite. +2 on climbing, leaping and other physical checks.' },
  { id: 'sw_divingbell', name: 'Diving Bell', kind: 'upgrade', bonus: { wis: 3 }, tags: ['travel'], stackMax: 1, price: 24, text: 'Brass bell rigged under the Second Chance. +3 Wisdom on travel checks.' },
  { id: 'sw_staretch', name: 'Star-Etched Edge', kind: 'upgrade', bonus: { dmg: 1 }, stackMax: 2, price: 14, text: 'A blade etched with Wend’s light. +1 to Damage rolls. Stacks up to 2 times.' },
  // Equipment
  { id: 'sw_tricorn', name: 'Oiled Tricorn', kind: 'gear', slot: 'head', bonus: { def: 1 }, price: 9, text: '+1 Defense.' },
  { id: 'sw_peacoat', name: 'Wool Peacoat', kind: 'gear', slot: 'body', bonus: { maxHp: 2 }, price: 10, text: '+2 max health.' },
  { id: 'sw_deckboots', name: 'Grip-Soled Deck Boots', kind: 'gear', slot: 'feet', bonus: { dex: 1 }, price: 12, text: '+1 Dexterity.' },
  { id: 'sw_sextant', name: 'Starwell Sextant', kind: 'gear', slot: 'trinket', bonus: { atk: 1, wis: 1 }, magical: true, price: 20, text: 'Magical. +1 Attack, +1 Wisdom. Hums when a shard of Wend is near.' },
  { id: 'sw_saltcoat', name: 'Saltcured Coat', kind: 'gear', slot: 'body', bonus: { maxHp: 3, con: 1 }, magical: true, price: 18, text: 'Magical. +3 max health, +1 Constitution. Salt-white and stiff as armor.' },
  { id: 'sw_ferrypole', name: 'Ferryman’s Pole', kind: 'gear', slot: 'hands', bonus: { atk: 1, wis: 1 }, magical: true, price: 16, text: 'Magical. +1 Attack, +1 Wisdom. It always finds the bottom.' },
  { id: 'sw_admiralcoat', name: 'Admiral Sund’s Coat', kind: 'gear', slot: 'body', bonus: { maxHp: 4, def: 1 }, magical: true, price: 30, text: 'Magical. +4 max health, +1 Defense. Still damp after a hundred years.' },
  { id: 'sw_stormblade', name: 'Stormglass Blade', kind: 'gear', slot: 'hands', bonus: { atk: 2 }, magical: true, price: 32, text: 'Magical. +2 Attack. Lightning sleeps in the glass.' },
  { id: 'sw_lens', name: 'Astronomer’s Lens', kind: 'gear', slot: 'head', bonus: { def: 1, int: 2 }, magical: true, price: 28, text: 'Magical. +1 Defense, +2 Intellect.' },
  { id: 'sw_keepersextant', name: 'The Keeper’s Sextant', kind: 'gear', slot: 'trinket', bonus: { atk: 2, wis: 2 }, magical: true, price: 40, text: 'Magical. +2 Attack, +2 Wisdom. The Starwell Sextant, rebuilt with the true Night Chart inside.' },
]

/** ac = Attack to hit · toughness = Damage to defeat · hits = its attack vs your 10 + Defense · dmg = damage. */
const enemies: EnemyDef[] = [
  // Month 1
  { id: 'sw_pressganger', name: 'Press-Ganger', ac: 11, toughness: 4, hits: 12, dmg: 2, text: 'One of Ashe Calloway’s recruiters: a cudgel, a sack and a cheerful smile.' },
  { id: 'sw_reefcrab', name: 'Reef Crab', ac: 10, toughness: 3, hits: 11, dmg: 1, text: 'A crab as big as a barrel lid, and twice as bad-tempered.' },
  { id: 'sw_gulls', name: 'Gull Swarm', ac: 12, toughness: 2, hits: 12, dmg: 1, text: 'Gulls gone mad since the stars moved. They dive at anything that shines.' },
  { id: 'sw_drowned', name: 'Drowned Stargazer', ac: 11, toughness: 4, hits: 12, dmg: 2, text: 'An astronomer who stayed at his post when the observatory flooded. He is still there.' },
  { id: 'sw_tidewarden', name: 'The Tidewarden', ac: 12, toughness: 4, hits: 13, dmg: 2, text: 'A brass guardian of the drowned dome, barnacled to the eyes and still following orders.' },
  // Month 2
  { id: 'sw_overseer', name: 'Gull’s Teeth Overseer', ac: 11, toughness: 5, hits: 13, dmg: 2, text: 'A whip, a ledger, and a bad habit of using both.' },
  { id: 'sw_saltwalker', name: 'Salt-Walker', ac: 12, toughness: 5, hits: 13, dmg: 2, text: 'A statue of living salt, made from whatever the shard touched.' },
  { id: 'sw_brinejelly', name: 'Brine Jelly', ac: 11, toughness: 3, hits: 13, dmg: 2, text: 'A drifting jelly from the geyser pools. Its sting burns like pickling.' },
  { id: 'sw_dredge', name: 'The Brine Foreman’s Dredge', ac: 13, toughness: 4, hits: 14, dmg: 2, text: 'A steam dredge with iron jaws, driven by the Foreman from a cage on its back.' },
  // Month 3
  { id: 'sw_fledgling', name: 'Roc Fledgling', ac: 12, toughness: 5, hits: 14, dmg: 2, text: 'A baby roc the size of a cart, and very hungry.' },
  { id: 'sw_hermit', name: 'Mad Kite-Hermit', ac: 12, toughness: 4, hits: 14, dmg: 2, text: 'A hermit who has lived alone with the wind too long and thinks you are stealing his sky.' },
  { id: 'sw_gremlin', name: 'Rust Gremlin', ac: 13, toughness: 4, hits: 14, dmg: 2, text: 'A small grey thing that eats chain-links and fingers.' },
  { id: 'sw_corsair', name: 'Gull’s Teeth Corsair', ac: 12, toughness: 5, hits: 14, dmg: 3, text: 'A privateer in Ashe’s gold-and-grey, cutlass out.' },
  { id: 'sw_rocmother', name: 'The Storm Roc Matriarch', ac: 14, toughness: 6, hits: 15, dmg: 3, text: 'Wings as wide as a sail and feathers that crackle with static. The shard is in her nest.' },
  // Month 4
  { id: 'sw_watercopy', name: 'Water-Copy', ac: 13, toughness: 5, hits: 14, dmg: 3, text: 'Someone you know, stepped out of a puddle. Its eyes are a little too still.' },
  { id: 'sw_gator', name: 'Marsh Gator', ac: 12, toughness: 6, hits: 14, dmg: 3, text: 'A gator that has learned how to lie still and look like a log.' },
  { id: 'sw_stingers', name: 'Stinger Swarm', ac: 13, toughness: 3, hits: 14, dmg: 2, text: 'Marsh-flies with needle tails.' },
  { id: 'sw_reflection', name: 'Your Reflection', ac: 14, toughness: 8, hits: 16, dmg: 4, text: 'You, from the water: every scar, every trick, and none of your doubts.' },
  // Month 5
  { id: 'sw_becalmed', name: 'Becalmed Sailor', ac: 14, toughness: 6, hits: 15, dmg: 3, text: 'A sailor who has waited for wind for a hundred years, and is tired of waiting.' },
  { id: 'sw_wreckwraith', name: 'Wreck-Wraith', ac: 15, toughness: 5, hits: 15, dmg: 3, text: 'A cold shape that lives in the dark of a hold.' },
  { id: 'sw_deadmarine', name: 'Drowned Marine', ac: 15, toughness: 7, hits: 15, dmg: 4, text: 'Still in uniform, still loyal to the Admiral.' },
  { id: 'sw_veyra', name: 'Admiral Veyra Sund', ac: 16, toughness: 9, hits: 17, dmg: 4, text: 'The Becalmed. Her flagship sank a century ago and she has held the Glass Calm still ever since.' },
  // Month 6
  { id: 'sw_lanternjaw', name: 'Lantern-Jaw', ac: 15, toughness: 5, hits: 15, dmg: 3, text: 'A deep fish with a light on a stalk and a mouth like a trap.' },
  { id: 'sw_abysscrab', name: 'Abyssal Crab', ac: 15, toughness: 8, hits: 16, dmg: 4, text: 'Pale, blind and enormous. It has never needed to see.' },
  { id: 'sw_inkwraith', name: 'Ink Wraith', ac: 16, toughness: 6, hits: 16, dmg: 3, text: 'A cloud of ink with arms in it.' },
  { id: 'sw_deepmaw', name: 'The Deepmaw', ac: 16, toughness: 10, hits: 18, dmg: 5, text: 'An eel the length of a harbor, woken by Wend’s fall. It has never seen light and hates it.' },
  // Month 7
  { id: 'sw_petrel', name: 'Storm Petrel Spirit', ac: 16, toughness: 5, hits: 16, dmg: 4, text: 'A bird made of spray and spite.' },
  { id: 'sw_ironmarine', name: 'Ironclad Marine', ac: 16, toughness: 8, hits: 16, dmg: 4, text: 'One of Ashe’s boarding marines, in a steel breastplate that would sink anyone else.' },
  { id: 'sw_teague', name: 'Bosun Harrow Teague', ac: 16, toughness: 9, hits: 17, dmg: 4, text: 'Ashe’s enforcer: a slab of a man with a boarding axe and a long memory.' },
  // Month 8
  { id: 'sw_clockwarden', name: 'Clockwork Warden', ac: 16, toughness: 8, hits: 16, dmg: 5, text: 'An astronomer’s guard, all brass and ticking.' },
  { id: 'sw_raider', name: 'Gull’s Teeth Raider', ac: 16, toughness: 7, hits: 16, dmg: 5, text: 'A torch in one hand and a cutlass in the other.' },
  { id: 'sw_gearhound', name: 'Gear-Hound', ac: 17, toughness: 6, hits: 17, dmg: 5, text: 'A clockwork hound with a key in its back and no off-switch.' },
  { id: 'sw_orrery', name: 'The Runaway Orrery', ac: 17, toughness: 12, hits: 18, dmg: 6, text: 'The Orrery’s great gears, cut loose by sabotage and grinding toward the archive.' },
  // Month 9
  { id: 'sw_giltmarine', name: 'Gilt Marine', ac: 17, toughness: 8, hits: 17, dmg: 5, text: 'An elite of the flagship’s crew, gold buttons and cold eyes.' },
  { id: 'sw_boarder', name: 'Corsair Boarder', ac: 16, toughness: 8, hits: 17, dmg: 5, text: 'Swinging across on a line with a knife in their teeth.' },
  { id: 'sw_needlelight', name: 'Needle-Light', ac: 17, toughness: 7, hits: 17, dmg: 5, text: 'A splinter of stolen starlight from the Hollow Needle, sharp enough to cut.' },
  { id: 'sw_giltgull', name: 'The Gilt Gull', ac: 19, toughness: 13, hits: 20, dmg: 7, text: 'Ashe Calloway’s flagship, and Ashe himself at the rail with a smile and a rapier.' },
]

const follower = (m: Omit<MemberDef, 'kind' | 'maxHp' | 'abilities'>): MemberDef => ({ kind: 'critter', maxHp: 1, abilities: [], ...m })

const members: MemberDef[] = [
  follower({ id: 'sw_f_biscuit', name: 'Biscuit', fee: 4, follower: { upkeep: 1, grants: ['sw_ab_mouser'] }, text: 'The Second Chance’s cat. She hisses at trouble before anyone else sees it.' }),
  follower({ id: 'sw_f_fenwick', name: 'Old Fenwick', fee: 6, follower: { upkeep: 2, grants: ['sw_ab_hotmeal'] }, text: 'A one-legged galley cook who can make soup from a boot.' }),
  follower({ id: 'sw_f_jory', name: 'Jory', fee: 8, follower: { upkeep: 2, grants: ['sw_ab_pickswing'] }, text: 'A digger you freed from the salt mines. He still carries his pick.' }),
  follower({ id: 'sw_f_tully', name: 'Mossy Tully', fee: 10, follower: { upkeep: 2, grants: ['sw_ab_otterpilot'] }, text: 'An otter-folk ferryman who knows every channel in the marsh, and several that aren’t.' }),
  follower({ id: 'sw_f_vessa', name: 'Vessa Quill', fee: 14, follower: { upkeep: 3, grants: ['sw_ab_divelore'] }, text: 'A diver-scholar who used to work for Ashe. She knows what he plans, and wants it stopped.' }),
  follower({ id: 'sw_f_calibra', name: 'Aunt Calibra', fee: 16, follower: { upkeep: 4, grants: ['sw_ab_springtrap'] }, text: 'The Orrery’s oldest clockmaker, who builds traps for fun.' }),
]

export const STARWAKE_CONTENT: ContentPack = { abilities, heroes, items, enemies, members }
export const STARWAKE_HEROES = ['sw_bram', 'sw_isadora', 'sw_kip', 'sw_sel', 'sw_tanu', 'sw_reyna']
