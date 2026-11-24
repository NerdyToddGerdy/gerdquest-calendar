// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Campaign, CampaignEntry } from '@questender/engine/types'

// The registries are module state, so each test gets a fresh, empty engine.
async function fresh() {
  vi.resetModules()
  const campaign = await import('@questender/engine/campaign')
  const content = await import('@questender/engine/content')
  return { ...campaign, ...content }
}

const entry = (id: string): CampaignEntry => ({
  id, title: id, blurb: '', authoredYear: 2024, rulesetId: 'modern', pageCount: 1, firstDate: '2024-01-01',
})
const pack = (id: string, itemId = `${id}_item`): Campaign => ({
  ...entry(id),
  pages: [{ id: `${id}-1`, month: 1, day: 1, title: 'One', scene: 'harbor', text: '' } as never],
  content: { items: [{ id: itemId, name: itemId } as never] },
})

describe('campaign registry', () => {
  let e: Awaited<ReturnType<typeof fresh>>
  beforeEach(async () => {
    e = await fresh()
  })

  it('an unloaded campaign throws a clear error, and an unknown one a different one', () => {
    e.registerCatalog(entry('a'))
    expect(() => e.campaign('a')).toThrow(/not loaded yet: a/)
    expect(() => e.campaign('zzz')).toThrow(/Unknown campaign: zzz/)
    expect(e.campaignEntry('a').id).toBe('a')
    expect(e.listCatalog().map((c) => c.id)).toEqual(['a'])
    expect(e.listCampaigns()).toEqual([])
  })

  it('content lookups throw until the pack is registered', () => {
    expect(() => e.item('a_item')).toThrow(/Unknown item: a_item/)
    e.registerCampaign(pack('a'))
    expect(e.item('a_item').id).toBe('a_item')
    expect(e.campaign('a').pages).toHaveLength(1)
    expect(e.isCampaignLoaded('a')).toBe(true)
  })

  it('registering the same campaign twice is a no-op', () => {
    const a = pack('a')
    e.registerCampaign(a)
    expect(() => e.registerCampaign(a)).not.toThrow()
    expect(e.listCampaigns()).toHaveLength(1)
  })

  it('a different campaign with a taken id, or a clashing content id, is an error', () => {
    e.registerCampaign(pack('a'))
    expect(() => e.registerCampaign(pack('a', 'other'))).toThrow(/Duplicate campaign id: a/)
    expect(() => e.registerCampaign(pack('b', 'a_item'))).toThrow(/Duplicate item id: a_item/)
    expect(e.isCampaignLoaded('b')).toBe(false)
  })

  it('registerContent is idempotent per key and rejects duplicate ids', () => {
    const p = { items: [{ id: 'x' } as never] }
    e.registerContent('base', p)
    e.registerContent('base', p)
    expect(() => e.registerContent('other', p)).toThrow(/Duplicate item id: x/)
    expect(() => e.registerContent('dupe', { items: [{ id: 'y' } as never, { id: 'y' } as never] })).toThrow(/Duplicate item id: y/)
    expect(() => e.item('y')).toThrow()
  })
})

describe('campaign loader', () => {
  it('loads once, shares in-flight fetches and registers the pack', async () => {
    const e = await fresh()
    const load = vi.fn(async () => pack('a'))
    e.registerCatalog(entry('a'))
    e.registerCampaignLoader('a', load)
    const [x, y] = await Promise.all([e.loadCampaign('a'), e.loadCampaign('a')])
    expect(x).toBe(y)
    await e.loadCampaigns(['a', 'a'])
    expect(load).toHaveBeenCalledTimes(1)
    expect(e.campaign('a')).toBe(x)
  })

  it('a failed fetch rejects, stays unloaded and can be retried', async () => {
    const e = await fresh()
    let fail = true
    e.registerCatalog(entry('a'))
    e.registerCampaignLoader('a', async () => {
      if (fail) throw new Error('network')
      return pack('a')
    })
    await expect(e.loadCampaign('a')).rejects.toThrow('network')
    expect(e.isCampaignLoaded('a')).toBe(false)
    fail = false
    await expect(e.loadCampaign('a')).resolves.toMatchObject({ id: 'a' })
  })

  it('rejects unknown campaigns', async () => {
    const e = await fresh()
    await expect(e.loadCampaign('nope')).rejects.toThrow(/Unknown campaign/)
  })
})

describe('bundled catalog', () => {
  it('every entry matches its loaded pack', async () => {
    const { BUNDLED_CATALOG } = await import('@questender/engine/content/bundled')
    const { campaign, authoredDate, campaignEntry, loadCampaigns } = await import('@questender/engine/campaign')
    expect(() => campaign('brightwatch')).toThrow(/not loaded yet/)
    await loadCampaigns(BUNDLED_CATALOG.map((e) => e.id))
    for (const e of BUNDLED_CATALOG) {
      const c = campaign(e.id)
      expect(campaignEntry(e.id), e.id).toBe(e)
      expect(c.pages.length, `${e.id} pageCount`).toBe(e.pageCount)
      expect(authoredDate(c, 0), `${e.id} firstDate`).toBe(e.firstDate)
      expect(c.heroIds, e.id).toEqual(e.heroIds)
    }
  })
})
