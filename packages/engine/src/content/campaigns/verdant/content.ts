// The Verdant Accord — original heroes, abilities, items, enemies, followers
// and legacy marks for a classic-rules forest campaign (Chapters 1–4 of 12).
import type { AbilityDef, ContentPack, EnemyDef, HeroDef, ItemDef, LegacyDef, LevelSpec, MemberDef } from '../../../engine/types'

const abilities: AbilityDef[] = [
  // Agathe Rook (prologue)
  { id: 'va_ab_roadwise', name: 'Roadwise', kind: 'passive', bonus: 2, tags: ['travel', 'lore'], text: '+2 to rolls about roads, weather and wagons.' },
  { id: 'va_ab_teamster', name: 'Teamster’s Grit', kind: 'heal', per: 'rest', uses: 1, die: 4, bonus: 1, text: 'Once per Rest: grit your teeth and keep driving — recover d4+1 health.' },

  // Brannoc Tull — Wagon Guard
  { id: 'va_ab_shoulder', name: 'Shoulder to the Wheel', kind: 'passive', bonus: 2, tags: ['physical'], text: '+2 to feats of strength and endurance.' },
  { id: 'va_ab_cleave', name: 'Cleave', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['damage'], text: 'Twice per Rest: add d6 to a Damage roll.' },
  { id: 'va_ab_standfast', name: 'Stand Fast', kind: 'heal', per: 'rest', uses: 1, die: 6, bonus: 2, text: 'Once per Rest: recover d6+2 health.' },
  { id: 'va_ab_roar', name: 'Caravan Roar', kind: 'passive', bonus: 2, tags: ['social'], text: '+2 to rallying, commanding and intimidating.' },

  // Sorrel Vey — Hedge-Witch (Spell points)
  { id: 'va_ab_herblore', name: 'Herb Lore', kind: 'passive', bonus: 2, tags: ['lore'], text: '+2 to rolls about plants, poisons and old magic.' },
  { id: 'va_ab_thornlash', name: 'Thornlash', kind: 'addDie', per: 'rest', uses: 99, die: 8, slots: ['damage'], cost: { pool: 'spell', amount: 2 }, text: '2 Spell: add d8 to a Damage roll.' },
  { id: 'va_ab_hedgesight', name: 'Hedge-Sight', kind: 'reroll', per: 'page', uses: 1, cost: { pool: 'spell', amount: 1 }, text: 'Once per page, 1 Spell: reroll any d20.' },
  { id: 'va_ab_poultice', name: 'Green Poultice', kind: 'heal', per: 'rest', uses: 99, die: 6, bonus: 1, cost: { pool: 'spell', amount: 2 }, text: '2 Spell: recover d6+1 health.' },
  { id: 'va_ab_bramblewall', name: 'Bramble Wall', kind: 'addDie', per: 'rest', uses: 99, die: 4, slots: ['check', 'attack'], cost: { pool: 'spell', amount: 1 }, text: '1 Spell: thorns snag your foe or steady your footing — add d4 to a check or Attack roll.' },

  // Pip Larkspur — Road Urchin (uses the shared Pickpocket ability)
  { id: 'va_ab_lightstep', name: 'Light Step', kind: 'passive', bonus: 2, tags: ['stealth', 'lockpick'], text: '+2 to sneaking and picking locks.' },
  { id: 'va_ab_scarper', name: 'Scarper!', kind: 'reroll', per: 'page', uses: 1, text: 'Once per page: reroll any d20.' },
  { id: 'va_ab_sling', name: 'Sling Stone', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['attack', 'damage'], text: 'Twice per Rest: add d6 to an Attack or Damage roll.' },
  { id: 'va_ab_patter', name: 'Market Patter', kind: 'passive', bonus: 2, tags: ['social'], text: '+2 to haggling, fibbing and charming.' },

  // Brother Aldous Fenn — Wayside Friar (Spell points)
  { id: 'va_ab_kindword', name: 'Kind Word', kind: 'passive', bonus: 2, tags: ['social'], text: '+2 to persuading, comforting and bargaining.' },
  { id: 'va_ab_mend', name: 'Wayside Mending', kind: 'heal', per: 'rest', uses: 99, die: 4, bonus: 2, cost: { pool: 'spell', amount: 1 }, text: '1 Spell: recover d4+2 health.' },
  { id: 'va_ab_sunblessing', name: 'Sun Blessing', kind: 'addDie', per: 'rest', uses: 99, die: 6, slots: ['damage'], cost: { pool: 'spell', amount: 2 }, text: '2 Spell: add d6 to a Damage roll.' },
  { id: 'va_ab_hearthhymn', name: 'Hearth Hymn', kind: 'heal', per: 'rest', uses: 99, die: 8, bonus: 2, cost: { pool: 'spell', amount: 2 }, text: '2 Spell: recover d8+2 health.' },
  { id: 'va_ab_steadyhand', name: 'Steady Hand', kind: 'addDie', per: 'rest', uses: 99, die: 4, slots: ['check', 'attack'], cost: { pool: 'spell', amount: 1 }, text: '1 Spell: add d4 to a check or Attack roll.' },

  // Kestrel Moss — Fernreach Ranger
  { id: 'va_ab_tracker', name: 'Tracker', kind: 'passive', bonus: 2, tags: ['travel', 'perception'], text: '+2 to tracking, travel and spotting danger.' },
  { id: 'va_ab_drawbreath', name: 'Draw and Breathe', kind: 'reroll', per: 'page', uses: 1, text: 'Once per page: reroll any d20.' },
  { id: 'va_ab_twinshot', name: 'Twin Shot', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['attack', 'damage'], text: 'Twice per Rest: add d6 to an Attack or Damage roll.' },
  { id: 'va_ab_heartshot', name: 'Heart Shot', kind: 'addDie', per: 'rest', uses: 1, die: 10, slots: ['damage'], text: 'Once per Rest: add d10 to a Damage roll.' },
  { id: 'va_ab_fieldcraft', name: 'Fieldcraft', kind: 'heal', per: 'rest', uses: 1, die: 6, bonus: 2, text: 'Once per Rest: dress your own wounds — recover d6+2 health.' },

  // Odo Brindle — Wandering Monk (Chi points)
  { id: 'va_ab_stillroot', name: 'Still as Roots', kind: 'passive', bonus: 2, tags: ['physical'], text: '+2 to climbing, balance and endurance.' },
  { id: 'va_ab_palm', name: 'Open Palm', kind: 'addDie', per: 'rest', uses: 99, die: 4, slots: ['attack'], cost: { pool: 'chi', amount: 1 }, text: '1 Chi: add d4 to an Attack roll.' },
  { id: 'va_ab_breath', name: 'Forest Breath', kind: 'reroll', per: 'page', uses: 1, cost: { pool: 'chi', amount: 1 }, text: 'Once per page, 1 Chi: reroll any d20.' },
  { id: 'va_ab_oakfist', name: 'Oak Fist', kind: 'addDie', per: 'rest', uses: 99, die: 8, slots: ['damage'], cost: { pool: 'chi', amount: 2 }, text: '2 Chi: add d8 to a Damage roll.' },
  { id: 'va_ab_innerspring', name: 'Inner Spring', kind: 'heal', per: 'rest', uses: 99, die: 6, bonus: 2, cost: { pool: 'chi', amount: 1 }, text: '1 Chi: recover d6+2 health.' },

  // Lent by followers
  { id: 'va_ab_burrnose', name: 'Burr’s Nose', kind: 'passive', bonus: 2, tags: ['perception'], text: '+2 to spotting danger (from Burr).' },
  { id: 'va_ab_turnip', name: 'Turnip’s Back', kind: 'passive', bonus: 2, tags: ['travel'], text: '+2 to travel checks (from Turnip).' },
  { id: 'va_ab_minnow', name: 'Minnow’s Shortcuts', kind: 'passive', bonus: 2, tags: ['stealth'], text: '+2 to sneaking (from Minnow).' },
  { id: 'va_ab_sedge', name: 'Lamplighter’s Lore', kind: 'passive', bonus: 2, tags: ['lore'], text: '+2 to lore checks (from Old Sedge).' },
  { id: 'va_ab_juggle', name: 'Thrown Clubs', kind: 'addDie', per: 'rest', uses: 2, die: 4, slots: ['attack'], text: 'Twice per Rest (from Fennick): add d4 to an Attack roll.' },
]

