// Week 2 — Isolde Brack, Tidecaller: the Drowned Archive.
import type { Day } from '../../../../engine/types'
import { trialIntro, WEEKEND_MARKET } from './helpers'

export const WEEK2: Day[] = [
  {
    id: 'w2-archive-ship',
    month: 1,
    day: 8,
    title: 'The Archive Ship',
    scene: 'harbor',
    text:
      'With the bell under the tower silent, the fog has begun to press against the walls like a hand on glass. Captain Hale sends word to the archive ship Patience, moored off the north quay. Its tidecaller, Isolde Brack, rows ashore with a satchel of tide-tablets and a look of deep interest.',
    note: 'This week you play Isolde Brack. Do each task in order.',
    steps: [
      trialIntro('isolde', 'Take up Isolde’s story', 'Isolde climbs the quay steps, already reading the fog like a page.'),
      {
        title: '2. Read the water',
        options: [
          {
            label: 'Listen to what the tide is saying',
            check: { trait: 'wis', tags: ['lore'] },
            bands: [
              { max: 10, text: 'The water mutters. You catch nothing but a headache.' },
              { min: 11, text: 'The tide has a new rhythm since the bell fell quiet — slower, like something breathing in its sleep.', effects: [{ type: 'pageBonus', stat: 'int', amount: 1 }] },
            ],
          },
        ],
      },
      {
        title: '3. Report to Hale',
        options: [
          {
            label: 'Explain what you heard',
            check: { trait: 'cha', tags: ['social'] },
            bands: [
              { max: 10, text: 'Hale listens with folded arms and says, “Bring me something I can hit.”' },
              { min: 11, text: 'Hale goes quiet, then hands you a pass to the old warden records.', effects: [{ type: 'glint', amount: 2 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'w2-tide-tablets',
    month: 1,
    day: 9,
    title: 'Tide-Tablets',
    scene: 'tower',
    text:
      'The warden records are kept in a damp room halfway up the tower. Among them are clay tablets older than Brightwatch itself, marked with the same tide-script the archive uses.',
    note: 'Do both tasks.',
    steps: [
      {
        title: '1. Sort the tablets',
        options: [
          {
            label: 'Put the tablets in order by age',
            check: { trait: 'int', tags: ['lore'] },
            bands: [
              { max: 9, text: 'You drop one. It breaks cleanly in half. You decide not to mention it.', effects: [{ type: 'virtue', amount: -1 }] },
              { min: 10, max: 14, text: 'A rough order emerges, oldest at the bottom.' },
              { min: 15, text: 'The oldest tablet shows a lighthouse with a bell beneath it, and under the bell, a closed eye.', effects: [{ type: 'item', id: 'bw-archiveScroll' }] },
            ],
          },
        ],
      },
      {
        title: '2. Copy the inscriptions',
        options: [
          {
            label: 'Work through the night by lamplight',
            check: { trait: 'con' },
            bands: [
              { max: 9, text: 'You wake with your cheek on the table and ink in your hair.', effects: [{ type: 'damage', amount: 1 }] },
              { min: 10, text: 'By dawn you have a full copy, and a word that repeats on every tablet: the Pale Tide.' },
            ],
          },
        ],
      },
    ],
    icons: [{ kind: 'loot', x: 18, y: 62 }],
  },
  {
    id: 'w2-flooded-stacks',
    month: 1,
    day: 10,
    title: 'The Flooded Stacks',
    scene: 'depths',
    text:
      'The tablets mention a second archive, sunk when the old harbor flooded. At low tide its upper stacks can be reached through a drain beneath the fish market — if you don’t mind the smell, or the dark.',
    note: 'Choose how to get in, then search.',
    steps: [
      {
        title: '1. Getting in',
        options: [
          {
            label: 'A) Swim the drain on one breath',
            check: { trait: 'con', tags: ['physical'] },
            bands: [
              { max: 10, text: 'You surface gasping and scraped raw.', effects: [{ type: 'damage', amount: 2 }] },
              { min: 11, text: 'You come up in an air pocket among the shelves, dripping and triumphant.' },
            ],
          },
          {
            label: 'B) Ask the tide to pull back for you',
            check: { trait: 'wis', tags: ['lore'] },
            bands: [
              { max: 10, text: 'The water ignores you for a long, embarrassing minute, then lets you through anyway — wetly.', effects: [{ type: 'damage', amount: 1 }] },
              { min: 11, text: 'The water draws aside like a curtain.', effects: [{ type: 'virtue', amount: 1 }] },
            ],
          },
        ],
      },
      {
        title: '2. Search the shelves',
        options: [
          {
            label: 'Look for anything that mentions the bell',
            check: { trait: 'int', tags: ['lore', 'perception'] },
            bands: [
              { max: 10, text: 'Most of it is pulp. You find a waterlogged purse instead.', effects: [{ type: 'glint', amount: 2 }] },
              { min: 11, text: 'A sealed brass tube holds a map of the reef — with a second bell marked far out to sea.', effects: [{ type: 'glint', amount: 1 }, { type: 'pageBonus', stat: 'roll', amount: 1 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'w2-archivist',
    month: 1,
    day: 11,
    title: 'The Archivist’s Objection',
    scene: 'harbor',
    text:
      'Back aboard the Patience, the senior archivist is furious. The sunken archive is forbidden, he says, and the tablets belong to the archive, not to a fortress of lamp-polishers.',
    note: 'Choose how to handle him.',
    steps: [
      {
        options: [
          {
            label: 'A) Argue that the fortress needs the knowledge now',
            check: { trait: 'cha', tags: ['social'] },
            bands: [
              { max: 11, text: 'He confiscates your notes. You copied them anyway, of course.' },
              { min: 12, text: 'He grumbles, then offers to help. Two scholars are better than one.', effects: [{ type: 'virtue', amount: 1 }, { type: 'item', id: 'bw-archiveScroll' }] },
            ],
          },
          {
            label: 'B) Quote the archive’s own charter back at him',
            check: { trait: 'int', tags: ['lore'] },
            bands: [
              { max: 11, text: 'He quotes a later amendment. You lose on points.' },
              { min: 12, text: 'He has no answer. He leaves the room, and you keep the tablets.', effects: [{ type: 'glint', amount: 2 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'w2-ink-eels',
    month: 1,
    day: 12,
    title: 'Ink in the Water',
    scene: 'depths',
    text:
      'You return to the sunken archive for one last tablet. Something has followed the fog in: long black eels that spit clouds of ink and coil around the shelves.',
    note: 'Fight for up to 3 rounds.',
    steps: [],
    combat: {
      enemies: ['bw-inkEel', 'bw-inkEel'],
      rounds: 3,
      intro: 'The ink eels uncoil from the shelves.',
      winText: 'The eels flee into the dark. The last tablet is where the map said it would be.',
      loseText: 'You snatch the tablet and flee with the eels snapping at your heels.',
      win: [{ type: 'glint', amount: 3 }],
      lose: [{ type: 'damage', amount: 1 }],
    },
  },
  {
    id: 'w2-the-lock',
    month: 1,
    day: 13,
    span: 2,
    title: 'The Bell Was a Lock',
    scene: 'inn',
    text:
      'Over two long evenings at the Lamplighter’s Rest, the last tablet gives up its meaning. The bell under the tower was never meant to call ships home. It was a lock — one of two — rung to keep something beneath the reef asleep. Now one is silent.',
    note: 'Finish the translation, then rest and resupply.',
    rest: true,
    steps: [
      {
        options: [
          {
            label: 'Finish the translation',
            check: { trait: 'int', tags: ['lore'] },
            bands: [
              { max: 10, text: 'The last lines stay stubborn. You understand enough to be afraid.' },
              { min: 11, text: 'You finish it: “While the second bell rings, the Pale Tide only dreams.” You take the copy to Hale.', effects: [{ type: 'glint', amount: 3 }, { type: 'virtue', amount: 1 }] },
            ],
          },
        ],
      },
    ],
    shop: { items: [...WEEKEND_MARKET, { id: 'bw-archiveScroll', price: 5 }] },
    icons: [{ kind: 'loot', x: 84, y: 30 }],
  },
]
