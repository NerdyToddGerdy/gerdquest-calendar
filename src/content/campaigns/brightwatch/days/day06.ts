import type { Day } from '../../../../engine/types'

export const day06: Day = {
  id: 'drowned-keeper',
  month: 1,
  day: 6,
  span: 2, // Saturday + Sunday weekend page
  title: 'The Drowned Keeper',
  scene: 'seacave',
  text:
    'The tunnel ends in a sea-cave under the tower. Water laps at a sunken bell, and beside it something tall and dripping stands up from the tide pool. It was a bell-keeper once. It has been ringing for a ship for a hundred years, and it does not want to be interrupted.',
  note: 'Travel to the cave, choose an approach, then fight for up to 4 rounds. Afterwards, rest and resupply at the Lamplighter’s Rest.',
  rest: true,
  steps: [
    {
      title: '1. The tide road',
      options: [
        {
          label: 'Follow the tunnel down to the sea',
          result: 'It is a long, cold walk. You stop once to eat.',
          effects: [{ type: 'travel', rations: 1 }],
        },
      ],
    },
    {
      title: '2. Approach',
      options: [
        {
          label: 'A) Ring the bell yourself and speak to the Keeper',
          check: { trait: 'cha', tags: ['social'] },
          bands: [
            { max: 11, text: 'It hears only an interruption. It howls and comes for you.' },
            { min: 12, text: 'For one moment the Keeper listens, and grief slows it. You strike first.', effects: [{ type: 'pageBonus', stat: 'atk', amount: 2 }, { type: 'virtue', amount: 1 }] },
          ],
        },
        {
          label: 'B) Creep along the ledge and strike from behind',
          check: { trait: 'dex', tags: ['stealth', 'physical'] },
          bands: [
            { max: 11, text: 'A stone clatters. It turns.' },
            { min: 12, text: 'You are behind it before it knows you are there.', effects: [{ type: 'pageBonus', stat: 'dmg', amount: 2 }] },
          ],
        },
      ],
    },
  ],
  combat: {
    enemies: ['keeper', 'brinecrab'],
    rounds: 4,
    intro: 'The Drowned Keeper raises its bell-hammer. A brine crab scuttles out of the pool beside it.',
    winText:
      'The Keeper sinks back into the water with something like relief. The bell falls silent — for the first time in a hundred years. Wedged in the rocks you find an old helm and the Keeper’s purse. That night, the fog creeps a little closer to the wall.',
    loseText:
      'The Keeper drags itself back under the water, still tolling. You stagger out of the cave with nothing but bruises — but you know where it sleeps now.',
    win: [{ type: 'glint', amount: 6 }, { type: 'item', id: 'gullhelm' }],
    lose: [{ type: 'damage', amount: 2 }],
  },
  shop: {
    items: [
      { id: 'ration', price: 1 },
      { id: 'mendwater', price: 5 },
      { id: 'emberflask', price: 4 },
      { id: 'ironbrew', price: 3 },
      { id: 'wardsalve', price: 3 },
      { id: 'luckglass', price: 8 },
    ],
  },
  icons: [{ kind: 'pickpocket', x: 70, y: 76 }],
}
