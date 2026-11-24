// Brightwatch's year content (Feb 19 – Dec 31): enemies scaled month by
// month, gear and consumables for the shops, companions, and the level 3–8
// abilities of the three Brightwatch-only wardens.
import type { AbilityDef, EnemyDef, ItemDef, LevelSpec, MemberDef } from '../../../engine/types'

/** Grouped by the month each enemy first appears; stats climb through the year. */
export const YEAR_ENEMIES: EnemyDef[] = [
  // Feb–Mar
  { id: 'bw-cliffSpider', name: 'Cliff Spider', ac: 12, toughness: 5, hits: 12, dmg: 2, text: 'Long-legged, pale, and patient; its silk is stronger than rope.' },
  { id: 'bw-ropeGnawer', name: 'The Rope-Gnawer', ac: 13, toughness: 7, hits: 13, dmg: 3, text: 'A many-plated reef louse the size of a rowboat, fond of hemp and fingers.' },
  { id: 'bw-bogChorister', name: 'Bog Chorister', ac: 12, toughness: 6, hits: 12, dmg: 3, text: 'A fog-swollen marsh frog whose croak makes your ears ring.' },
  { id: 'bw-hushAcolyte', name: 'Hush Acolyte', ac: 12, toughness: 6, hits: 13, dmg: 3, text: 'A grey-robed member of the Quiet Choir, sworn never to speak.' },
  { id: 'bw-reedHound', name: 'Reed Hound', ac: 13, toughness: 6, hits: 12, dmg: 3, text: 'A dog woven from wet reeds and bad intentions.' },
  { id: 'bw-sedgeMother', name: 'The Sedge-Mother', ac: 14, toughness: 7, hits: 14, dmg: 4, text: 'A towering fen-spirit of reed and black water, wearing the Marsh Bell like a heart.' },
  // Apr
  { id: 'bw-moorWolf', name: 'Moor Wolf', ac: 14, toughness: 7, hits: 14, dmg: 4, text: 'Grey, gaunt, and hunting in fog.' },
  { id: 'bw-hushBlade', name: 'Hush Blade', ac: 14, toughness: 7, hits: 14, dmg: 4, text: 'A Choir enforcer with a muffled sword and a muffled step.' },
  { id: 'bw-tarnSerpent', name: 'The Tarn Serpent', ac: 16, toughness: 9, hits: 15, dmg: 4, text: 'A coiled cold-water serpent sleeping around a drowned bell.' },
  // May
  { id: 'bw-canalCutter', name: 'Canal Cutter', ac: 14, toughness: 7, hits: 14, dmg: 4, text: 'A Saltmarket cutpurse who prefers knives to purses.' },
  { id: 'bw-syndicateBravo', name: 'Syndicate Bravo', ac: 15, toughness: 7, hits: 15, dmg: 4, text: 'Madam Quill’s best-dressed muscle.' },
  { id: 'bw-hushknight', name: 'The Hushknight', ac: 16, toughness: 9, hits: 16, dmg: 5, text: 'The Choir’s champion, in grey plate stuffed with wool so it makes no sound.' },
  // Jun
  { id: 'bw-glassJelly', name: 'Glass Jelly', ac: 15, toughness: 7, hits: 15, dmg: 4, text: 'A drifting bell of living fogglass with stinging threads.' },
  { id: 'bw-abyssEel', name: 'Abyss Eel', ac: 15, toughness: 7, hits: 15, dmg: 5, text: 'Long as a mast and lit from inside like a lantern.' },
  { id: 'bw-abyssalShepherd', name: 'The Abyssal Shepherd', ac: 17, toughness: 10, hits: 16, dmg: 6, text: 'An ancient deep-thing that herds the drowned like sheep.' },
  // Jul
  { id: 'bw-hushZealot', name: 'Hush Zealot', ac: 15, toughness: 9, hits: 16, dmg: 5, text: 'Eyes bound, ears stopped, and utterly fearless.' },
  { id: 'bw-abbeyGuard', name: 'Abbey Guard', ac: 16, toughness: 9, hits: 16, dmg: 5, text: 'A Greyholm sentry in salt-grey mail.' },
  { id: 'bw-abbessVane', name: 'Abbess Morrow Vane', ac: 17, toughness: 11, hits: 17, dmg: 6, text: 'Leader of the Quiet Choir. Her silence is a weapon.' },
  // Aug
  { id: 'bw-stackHarpy', name: 'Stack Harpy', ac: 16, toughness: 9, hits: 16, dmg: 6, text: 'A screeching fog-bird from the sea-stacks.' },
  { id: 'bw-wyrmling', name: 'Fog Wyrmling', ac: 16, toughness: 9, hits: 16, dmg: 6, text: 'A serpent-pup of mist with very real teeth.' },
  { id: 'bw-fogwyrm', name: 'The Young Fogwyrm', ac: 18, toughness: 11, hits: 17, dmg: 7, text: 'Fog given wings, coils, and a hoard.' },
  // Sep
  { id: 'bw-coralRevenant', name: 'Coral Revenant', ac: 16, toughness: 9, hits: 17, dmg: 6, text: 'A drowned citizen of the Underreef, half grown over with coral.' },
  { id: 'bw-drownedKnight', name: 'Drowned Knight', ac: 17, toughness: 9, hits: 17, dmg: 7, text: 'Still guarding a city that sank a thousand years ago.' },
  { id: 'bw-bellBreaker', name: 'The Bell-Breaker', ac: 18, toughness: 11, hits: 18, dmg: 8, text: 'The Choir’s giant, with a maul made to crack bronze.' },
  // Oct
  { id: 'bw-cinderHound', name: 'Cinder Hound', ac: 17, toughness: 9, hits: 17, dmg: 7, text: 'A dog of smoking ash from the Cinder Moors.' },
  { id: 'bw-hushSaboteur', name: 'Hush Saboteur', ac: 18, toughness: 9, hits: 18, dmg: 7, text: 'A Choir agent with a flask of quench-oil and a quiet knife.' },
  { id: 'bw-drownedHost', name: 'The Drowned Host', ac: 19, toughness: 13, hits: 19, dmg: 8, text: 'Every lost sailor of the Marches, walking out of the sea together.' },
  // Nov
  { id: 'bw-fogReaver', name: 'Fog Reaver', ac: 18, toughness: 11, hits: 19, dmg: 7, text: 'A raider who has given themself entirely to the fog.' },
  { id: 'bw-heirGuard', name: 'Heir-Guard', ac: 19, toughness: 11, hits: 19, dmg: 9, text: 'A towering fog-knight crowned with a single drowned bell.' },
  { id: 'bw-vaneUnbound', name: 'Morrow Vane, the Hush Unbound', ac: 20, toughness: 13, hits: 19, dmg: 9, text: 'The Abbess, wrapped in the fog she worships.' },
  // Dec
  { id: 'bw-throatSentinel', name: 'Throat Sentinel', ac: 19, toughness: 11, hits: 19, dmg: 9, text: 'A guardian grown from the Underreef’s own stone.' },
  { id: 'bw-paleHeir', name: 'The Pale Heir', ac: 20, toughness: 14, hits: 20, dmg: 10, text: 'The Pale Herald reborn, wearing a crown of seven silent bells.' },
  { id: 'bw-paleTide', name: 'The Pale Tide', ac: 21, toughness: 16, hits: 21, dmg: 14, text: 'The fog itself, risen from the deep, vast and half awake.' },
]

