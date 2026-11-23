import type { Day } from '../../../../engine/types'

export const day01: Day = {
  id: 'brightwatch',
  month: 1,
  day: 1,
  title: 'Brightwatch',
  scene: 'harbor',
  text:
    'The supply barge drops you at Brightwatch an hour before dawn: a lighthouse-fortress on a black rock, its great lamp sweeping the fog that never quite leaves the Lantern Marches. You are the newest warden. Captain Hale expects you tomorrow — today is yours to learn the place.',
  note: 'Explore the outpost in any order. Keep an eye out for anything hidden in the scene.',
  anyOrder: true,
  steps: [
    {
      title: 'The Tide Pools',
      options: [
        {
          label: 'Take the cliff-divers’ dare',
          check: { trait: 'dex', tags: ['physical'] },
          bands: [
            { max: 10, text: 'You misjudge the rocks and come up bloody and laughing.', effects: [{ type: 'damage', amount: 1 }] },
            { min: 11, max: 14, text: 'A clean enough dive. The divers nod, unimpressed but approving.' },
            { min: 15, text: 'A perfect arc. At the bottom of the pool something glints — a fistful of old coins.', effects: [{ type: 'glint', amount: 2 }] },
          ],
        },
      ],
    },
    {
      title: 'The Oil Yard',
      options: [
        {
          label: 'Help roll the lamp-oil casks',
          check: { trait: 'str', tags: ['physical'] },
          bands: [
            { max: 10, text: 'A cask gets away from you and clips your shin.', effects: [{ type: 'damage', amount: 1 }] },
            { min: 11, text: 'The yard-master flips you a coin for the help.', effects: [{ type: 'glint', amount: 1 }] },
          ],
        },
      ],
    },
    {
      title: 'The Galley',
      options: [
        {
          label: 'Lend a hand with the fish stew',
          check: { trait: 'wis' },
          bands: [
            { max: 10, text: 'You salt it twice. The cook throws you out, but not before you eat.', effects: [{ type: 'heal', amount: 1 }] },
            { min: 11, text: 'The cook likes your hands and sends you off with travel food.', effects: [{ type: 'item', id: 'ration' }, { type: 'virtue', amount: 1 }] },
          ],
        },
      ],
    },
  ],
  icons: [{ kind: 'loot', x: 82, y: 70 }],
  shop: {
    items: [
      { id: 'ration', price: 1 },
      { id: 'mendwater', price: 5 },
      { id: 'emberflask', price: 4 },
      { id: 'wardsalve', price: 3 },
      { id: 'saltboots', price: 8 },
    ],
  },
}
