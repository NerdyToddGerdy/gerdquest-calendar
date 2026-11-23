import type { Step } from '../../../../engine/types'

/**
 * First step of a hero-trial week: hand the story to a new warden, who starts
 * fresh with a small kit.
 */
export function trialIntro(heroId: string, label: string, result: string): Step {
  return {
    title: 'A new warden',
    options: [
      {
        label,
        result,
        effects: [
          { type: 'setHero', heroId },
          { type: 'item', id: 'ration', qty: 2 },
          { type: 'item', id: 'mendwater' },
        ],
      },
    ],
  }
}

/** The market most weekend rest pages share. */
export const WEEKEND_MARKET = [
  { id: 'ration', price: 1 },
  { id: 'mendwater', price: 5 },
  { id: 'emberflask', price: 4 },
  { id: 'ironbrew', price: 3 },
  { id: 'wardsalve', price: 3 },
]
