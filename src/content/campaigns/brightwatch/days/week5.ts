// Week 5 — Hask Driftwood, Gull-Cliff Archer: false lights on the reef.
import type { Day } from '../../../../engine/types'
import { trialIntro, WEEKEND_MARKET } from './helpers'

export const WEEK5: Day[] = [
  {
    id: 'w5-cliffs',
    month: 1,
    day: 29,
    title: 'The Gull Cliffs',
    scene: 'tower',
    text:
      'Two supply ships have run aground on the reef this month, in calm weather, within sight of the lamp. Hale posts Hask Driftwood on the cliff lookout with his bow and a long night ahead of him.',
    note: 'This week you play Hask Driftwood. Do each task in order.',
    steps: [
      trialIntro('bw-hask', 'Take up Hask’s story', 'Hask settles into the wind on the cliff edge and starts to watch.'),
      {
        title: '2. Keep watch',
        options: [
          {
            label: 'Watch the reef through the night',
            check: { trait: 'wis', tags: ['perception'] },
            bands: [
              { max: 10, text: 'You see the fog and nothing else, and you’re very cold.', effects: [{ type: 'damage', amount: 1 }] },
              { min: 11, text: 'At the darkest hour, a light blinks on the reef — exactly where no light should be.', effects: [{ type: 'pageBonus', stat: 'roll', amount: 1 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'w5-tracks',
    month: 1,
    day: 30,
    title: 'Tracks in the Shingle',
    scene: 'harbor',
    text:
      'At low tide you walk the beach below the reef. The shingle is churned with bootprints and the drag marks of small boats.',
    note: 'Do both tasks.',
    steps: [
      {
        title: '1. Follow the tracks',
        options: [
          {
            label: 'Read where they came from and went',
            check: { trait: 'wis', tags: ['perception'] },
            bands: [
              { max: 10, text: 'The tide has eaten most of them.' },
              { min: 11, text: 'They lead to a sea-cave at the foot of the cliffs, and back out to the reef.', effects: [{ type: 'glint', amount: 1 }] },
            ],
          },
        ],
      },
      {
        title: '2. Check the wreck',
        options: [
          {
            label: 'Search the nearest stranded hull',
            check: { trait: 'int' },
            bands: [
              { max: 10, text: 'Picked clean.' },
              { min: 11, text: 'Picked clean of cargo — but someone missed a sailor’s purse in a bunk.', effects: [{ type: 'glint', amount: 3 }] },
            ],
          },
        ],
      },
    ],
    icons: [{ kind: 'loot', x: 26, y: 70 }],
  },
  {
    id: 'w5-climb',
    month: 1,
    day: 31,
    title: 'Down the Cliff',
    scene: 'seacave',
    text: 'The wreckers’ cave can only be reached from the sea, or by climbing down a cliff face slick with spray.',
    note: 'Choose how to get down.',
    steps: [
      {
        options: [
          {
            label: 'A) Climb down',
            check: { trait: 'dex', tags: ['physical'] },
            bands: [
              { max: 10, text: 'You slip the last ten feet onto the rocks.', effects: [{ type: 'damage', amount: 2 }] },
              { min: 11, text: 'You climb down like one of your gulls.' },
            ],
          },
          {
            label: 'B) Fix a rope with an arrow and slide down',
            check: { trait: 'dex' },
            bands: [
              { max: 10, text: 'The arrow pulls loose halfway. So do you.', effects: [{ type: 'damage', amount: 3 }] },
              { min: 11, text: 'You land silently, rope coiled, bow ready.', effects: [{ type: 'pageBonus', stat: 'atk', amount: 1 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'w5-false-beacon',
    month: 2,
    day: 1,
    title: 'The False Beacon',
    scene: 'seacave',
    text:
      'In the cave you find the wreckers’ lantern: a great lens of fogglass that bends light so a ship’s lookout sees the lamp in the wrong place. Beside it is a crate of brand-new lenses, waiting for the next dark night.',
    note: 'Do both tasks.',
    steps: [
      {
        title: '1. Understand it',
        options: [
          {
            label: 'Work out how the lens fools the eye',
            check: { trait: 'int' },
            bands: [
              { max: 10, text: 'It makes your eyes water just looking at it.' },
              { min: 11, text: 'The glass doesn’t just bend light — it bends toward the reef, as if something out there is pulling.', effects: [{ type: 'virtue', amount: 1 }] },
            ],
          },
        ],
      },
      {
        title: '2. Smash it',
        options: [
          {
            label: 'Break the lens and the spares',
            result: 'The fogglass shatters with a sound like a bell struck underwater. Somewhere outside, someone shouts in alarm.',
            effects: [{ type: 'virtue', amount: 1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'w5-wreckers',
    month: 2,
    day: 2,
    title: 'Wreckers',
    scene: 'seacave',
    text: 'The wreckers come back for their lantern and find you standing among the pieces.',
    note: 'Fight for up to 3 rounds.',
    steps: [],
    combat: {
      enemies: ['bw-wrecker', 'bw-wrecker', 'bw-wrecker'],
      rounds: 3,
      intro: 'Three wreckers rush into the cave with hooks and boat-axes.',
      winText: 'The last wrecker drops his axe and surrenders. He babbles that “the tide pays better than the Syndicate ever did.”',
      loseText: 'The wreckers flee by boat. Without their lantern, at least, they won’t sink anything tonight.',
      win: [{ type: 'glint', amount: 5 }],
      lose: [{ type: 'damage', amount: 1 }],
    },
  },
  {
    id: 'w5-rescue',
    month: 2,
    day: 3,
    span: 2,
    title: 'Rescue on the Reef',
    scene: 'harbor',
    text:
      'A third ship, the Marrow Gull, is already on the rocks when the wardens row out. Her crew clings to the rigging as the tide climbs.',
    note: 'Save who you can, then rest.',
    rest: true,
    steps: [
      {
        options: [
          {
            label: 'A) Shoot lines to the rigging so the crew can climb across',
            check: { trait: 'dex' },
            bands: [
              { max: 10, text: 'Some lines fall short. Most of the crew makes it.', effects: [{ type: 'virtue', amount: 1 }] },
              { min: 11, text: 'Every line lands true. Every sailor comes home.', effects: [{ type: 'virtue', amount: 2 }, { type: 'glint', amount: 4 }] },
            ],
          },
          {
            label: 'B) Guide the rowboats in by the safe channel',
            check: { trait: 'wis', tags: ['perception'] },
            bands: [
              { max: 10, text: 'A boat scrapes the reef, but everyone gets off.', effects: [{ type: 'virtue', amount: 1 }] },
              { min: 11, text: 'You read the water perfectly. The Marrow Gull’s captain swears she owes you her life.', effects: [{ type: 'virtue', amount: 2 }, { type: 'glint', amount: 4 }] },
            ],
          },
        ],
      },
    ],
    shop: { items: [...WEEKEND_MARKET, { id: 'tidewraps', price: 10 }, { id: 'luckglass', price: 8 }] },
  },
]
