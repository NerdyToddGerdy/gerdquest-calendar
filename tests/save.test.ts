import { describe, expect, it } from 'vitest'
import { defaultStartDate, campaign } from '@questender/engine/campaign'
import { initialState, reduce } from '@questender/engine/state'
import { emptyProgress } from '@questender/engine/progress'
import { bundleSaves, importSaveText, parseSaves, singlePayload } from '../src/save'
import { encodeSave } from '../src/saveCode'

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
    expect(() => parseSaves('not json', today)).toThrow(/Not a GerdQuest Calendar save/)
    expect(() => parseSaves(JSON.stringify(bundleSaves([], today)), today)).toThrow(/no campaigns/)
    const bad = { ...start('brightwatch'), campaignId: 'nope' }
    expect(() => parseSaves(JSON.stringify(bundleSaves([start('halcyon'), bad], today)), today)).toThrow()
  })
})

describe('campaign notes', () => {
  it('saves notes on any date and keeps them through export and import', () => {
    const s = reduce(start('halcyon'), { type: 'SET_NOTES', text: 'Ask the dock boss about the core.' })
    expect(s.notes).toBe('Ask the dock boss about the core.')
    const back = parseSaves(JSON.stringify(bundleSaves([s], today)), today)
    expect(back[0].notes).toBe('Ask the dock boss about the core.')
  })
})

describe('note dates', () => {
  it('records each date notes were written on, once', () => {
    let s = start('brightwatch')
    s = reduce(s, { type: 'SET_NOTES', text: 'a', date: '2026-11-20' })
    s = reduce(s, { type: 'SET_NOTES', text: 'ab', date: '2026-11-20' })
    s = reduce(s, { type: 'SET_NOTES', text: 'abc', date: '2026-11-18' })
    expect(s.noteDates).toEqual(['2026-11-18', '2026-11-20'])
  })
})

describe('save codes through import', () => {
  it('round-trips a single campaign and a full bundle with calendar and progress', async () => {
    const s = start('emberroad')
    const single = await importSaveText(await encodeSave(singlePayload(s)), today)
    expect(single.states).toHaveLength(1)
    expect(single.states[0].hero?.name).toBe(s.hero?.name)

    const calendar = [{ id: 'a', date: '2026-11-24', text: 'dentist' }] as never
    const progress = { ...emptyProgress(), days: ['2026-11-20'] }
    const bundle = bundleSaves(['brightwatch', 'halcyon'].map(start), today, calendar, progress)
    const back = await importSaveText(await encodeSave(bundle), today)
    expect(back.states.map((x) => x.campaignId)).toEqual(['brightwatch', 'halcyon'])
    expect(back.calendar).toHaveLength(1)
    expect(back.progress?.days).toEqual(['2026-11-20'])
  })

  it('still imports old pretty-printed JSON text', async () => {
    const text = JSON.stringify(bundleSaves([start('emberroad')], today), null, 2)
    expect((await importSaveText(text, today)).states).toHaveLength(1)
    expect((await importSaveText(JSON.stringify(start('emberroad'), null, 2), today)).states).toHaveLength(1)
  })

  it('reports damaged codes and non-saves clearly', async () => {
    const code = await encodeSave(singlePayload(start('emberroad')))
    await expect(importSaveText(code.slice(0, -25), today)).rejects.toThrow(/incomplete or mistyped/)
    await expect(importSaveText('not a save', today)).rejects.toThrow(/Not a GerdQuest Calendar save/)
  })
})
