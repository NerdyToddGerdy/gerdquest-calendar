import { SANTA_ENTRY } from './meta'
import type { Campaign } from '../../../engine/types'
import { SANTA_CONTENT } from './content'
import { DAYS } from './days/index'

/** "The 1st door", "The 2nd door", … : an advent calendar counts doors, not dates. */
const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`

function inWorldDate(i: number): string {
  return i >= DAYS.length - 1 ? 'Christmas morning' : `The ${ordinal(i + 1)} door`
}

export const santa: Campaign = {
  ...SANTA_ENTRY,
  pages: DAYS,
  content: SANTA_CONTENT,
  inWorldDate,
}
