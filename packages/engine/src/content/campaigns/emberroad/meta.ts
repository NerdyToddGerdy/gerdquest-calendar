import type { CampaignEntry } from '../../../engine/types'

/** Catalog entry: small enough to ship up front. The pages and content load on demand. */
export const EMBER_ROAD_ENTRY: CampaignEntry = {
  id: 'emberroad',
  title: 'The Ember Road',
  blurb:
    'Someone is snuffing the waystones that light the frozen north road. Classic rules: followers, spell points, and a gods-or-gold death table.',
  authoredYear: 2022,
  rulesetId: 'classic',
  pageCount: 313,
  firstDate: '2022-01-01',
  startHero: 'er_tamsin',
  heroIds: ['er_garrick', 'er_ysolde', 'er_pell', 'er_odalys', 'er_kesh', 'er_wenna'],
  startItems: { ration: 3, er_draught: 1 },
}
