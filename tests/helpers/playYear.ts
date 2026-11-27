// Plays a campaign with the real reducer (always the first option) for save tests and the size spike.
import { listCampaigns } from '@questender/engine/campaign'
import { canAdvance, initialState, reduce, type Action } from '@questender/engine/state'
import type { GameState } from '@questender/engine/types'

export function playYear(campaignId: string, seed: number, stopAtPage = Infinity): GameState {
  const camp = listCampaigns().find((c) => c.id === campaignId)!
  // Campaigns without a fixed opening hero get their first listed hero.
  const heroId = camp.startHero ? undefined : camp.heroIds?.[0]
  let s = reduce(initialState(), { type: 'NEW_GAME', seed, campaignId, heroId, startDate: '2026-01-03' })
  for (let guard = 0; guard < 30000 && !s.finished && s.dayIndex < stopAtPage; guard++) {
    if (s.pending) {
      s = s.pending.type === 'pickpocket' ? reduce(s, { type: 'PICKPOCKET', take: true }) : reduce(s, { type: 'CONFIRM' })
      continue
    }
    const next = s.progress.steps.findIndex((x) => x === null)
    if (next >= 0) {
      s = reduce(s, { type: 'CHOOSE', step: next, option: 0 })
      continue
    }
    if (!canAdvance(s)) {
      // Combat rounds / dogfight volleys: try each roll action until one changes state.
      const tries: Action[] = [{ type: 'ROLL_ROUND' }, { type: 'ROLL_VOLLEY' } as Action]
      const moved = tries.map((a) => reduce(s, a)).find((r) => r !== s)
      if (!moved) throw new Error(`stuck on ${campaignId} page ${s.dayIndex}`)
      s = moved
      continue
    }
    if (camp.pages[s.dayIndex].rest && !s.progress.rested) {
      s = reduce(s, { type: 'REST' })
      continue
    }
    s = reduce(s, { type: 'NEXT_DAY', today: '2030-01-01' })
  }
  return s
}
