import type { CampaignEntry } from '../../../engine/types'

/** Catalog entry: small enough to ship up front. The pages and content load on demand. */
export const BRIGHTWATCH_ENTRY: CampaignEntry = {
  id: 'brightwatch',
  title: 'The Lamp at Brightwatch',
  blurb:
    'Six wardens, one week each, and the fog that never quite leaves the Lantern Marches. Then you choose who carries the lamp out to sea.',
  authoredYear: 2024,
  rulesetId: 'modern',
  pageCount: 314,
  firstDate: '2024-01-01',
  heroIds: ['wren', 'isolde', 'corin', 'bw-ottilie', 'bw-hask', 'bw-jory'],
  startHero: 'wren',
}
