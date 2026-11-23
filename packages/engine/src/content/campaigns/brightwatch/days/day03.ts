import type { Day } from '../../../../engine/types'

export const day03: Day = {
  id: 'cellars',
  month: 1,
  day: 3,
  title: 'The Flooded Cellars',
  scene: 'cellar',
  text:
    '“Fogweed,” Hale spits. “It’s in the cellars again. Grows in the damp, eats the mortar, and if we let it reach the foundations the whole tower comes down. Go in there and pull every root.”',
  note: 'Choose how to go in (A or B), then do the remaining tasks in order.',
  steps: [
    {
      title: '1. Going in',
      options: [
        {
          label: 'A) Rally the cellar crew to work with you',
          check: { trait: 'cha', tags: ['social'] },
          bands: [
            { max: 10, text: 'They mumble excuses and drift off. You’re on your own.' },
            { min: 11, text: 'The crew follows your lead. With extra hands, everything goes easier.', effects: [{ type: 'pageBonus', stat: 'roll', amount: 2 }] },
          ],
        },
        {
          label: 'B) Go alone and let the crew rest',
          result: 'You wave the crew off. They look grateful — and a little guilty.',
          effects: [{ type: 'virtue', amount: 1 }],
        },
      ],
    },
    {
      title: '2. Clear the choked passage',
      options: [
        {
          label: 'Pull and hack at the fogweed',
          check: { trait: 'str', tags: ['physical'] },
          bands: [
            { max: 10, text: 'The roots fight back, lashing your arms with stinging sap.', effects: [{ type: 'damage', amount: 1 }, { type: 'condition', poisoned: true }] },
            { min: 11, text: 'The passage comes clear in a satisfying tangle of grey roots.' },
          ],
        },
      ],
    },
    {
      title: '3. The scratching below',
      options: [
        {
          label: 'Investigate the sound under the floor',
          check: { trait: 'int', tags: ['lore', 'perception'] },
          bands: [
            { max: 10, text: 'You press your ear to the flagstones. Scratching. Lots of it. There should be no room down there.' },
            { min: 11, text: 'You find an old warden’s cache behind a loose stone, and a map showing a sealed chamber below this one.', effects: [{ type: 'item', id: 'wardsalve' }, { type: 'glint', amount: 2 }] },
          ],
        },
      ],
    },
  ],
  icons: [{ kind: 'loot', x: 63, y: 34 }],
}
