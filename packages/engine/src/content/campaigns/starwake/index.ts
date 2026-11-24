import { STARWAKE_ENTRY } from './meta'
import type { Campaign } from '../../../engine/types'
import { STARWAKE_CONTENT } from './content'
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
  ...STARWAKE_ENTRY,
  pages: DAYS,
  content: STARWAKE_CONTENT,
  inWorldDate,
}
