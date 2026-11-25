import { beforeEach, describe, expect, it } from 'vitest'
import { contentVersion, listCampaigns } from '@questender/engine/campaign'
import { packVersion } from '@questender/engine/packVersion'
import { fromStored, isStored, journalDrifted, NEUTRAL_LINE, toStored, type StoredState } from '@questender/engine/saveFormat'
import type { GameState } from '@questender/engine/types'
import { bundleSaves, CODE_LOG_KEEP, importSaveText, listSlots, loadSlot, normalizeState, parseCalendar, parseProgress, parseSaves, saveSlot, singlePayload, allPayload } from '../src/save'
import { decodeSave, encodeSave } from '../src/saveCode'
import { emptyProgress } from '@questender/engine/progress'
import { playYear } from './helpers/playYear'

const today = '2030-06-01'
const texts = (s: GameState) => s.journal.map((j) => [j.page, j.date, j.lines])
const asV1 = (s: GameState) => ({ ...s, version: 1 }) as GameState
const viaJson = <T>(v: T): T => JSON.parse(JSON.stringify(v))

function stubStorage() {
  const m = new Map<string, string>()
  ;(globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  }
  return m
}

const years = new Map<string, GameState>()
const year = (id: string) => {
  let s = years.get(id)
  if (!s) years.set(id, (s = playYear(id, 42)))
  return s
}

describe('save format v2: journal references', () => {
  for (const c of listCampaigns()) {
    it(`${c.id}: a full year renders identically from references, and is much smaller`, () => {
      const s = year(c.id)
      expect(s.finished).toBe(true)
      const stored = viaJson(toStored(s))
      expect(isStored(stored)).toBe(true)
      expect('journal' in stored).toBe(false)
      expect(texts(fromStored(stored))).toEqual(texts(s))
      // v1 lines === render(v2 refs), and writing it again changes nothing
      expect(viaJson(toStored(fromStored(stored)))).toEqual(stored)
      expect(JSON.stringify(stored.jrnl).length).toBeLessThan(JSON.stringify(s.journal).length / 3)
      expect(journalDrifted(stored)).toBe(false)
    }, 120_000)
  }

  it('keeps lines it cannot abbreviate as literals (including # and $)', () => {
    const s = playYear('brightwatch', 1, 3)
    s.journal = [{ page: 0, date: '2026-01-03', lines: ['Cost: $5 for #1 (007 coins)', 'Plain one-off line.', 'A 12 and a 12'] }]
    expect(fromStored(viaJson(toStored(s))).journal).toEqual(s.journal)
  })

  it('degrades, never throws, when references no longer resolve (content edited)', () => {
    const s = year('brightwatch')
    const stored = viaJson(toStored(s)) as StoredState
    stored.jrnl.v = 'old-version'
    expect(journalDrifted(stored)).toBe(true)
    stored.jrnl.p[0] = [['r99.9'], ['b0.0.99', 7], ['ci'], [9999, 1], 9999, [3, 'x'], ['zzz']]
    const back = fromStored(stored)
    expect(back.journal[0].lines.slice(0, 2)).toEqual([NEUTRAL_LINE, NEUTRAL_LINE])
    expect(back.journal[0].lines.slice(3)).toEqual(Array(4).fill(NEUTRAL_LINE))
    expect(back.journal).toHaveLength(s.journal.length)
    // a save for a campaign that is not loaded still decodes
    const orphan = { ...stored, campaignId: 'not-loaded' }
    expect(() => fromStored(orphan)).not.toThrow()
  })

  it('stamps the pack with a content version that follows its content and explicit version', () => {
    const c = listCampaigns()[0]
    expect(contentVersion(c.id)).toBe(packVersion(c))
    expect(packVersion({ ...c, version: '3' })).toBe(`3.${packVersion(c)}`)
    expect(packVersion({ ...c, pages: c.pages.slice(1) })).not.toBe(packVersion(c))
    expect(toStored(year(c.id)).jrnl.v).toBe(contentVersion(c.id))
  })
})

