import type { CampaignEntry } from '../../../engine/types'

/** Catalog entry: small enough to ship up front. The pages and content load on demand. */
export const VERDANT_ENTRY: CampaignEntry = {
  id: 'verdant',
  title: 'The Verdant Accord',
  blurb:
    'The city in the ancient stump must return the Seedcrown to the forest this year, and the Crown is gone. One chapter a month, and every chapter’s ending is remembered. Classic rules.',
  authoredYear: 2022,
  rulesetId: 'classic',
  pageCount: 208,
  chaptersWritten: 8,
  chaptersPlanned: 12,
  firstDate: '2022-01-01',
  startHero: 'va_agathe',
  heroIds: ['va_brannoc', 'va_sorrel', 'va_pip', 'va_aldous', 'va_kestrel', 'va_odo'],
  startItems: { ration: 3, va_fernleaf: 1 },
}