/** Levels 2–5 (Chapters 1–4: one level per chapter). Later chapters add 6+. */
const LEVELS: Record<string, Record<number, LevelSpec>> = {
  va_brannoc: {
    2: { maxHp: 4, atk: 1, traits: { con: 1 }, ability: 'va_ab_standfast' },
    3: { maxHp: 4, def: 1 },
    4: { maxHp: 4, traits: { str: 1 }, ability: 'va_ab_roar' },
    5: { maxHp: 4, atk: 1, dmgDie: 10 },
  },
  va_sorrel: {
    2: { maxHp: 3, def: 1, pools: { spell: 2 }, ability: 'va_ab_poultice' },
    3: { maxHp: 3, pools: { spell: 1 } },
    4: { maxHp: 3, traits: { wis: 1 }, ability: 'va_ab_bramblewall' },
    5: { maxHp: 3, atk: 1, dmgDie: 8, pools: { spell: 1 } },
  },
  va_pip: {
    2: { maxHp: 3, atk: 1, traits: { dex: 1 }, ability: 'va_ab_sling' },
    3: { maxHp: 3, def: 1 },
    4: { maxHp: 3, traits: { cha: 1 }, ability: 'va_ab_patter' },
    5: { maxHp: 3, atk: 1, dmgDie: 8 },
  },
  va_aldous: {
    2: { maxHp: 3, pools: { spell: 1 }, ability: 'va_ab_steadyhand' },
    3: { maxHp: 3, pools: { spell: 1 } },
    4: { maxHp: 3, traits: { wis: 1 }, ability: 'va_ab_hearthhymn' },
    5: { maxHp: 4, atk: 1, dmgDie: 8, pools: { spell: 1 } },
  },
  va_kestrel: {
    2: { maxHp: 3, def: 1, ability: 'va_ab_fieldcraft' },
    3: { maxHp: 3, atk: 1 },
    4: { maxHp: 3, traits: { wis: 1 }, ability: 'va_ab_heartshot' },
    5: { maxHp: 4, def: 1, dmgDie: 10 },
  },
  va_odo: {
    2: { maxHp: 3, pools: { chi: 1 }, ability: 'va_ab_oakfist' },
    3: { maxHp: 3, pools: { chi: 1 } },
    4: { maxHp: 3, traits: { dex: 1 }, ability: 'va_ab_innerspring' },
    5: { maxHp: 4, atk: 1, dmgDie: 8, pools: { chi: 1 } },
  },
}

