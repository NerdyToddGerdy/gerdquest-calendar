import type { CampaignEntry } from '../../../engine/types'

/**
 * Catalog entry for the December advent campaign. Seasonal: it can only be
 * started in December, always begins on December 1 of the current year, and
 * comes back every year (see `season` in engine/types.ts).
 */
export const SANTA_ENTRY: CampaignEntry = {
  id: 'santa',
  title: 'Saving Santa',
  blurb:
    'Santa’s sleigh has come down empty in the snow outside Pinecrook, and something called the Hush wants this year to end in silence. One door a day, December 1 to Christmas morning. Modern rules.',
  authoredYear: 2026,
  rulesetId: 'modern',
  pageCount: 25,
  firstDate: '2026-12-01',
  heroIds: ['ss_juniper', 'ss_rowan', 'ss_marigold', 'ss_nell'],
  startItems: { ration: 2, ss_cocoa: 1 },
  season: { month: 12, label: 'Holiday event' },
}