describe('migration from v1', () => {
  beforeEach(() => {
    years.clear()
  })

  it('upgrades a v1 slot on load, rewrites it as v2, and is idempotent', () => {
    const m = stubStorage()
    const s = year('emberroad')
    const v1 = asV1(s)
    m.set('questender.slot.emberroad-2026-01-03', JSON.stringify(v1))
    m.set('questender.slots', JSON.stringify([{ slotId: 'emberroad-2026-01-03', campaignId: 'emberroad', startDate: '2026-01-03', heroName: 'x', updated: 1 }]))
    const loaded = loadSlot('emberroad-2026-01-03', today)!
    expect(texts(loaded)).toEqual(texts(s))
    expect(loaded.log).toEqual(s.log)
    const rewritten = JSON.parse(m.get('questender.slot.emberroad-2026-01-03')!)
    expect(rewritten.version).toBe(2)
    expect(rewritten.journal).toBeUndefined()
    expect(m.get('questender.slot.emberroad-2026-01-03')!.length).toBeLessThan(JSON.stringify(v1).length)
    const again = loadSlot('emberroad-2026-01-03', today)!
    expect(again).toEqual(loaded)
    expect(JSON.parse(m.get('questender.slot.emberroad-2026-01-03')!)).toEqual(rewritten)
  })

  it('saves new slots as v2 and reads them back unchanged', () => {
    stubStorage()
    const s = year('halcyon')
    const id = saveSlot(s)!
    expect(listSlots()).toHaveLength(1)
    expect(texts(loadSlot(id, today)!)).toEqual(texts(s))
  })

  it('imports v1 JSON files and v1 bundles (with calendar and progress)', () => {
    const a = year('brightwatch')
    const b = year('starwake')
    const progress = emptyProgress()
    const bundle = JSON.stringify({ format: 'questender.bundle', version: 1, exportedOn: today, campaigns: [asV1(a), asV1(b)], calendar: [{ id: 'e1', date: '2026-02-02', text: 'hi' }], progress })
    const back = parseSaves(bundle, today)
    expect(back.map((s) => s.version)).toEqual([2, 2])
    expect(back.map(texts)).toEqual([texts(a), texts(b)])
    expect(parseProgress(bundle)).toEqual(progress)
    expect(parseCalendar(bundle)).toHaveLength(1)
    expect(parseSaves(JSON.stringify(asV1(a)), today).map(texts)).toEqual([texts(a)])
  })

  it('imports a GQC1 code written by 0.11.x', async () => {
    const a = year('verdant')
    const code = (await encodeSave(asV1(a))).replace(/^GQC2/, 'GQC1')
    expect(code.startsWith('GQC1.')).toBe(true)
    const { states } = await importSaveText(code, today)
    expect(texts(states[0])).toEqual(texts(a))
    expect(states[0].version).toBe(2)
  })

  it('normalizeState upgrades v1 and stored states alike', () => {
    const a = year('brightwatch')
    expect(normalizeState(asV1(a), today).version).toBe(2)
    expect(texts(normalizeState(toStored(a), today))).toEqual(texts(a))
  })
})

describe('save codes in v2', () => {
  it('use the GQC2 prefix and round trip a full year, shorter than the v1 code', async () => {
    const a = year('brightwatch')
    const code = await encodeSave(singlePayload(a))
    expect(code.startsWith('GQC2.')).toBe(true)
    const v1Code = await encodeSave(asV1(a))
    expect(code.length).toBeLessThan(v1Code.length)
    const { states } = await importSaveText(code, today)
    expect(texts(states[0])).toEqual(texts(a))
    expect(await decodeSave(code)).toContain('"jrnl"')
  })

  it('trim the play log to the newest entries, in codes only', async () => {
    const a = year('brightwatch')
    expect(a.log.length).toBeGreaterThan(CODE_LOG_KEEP)
    const { states } = await importSaveText(await encodeSave(singlePayload(a)), today)
    expect(states[0].log).toEqual(a.log.slice(0, CODE_LOG_KEEP))
    // the Export all bundle trims too; its calendar/progress survive
    const bundle = await importSaveText(await encodeSave(allPayload([a], today)), today)
    expect(bundle.states[0].log).toHaveLength(CODE_LOG_KEEP)
    // slots and plain bundles keep the whole log
    stubStorage()
    const id = saveSlot(a)!
    expect(loadSlot(id, today)!.log).toEqual(a.log)
    expect(parseSaves(JSON.stringify(bundleSaves([a], today)), today)[0].log).toEqual(a.log)
    expect(a.log.length).toBeGreaterThan(0)
  })
})