export const YEAR_ITEMS: ItemDef[] = [
  // Consumables
  { id: 'bw-fenTonic', name: 'Fen Tonic', kind: 'heal', die: 6, bonus: 4, price: 7, text: 'Recover d6+4 health. Not usable during combat rounds.' },
  { id: 'bw-warHorn', name: 'War-Horn Draught', kind: 'slotDie', die: 6, slots: ['attack'], price: 6, text: 'Add d6 to an Attack roll.' },
  { id: 'bw-tideBalm', name: 'Tide Balm', kind: 'slotDie', die: 6, slots: ['defense'], price: 6, text: 'Add d6 to a Defense roll.' },
  { id: 'bw-sparkFlask', name: 'Sparkflask', kind: 'slotDie', die: 8, slots: ['damage'], price: 7, text: 'Add d8 to a Damage roll.' },
  { id: 'bw-strongMend', name: 'Strong Mendwater', kind: 'heal', die: 8, bonus: 6, price: 10, text: 'Recover d8+6 health. Not usable during combat rounds.' },
  { id: 'bw-bellResin', name: 'Bell Resin', kind: 'pageBonus', stat: 'roll', amount: 2, price: 8, text: '+2 to every d20 roll for the rest of today.' },
  { id: 'bw-greatMend', name: 'Great Mendwater', kind: 'heal', die: 10, bonus: 10, price: 16, text: 'Recover d10+10 health. Not usable during combat rounds.' },
  { id: 'bw-starFlask', name: 'Starflask', kind: 'slotDie', die: 10, slots: ['damage'], price: 10, text: 'Add d10 to a Damage roll.' },
  // Gear, roughly one upgrade per slot every couple of months
  { id: 'bw-sedgeCloak', name: 'Sedge Cloak', kind: 'gear', slot: 'body', bonus: { maxHp: 3, def: 1 }, price: 20, text: '+3 max health, +1 Defense.' },
  { id: 'bw-tarnBand', name: 'Tarn-Iron Bracers', kind: 'gear', slot: 'hands', bonus: { atk: 1, dmg: 1 }, price: 22, text: '+1 Attack, +1 Damage.' },
  { id: 'bw-canalBoots', name: 'Canal-Runner Boots', kind: 'gear', slot: 'feet', bonus: { dex: 1, def: 1 }, price: 18, text: '+1 Dexterity, +1 Defense.' },
  { id: 'bw-diverHelm', name: 'Diver’s Helm', kind: 'gear', slot: 'head', bonus: { def: 2 }, price: 26, text: '+2 Defense.' },
  { id: 'bw-abbeyMail', name: 'Greyholm Mail', kind: 'gear', slot: 'body', bonus: { def: 1, maxHp: 5 }, price: 34, text: '+1 Defense, +5 max health.' },
  { id: 'bw-wyrmscale', name: 'Wyrmscale Gauntlets', kind: 'gear', slot: 'hands', bonus: { atk: 2, dmg: 1 }, price: 38, text: '+2 Attack, +1 Damage.' },
  { id: 'bw-coralCrown', name: 'Coral Circlet', kind: 'gear', slot: 'head', bonus: { def: 2, wis: 1 }, price: 36, text: '+2 Defense, +1 Wisdom.' },
  { id: 'bw-emberGauntlets', name: 'Emberwell Gauntlets', kind: 'gear', slot: 'hands', bonus: { atk: 2, dmg: 2 }, price: 48, text: '+2 Attack, +2 Damage.' },
  { id: 'bw-stridersBoots', name: 'Moor-Strider Boots', kind: 'gear', slot: 'feet', bonus: { def: 2, dex: 1 }, price: 34, text: '+2 Defense, +1 Dexterity.' },
  { id: 'bw-concordCoat', name: 'Concord Greatcoat', kind: 'gear', slot: 'body', bonus: { def: 2, maxHp: 6 }, price: 50, text: '+2 Defense, +6 max health.' },
  { id: 'bw-pealCharm', name: 'Peal-Charm', kind: 'gear', slot: 'trinket', bonus: { atk: 1, def: 1, cha: 1 }, price: 45, text: '+1 Attack, +1 Defense, +1 Charisma. Rings softly in the fog.' },
  // Late-year upgrades (Oct to Dec markets): stackable, so a full purse always has a use.
  { id: 'bw-bellWhet', name: 'Bell-Bronze Whetstone', kind: 'upgrade', bonus: { dmg: 1 }, stackMax: 1, price: 30, text: '+1 to Damage rolls.' },
  { id: 'bw-lampGrip', name: 'Lamp-Keeper’s Grip', kind: 'upgrade', bonus: { atk: 1 }, stackMax: 1, price: 32, text: '+1 Attack.' },
  { id: 'bw-oilskinLiner', name: 'Storm Oilskin Liner', kind: 'upgrade', bonus: { def: 1 }, stackMax: 1, price: 34, text: '+1 Defense.' },
]

