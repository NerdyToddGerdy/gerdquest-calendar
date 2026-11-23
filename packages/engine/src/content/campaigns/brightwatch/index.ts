import type { Campaign } from '../../../engine/types'
import { BRIGHTWATCH_CONTENT, TRIAL_HEROES } from './content'
import { DAYS } from './days'

/** In-world month names, January → December. */
const MONTHS = ['Firstfrost', 'Deepthaw', 'Greenrise', 'Rainmoot', 'Blossomtide', 'Highsun', 'Emberheat', 'Goldwane', 'Harvestmoon', 'Fogfall', 'Lampdark', 'Longnight']

/** "Firstfrost 6–7" style in-world dates, following each page's authored date. */
function inWorldDate(index: number): string {
  const p = DAYS[index]
  if (!p?.month || !p.day) return `Firstfrost ${index + 1}`
  const m = MONTHS[p.month - 1] ?? `Month ${p.month}`
  return p.span && p.span > 1 ? `${m} ${p.day}–${p.day + p.span - 1}` : `${m} ${p.day}`
}

export const brightwatch: Campaign = {
  id: 'brightwatch',
  title: 'The Lamp at Brightwatch',
  blurb:
    'Six wardens, one week each, and the fog that never quite leaves the Lantern Marches. Then you choose who carries the lamp out to sea.',
  authoredYear: 2024,
  rulesetId: 'modern',
  pages: DAYS,
  content: BRIGHTWATCH_CONTENT,
  heroIds: TRIAL_HEROES,
  startHero: 'wren',
  inWorldDate,
}
