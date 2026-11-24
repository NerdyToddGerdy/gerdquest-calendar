// Notable moments the reducer records on a run (GameState.feats), and the
// shared "which fight is a boss" rule. Pure; achievements read these.
import type { Campaign, GameState } from './types'

export const FEAT_BOSS_CRIT = 'bossCrit'
export const FEAT_NAT1_WON = 'nat1Won'

export function hasFeat(s: Pick<GameState, 'feats'>, id: string): boolean {
  return (s.feats ?? []).includes(id)
}

/** Add a feat once (mutates the working copy inside the reducer). */
export function addFeat(s: GameState, id: string) {
  if (!hasFeat(s, id)) s.feats = [...(s.feats ?? []), id]
}

/**
 * A boss page: a fight that records a chapter's legacy mark when won, or the
 * last fight of the campaign.
 */
export function isBossPage(c: Pick<Campaign, 'pages'>, page: number): boolean {
  const day = c.pages[page]
  if (!day?.combat) return false
  if ((day.combat.win ?? []).some((e) => e.type === 'legacy')) return true
  for (let i = c.pages.length - 1; i >= 0; i--) if (c.pages[i].combat) return i === page
  return false
}