const hero = (h: Omit<HeroDef, 'glint' | 'levels'> & { glint?: number }): HeroDef => ({ glint: 4, ...h, levels: LEVELS[h.id] ?? {} })

const heroes: HeroDef[] = [
  hero({
    id: 'va_agathe', name: 'Agathe Rook', title: 'Wagon-Mistress', color: '#b88a4a', weapon: 'Coiled drover’s whip', glint: 5,
    blurb: 'Forty years driving the Greenway, and never lost a wagon. This winter every carter in Cobbleford says the road has changed.',
    traits: { str: 0, dex: 0, con: 1, int: 1, wis: 2, cha: 1 }, maxHp: 9, atk: 1, def: 2, dmgDie: 6,
    abilities: ['va_ab_roadwise', 'va_ab_teamster'],
  }),
  hero({
    id: 'va_brannoc', name: 'Brannoc Tull', title: 'Wagon Guard', color: '#c4703a', weapon: 'Long-hafted woodaxe',
    blurb: 'A former logger built like a cart-horse. He quit the timber camps the day a tree he was felling spoke to him, and he won’t say what it said.',
    traits: { str: 2, dex: 0, con: 2, int: -1, wis: 0, cha: 0 }, maxHp: 14, atk: 2, def: 4, dmgDie: 8,
    abilities: ['va_ab_shoulder', 'va_ab_cleave'],
  }),
  hero({
    id: 'va_sorrel', name: 'Sorrel Vey', title: 'Hedge-Witch', color: '#7fb86a', weapon: 'Rowan wand', glint: 6,
    blurb: 'She keeps a garden of things that shouldn’t grow in winter. This year they are flowering, and she wants to know why.',
    traits: { str: -1, dex: 0, con: 0, int: 2, wis: 2, cha: 0 }, maxHp: 9, atk: 3, def: 1, dmgDie: 6, pools: { spell: 4 },
    abilities: ['va_ab_herblore', 'va_ab_thornlash', 'va_ab_hedgesight'],
  }),
  hero({
    id: 'va_pip', name: 'Pip Larkspur', title: 'Road Urchin', color: '#b08ad0', weapon: 'Sling and a bent knife', glint: 8,
    blurb: 'Pip has ridden every caravan out of Cobbleford, mostly as a stowaway. This time Agathe caught them and made them sign on properly.',
    traits: { str: 0, dex: 3, con: 0, int: 1, wis: -1, cha: 2 }, maxHp: 10, atk: 3, def: 2, dmgDie: 6,
    abilities: ['pickpocket', 'va_ab_lightstep', 'va_ab_scarper'],
  }),
  hero({
    id: 'va_aldous', name: 'Brother Aldous Fenn', title: 'Wayside Friar', color: '#e0c77a', weapon: 'Oak staff with a brass sun', glint: 5,
    blurb: 'He walks the roads blessing milestones and burying the travelers nobody else will. He has been very busy this winter.',
    traits: { str: 0, dex: -1, con: 1, int: 1, wis: 3, cha: 1 }, maxHp: 11, atk: 2, def: 3, dmgDie: 6, pools: { spell: 3 },
    abilities: ['va_ab_kindword', 'va_ab_mend', 'va_ab_sunblessing'],
  }),
  hero({
    id: 'va_kestrel', name: 'Kestrel Moss', title: 'Fernreach Ranger', color: '#5f9a7a', weapon: 'Yew longbow',
    blurb: 'She has walked the Fernreach since she was old enough to hold a bow. The forest has never frightened her before.',
    traits: { str: 1, dex: 2, con: 1, int: 0, wis: 2, cha: 0 }, maxHp: 12, atk: 3, def: 2, dmgDie: 8,
    abilities: ['va_ab_tracker', 'va_ab_drawbreath', 'va_ab_twinshot'],
  }),
  hero({
    id: 'va_odo', name: 'Odo Brindle', title: 'Wandering Monk', color: '#a8c46a', weapon: 'Bare hands and a walking stick', glint: 3,
    blurb: 'Odo trained among the moss-shrines of the deep woods. When the shrine bells began ringing on their own, his teachers sent him out to find out why.',
    traits: { str: 1, dex: 2, con: 1, int: 0, wis: 2, cha: -1 }, maxHp: 11, atk: 3, def: 3, dmgDie: 6, pools: { chi: 3 },
    abilities: ['va_ab_stillroot', 'va_ab_palm', 'va_ab_breath'],
  }),
]

