// The desk treats a weekend page as one stop: › goes Saturday → Monday.
import { describe, expect, it } from 'vitest'
import { deskSpanEnd, nextDeskDate, prevDeskDate, turnThrough } from '@questender/engine/desk'
import { canAdvance, initialState, reduce } from '@questender/engine/state'
import type { GameState } from '@questender/engine/types'

function finishPage(s: GameState): GameState {
  for (let guard = 0; guard < 50 && !canAdvance(s); guard++) {
    if (s.pending) {
      s = s.pending.type === 'pickpocket' ? reduce(s, { type: 'PICKPOCKET', take: false }) : reduce(s, { type: 'CONFIRM' })
      continue
    }
    const next = s.progress.steps.findIndex((x) => x === null)
    if (next >= 0) s = reduce(s, { type: 'CHOOSE', step: next, option: 0 })
    else s = reduce(s, { type: 'ROLL_ROUND' })
  }
  return s
}

// The Ember Road opens on a weekend page (Sat + Sun); start it on Sat Jan 3, 2026.
const game = (campaignId = 'emberroad', startDate = '2026-01-03') => reduce(initialState(), { type: 'NEW_GAME', seed: 1, campaignId, startDate })

describe('weekend pages on the desk', () => {
  const states = [game()]

  it('› skips the Sunday half of a weekend page', () => {
    expect(nextDeskDate(states, '2026-01-03', '2026-01-20')).toBe('2026-01-05')
    expect(nextDeskDate(states, '2026-01-05', '2026-01-20')).toBe('2026-01-06')
  })

  it('‹ lands on the Saturday, not the Sunday', () => {
    expect(prevDeskDate(states, '2026-01-05', '2026-01-03')).toBe('2026-01-03')
    expect(prevDeskDate(states, '2026-01-06', '2026-01-03')).toBe('2026-01-05')
  })

  it('the weekend reads as one range, and › never passes today', () => {
    expect(deskSpanEnd(states, '2026-01-03')).toBe('2026-01-04')
    expect(deskSpanEnd(states, '2026-01-05')).toBe('2026-01-05')
    expect(nextDeskDate(states, '2026-01-03', '2026-01-04')).toBe('2026-01-04')
  })

  it('a weekday campaign alongside keeps every date a stop', () => {
    // A campaign whose pages don't line up with Ember’s weekend keeps Sunday a stop.
    const mixed = [...states, game('halcyon', '2026-01-04')]
    expect(nextDeskDate(mixed, '2026-01-03', '2026-01-20')).toBe('2026-01-04')
  })

  it('jumping Saturday → Monday still turns the finished weekend page', () => {
    const done = finishPage(states[0])
    expect(canAdvance(done)).toBe(true)
    const next = nextDeskDate([done], '2026-01-03', '2026-01-20')
    expect(next).toBe('2026-01-05')
    expect(turnThrough(done, '2026-01-03', next).dayIndex).toBe(1)
    expect(turnThrough(states[0], '2026-01-03', next).dayIndex).toBe(0) // unfinished pages stay put
  })
})
