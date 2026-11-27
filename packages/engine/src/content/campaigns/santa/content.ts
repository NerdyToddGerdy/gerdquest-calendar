// Saving Santa: original heroes, abilities, items and enemies for the
// December advent campaign. Santa and the North Pole are public folklore;
// every character, place and creature below is original to GerdQuest Calendar.
import type { AbilityDef, ContentPack, EnemyDef, HeroDef, ItemDef } from '../../../engine/types'

const abilities: AbilityDef[] = [
  // Juniper Tock — Toymaker
  { id: 'ss_ab_tinker', name: 'Tinker', kind: 'passive', bonus: 2, tags: ['lore', 'lockpick'], text: '+2 to puzzles, mechanisms, locks and anything with a spring in it.' },
  { id: 'ss_ab_windup', name: 'Wind-Up Decoy', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['defense', 'check'], text: 'Twice per Rest: a clockwork mouse scurries off and draws trouble away. Add d6 to a Defense roll or a check.' },
  { id: 'ss_ab_mallet', name: 'Toymaker’s Mallet', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['damage'], text: 'Twice per Rest: add d6 to a Damage roll.' },
  { id: 'ss_ab_spareparts', name: 'Spare Parts', kind: 'reroll', per: 'page', uses: 1, text: 'Once per page: “I can fix that.” Reroll any d20.' },

  // Rowan Thistledown — Reindeer Wrangler
  { id: 'ss_ab_herd', name: 'Herd Sense', kind: 'passive', bonus: 2, tags: ['travel', 'physical'], text: '+2 to travel, hauling and handling animals.' },
  { id: 'ss_ab_lasso', name: 'Harness Lasso', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['attack'], text: 'Twice per Rest: add d6 to an Attack roll.' },
  { id: 'ss_ab_antler', name: 'Antler Charge', kind: 'addDie', per: 'rest', uses: 1, die: 10, slots: ['damage'], text: 'Once per Rest: add d10 to a Damage roll.' },
  { id: 'ss_ab_thickcoat', name: 'Thick Coat', kind: 'heal', per: 'rest', uses: 1, die: 6, bonus: 2, text: 'Once per Rest: shake off the cold. Recover d6+2 health.' },

  // Marigold Puddingstone — Kitchen Witch
  { id: 'ss_ab_hearthlore', name: 'Hearth Lore', kind: 'passive', bonus: 2, tags: ['lore', 'social'], text: '+2 to recipes, remedies, old winter charms and kind words.' },
  { id: 'ss_ab_spicedcocoa', name: 'Spiced Cocoa', kind: 'heal', per: 'rest', uses: 2, die: 8, bonus: 1, text: 'Twice per Rest: recover d8+1 health.' },
  { id: 'ss_ab_pepperspark', name: 'Peppermint Spark', kind: 'addDie', per: 'rest', uses: 2, die: 8, slots: ['damage'], text: 'Twice per Rest: a crackle of peppermint fire. Add d8 to a Damage roll.' },
  { id: 'ss_ab_warmhands', name: 'Warm Hands', kind: 'addDie', per: 'page', uses: 1, die: 4, slots: ['check', 'defense'], text: 'Once per page: add d4 to a check or Defense roll.' },

  // Nell Carroway — Bellringer
  { id: 'ss_ab_carol', name: 'Carol', kind: 'passive', bonus: 2, tags: ['social', 'perception'], text: '+2 to singing, cheering, persuading and listening hard.' },
  { id: 'ss_ab_clearnote', name: 'Clear Note', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['attack', 'check'], text: 'Twice per Rest: one bright note cuts through the Hush. Add d6 to an Attack roll or a check.' },
  { id: 'ss_ab_handbell', name: 'Handbell Swing', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['damage'], text: 'Twice per Rest: add d6 to a Damage roll.' },
  { id: 'ss_ab_chorus', name: 'Chorus', kind: 'heal', per: 'rest', uses: 1, die: 6, bonus: 2, text: 'Once per Rest: hum the old song until you feel it in your toes. Recover d6+2 health.' },

  // Levels 2–3
  { id: 'ss_ab_doubleknot', name: 'Double Knot', kind: 'addDie', per: 'rest', uses: 1, die: 8, slots: ['attack', 'damage'], text: 'Once per Rest: add d8 to an Attack or Damage roll.' },
  { id: 'ss_ab_sledrun', name: 'Sled Run', kind: 'reroll', per: 'page', uses: 1, text: 'Once per page: reroll any d20.' },
  { id: 'ss_ab_gingersnap', name: 'Gingersnap', kind: 'addDie', per: 'rest', uses: 1, die: 10, slots: ['damage'], text: 'Once per Rest: add d10 to a Damage roll.' },
  { id: 'ss_ab_descant', name: 'Descant', kind: 'addDie', per: 'rest', uses: 1, die: 8, slots: ['defense'], text: 'Once per Rest: add d8 to a Defense roll.' },
]

