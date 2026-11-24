import { EMBER_ROAD_ENTRY } from './meta'
import type { Campaign } from '../../../engine/types'
import { EMBER_ROAD_CONTENT } from './content'
import { DAYS } from './days/index'

/** The northern calendar: one in-world month per real month. */
const MONTHS = ['Hearthmoon', 'Deepsnow', 'Thawing', 'Seedtide', 'Blossom', 'Highsun', 'Haymoon', 'Harvest', 'Ashfall', 'Leafdrop', 'Frostcall', 'Longnight']

function inWorldDate(i: number): string {
  const d = DAYS[i]
  if (!d?.month || !d.day) return `Hearthmoon ${i + 1}`
  const m = MONTHS[d.month - 1]
  return d.span === 2 ? `${m} ${d.day}–${d.day + 1}` : `${m} ${d.day}`
}

export const emberRoad: Campaign = {
  ...EMBER_ROAD_ENTRY,
  pages: DAYS,
  content: EMBER_ROAD_CONTENT,
  inWorldDate,
}
