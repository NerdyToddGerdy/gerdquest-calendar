import type { GameState } from '@questender/engine/types'

/** data-paper / data-dice / data-edge for a campaign run's chosen looks (CSS in App.css reads them). */
export function styleAttrs(s: Pick<GameState, 'style'>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [category, id] of Object.entries(s.style ?? {})) if (id) out[`data-${category}`] = id
  return out
}
