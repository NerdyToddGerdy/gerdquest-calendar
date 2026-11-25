import { VERDANT_ENTRY } from './meta'
import type { Campaign } from '../../../engine/types'
import { VERDANT_CONTENT, VERDANT_LEGACY } from './content'
import { DAYS } from './days/index'

/** The Fernreach calendar: one in-world month per chapter. Chapters 11–12 come later. */
const MONTHS = ['Firstleaf', 'Rootmoon', 'Thawmoon', 'Blossomtide', 'Greenmoon', 'Fenmoon', 'Antlermoon', 'Emberleaf', 'Marrowmoon', 'Ledgermoon', 'Snowroot', 'Longnight']

function inWorldDate(i: number): string {
  const d = DAYS[i]
  if (!d?.month || !d.day) return `Firstleaf ${i + 1}`
  const m = MONTHS[d.month - 1]
  return d.span === 2 ? `${m} ${d.day}–${d.day + 1}` : `${m} ${d.day}`
}

export const verdant: Campaign = {
  ...VERDANT_ENTRY,
  pages: DAYS,
  content: VERDANT_CONTENT,
  inWorldDate,
  legacy: VERDANT_LEGACY,
}