export const YEAR_MEMBERS: MemberDef[] = [
  {
    id: 'bw-bramble',
    name: 'Bramble',
    kind: 'critter',
    maxHp: 3,
    fee: 8,
    text: 'A warty fen toad who lights lamps with a flick of his tongue and complains the whole time.',
    abilities: [
      { name: 'Croak of Warning', suits: ['spades', 'clubs'], target: 6, effect: { type: 'slotBonus', slots: ['defense'], amount: 2 } },
      { name: 'Sticky Tongue', suits: ['hearts'], target: 7, effect: { type: 'slotBonus', slots: ['attack'], amount: 2 } },
    ],
  },
  {
    id: 'bw-wick',
    name: 'Wick',
    kind: 'bug',
    maxHp: 2,
    fee: 6,
    text: 'A mountain firefly who glows white-hot when angry.',
    abilities: [
      { name: 'Flare', suits: ['diamonds'], target: 6, effect: { type: 'slotBonus', slots: ['damage'], amount: 2 } },
      { name: 'Kindle', suits: ['hearts'], target: 6, effect: { type: 'heal', amount: 3 } },
    ],
  },
  {
    id: 'bw-oaken',
    name: 'Oaken',
    kind: 'critter',
    maxHp: 4,
    fee: 14,
    text: 'A grave old sea-owl who has watched the stacks for forty years.',
    abilities: [
      { name: 'Night Eyes', suits: ['clubs'], target: 5, effect: { type: 'slotBonus', slots: ['check'], amount: 2 } },
      { name: 'Talons', suits: ['diamonds', 'spades'], target: 8, effect: { type: 'slotBonus', slots: ['attack'], amount: 3 } },
    ],
  },
  {
    id: 'bw-tumble',
    name: 'Tumble',
    kind: 'bug',
    maxHp: 3,
    fee: 10,
    text: 'A pill-bug the size of a fist who rolls up in front of danger on principle.',
    abilities: [{ name: 'Roll Up', suits: ['spades'], target: 4, effect: { type: 'slotBonus', slots: ['defense'], amount: 3 } }],
  },
]