const heroes: HeroDef[] = [
  {
    id: 'ss_juniper',
    name: 'Juniper Tock',
    title: 'Toymaker',
    blurb: 'Juniper has built a toy for every child in Pinecrook, some of them twice. She can hear a spring about to break from across a room, and she has never once tidied her pockets.',
    color: '#d94a4a',
    traits: { str: 0, dex: 2, con: 1, int: 3, wis: 0, cha: 0 },
    maxHp: 11,
    atk: 2,
    def: 2,
    dmgDie: 8,
    weapon: 'Toymaker’s mallet',
    glint: 4,
    abilities: ['ss_ab_tinker', 'ss_ab_windup', 'ss_ab_mallet'],
    levels: {
      2: { maxHp: 3, atk: 1, traits: { dex: 1 }, ability: 'ss_ab_spareparts' },
      3: { maxHp: 3, def: 1, traits: { int: 1 }, ability: 'ss_ab_doubleknot' },
    },
  },
  {
    id: 'ss_rowan',
    name: 'Rowan Thistledown',
    title: 'Reindeer Wrangler',
    blurb: 'Rowan keeps the winter herd on the hill above Pinecrook and knows every animal by the sound of its bell. Rowan smells faintly of hay all year round and has stopped apologising for it.',
    color: '#8a5a32',
    traits: { str: 3, dex: 1, con: 2, int: -1, wis: 1, cha: 0 },
    maxHp: 13,
    atk: 2,
    def: 1,
    dmgDie: 8,
    weapon: 'Hazel crook',
    glint: 3,
    abilities: ['ss_ab_herd', 'ss_ab_lasso', 'ss_ab_antler'],
    levels: {
      2: { maxHp: 4, def: 1, traits: { con: 1 }, ability: 'ss_ab_thickcoat' },
      3: { maxHp: 3, atk: 1, traits: { str: 1 }, ability: 'ss_ab_sledrun' },
    },
  },
  {
    id: 'ss_marigold',
    name: 'Marigold Puddingstone',
    title: 'Kitchen Witch',
    blurb: 'Marigold runs the cocoa house on Pinecrook’s green, where the fire has not gone out in sixty winters. Her recipes are mostly spice and partly spell, and she will not say which part is which.',
    color: '#e0a23a',
    traits: { str: -1, dex: 0, con: 1, int: 1, wis: 3, cha: 2 },
    maxHp: 11,
    atk: 1,
    def: 2,
    dmgDie: 8,
    weapon: 'Copper ladle',
    glint: 5,
    abilities: ['ss_ab_hearthlore', 'ss_ab_spicedcocoa', 'ss_ab_pepperspark'],
    levels: {
      2: { maxHp: 3, atk: 1, traits: { wis: 1 }, ability: 'ss_ab_warmhands' },
      3: { maxHp: 3, def: 1, traits: { con: 1 }, ability: 'ss_ab_gingersnap' },
    },
  },
  {
    id: 'ss_nell',
    name: 'Nell Carroway',
    title: 'Bellringer',
    blurb: 'Nell rings the old bell in Pinecrook’s tower every evening of December and leads the carols on the green. She has a voice that carries across the frozen lake, and a temper that carries further.',
    color: '#3f8f6a',
    traits: { str: 1, dex: 1, con: 1, int: 0, wis: 1, cha: 3 },
    maxHp: 12,
    atk: 2,
    def: 1,
    dmgDie: 8,
    weapon: 'Brass handbell',
    glint: 4,
    abilities: ['ss_ab_carol', 'ss_ab_clearnote', 'ss_ab_handbell'],
    levels: {
      2: { maxHp: 3, def: 1, traits: { cha: 1 }, ability: 'ss_ab_chorus' },
      3: { maxHp: 4, atk: 1, traits: { con: 1 }, ability: 'ss_ab_descant' },
    },
  },
]

