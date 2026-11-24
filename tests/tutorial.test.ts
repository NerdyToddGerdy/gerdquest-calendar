import { describe, expect, it } from 'vitest'
import { TUTORIAL_DAYS, tutorialActive } from '../src/ui/tutorialPrefs'
import { rulesFor, RULESETS } from '@questender/engine/ruleset'

describe('tutorial tips', () => {
  const on = (days: string[]) => tutorialActive({ off: false, seen: [], days }, '2026-11-24')

  it('show on the first few days the desk is opened, counted by visit', () => {
    expect(on([])).toBe(true)
    expect(on(['2026-11-20', '2026-11-22'])).toBe(true)
    expect(on(['2026-11-20', '2026-11-22', '2026-11-23'])).toBe(false)
    // Still on for the rest of the last tutorial day.
    expect(on(['2026-11-20', '2026-11-22', '2026-11-24'])).toBe(true)
    expect(TUTORIAL_DAYS).toBe(3)
  })

  it('Skip tutorial turns them off', () => {
    expect(tutorialActive({ off: true, seen: [], days: [] }, '2026-11-24')).toBe(false)
  })
})

describe('rules explanations', () => {
  it('every ruleset explains itself in plain words', () => {
    for (const r of Object.values(RULESETS)) {
      expect(r.summary.length).toBeGreaterThan(20)
      expect(r.points.length).toBeGreaterThanOrEqual(3)
    }
    expect(rulesFor('classic').points.join(' ')).toMatch(/no Defense roll/)
  })
})