const items: ItemDef[] = [
  { id: 'va_fernleaf', name: 'Fernleaf Draught', kind: 'heal', die: 6, bonus: 2, price: 5, text: 'Recover d6+2 health. Not usable during combat rounds.' },
  { id: 'va_heartsap', name: 'Heartsap Tonic', kind: 'heal', die: 10, bonus: 3, price: 10, text: 'Recover d10+3 health. Not usable during combat rounds.' },
  { id: 'va_firepot', name: 'Pitch Firepot', kind: 'slotDie', die: 6, slots: ['damage'], price: 4, text: 'Throw it: add d6 to a Damage roll.' },
  { id: 'va_blastjar', name: 'Miner’s Blast Jar', kind: 'slotDie', die: 10, slots: ['damage'], price: 9, text: 'Add d10 to a Damage roll.' },
  { id: 'va_cider', name: 'Hard Cider', kind: 'slotDie', die: 4, slots: ['attack'], price: 3, text: 'Add d4 to an Attack roll.' },
  { id: 'va_wasp', name: 'Wasp-Sting Oil', kind: 'slotDie', die: 6, slots: ['attack'], price: 6, text: 'Add d6 to an Attack roll.' },
  { id: 'va_mossbalm', name: 'Mossbalm', kind: 'cure', price: 6, text: 'Heals one lingering Injury, Trauma or Wound.' },
  { id: 'va_honeycake', name: 'Honey Cake', kind: 'pageBonus', stat: 'cha', amount: 0, die: 6, price: 3, text: '+d6 Charisma for the rest of today.' },
  { id: 'va_jerky', name: 'Boar Jerky', kind: 'pageBonus', stat: 'str', amount: 0, die: 6, price: 3, text: '+d6 Strength for the rest of today.' },
  { id: 'va_bitterroot', name: 'Bitterroot Tea', kind: 'pageBonus', stat: 'wis', amount: 0, die: 6, price: 4, text: '+d6 Wisdom for the rest of today.' },
  // Upgrades: passive while carried.
  { id: 'va_whetstone', name: 'River Whetstone', kind: 'upgrade', bonus: { dmg: 1 }, stackMax: 3, price: 6, text: '+1 to Damage rolls. Stacks up to 3 times.' },
  { id: 'va_grip', name: 'Pine-Pitch Grip', kind: 'upgrade', bonus: { atk: 1 }, stackMax: 3, price: 7, text: '+1 Attack. Stacks up to 3 times.' },
  { id: 'va_picks', name: 'Tinker’s Picks', kind: 'upgrade', bonus: { roll: 2 }, tags: ['lockpick'], stackMax: 1, price: 5, text: '+2 to lock-picking checks.' },
  { id: 'va_compass', name: 'Moss Compass', kind: 'upgrade', bonus: { wis: 2 }, tags: ['travel'], stackMax: 1, price: 12, text: 'Its needle points to the oldest tree nearby. +2 Wisdom on travel checks.' },
  // Equipment
  { id: 'va_feltcap', name: 'Felted Wool Cap', kind: 'gear', slot: 'head', bonus: { def: 1 }, price: 9, text: '+1 Defense.' },
  { id: 'va_drovercoat', name: 'Drover’s Coat', kind: 'gear', slot: 'body', bonus: { maxHp: 2 }, price: 10, text: '+2 max health.' },
  { id: 'va_fordboots', name: 'Ford-Wader Boots', kind: 'gear', slot: 'feet', bonus: { dex: 1 }, price: 12, text: '+1 Dexterity.' },
  { id: 'va_knucklering', name: 'Knucklebark’s Ring', kind: 'gear', slot: 'trinket', bonus: { atk: 1, con: 1 }, magical: true, price: 20, text: 'Magical. +1 Attack, +1 Constitution. A troll’s toll-ring, big enough for a bracelet.' },
  { id: 'va_oilskin', name: 'Miller’s Oilskin', kind: 'gear', slot: 'body', bonus: { maxHp: 3, con: 1 }, magical: true, price: 18, text: 'Magical. +3 max health, +1 Constitution. Water runs off it like it’s embarrassed.' },
  { id: 'va_gutterlamp', name: 'Gutterlight Lamp', kind: 'gear', slot: 'hands', bonus: { atk: 1, wis: 1 }, magical: true, price: 16, text: 'Magical. +1 Attack, +1 Wisdom. Its flame burns green near hidden doors.' },
  { id: 'va_clocklens', name: 'Spindle’s Loupe', kind: 'gear', slot: 'head', bonus: { def: 1, int: 2 }, magical: true, price: 26, text: 'Magical. +1 Defense, +2 Intellect. A clockmaker’s eyeglass with a dozen tiny lenses.' },
]

