import type { Campaign } from '../../../engine/types'
import { EMBER_ROAD_CONTENT, EMBER_ROAD_HEROES } from './content'
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
  id: 'emberroad',
  title: 'The Ember Road',
  blurb: 'Someone is snuffing the waystones that light the frozen north road. Classic rules: followers, spell points, and a gods-or-gold death table.',
  authoredYear: 2022,
  rulesetId: 'classic',
  pages: DAYS,
  content: EMBER_ROAD_CONTENT,
  startHero: 'er_tamsin',
  heroIds: EMBER_ROAD_HEROES,
  startItems: { ration: 3, er_draught: 1 },
  inWorldDate,
}
