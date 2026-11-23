// Week 7 — the chosen warden leads the expedition to the second bell.
import type { Day, Option } from '../../../../engine/types'
import { TRIAL_HEROES } from '../content'
import { WEEKEND_MARKET } from './helpers'

const CHOICE_LABELS: Record<string, string> = {
  wren: 'Wren Ashvale, Lantern Warden — steady, tough, and first through the door',
  isolde: 'Isolde Brack, Tidecaller — who can read the tide and ask it for favors',
  corin: 'Corin Vale, Gutter Charmer — quick hands, quicker tongue',
  'bw-ottilie': 'Ottilie Venn, Lamp Chaplain — who keeps everyone else standing',
  'bw-hask': 'Hask Driftwood, Gull-Cliff Archer — who sees trouble a mile off',
  'bw-jory': 'Jory Saltmarsh, Dockyard Brawler — who held the door against the Herald',
}

/** One pick-one option per trial hero; the chosen warden starts fresh with an expedition kit. */
const choices: Option[] = TRIAL_HEROES.map((heroId, i) => ({
  label: `${'ABCDEF'[i]}) ${CHOICE_LABELS[heroId]}`,
  result: 'Hale nods once and writes the name in her ledger.',
  effects: [
    { type: 'setHero', heroId },
    { type: 'item', id: 'ration', qty: 3 },
    { type: 'item', id: 'mendwater', qty: 2 },
    { type: 'glint', amount: 6 },
  ],
}))

