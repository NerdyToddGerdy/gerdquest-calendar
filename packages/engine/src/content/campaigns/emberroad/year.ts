// The Ember Road — content for the rest of the year (Feb–Dec): level 3–8
// progression for all six heroes, plus new abilities, items, enemies and
// followers. Merged into the campaign pack in content.ts.
import type { AbilityDef, EnemyDef, ItemDef, LevelSpec, MemberDef } from '../../../engine/types'

export const YEAR_ABILITIES: AbilityDef[] = [
  // Garrick
  { id: 'er_ab_anvilvoice', name: 'Anvil Voice', kind: 'passive', bonus: 2, tags: ['social'], text: '+2 to commanding, rallying and intimidating.' },
  { id: 'er_ab_earthshaker', name: 'Earthshaker', kind: 'addDie', per: 'rest', uses: 1, die: 10, slots: ['damage'], text: 'Once per Rest: add d10 to a Damage roll.' },
  // Ysolde
  { id: 'er_ab_frostward', name: 'Frost Ward', kind: 'heal', per: 'rest', uses: 99, die: 4, bonus: 3, cost: { pool: 'spell', amount: 1 }, text: '1 Spell: knit wounds shut with rime — recover d4+3 health.' },
  { id: 'er_ab_blizzard', name: 'Blizzard', kind: 'addDie', per: 'rest', uses: 99, die: 12, slots: ['damage'], cost: { pool: 'spell', amount: 3 }, text: '3 Spell: add d12 to a Damage roll.' },
  // Pell
  { id: 'er_ab_cheapshot', name: 'Cheap Shot', kind: 'addDie', per: 'page', uses: 1, die: 4, slots: ['attack'], text: 'Once per page: add d4 to an Attack roll.' },
  { id: 'er_ab_vanish', name: 'Vanishing Strike', kind: 'addDie', per: 'rest', uses: 1, die: 10, slots: ['damage'], text: 'Once per Rest: add d10 to a Damage roll.' },
  // Odalys
  { id: 'er_ab_sanctuary', name: 'Sanctuary', kind: 'heal', per: 'rest', uses: 99, die: 8, bonus: 2, cost: { pool: 'spell', amount: 2 }, text: '2 Spell: recover d8+2 health.' },
  { id: 'er_ab_dawnstrike', name: 'Dawnstrike', kind: 'addDie', per: 'rest', uses: 99, die: 10, slots: ['damage'], cost: { pool: 'spell', amount: 3 }, text: '3 Spell: add d10 to a Damage roll.' },
  // Kesh
  { id: 'er_ab_ironbody', name: 'Iron Body', kind: 'heal', per: 'rest', uses: 99, die: 6, bonus: 2, cost: { pool: 'chi', amount: 1 }, text: '1 Chi: recover d6+2 health.' },
  { id: 'er_ab_ninewinds', name: 'Strike of Nine Winds', kind: 'addDie', per: 'rest', uses: 99, die: 10, slots: ['damage'], cost: { pool: 'chi', amount: 3 }, text: '3 Chi: add d10 to a Damage roll.' },
  // Wenna
  { id: 'er_ab_fieldcraft', name: 'Fieldcraft', kind: 'heal', per: 'rest', uses: 1, die: 6, bonus: 2, text: 'Once per Rest: dress your wounds — recover d6+2 health.' },
  { id: 'er_ab_heartseeker', name: 'Heartseeker', kind: 'addDie', per: 'rest', uses: 1, die: 10, slots: ['damage'], text: 'Once per Rest: add d10 to a Damage roll.' },
  // Lent by followers
  { id: 'er_ab_lampwright', name: 'Lampwright’s Eye', kind: 'passive', bonus: 2, tags: ['lore'], text: '+2 to lore and waystone checks (from Marta).' },
  { id: 'er_ab_glassfocus', name: 'Glassfire', kind: 'addDie', per: 'rest', uses: 1, die: 6, slots: ['damage'], text: 'Once per Rest (from Durn): add d6 to a Damage roll.' },
  { id: 'er_ab_dunewise', name: 'Dunewise', kind: 'passive', bonus: 2, tags: ['travel', 'perception'], text: '+2 to travel and spotting danger (from Saffi).' },
  { id: 'er_ab_rallybell', name: 'Rallying Bell', kind: 'heal', per: 'rest', uses: 1, die: 8, bonus: 2, text: 'Once per Rest (from Brann): recover d8+2 health.' },
]

