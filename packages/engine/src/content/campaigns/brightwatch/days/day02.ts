import type { Day } from '../../../../engine/types'

export const day02: Day = {
  id: 'hale-orders',
  month: 1,
  day: 2,
  title: 'Captain Hale’s Orders',
  scene: 'tower',
  text:
    'Captain Hale is a broad woman with a voice like a foghorn and a ledger she never closes. “New blood. Good. The lamp doesn’t care how tired you are, warden — neither do I.” She hands you a slate of chores.',
  note: 'Do every task, in order.',
  steps: [
    {
      title: '1. Walk the seawall',
      options: [
        {
          label: 'Patrol and watch the fog line',
          check: { trait: 'wis', tags: ['perception'] },
          bands: [
            { max: 9, text: 'You see nothing but grey. Hale marks something in her ledger.' },
            { min: 10, max: 14, text: 'You spot a loose stone in the parapet and report it. Hale grunts.' },
            { min: 15, text: 'You notice tracks in the wet sand below the wall — small, many-legged, leading toward the old cellars. Hale stops writing.', effects: [{ type: 'glint', amount: 1 }, { type: 'pageBonus', stat: 'int', amount: 1 }] },
          ],
        },
      ],
    },
    {
      title: '2. Polish the great lens',
      options: [
        {
          label: 'Spend hours buffing salt from the glass',
          check: { trait: 'con', tags: ['physical'] },
          bands: [
            { max: 9, text: 'The fumes from the polish make you dizzy for the rest of the day.', effects: [{ type: 'damage', amount: 2 }] },
            { min: 10, max: 14, text: 'Your arms ache, but the lens shines.', effects: [{ type: 'damage', amount: 1 }] },
            { min: 15, text: 'The lens has never been brighter. The lamp-keeper gives you a tonic for your trouble.', effects: [{ type: 'item', id: 'ironbrew' }] },
          ],
        },
      ],
    },
    {
      title: '3. Carry oil up the three hundred stairs',
      options: [
        {
          label: 'Haul the cans to the lamp room',
          check: { trait: 'str', tags: ['physical'] },
          bands: [
            { max: 9, text: 'You make it, eventually, barely. Your legs will remember this.', effects: [{ type: 'damage', amount: 2 }] },
            { min: 10, max: 14, text: 'Steady work. Hale nods once.', effects: [{ type: 'glint', amount: 1 }] },
            { min: 15, text: 'You take the stairs two at a time. “Huh,” says Hale, and pays you a bonus.', effects: [{ type: 'glint', amount: 3 }] },
          ],
        },
      ],
    },
  ],
  icons: [{ kind: 'pickpocket', x: 14, y: 58 }],
}