const enemies: EnemyDef[] = [
  { id: 'ss_hushling', name: 'Hushling', ac: 10, toughness: 4, hits: 10, dmg: 1, text: 'A snow-imp the size of a cat. It eats sound: footsteps, laughter, sleigh bells. Where it has been, the snow is perfectly quiet.' },
  { id: 'ss_sleetwolf', name: 'Sleet Wolf', ac: 11, toughness: 5, hits: 11, dmg: 2, text: 'A wolf made of driven sleet. It howls without any noise at all.' },
  { id: 'ss_toysoldier', name: 'Frost-Wound Toy Soldier', ac: 11, toughness: 4, hits: 11, dmg: 2, text: 'A wind-up soldier as tall as a man, its key turned by cold fingers that aren’t there.' },
  { id: 'ss_coalgoblin', name: 'Coal Goblin', ac: 10, toughness: 5, hits: 11, dmg: 2, text: 'A sulky goblin who has received coal every year since anyone can remember, and has decided it is everyone else’s fault.' },
  { id: 'ss_icicle', name: 'Icicle Bat', ac: 12, toughness: 3, hits: 11, dmg: 1, text: 'Hangs from the eaves pretending to be an icicle. Not very good at pretending.' },
  // Bosses
  { id: 'ss_gingerbrute', name: 'The Gingerbread Brute', ac: 12, toughness: 6, hits: 12, dmg: 3, text: 'A gingerbread giant baked wrong: the Hush breathed on the dough. Its icing smile is frozen and its gumdrop buttons are hard as stone.' },
  { id: 'ss_nutgeneral', name: 'The Nutcracker General', ac: 13, toughness: 7, hits: 14, dmg: 4, text: 'The workshop’s great nutcracker, twelve feet of painted oak, now marching for the Hush with jaws that could crack a cartwheel.' },
  { id: 'ss_snowwyrm', name: 'The Snow Wyrm', ac: 14, toughness: 8, hits: 16, dmg: 5, text: 'A serpent of packed snow and blue ice that wakes only on the longest night, and swallows whole villages’ worth of sound.' },
  { id: 'ss_hush', name: 'The Hush', ac: 15, toughness: 9, hits: 17, dmg: 5, text: 'A tall, pale figure in a gown of falling snow, with no mouth at all. She would like the world to be quiet now, please. Forever.' },
]

const items: ItemDef[] = [
  { id: 'ss_cocoa', name: 'Mug of Cocoa', kind: 'heal', die: 4, bonus: 3, price: 5, text: 'Recover d4+3 health. Not usable during combat rounds.' },
  { id: 'ss_figgypudding', name: 'Figgy Pudding', kind: 'heal', die: 8, bonus: 3, price: 9, text: 'Recover d8+3 health. Heavy enough to stop a door. Not usable during combat rounds.' },
  { id: 'ss_candycane', name: 'Candy Cane', kind: 'pageBonus', stat: 'atk', amount: 1, price: 4, text: '+1 Attack for the rest of today. Sharpened to a point.' },
  { id: 'ss_jinglebell', name: 'Loose Jingle Bell', kind: 'slotDie', die: 6, slots: ['check', 'defense'], price: 6, text: 'Ring it once: add d6 to a check or Defense roll. Used up.' },
  { id: 'ss_scarf', name: 'Knitted Scarf', kind: 'gear', slot: 'body', bonus: { maxHp: 3 }, price: 14, text: '+3 max health. Far too long, which is the point.' },
  { id: 'ss_mittens', name: 'Toymaker’s Mittens', kind: 'gear', slot: 'hands', bonus: { atk: 1 }, price: 15, text: '+1 Attack. The fingertips fold back for fiddly work.' },
  { id: 'ss_snowboots', name: 'Snowshoe Boots', kind: 'gear', slot: 'feet', bonus: { dex: 1, def: 1 }, price: 16, text: '+1 Dexterity, +1 Defense.' },
  { id: 'ss_bobblehat', name: 'Bobble Hat', kind: 'gear', slot: 'head', bonus: { def: 1, cha: 1 }, price: 12, text: '+1 Defense, +1 Charisma. Nobody can stay cross with a bobble hat.' },
  { id: 'ss_starshard', name: 'Star-Lantern Shard', kind: 'gear', slot: 'trinket', bonus: { wis: 1, def: 1 }, price: 0, text: '+1 Wisdom, +1 Defense. A sliver of the light that guides the sleigh. It hums a carol only you can hear.', magical: true },
]

export const SANTA_CONTENT: ContentPack = { abilities, heroes, enemies, items }
