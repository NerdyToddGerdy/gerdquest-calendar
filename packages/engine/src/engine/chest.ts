// The weekly chest's contents: a small purse of the campaign's currency plus
// one healing consumable from that campaign's own items (or the base Mendwater).
import { campaign } from './campaign'
import type { ItemDef } from './types'

/**
 * Kept deliberately small: balance reports put median currency at 10-100 across
 * a campaign, with a healing draught costing 5-10, so this is about half a
 * week's median income.
 */
export const CHEST_CURRENCY = 6

export function chestLoot(campaignId: string): { currency: number; itemId: string } {
  const heals = (campaign(campaignId).content?.items ?? []).filter((i): i is Extract<ItemDef, { kind: 'heal' }> => i.kind === 'heal')
  heals.sort((a, b) => a.price - b.price || a.id.localeCompare(b.id))
  return { currency: CHEST_CURRENCY, itemId: heals[0]?.id ?? 'mendwater' }
}
