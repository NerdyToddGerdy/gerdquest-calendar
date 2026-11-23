import { describe, expect, it } from 'vitest'
import { defaultStartDate, campaign } from '../src/engine/campaign'
import { initialState, reduce } from '../src/engine/state'
import { bundleSaves, parseSaves } from '../src/save'

const today = '2026-11-23'
const start = (campaignId: string) => {
  const startDate = defaultStartDate(campaign(campaignId), today)
  return reduce(initialState(), { type: 'NEW_GAME', heroId: 'wren', seed: 7, campaignId, startDate })
}

describe('export all / import', () => {
  it('round-trips every campaign through one bundle file', () => {
    const states = ['brightwatch', 'emberroad', 'halcyon'].map(start)
    const text = JSON.stringify(bundleSaves(states, today))
    const back = parseSaves(text, today)
    expect(back.map((s) => [s.campaignId, s.startDate, s.hero?.name])).toEqual(
      states.map((s) => [s.campaignId, s.startDate, s.hero?.name]),
    )
  })

  it('still imports a single-campaign export', () => {
    const s = start('emberroad')
    expect(parseSaves(JSON.stringify(s), today)).toHaveLength(1)
  })

  it('rejects junk, empty bundles and bundles with a bad campaign', () => {
    expect(() => parseSaves('not json', today)).toThrow(/Not a Questender save/)
    expect(() => parseSaves(JSON.stringify(bundleSaves([], today)), today)).toThrow(/no campaigns/)
    const bad = { ...start('brightwatch'), campaignId: 'nope' }
    expect(() => parseSaves(JSON.stringify(bundleSaves([start('halcyon'), bad], today)), today)).toThrow()
  })
})