/** ac = Attack to hit · toughness = Damage to defeat · hits = its attack vs your 10 + Defense · dmg = damage. */
const enemies: EnemyDef[] = [
  // Chapter 1 — the Greenway
  { id: 'va_boar', name: 'Bramble Boar', ac: 11, toughness: 4, hits: 12, dmg: 2, text: 'A boar with thorns grown into its bristles. It charges anything that smells of bread.' },
  { id: 'va_highwayman', name: 'Greenway Highwayman', ac: 12, toughness: 5, hits: 13, dmg: 3, text: 'A masked rider with a crossbow and very polite manners.' },
  { id: 'va_wolf', name: 'Hollow Wolf', ac: 12, toughness: 4, hits: 13, dmg: 2, text: 'Grey, thin and too quiet. Moss grows in the hollows of its ribs.' },
  { id: 'va_briargob', name: 'Briar Goblin', ac: 12, toughness: 3, hits: 12, dmg: 2, text: 'A goblin in a coat of woven thorns. It steals buttons, spoons and boots.' },
  { id: 'va_knucklebark', name: 'Old Knucklebark', ac: 13, toughness: 7, hits: 15, dmg: 4, text: 'A bridge-troll with bark for skin and a toll-ring on one knuckle. He says the forest told him to close the road.' },
  // Chapter 2 — the Drowned Mill
  { id: 'va_smuggler', name: 'Timber Smuggler', ac: 12, toughness: 6, hits: 14, dmg: 3, text: 'A raftsman with a hook-pole and no paperwork.' },
  { id: 'va_ratswarm', name: 'Millrow Rat Swarm', ac: 13, toughness: 4, hits: 13, dmg: 2, text: 'The flood drove every rat in Millrow upstairs, and they are hungry.' },
  { id: 'va_bogling', name: 'Bogling', ac: 13, toughness: 5, hits: 14, dmg: 3, text: 'A knee-high thing of mud and reeds that came downriver with the roots.' },
  { id: 'va_enforcer', name: 'Copperleaf Enforcer', ac: 13, toughness: 7, hits: 14, dmg: 4, text: 'An Exchange “debt-collector” in a good coat, with a club inside it.' },
  { id: 'va_sluicemother', name: 'The Sluice-Mother', ac: 14, toughness: 8, hits: 16, dmg: 5, text: 'An eel as thick as a mill-beam, nesting in the jammed millrace. She has had a lot of babies.' },
  // Chapter 3 — under the cobbles
  { id: 'va_cutpurse', name: 'Gutterlight Cutpurse', ac: 13, toughness: 5, hits: 14, dmg: 3, text: 'Quick hands, quicker feet, and a lamp that burns green.' },
  { id: 'va_gutterlizard', name: 'Gutter Lizard', ac: 13, toughness: 7, hits: 15, dmg: 4, text: 'A pale lizard as long as a rowboat, raised on kitchen scraps and the occasional thief.' },
  { id: 'va_waxling', name: 'Waxling', ac: 14, toughness: 5, hits: 15, dmg: 3, text: 'A little figure of melted candle-wax, walking.' },
  { id: 'va_bonebell', name: 'Founder’s Bellwarden', ac: 14, toughness: 7, hits: 15, dmg: 4, text: 'A skeleton in chapel robes, still ringing the hour for a congregation four hundred years gone.' },
  { id: 'va_waxwarden', name: 'The Wax Warden', ac: 15, toughness: 9, hits: 16, dmg: 5, text: 'A towering guardian of candle-wax with a crown of lit wicks. Each blow you land, it melts and pours itself back.' },
  // Chapter 4 — the Spring Fair
  { id: 'va_fairbruiser', name: 'Fair Bruiser', ac: 14, toughness: 7, hits: 15, dmg: 4, text: 'A prize-fighter who has been paid to lose, and has decided not to.' },
  { id: 'va_footman', name: 'Clockwork Footman', ac: 15, toughness: 7, hits: 16, dmg: 4, text: 'A brass servant in livery, wound tight and polite until it isn’t.' },
  { id: 'va_manorguard', name: 'Crane’s House Guard', ac: 15, toughness: 8, hits: 16, dmg: 5, text: 'Copperleaf colors, a halberd and a pension worth protecting.' },
  { id: 'va_topiary', name: 'Topiary Hound', ac: 14, toughness: 6, hits: 16, dmg: 4, text: 'A hedge clipped into the shape of a hound. It has been clipped wrong.' },
  { id: 'va_brassgardener', name: 'The Brass Gardener', ac: 15, toughness: 10, hits: 17, dmg: 5, text: 'Crane’s clockwork groundskeeper: eight feet of brass with shears for hands and a gardener’s patience.' },
]

