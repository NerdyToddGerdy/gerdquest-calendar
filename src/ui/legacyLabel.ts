import { campaign } from '@questender/engine/campaign'
import type { GameState } from '@questender/engine/types'

/**
 * The note on a gated option. While it is open to you, it names the mark you
 * hold; while it is locked it names only the chapter, never the outcome you
 * didn't get, so it can't spoil the other ending.
 */
export function legacyLabel(state: GameState, requires: string, locked: boolean): string {
  const negate = requires.startsWith('!')
  const id = negate ? requires.slice(1) : requires
  const def = campaign(state.campaignId).legacy?.find((l) => l.id === id)
  const of = def ? `Chapter ${def.chapter}` : 'an earlier chapter'
  if (locked) return negate ? `Closed by your ${of} ending` : `Needs a different ${of} ending`
  return negate ? `Open because of your ${of} ending` : `Legacy: ${def?.name ?? id}`
}
