import { beforeEach, describe, expect, it } from 'vitest'
import { campaign, defaultStartDate } from '@questender/engine/campaign'
import { initialState, reduce } from '@questender/engine/state'
import { localSaveStore } from '../src/saveStore'

const today = '2026-11-23'

function stubStorage() {
  const m = new Map<string, string>()
  ;(globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  }
}

describe('localSaveStore (SaveStore over localStorage)', () => {
  beforeEach(stubStorage)

  const start = () =>
    reduce(initialState(), {
      type: 'NEW_GAME',
      heroId: 'wren',
      seed: 3,
      campaignId: 'brightwatch',
      startDate: defaultStartDate(campaign('brightwatch'), today),
    })

  it('saves, lists, loads and deletes a slot', async () => {
    expect(await localSaveStore.listSlots()).toEqual([])
    const s = start()
    const id = await localSaveStore.saveSlot(s)
    expect(id).toBe(`brightwatch-${s.startDate}`)
    expect((await localSaveStore.listSlots()).map((m) => m.slotId)).toEqual([id])
    const back = await localSaveStore.loadSlot(id!, today)
    expect(back?.hero?.name).toBe(s.hero?.name)
    await localSaveStore.deleteSlot(id!)
    expect(await localSaveStore.loadSlot(id!, today)).toBeNull()
    expect(await localSaveStore.listSlots()).toEqual([])
  })

  it('refuses to save a state with no hero', async () => {
    expect(await localSaveStore.saveSlot(initialState())).toBeNull()
  })

  it('round-trips calendar entries', async () => {
    const e = [{ id: 'a', date: '2026-12-01', text: 'Dentist' }]
    await localSaveStore.saveCalendar(e)
    expect(await localSaveStore.loadCalendar()).toEqual(e)
  })
})
