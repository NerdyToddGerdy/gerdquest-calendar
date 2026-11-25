// Spike (#26, updated for save format v2): how big is a GameState after a full campaign year?
// Plays every page with the real reducer, then reports JSON bytes raw/gzipped.
// Run: npx vitest run spikes/save-size.test.ts   (prints a table)
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { encodeSave } from '../src/saveCode'
import { listCampaigns } from '@questender/engine/campaign'
import { playYear } from '../tests/helpers/playYear'
import { fromStored, toStored } from '@questender/engine/saveFormat'
import { singlePayload } from '../src/save'
import type { GameState } from '@questender/engine/types'

const DDB_LIMIT = 400 * 1024

const size = (v: unknown) => {
  const raw = Buffer.from(JSON.stringify(v))
  return { raw: raw.length, gz: gzipSync(raw).length }
}
const kb = (n: number) => (n / 1024).toFixed(1)

describe('save size after a full year', () => {
  const rows: string[] = []
  for (const c of listCampaigns()) {
    it(c.id, () => {
      const s = playYear(c.id, 42)
      expect(s.finished, 'campaign should finish').toBe(true)
      const base = size(s)
      // Upper bound: player also writes ~2000 chars of notes for every page.
      const note = 'The quick brown fox jumps over the lazy dog. '.repeat(45)
      const notes = s.journal.map(() => note).join('\n\n')
      const withNotes = size({ ...s, notes, noteDates: s.journal.map((j) => j.date) })
      const journal = size(s.journal)
      const log = size(s.log)
      rows.push(
        `${c.id.padEnd(12)} pages=${String(c.pages.length).padStart(3)} journal=${s.journal.length} log=${s.log.length} ` +
          `raw=${kb(base.raw)}KB gz=${kb(base.gz)}KB | journal ${kb(journal.raw)}KB log ${kb(log.raw)}KB | ` +
          `+2KB notes/page: raw=${kb(withNotes.raw)}KB gz=${kb(withNotes.gz)}KB`,
      )
      expect(base.raw).toBeGreaterThan(0) // results are reported, not gated (see DDB_LIMIT below)
      console.log(`${c.id}: DynamoDB headroom without notes = ${((DDB_LIMIT - base.raw) / 1024).toFixed(0)}KB`)
    }, 120_000)
  }
  it('summary', () => {
    console.log('\n' + rows.join('\n'))
  })
})

describe('save size, v1 vs v2 (raw JSON / gzip / code length)', () => {
  const row = async (s: GameState) => {
    const v1 = { ...s, version: 1 }
    const v2 = toStored(s)
    const code1 = await encodeSave(v1)
    const code2 = await encodeSave(singlePayload(s))
    return `raw ${kb(size(v1).raw)}->${kb(size(v2).raw)}KB  journal ${kb(size(s.journal).raw)}->${kb(size(v2.jrnl).raw)}KB  gzip ${kb(size(v1).gz)}->${kb(size(v2).gz)}KB  code ${code1.length}->${code2.length}`
  }
  for (const c of listCampaigns()) {
    it(c.id, async () => {
      const fresh = playYear(c.id, 42, 0)
      const mid = playYear(c.id, 42, Math.floor(c.pages.length / 2))
      const full = playYear(c.id, 42)
      expect(fromStored(toStored(full)).journal).toEqual(full.journal)
      console.log(`SIZES ${c.id.padEnd(12)} fresh: ${await row(fresh)}\nSIZES ${c.id.padEnd(12)} mid:   ${await row(mid)}\nSIZES ${c.id.padEnd(12)} full:  ${await row(full)}`)
    }, 120_000)
  }
})
