// Brightwatch's own content pack: the three heroes added for the hero-trial
// weeks, plus this campaign's enemies and items. (Wren, Isolde and Corin and
// the shared items live in the base content files.)
import type { ContentPack } from '../../../engine/types'
import { YEAR_ABILITIES, YEAR_ENEMIES, YEAR_ITEMS, YEAR_LEVELS, YEAR_MEMBERS } from './content-year'

export const BRIGHTWATCH_CONTENT: ContentPack = {
  abilities: [
    // Sister Ottilie Venn — Lamp Chaplain
    { id: 'bw-compassion', name: 'Compassion', kind: 'passive', bonus: 2, tags: ['social'], text: '+2 to comforting, persuading and calming others.' },
    { id: 'bw-mendingLight', name: 'Mending Light', kind: 'heal', per: 'rest', uses: 2, die: 8, bonus: 1, text: 'Twice per Rest: recover d8+1 health.' },
    { id: 'bw-wardOfDawn', name: 'Ward of Dawn', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['defense'], text: 'Twice per Rest: add d6 to a Defense roll.' },
    { id: 'bw-blessing', name: 'Blessing', kind: 'addDie', per: 'page', uses: 1, die: 4, slots: ['check', 'attack'], text: 'Once per page: add d4 to a check or Attack roll.' },

    // Hask Driftwood — Gull-Cliff Archer
    { id: 'bw-keenEye', name: 'Keen Eye', kind: 'passive', bonus: 2, tags: ['perception'], text: '+2 to spotting, tracking and keeping watch.' },
    { id: 'bw-aimedShot', name: 'Aimed Shot', kind: 'addDie', per: 'rest', uses: 2, die: 6, slots: ['attack'], text: 'Twice per Rest: add d6 to an Attack roll.' },
    { id: 'bw-steadyBreath', name: 'Steady Breath', kind: 'reroll', per: 'page', uses: 1, text: 'Once per page: reroll any d20 and take the new result.' },
    { id: 'bw-volley', name: 'Volley', kind: 'addDie', per: 'rest', uses: 1, die: 10, slots: ['damage'], text: 'Once per Rest: add d10 to a Damage roll.' },

    // Jory Saltmarsh — Dockyard Brawler
    { id: 'bw-brawn', name: 'Brawn', kind: 'passive', bonus: 2, tags: ['physical'], text: '+2 to lifting, hauling, climbing and shoving.' },
    { id: 'bw-haymaker', name: 'Haymaker', kind: 'addDie', per: 'rest', uses: 2, die: 8, slots: ['damage'], text: 'Twice per Rest: add d8 to a Damage roll.' },
    { id: 'bw-shrugItOff', name: 'Shrug It Off', kind: 'heal', per: 'page', uses: 1, die: 4, bonus: 1, text: 'Once per page: recover d4+1 health.' },
    ...YEAR_ABILITIES,
    { id: 'bw-grapple', name: 'Grapple', kind: 'addDie', per: 'page', uses: 1, die: 4, slots: ['attack', 'defense'], text: 'Once per page: add d4 to an Attack or Defense roll.' },
  ],

  heroes: [
    {
      id: 'bw-ottilie',
      name: 'Ottilie Venn',
      title: 'Lamp Chaplain',
      blurb:
        'She keeps the little chapel at the foot of the tower, where the lamp’s first flame is said to have been lit. She believes the fog can be talked to, and she is not entirely wrong.',
      color: '#f0d27a',
      traits: { str: 0, dex: -1, con: 1, int: 1, wis: 3, cha: 1 },
      maxHp: 11,
      atk: 1,
      def: 2,
      dmgDie: 8,
      weapon: 'Lantern mace',
      glint: 3,
      abilities: ['bw-compassion', 'bw-mendingLight', 'bw-wardOfDawn'],
      levels: { 2: { maxHp: 3, atk: 1, traits: { wis: 1 }, ability: 'bw-blessing' }, ...YEAR_LEVELS['bw-ottilie'] },
    },
    {
      id: 'bw-hask',
      name: 'Hask Driftwood',
      title: 'Gull-Cliff Archer',
      blurb:
        'Raised among the cliff-nesters who climb for eggs above the breakers, Hask can hit a gull on the wing in a gale. He talks to almost no one and notices almost everything.',
      color: '#7fbf8e',
      traits: { str: 0, dex: 3, con: 1, int: 0, wis: 2, cha: -1 },
      maxHp: 10,
      atk: 3,
      def: 2,
      dmgDie: 8,
      weapon: 'Cliff longbow',
      glint: 4,
      abilities: ['bw-keenEye', 'bw-aimedShot', 'bw-steadyBreath'],
      levels: { 2: { maxHp: 3, def: 1, traits: { dex: 1 }, ability: 'bw-volley' }, ...YEAR_LEVELS['bw-hask'] },
    },
    {
      id: 'bw-jory',
      name: 'Jory Saltmarsh',
      title: 'Dockyard Brawler',
      blurb:
        'Jory has hauled cargo on the Brightwatch quays since before she could see over the crates. She settles arguments with her fists, apologizes afterward, and means both.',
      color: '#d9785a',
      traits: { str: 3, dex: 1, con: 2, int: -2, wis: 0, cha: 0 },
      maxHp: 14,
      atk: 2,
      def: 1,
      dmgDie: 10,
      weapon: 'Iron-banded cargo hook',
      glint: 5,
      abilities: ['bw-brawn', 'bw-haymaker', 'bw-shrugItOff'],
      levels: { 2: { maxHp: 4, atk: 1, traits: { con: 1 }, ability: 'bw-grapple' }, ...YEAR_LEVELS['bw-jory'] },
    },
  ],

  enemies: [
    { id: 'bw-inkEel', name: 'Ink Eel', ac: 12, toughness: 5, hits: 12, dmg: 2, text: 'A slick black eel that spits clouds of archive ink.' },
    { id: 'bw-dockThug', name: 'Syndicate Thug', ac: 12, toughness: 6, hits: 12, dmg: 3, text: 'Big, bored, and paid by the bruise.' },
    { id: 'bw-fogWight', name: 'Fog-Wight', ac: 13, toughness: 6, hits: 13, dmg: 3, text: 'A sleepwalker the fog has hollowed out and filled with itself.' },
    { id: 'bw-wrecker', name: 'Reef Wrecker', ac: 12, toughness: 5, hits: 13, dmg: 3, text: 'Lights false beacons on the reef and loots what washes up.' },
    { id: 'bw-paleHerald', name: 'The Pale Herald', ac: 15, toughness: 8, hits: 15, dmg: 5, text: 'A giant shape of fog wearing a crown of drowned bells.' },
    { id: 'bw-reefWraith', name: 'Reef Wraith', ac: 13, toughness: 6, hits: 13, dmg: 3, text: 'The cold outline of a sailor who never made it home.' },
    { id: 'bw-bellWarden', name: 'The Bell-Warden', ac: 14, toughness: 7, hits: 14, dmg: 4, text: 'Guardian of the second bell, armored in barnacled brass.' },
    ...YEAR_ENEMIES,
  ],

  members: YEAR_MEMBERS,

  items: [
    { id: 'bw-archiveScroll', name: 'Tide-Script Scroll', kind: 'pageBonus', stat: 'int', amount: 3, price: 5, text: '+3 Intellect for the rest of today.' },
    { id: 'bw-chapelCandle', name: 'Chapel Candle', kind: 'heal', die: 4, bonus: 4, price: 6, text: 'Recover d4+4 health. Not usable during combat rounds.' },
    { id: 'bw-fogglass', name: 'Fogglass Lens', kind: 'gear', slot: 'trinket', bonus: { wis: 1, def: 1 }, price: 16, text: '+1 Wisdom, +1 Defense. Hums faintly near the fog.' },
    ...YEAR_ITEMS,
  ],
}

/** The six heroes of the trial weeks, in the order they're played. */
export const TRIAL_HEROES = ['wren', 'isolde', 'corin', 'bw-ottilie', 'bw-hask', 'bw-jory']