/** Levels 3–8 for every chosen hero. */
export const YEAR_LEVELS: Record<string, Record<number, LevelSpec>> = {
  er_garrick: {
    3: { maxHp: 4 },
    4: { maxHp: 4, traits: { str: 1 }, ability: 'er_ab_anvilvoice' },
    5: { maxHp: 4, atk: 1, dmgDie: 10 },
    6: { maxHp: 4, def: 1, ability: 'er_ab_earthshaker' },
    7: { maxHp: 4, atk: 1, traits: { con: 1 } },
    8: { maxHp: 5, def: 1 },
  },
  er_ysolde: {
    3: { maxHp: 3, pools: { spell: 1 } },
    4: { maxHp: 3, traits: { int: 1 }, ability: 'er_ab_frostward' },
    5: { maxHp: 3, atk: 1, dmgDie: 8, pools: { spell: 1 } },
    6: { maxHp: 3, def: 1, pools: { spell: 2 }, ability: 'er_ab_blizzard' },
    7: { maxHp: 3, atk: 1, traits: { wis: 1 } },
    8: { maxHp: 4, def: 1, pools: { spell: 2 } },
  },
  er_pell: {
    3: { maxHp: 4, def: 1 },
    4: { maxHp: 4, traits: { cha: 1 }, ability: 'er_ab_cheapshot' },
    5: { maxHp: 4, atk: 1, dmgDie: 8 },
    6: { maxHp: 4, def: 1, ability: 'er_ab_vanish' },
    7: { maxHp: 5, atk: 1, traits: { dex: 1 } },
    8: { maxHp: 5, def: 1 },
  },
  er_odalys: {
    3: { maxHp: 3, pools: { spell: 1 } },
    4: { maxHp: 3, traits: { wis: 1 }, ability: 'er_ab_sanctuary' },
    5: { maxHp: 4, atk: 1, dmgDie: 8, pools: { spell: 1 } },
    6: { maxHp: 3, def: 1, pools: { spell: 2 }, ability: 'er_ab_dawnstrike' },
    7: { maxHp: 4, atk: 1, traits: { con: 1 } },
    8: { maxHp: 4, def: 1, pools: { spell: 2 } },
  },
  er_kesh: {
    3: { maxHp: 3, pools: { chi: 1 } },
    4: { maxHp: 3, traits: { dex: 1 }, ability: 'er_ab_ironbody' },
    5: { maxHp: 4, atk: 1, dmgDie: 8, pools: { chi: 1 } },
    6: { maxHp: 3, def: 1, pools: { chi: 2 }, ability: 'er_ab_ninewinds' },
    7: { maxHp: 4, atk: 1, traits: { wis: 1 } },
    8: { maxHp: 4, def: 1, pools: { chi: 2 } },
  },
  er_wenna: {
    3: { maxHp: 3, atk: 1 },
    4: { maxHp: 3, traits: { wis: 1 }, ability: 'er_ab_fieldcraft' },
    5: { maxHp: 4, def: 1, dmgDie: 10 },
    6: { maxHp: 3, atk: 1, ability: 'er_ab_heartseeker' },
    7: { maxHp: 4, def: 1, traits: { dex: 1 } },
    8: { maxHp: 4, atk: 1 },
  },
}

