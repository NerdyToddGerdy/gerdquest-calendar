import type { CampaignEntry } from '../../../engine/types'

/** Catalog entry: small enough to ship up front. The pages and content load on demand. */
export const HALCYON_ENTRY: CampaignEntry = {
  id: 'halcyon',
  title: 'The Halcyon Debt',
  blurb:
    'A courier, a stolen data core, and a dented long-hauler racing a pirate captain across the Shoal.',
  authoredYear: 2023,
  rulesetId: 'frontier',
  pageCount: 313,
  firstDate: '2023-01-01',
  // Pages 0–5 (Sun Jan 1 – Fri Jan 6) are the prologue; the lottery starts after.
  prologuePages: 6,
  startHero: 'hd_juniper',
  heroIds: ['hd_tamsin', 'hd_brask', 'hd_ilse', 'hd_kit', 'hd_ash', 'hd_seren'],
  startItems: { ration: 2, hd_medgel: 1 },
}