const follower = (m: Omit<MemberDef, 'kind' | 'maxHp' | 'abilities'>): MemberDef => ({ kind: 'critter', maxHp: 1, abilities: [], ...m })

const members: MemberDef[] = [
  follower({ id: 'va_f_burr', name: 'Burr', fee: 4, follower: { upkeep: 1, grants: ['va_ab_burrnose'] }, text: 'A shaggy wagon dog who growls at trouble before anyone else sees it.' }),
  follower({ id: 'va_f_turnip', name: 'Turnip', fee: 6, follower: { upkeep: 2, grants: ['va_ab_turnip'] }, text: 'A grey mule of strong opinions and stronger legs.' }),
  follower({ id: 'va_f_minnow', name: 'Minnow', fee: 8, follower: { upkeep: 2, grants: ['va_ab_minnow'] }, text: 'A mill-girl who knows every rooftop and drain in Millrow.' }),
  follower({ id: 'va_f_sedge', name: 'Old Sedge', fee: 10, follower: { upkeep: 2, grants: ['va_ab_sedge'] }, text: 'Highmarrow’s oldest lamplighter. He knows the city’s history street by street.' }),
  follower({ id: 'va_f_fennick', name: 'Fennick', fee: 12, follower: { upkeep: 3, grants: ['va_ab_juggle'] }, text: 'A Spring Fair juggler whose clubs are heavier than they look.' }),
]

