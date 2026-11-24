import type { CampaignEntry } from '../../../engine/types'

/** Catalog entry: small enough to ship up front. The pages and content load on demand. */
export const STARWAKE_ENTRY: CampaignEntry = {
  id: 'starwake',
  title: 'The Starwake',
  blurb:
    'The star that held the night sky in place has fallen into the sea. Sail the Saltreach for its shards before a corsair-prince cages it. Classic rules.',
  authoredYear: 2022,
  rulesetId: 'classic',
  pageCount: 234,
  firstDate: '2022-01-01',
  startHero: 'sw_greta',
  heroIds: ['sw_bram', 'sw_isadora', 'sw_kip', 'sw_sel', 'sw_tanu', 'sw_reyna'],
  startItems: { ration: 3, sw_kelptea: 1 },
}
