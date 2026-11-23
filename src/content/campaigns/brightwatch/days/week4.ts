// Week 4 — Ottilie Venn, Lamp Chaplain: the fog-sick village of Hollowmere.
import type { Day } from '../../../../engine/types'
import { trialIntro, WEEKEND_MARKET } from './helpers'

export const WEEK4: Day[] = [
  {
    id: 'w4-hollowmere',
    month: 1,
    day: 22,
    title: 'Hollowmere',
    scene: 'harbor',
    text:
      'Inland, where the marsh meets the sea, the village of Hollowmere has gone quiet. Half its people sit by their windows staring at the fog, and will not eat. Sister Ottilie Venn of the lamp chapel packs her bag and goes.',
    note: 'This week you play Ottilie Venn. Do each task in order.',
    steps: [
      trialIntro('bw-ottilie', 'Take up Ottilie’s story', 'Ottilie lights a small lantern from the great lamp’s flame and sets out along the marsh road.'),
      {
        title: '2. The first house',
        options: [
          {
            label: 'Sit with a family and listen',
            check: { trait: 'cha', tags: ['social'] },
            bands: [
              { max: 10, text: 'They’re too frightened to say much.' },
              { min: 11, text: 'The fog-sick all went down to the shore one night “to hear the bells.” There are no bells on this shore.', effects: [{ type: 'virtue', amount: 1 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'w4-tending',
    month: 1,
    day: 23,
    title: 'Tending the Sick',
    scene: 'inn',
    text:
      'The village hall becomes a sickroom. The fog-sick are cold to the touch, and when they sleep, they hum the same slow tune.',
    note: 'Do both tasks.',
    steps: [
      {
        title: '1. Warm them',
        options: [
          {
            label: 'Keep the fires and the lamps lit all day',
            check: { trait: 'con' },
            bands: [
              { max: 10, text: 'You run yourself ragged.', effects: [{ type: 'damage', amount: 2 }] },
              { min: 11, text: 'Color returns to a few faces.' },
            ],
          },
        ],
      },
      {
        title: '2. Learn the tune',
        options: [
          {
            label: 'Listen closely to the humming',
            check: { trait: 'wis', tags: ['perception'] },
            bands: [
              { max: 10, text: 'It slides away from you whenever you try to hold it.' },
              { min: 11, text: 'It’s the bell’s old rhythm, slowed and turned backward — a lullaby run in reverse. A waking song.', effects: [{ type: 'pageBonus', stat: 'roll', amount: 1 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'w4-marsh',
    month: 1,
    day: 24,
    title: 'Herbs in the Marsh',
    scene: 'cellar',
    text:
      'The old chapel remedies call for brightroot, which grows only in the deep marsh where the fog lies thickest.',
    note: 'Travel into the marsh, then gather.',
    steps: [
      {
        title: '1. Into the marsh',
        options: [
          {
            label: 'Wade out along the reed paths',
            result: 'The reed paths wind for hours. You eat on your feet.',
            effects: [{ type: 'travel', rations: 1 }],
          },
        ],
      },
      {
        title: '2. Gather brightroot',
        options: [
          {
            label: 'Search the hummocks',
            check: { trait: 'wis', tags: ['perception'] },
            bands: [
              { max: 10, text: 'You find a little, and a leech finds you.', effects: [{ type: 'damage', amount: 1 }] },
              { min: 11, text: 'You fill your satchel, and spot a chapel candle someone left at a marsh shrine.', effects: [{ type: 'item', id: 'bw-chapelCandle' }] },
            ],
          },
        ],
      },
    ],
    icons: [{ kind: 'loot', x: 58, y: 66 }],
  },
  {
    id: 'w4-vigil',
    month: 1,
    day: 25,
    title: 'The Night Vigil',
    scene: 'inn',
    text:
      'At midnight the fog-sick stand up, all at once, and walk toward the door.',
    note: 'Choose how to stop them.',
    steps: [
      {
        options: [
          {
            label: 'A) Sing them a true lullaby to answer the false one',
            check: { trait: 'wis' },
            bands: [
              { max: 11, text: 'Some sit down again. Three slip past you into the fog.', effects: [{ type: 'virtue', amount: -1 }] },
              { min: 12, text: 'One by one, they lie back down and sleep — properly, this time.', effects: [{ type: 'virtue', amount: 2 }] },
            ],
          },
          {
            label: 'B) Bar the door and hold it',
            check: { trait: 'str', tags: ['physical'] },
            bands: [
              { max: 11, text: 'They push like the tide. The door holds; your shoulder doesn’t.', effects: [{ type: 'damage', amount: 2 }] },
              { min: 12, text: 'You hold until dawn, when they collapse, exhausted but safe.', effects: [{ type: 'virtue', amount: 1 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'w4-wights',
    month: 1,
    day: 26,
    title: 'Fog-Wights',
    scene: 'depths',
    text:
      'The three who slipped away are found on the shore — or what is left of them. The fog has hollowed them out and filled them with itself, and it does not want the others back.',
    note: 'Fight for up to 3 rounds.',
    steps: [],
    combat: {
      enemies: ['bw-fogWight', 'bw-fogWight'],
      rounds: 3,
      intro: 'The fog-wights turn toward your lantern.',
      winText: 'The wights come apart into ordinary mist. Where they stood, the sand is frosted with fogglass.',
      loseText: 'The wights drift back into the sea. They will be back.',
      win: [{ type: 'glint', amount: 3 }, { type: 'virtue', amount: 1 }],
      lose: [{ type: 'damage', amount: 1 }],
    },
  },
  {
    id: 'w4-relit',
    month: 1,
    day: 27,
    span: 2,
    title: 'The Chapel Lamp',
    scene: 'tower',
    text:
      'Ottilie returns to Brightwatch with a promise to keep: Hollowmere needs a lamp of its own. On the second evening the villagers carry a lantern, lit from the great flame, back along the marsh road.',
    note: 'Light the lamp, then rest and resupply.',
    rest: true,
    steps: [
      {
        options: [
          {
            label: 'Bless the lantern for the journey',
            check: { trait: 'wis', tags: ['social'] },
            bands: [
              { max: 10, text: 'The flame gutters twice on the road but survives.' },
              { min: 11, text: 'The flame burns steady all the way home. That night, no one in Hollowmere hums.', effects: [{ type: 'virtue', amount: 1 }, { type: 'glint', amount: 3 }] },
            ],
          },
        ],
      },
    ],
    shop: { items: [...WEEKEND_MARKET, { id: 'bw-chapelCandle', price: 6 }, { id: 'dawndew', price: 12 }] },
  },
]
