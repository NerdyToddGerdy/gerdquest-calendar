import type { Day } from '../../../../engine/types'

export const day04: Day = {
  id: 'floor-gives',
  month: 1,
  day: 4,
  title: 'The Floor Gives Way',
  scene: 'depths',
  text:
    'You return at first light to finish the job. Halfway across the cellar the flagstones groan, tilt — and drop away into darkness beneath your feet.',
  note: 'Choose one way to save yourself.',
  steps: [
    {
      options: [
        {
          label: 'A) Grab for the edge',
          check: { trait: 'str', tags: ['physical'] },
          bands: [
            { max: 7, text: 'Your fingers slip. You fall hard onto wet stone far below.', effects: [{ type: 'damage', amount: 3 }] },
            { min: 8, max: 14, text: 'You catch the edge, hang, and lose your grip after a long moment. The fall is shorter than it might have been.', effects: [{ type: 'damage', amount: 1 }] },
            { min: 15, text: 'You catch the lip, haul yourself up, then climb down carefully on your own terms.' },
          ],
        },
        {
          label: 'B) Leap for the far side',
          check: { trait: 'dex', tags: ['physical'] },
          bands: [
            { max: 7, text: 'You jump short and hit the far wall on your way down.', effects: [{ type: 'damage', amount: 3 }] },
            { min: 8, max: 14, text: 'You land on the far edge, teeter, and slide in after all — slowly.', effects: [{ type: 'damage', amount: 1 }] },
            { min: 15, text: 'You land in a crouch on the far side and peer down into the hole with interest.' },
          ],
        },
        {
          label: 'C) Tuck in and ride the rubble down',
          check: { trait: 'con' },
          bands: [
            { max: 7, text: 'The rubble wins.', effects: [{ type: 'damage', amount: 2 }] },
            { min: 8, text: 'You roll with it and come up bruised but whole, in a long tunnel you didn’t know existed.' },
          ],
        },
      ],
    },
  ],
}