/** Level 4/6/8 abilities for Ottilie, Hask and Jory. */
export const YEAR_ABILITIES: AbilityDef[] = [
  { id: 'bw-sanctuary', name: 'Sanctuary', kind: 'heal', per: 'page', uses: 1, die: 4, bonus: 2, text: 'Once per page: recover d4+2 health.' },
  { id: 'bw-litany', name: 'Litany', kind: 'addDie', per: 'rest', uses: 3, die: 6, slots: ['check', 'attack', 'defense'], text: 'Three times per Rest: add d6 to any d20 roll.' },
  { id: 'bw-dawnChorus', name: 'Dawn Chorus', kind: 'heal', per: 'rest', uses: 1, die: 12, bonus: 6, text: 'Once per Rest: recover d12+6 health.' },
  { id: 'bw-pinningShot', name: 'Pinning Shot', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['defense'], text: 'Twice per Rest: add d6 to a Defense roll.' },
  { id: 'bw-eagleEye', name: 'Eagle Eye', kind: 'addDie', per: 'page', uses: 1, die: 6, slots: ['attack'], text: 'Once per page: add d6 to an Attack roll.' },
  { id: 'bw-rainOfArrows', name: 'Rain of Arrows', kind: 'addDie', per: 'rest', uses: 2, die: 10, slots: ['damage'], text: 'Twice per Rest: add d10 to a Damage roll.' },
  { id: 'bw-ironHide', name: 'Iron Hide', kind: 'addDie', per: 'rest', uses: 2, die: 8, slots: ['defense'], text: 'Twice per Rest: add d8 to a Defense roll.' },
  { id: 'bw-crowdBreaker', name: 'Crowd Breaker', kind: 'addDie', per: 'page', uses: 1, die: 6, slots: ['damage'], text: 'Once per page: add d6 to a Damage roll.' },
  { id: 'bw-unstoppable', name: 'Unstoppable', kind: 'heal', per: 'rest', uses: 1, die: 10, bonus: 6, text: 'Once per Rest: recover d10+6 health.' },
]

/** Level 3–8 for the Brightwatch-only wardens (level 2 is in content.ts). */
export const YEAR_LEVELS: Record<string, Record<number, LevelSpec>> = {
  'bw-ottilie': {
    3: { maxHp: 3, def: 1 },
    4: { maxHp: 3, traits: { wis: 1 }, ability: 'bw-sanctuary' },
    5: { maxHp: 4, atk: 1, dmgDie: 10 },
    6: { maxHp: 3, def: 1, ability: 'bw-litany' },
    7: { maxHp: 3, atk: 1, traits: { cha: 1 } },
    8: { maxHp: 4, def: 1, ability: 'bw-dawnChorus' },
  },
  'bw-hask': {
    3: { maxHp: 3, atk: 1 },
    4: { maxHp: 3, traits: { wis: 1 }, ability: 'bw-pinningShot' },
    5: { maxHp: 3, def: 1, dmgDie: 10 },
    6: { maxHp: 3, atk: 1, ability: 'bw-eagleEye' },
    7: { maxHp: 4, def: 1, traits: { dex: 1 } },
    8: { maxHp: 3, atk: 1, ability: 'bw-rainOfArrows' },
  },
  'bw-jory': {
    3: { maxHp: 4, atk: 1 },
    4: { maxHp: 4, traits: { str: 1 }, ability: 'bw-ironHide' },
    5: { maxHp: 4, def: 1, dmgDie: 12 },
    6: { maxHp: 4, traits: { con: 1 }, ability: 'bw-crowdBreaker' },
    7: { maxHp: 4, atk: 1, def: 1 },
    8: { maxHp: 5, traits: { str: 1 }, ability: 'bw-unstoppable' },
  },
}
