import type { Campaign } from '../../../engine/types'
import { STARWAKE_CONTENT, STARWAKE_HEROES } from './content'
import { DAYS } from './days/index'

/** The Saltreach calendar: one in-world month per chapter. Months 10–13 come later. */
const MONTHS = ['Driftmoon', 'Brinemoon', 'Galemoon', 'Reedmoon', 'Stillmoon', 'Deepmoon', 'Thundermoon', 'Gearmoon', 'Rimmoon']

function inWorldDate(i: number): string {
  const d = DAYS[i]
  if (!d?.month || !d.day) return `Driftmoon ${i + 1}`
  const m = MONTHS[d.month - 1]
  return d.span === 2 ? `${m} ${d.day}–${d.day + 1}` : `${m} ${d.day}`
}

export const starwake: Campaign = {
  id: 'starwake',
  title: 'The Starwake',
  blurb: 'The star that held the night sky in place has fallen into the sea. Sail the Saltreach for its shards before a corsair-prince cages it. Classic rules.',
  authoredYear: 2022,
  rulesetId: 'classic',
  pages: DAYS,
  content: STARWAKE_CONTENT,
  startHero: 'sw_greta',
  heroIds: STARWAKE_HEROES,
  startItems: { ration: 3, sw_kelptea: 1 },
  inWorldDate,
}