export const YEAR_ITEMS: ItemDef[] = [
  { id: 'er_greater', name: 'Greater Hearthwarm', kind: 'heal', die: 10, bonus: 3, price: 10, text: 'Recover d10+3 health. Not usable during combat rounds.' },
  { id: 'er_poultice', name: 'Dawnmoss Poultice', kind: 'cure', price: 9, text: 'Draws out an old hurt: heals one lingering Injury, Trauma or Wound.' },
  { id: 'er_blastpot', name: 'Forge Blastpot', kind: 'slotDie', die: 10, slots: ['damage'], price: 9, text: 'Add d10 to a Damage roll.' },
  { id: 'er_steelbrew', name: 'Steelbrew', kind: 'slotDie', die: 6, slots: ['attack'], price: 6, text: 'Add d6 to an Attack roll.' },
  { id: 'er_honeycake', name: 'Fair Honeycake', kind: 'pageBonus', stat: 'dex', amount: 0, die: 6, price: 4, text: '+d6 Dexterity for the rest of today.' },
  { id: 'er_owlwine', name: 'Owl-Eye Wine', kind: 'pageBonus', stat: 'wis', amount: 0, die: 6, price: 4, text: '+d6 Wisdom for the rest of today.' },
  // Upgrades
  { id: 'er_glasslens', name: 'Lamp-Glass Lens', kind: 'upgrade', bonus: { roll: 2 }, tags: ['lore'], stackMax: 1, price: 10, text: '+2 on lore checks.' },
  { id: 'er_pony', name: 'Fell Pony', kind: 'upgrade', bonus: { wis: 3 }, tags: ['travel'], stackMax: 1, price: 22, text: '+3 Wisdom on travel checks (replaces the need to walk everywhere).' },
  { id: 'er_rune', name: 'Hearth-Rune Etching', kind: 'upgrade', bonus: { dmg: 1 }, stackMax: 2, price: 14, text: '+1 to Damage rolls. Stacks up to 2 times.' },
  // Gear
  { id: 'er_frostamulet', name: 'Frostward Amulet', kind: 'gear', slot: 'trinket', bonus: { maxHp: 3, con: 1 }, magical: true, price: 18, text: 'Magical. +3 max health, +1 Constitution.' },
  { id: 'er_mossgloves', name: 'Mossbane Gloves', kind: 'gear', slot: 'hands', bonus: { atk: 1, dex: 1 }, magical: true, price: 16, text: 'Magical. +1 Attack, +1 Dexterity.' },
  { id: 'er_glassmail', name: 'Forge-Glass Mail', kind: 'gear', slot: 'body', bonus: { maxHp: 4, def: 1 }, magical: true, price: 30, text: 'Magical. +4 max health, +1 Defense.' },
  { id: 'er_striders', name: 'Kingsfair Striders', kind: 'gear', slot: 'feet', bonus: { dex: 1 }, price: 12, text: '+1 Dexterity.' },
  { id: 'er_varrowhelm', name: 'Varrow’s Helm', kind: 'gear', slot: 'head', bonus: { def: 2 }, magical: true, price: 28, text: 'Magical. +2 Defense.' },
  { id: 'er_ashcloak', name: 'Ashen Cloak', kind: 'gear', slot: 'body', bonus: { maxHp: 6 }, price: 24, text: '+6 max health.' },
  { id: 'er_emberbrand', name: 'Emberbrand Gauntlets', kind: 'gear', slot: 'hands', bonus: { atk: 2 }, magical: true, price: 32, text: 'Magical. +2 Attack.' },
  { id: 'er_keepercrown', name: 'The Keeper’s Crown', kind: 'gear', slot: 'head', bonus: { def: 2, wis: 2 }, magical: true, price: 40, text: 'Magical. +2 Defense, +2 Wisdom. Every waystone answers to it.' },
]