export const WEEK7: Day[] = [
  {
    id: 'w7-the-choice',
    month: 2,
    day: 12,
    title: 'Hale’s Choice',
    scene: 'tower',
    text:
      'The tablets were right. The second bell is still ringing out on the reef, but more slowly every night, and when it stops, the Pale Tide will wake. Someone must sail out and find it. Captain Hale lays her ledger open on the table in front of all six wardens. “One of you leads,” she says. “The rest hold the wall. Choose.”',
    note: 'Choose the warden who will carry the story from here on. They lead with a captain’s commission (a level up).',
    steps: [
      { title: '1. Who leads the expedition?', options: choices },
      {
        title: '2. The captain’s commission',
        options: [
          {
            label: 'Accept the commission',
            result: 'Hale pins the lamp badge to your coat herself. Everything the last six weeks taught Brightwatch now rests on your shoulders.',
            effects: [{ type: 'levelUp' }],
          },
        ],
      },
    ],
    shop: { items: [...WEEKEND_MARKET, { id: 'tidewraps', price: 10 }, { id: 'wardencoat', price: 12 }, { id: 'bw-fogglass', price: 16 }] },
  },
  {
    id: 'w7-setting-sail',
    month: 2,
    day: 13,
    title: 'Setting Sail',
    scene: 'harbor',
    text:
      'The Marrow Gull — patched, re-rigged, and crewed by the sailors you pulled off the reef — slips out of the harbor at first light, heading for the second bell.',
    note: 'Do both tasks.',
    steps: [
      {
        title: '1. The crossing',
        options: [
          {
            label: 'Sail out past the reef',
            result: 'A long day at sea. The crew shares their food with you.',
            effects: [{ type: 'travel', rations: 1 }],
          },
        ],
      },
      {
        title: '2. The crew',
        options: [
          {
            label: 'Earn the crew’s trust',
            check: { trait: 'cha', tags: ['social'] },
            bands: [
              { max: 10, text: 'They’re polite. They’re also clearly wondering if you’ll get them killed.' },
              { min: 11, text: 'By evening they’re singing, and they’d follow you anywhere.', effects: [{ type: 'virtue', amount: 1 }, { type: 'pageBonus', stat: 'roll', amount: 1 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'w7-glass-sea',
    month: 2,
    day: 14,
    title: 'The Glass Sea',
    scene: 'seacave',
    text:
      'Past the reef the water goes flat and still, and the fog lies on it like frost. Under the surface, fogglass grows in great pale fans. The compass spins.',
    note: 'Choose how to navigate.',
    steps: [
      {
        options: [
          {
            label: 'A) Steer by the sound of the bell',
            check: { trait: 'wis', tags: ['perception'] },
            bands: [
              { max: 11, text: 'The sound comes from everywhere at once. You lose a day going in circles.', effects: [{ type: 'travel', rations: 1 }] },
              { min: 12, text: 'You hear it, faint and true, and set course.' },
            ],
          },
          {
            label: 'B) Follow the fogglass fans toward where they grow thickest',
            check: { trait: 'int', tags: ['lore'] },
            bands: [
              { max: 11, text: 'The fans lead you onto a shoal. The hull groans.', effects: [{ type: 'damage', amount: 2 }] },
              { min: 12, text: 'The glass grows thicker and brighter. You’re close.', effects: [{ type: 'glint', amount: 2 }] },
            ],
          },
        ],
      },
    ],
    icons: [{ kind: 'loot', x: 40, y: 78 }],
  },
  {
    id: 'w7-island',
    month: 2,
    day: 15,
    title: 'The Drowned Lighthouse',
    scene: 'tower',
    text:
      'Out of the fog rises an island no chart shows: a black rock with the ruin of a lighthouse on it, older than Brightwatch, its tower half sunk into the sea. The bell is somewhere beneath it.',
    note: 'Do both tasks.',
    steps: [
      {
        title: '1. Land',
        options: [
          {
            label: 'Bring the longboat in through the rocks',
            check: { trait: 'dex', tags: ['physical'] },
            bands: [
              { max: 10, text: 'The longboat cracks a plank on the rocks. Everyone gets wet.', effects: [{ type: 'damage', amount: 1 }] },
              { min: 11, text: 'You land cleanly on a shelf of black stone.' },
            ],
          },
        ],
      },
      {
        title: '2. Scout the ruin',
        options: [
          {
            label: 'Search for a way down to the bell',
            check: { trait: 'wis', tags: ['perception', 'stealth'] },
            bands: [
              { max: 10, text: 'You find the stairs eventually, and something finds your scent.' },
              { min: 11, text: 'A spiral stair leads down into the drowned tower — and you spot the reef wraiths before they spot you.', effects: [{ type: 'pageBonus', stat: 'atk', amount: 1 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'w7-wraiths',
    month: 2,
    day: 16,
    title: 'Reef Wraiths',
    scene: 'depths',
    text: 'The spiral stair is guarded by the drowned: sailors from every ship the reef ever took, still on watch.',
    note: 'Fight for up to 3 rounds.',
    steps: [],
    combat: {
      enemies: ['bw-reefWraith', 'bw-reefWraith'],
      rounds: 3,
      intro: 'The reef wraiths turn their empty faces toward you.',
      winText: 'The wraiths sigh and fade, as if relieved of their watch. The bell is very close now.',
      loseText: 'You push past the wraiths and down the stair, cold to the bone.',
      win: [{ type: 'glint', amount: 4 }],
      lose: [{ type: 'damage', amount: 2 }],
    },
  },
  {
    id: 'w7-bell-warden',
    month: 2,
    day: 17,
    span: 2,
    title: 'The Second Bell',
    scene: 'seacave',
    text:
      'At the bottom of the drowned tower, in a cave lit by fogglass, the second bell hangs over black water, swinging slower and slower. Before it stands its guardian, armored in barnacled brass. It does not know the difference between a thief and a friend.',
    note: 'Choose an approach, then fight for up to 4 rounds. Afterwards, rest — the story continues.',
    rest: true,
    steps: [
      {
        options: [
          {
            label: 'A) Show it the lamp badge and ask to tend the bell',
            check: { trait: 'cha', tags: ['social'] },
            bands: [
              { max: 11, text: 'It raises its hammer. It does not recognize Brightwatch anymore.' },
              { min: 12, text: 'It hesitates long enough for you to strike first.', effects: [{ type: 'pageBonus', stat: 'atk', amount: 2 }, { type: 'virtue', amount: 1 }] },
            ],
          },
          {
            label: 'B) Wait for the bell’s swing and strike between the tolls',
            check: { trait: 'wis', tags: ['perception'] },
            bands: [
              { max: 11, text: 'You mistime it. The toll rattles your teeth.', effects: [{ type: 'damage', amount: 1 }] },
              { min: 12, text: 'You find the gap in its guard, right between two tolls.', effects: [{ type: 'pageBonus', stat: 'dmg', amount: 2 }] },
            ],
          },
        ],
      },
    ],
    combat: {
      enemies: ['bw-bellWarden'],
      rounds: 4,
      intro: 'The Bell-Warden steps forward, and the cave rings.',
      winText:
        'The guardian kneels and is still. You take hold of the bell rope and ring it — once, twice, steady — and far away, beneath the reef, something vast settles back into sleep. For now. The rope is fraying. Someone will have to come back with a new one, and soon.',
      loseText:
        'The guardian drives you back up the stair. But as you retreat, you see the bell rope fraying through — and you know you’ll have to come back.',
      win: [{ type: 'glint', amount: 8 }, { type: 'virtue', amount: 1 }],
      lose: [{ type: 'damage', amount: 2 }],
    },
    shop: { items: WEEKEND_MARKET },
  },
]
