import { describe, expect, it } from 'vitest'
import { CAMPAIGNS } from '@questender/engine/content/campaigns'
import { simulate } from '../packages/engine/src/sim/run'
import { summarize } from '../packages/engine/src/sim/stats'

// Light check that the balance simulator's bot can play every campaign to the
// end. The heavy run is opt-in: `npm run sim` (see docs/balance/REPORT.md).
describe('balance simulator', () => {
  for (const c of CAMPAIGNS) {
    it(`${c.id}: the bot finishes the campaign, deterministically`, () => {
      const a = simulate(c.id, 7)
      expect(a.stuckAt).toBeNull()
      expect(a.finished).toBe(true)
      expect(a.pages).toBe(c.pages.length)
      expect(simulate(c.id, 7)).toEqual(a)
      const sm = summarize(c.id, [a])
      expect(sm.runs).toBe(1)
      expect(sm.months.length).toBeGreaterThan(0)
    })
  }
})