/** ac = Attack to hit · toughness = Damage to defeat · hits = its attack vs your 10 + Defense · dmg = damage. */
export const YEAR_ENEMIES: EnemyDef[] = [
  // Feb
  { id: 'er_houndmaster', name: 'Hush Houndmaster', ac: 11, toughness: 5, hits: 13, dmg: 2, text: 'A handler in white with a silent whistle and a whip of braided ice.' },
  { id: 'er_snowbear', name: 'Rime Bear', ac: 11, toughness: 6, hits: 12, dmg: 3, text: 'A bear woken too early, its fur frozen into plates.' },
  { id: 'er_rimewight', name: 'Rime Wight', ac: 12, toughness: 4, hits: 13, dmg: 2, text: 'A frozen traveler that still walks the road it died on.' },
  { id: 'er_kennelmaster', name: 'The Kennelmaster', ac: 13, toughness: 5, hits: 15, dmg: 3, text: 'Tall as a doorway, with a hound’s skull for a mask and a pack that obeys her silence.' },
  // Mar
  { id: 'er_drowned', name: 'Drowned Lamplighter', ac: 12, toughness: 5, hits: 13, dmg: 2, text: 'A lamplighter pulled under the floodwater, still carrying a dead wick.' },
  { id: 'er_eels', name: 'Mere-Eel Swarm', ac: 12, toughness: 3, hits: 13, dmg: 2, text: 'Black eels that hunt in a knot.' },
  { id: 'er_marshtroll', name: 'Reed Troll', ac: 11, toughness: 7, hits: 14, dmg: 3, text: 'Slow, wet, enormous, and very hungry after a long winter.' },
  { id: 'er_glasswater', name: 'Old Glasswater', ac: 14, toughness: 7, hits: 15, dmg: 4, text: 'The spirit of the Mere, bargained into the Hush’s service. Her skin is a skin of ice.' },
  // Apr
  { id: 'er_mossling', name: 'Mossling', ac: 12, toughness: 4, hits: 14, dmg: 2, text: 'A bundle of quiet-moss walking on borrowed sticks.' },
  { id: 'er_hushfarmer', name: 'Hushed Farmhand', ac: 11, toughness: 5, hits: 13, dmg: 2, text: 'A farmer the moss has made quiet. They don’t want to fight; they can’t stop.' },
  { id: 'er_mossshepherd', name: 'The Moss Shepherd', ac: 15, toughness: 9, hits: 17, dmg: 4, text: 'A crook-backed thing in a cloak of quiet-moss, tending its silent flock.' },
  // May
  { id: 'er_glassmite', name: 'Glass Mite', ac: 13, toughness: 4, hits: 14, dmg: 2, text: 'A crawling shard of waystone glass gone wrong.' },
  { id: 'er_cragcat', name: 'Crag Cat', ac: 13, toughness: 6, hits: 14, dmg: 3, text: 'A grey mountain cat with eyes like lamps.' },
  { id: 'er_forgeguard', name: 'Forge Sentinel', ac: 14, toughness: 7, hits: 15, dmg: 3, text: 'An iron guardian left to keep the Ember Forge — and keeping it for the wrong masters now.' },
  { id: 'er_colossus', name: 'The Glass Colossus', ac: 16, toughness: 10, hits: 17, dmg: 5, text: 'A giant of fused waystone glass with the Hush’s silence burning blue inside it.' },
  // Jun
  { id: 'er_duelist', name: 'Masked Duelist', ac: 14, toughness: 6, hits: 15, dmg: 3, text: 'A court blade in a white mask, paid in Hush silver.' },
  { id: 'er_sellsword', name: 'Varrow Sellsword', ac: 13, toughness: 7, hits: 15, dmg: 3, text: 'Hired muscle in House Varrow’s grey.' },
  { id: 'er_varrow', name: 'Sir Edric Varrow', ac: 16, toughness: 10, hits: 18, dmg: 5, text: 'Kingsfair’s tourney champion and the Hush’s patron, armored like a cathedral.' },
  // Jul
  { id: 'er_ashjackal', name: 'Ash Jackal', ac: 15, toughness: 6, hits: 16, dmg: 3, text: 'A grey scavenger of the Ashflats, never alone.' },
  { id: 'er_saltraider', name: 'Salt Raider', ac: 15, toughness: 7, hits: 16, dmg: 4, text: 'A caravan-robber wrapped in salt-stiff rags.' },
  { id: 'er_cinderwyrm', name: 'The Cinderwyrm', ac: 17, toughness: 12, hits: 18, dmg: 6, text: 'A wyrm that sleeps in the ash and wakes when the Hush sings to it.' },
  // Aug
  { id: 'er_hushsister', name: 'Hush Sister', ac: 16, toughness: 7, hits: 17, dmg: 4, text: 'A nun of the Abbey of Silence, fast and wordless.' },
  { id: 'er_voiceless', name: 'Voiceless Knight', ac: 16, toughness: 8, hits: 17, dmg: 4, text: 'A knight sworn to the Abbess, helm sealed with wax.' },
  { id: 'er_vigilant', name: 'The Vigilant', ac: 17, toughness: 13, hits: 18, dmg: 6, text: 'The Abbey’s gatekeeper: four arms, no eyes, never asleep.' },
  // Sep
  { id: 'er_spearline', name: 'Hush Spearline', ac: 16, toughness: 9, hits: 17, dmg: 5, text: 'Ranks of white-robed spears marching in perfect silence.' },
  { id: 'er_ram', name: 'Snuffer Ram', ac: 15, toughness: 11, hits: 17, dmg: 6, text: 'A siege engine with a great iron snuffer for a head.' },
  { id: 'er_tender', name: 'The Siege-Tender', ac: 18, toughness: 14, hits: 19, dmg: 6, text: 'The Hush’s general, who has never spoken and never lost.' },
  // Oct
  { id: 'er_unlitmonk', name: 'Unlit Monk', ac: 17, toughness: 9, hits: 18, dmg: 5, text: 'A monk of the Underroad who has never seen a flame.' },
  { id: 'er_tunnelhorror', name: 'Tunnel Horror', ac: 17, toughness: 11, hits: 18, dmg: 6, text: 'Something long and pale that lives where the road’s roots go.' },
  { id: 'er_unlitsaint', name: 'The Unlit Saint', ac: 19, toughness: 15, hits: 20, dmg: 7, text: 'The first keeper ever to let a stone go dark — and the Hush’s first saint.' },
  // Nov
  { id: 'er_rimeknight', name: 'Rime Knight', ac: 19, toughness: 11, hits: 20, dmg: 7, text: 'A knight of the Long Dark, armor grown from frost.' },
  { id: 'er_wintergiant', name: 'Winter Giant', ac: 17, toughness: 15, hits: 19, dmg: 8, text: 'A giant walking south ahead of the cold.' },
  { id: 'er_abbess', name: 'Abbess Maud Sallow', ac: 20, toughness: 17, hits: 21, dmg: 8, text: 'The Hush’s voice that never speaks. Her silence puts out torches at forty paces.' },
  // Dec
  { id: 'er_shard', name: 'Shard of the Long Dark', ac: 20, toughness: 12, hits: 20, dmg: 7, text: 'A splinter of the old winter, shaped like whoever looks at it.' },
  { id: 'er_longdark', name: 'The Long Dark', ac: 21, toughness: 19, hits: 22, dmg: 9, text: 'Not a creature: a season that learned to want.' },
]

const follower = (m: Omit<MemberDef, 'kind' | 'maxHp' | 'abilities'>): MemberDef => ({ kind: 'critter', maxHp: 1, abilities: [], ...m })

export const YEAR_MEMBERS: MemberDef[] = [
  follower({ id: 'er_f_marta', name: 'Marta Lampwright', fee: 10, follower: { upkeep: 2, grants: ['er_ab_lampwright'] }, text: 'Bellhaven’s lampwright. She can read a dead waystone like a letter.' }),
  follower({ id: 'er_f_durn', name: 'Durn Glassblower', fee: 14, follower: { upkeep: 3, grants: ['er_ab_glassfocus'] }, text: 'The last glassblower of the Ember Forge, with a temper as hot as his furnace.' }),
  follower({ id: 'er_f_saffi', name: 'Saffi of the Caravans', fee: 12, follower: { upkeep: 3, grants: ['er_ab_dunewise'] }, text: 'A caravan guide who has crossed the Ashflats nineteen times and lost only one camel.' }),
  follower({ id: 'er_f_brann', name: 'Brann the Bellringer', fee: 16, follower: { upkeep: 4, grants: ['er_ab_rallybell'] }, text: 'Greyfold’s bellringer. When he rings, people stand up straighter.' }),
]