/** Each chapter's boss awards one of a pair. Later options can require them. */
export const VERDANT_LEGACY: LegacyDef[] = [
  { id: 'va_l1_win', chapter: 1, name: 'Hero of the Greenway', text: 'The caravan reached Highmarrow whole. Agathe and every carter on the road vouch for you.' },
  { id: 'va_l1_loss', chapter: 1, name: 'The Lost Wagons', text: 'Two wagons burned at Gallows Ford. Agathe owes the Copperleaf Exchange, and the Exchange collects.' },
  { id: 'va_l2_win', chapter: 2, name: 'Friend of Millrow', text: 'The flooded district owes you. Millrow’s millers will hide you when you need it.' },
  { id: 'va_l2_loss', chapter: 2, name: 'The Ledger Burned', text: 'The smugglers’ ledger was lost. You know less than you hoped, and they know your face.' },
  { id: 'va_l3_win', chapter: 3, name: 'The Gutterlight Sign', text: 'The thieves’ guild taught you its knock. Doors under the city open for you.' },
  { id: 'va_l3_loss', chapter: 3, name: 'Guild Grudge', text: 'The Gutterlight blames you for what happened in the chapel.' },
  { id: 'va_l4_win', chapter: 4, name: 'Champion of the Fair', text: 'Highmarrow cheered you at the Spring Fair. The Watch listens when you speak.' },
  { id: 'va_l4_loss', chapter: 4, name: 'The Stopped Clock', text: 'Crane’s version of the Fair is the one the city believes.' },
]

export const VERDANT_CONTENT: ContentPack = { abilities, heroes, items, enemies, members }
export const VERDANT_HEROES = ['va_brannoc', 'va_sorrel', 'va_pip', 'va_aldous', 'va_kestrel', 'va_odo']
