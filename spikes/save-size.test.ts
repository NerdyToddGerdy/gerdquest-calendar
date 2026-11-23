// Spike (#26): how big is a GameState after a full campaign year?
// Plays every page with the real reducer, then reports JSON bytes raw/gzipped.
// Run: npx vitest run spikes/save-size.test.ts   (prints a table)
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { CAMPAIGNS } from '@questender/engine/content/campaigns'
import { canAdvance, initialState, reduce, type Action } from '@questender/engine/state'
import type { GameState } from '@questender/engine/types'

const DDB_LIMIT = 400 * 1024

function playYear(campaignId: string, seed: number): GameState {
  const camp = CAMPAIGNS.find((c) => c.id === campaignId)!
  let s = reduce(initialState(), { type: 'NEW_GAME', seed, campaignId, startDate: '2026-01-03' })
  for (let guard = 0; guard < 30000 && !s.finished; guard++) {
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

const size = (v: unknown) => {
  const raw = Buffer.from(JSON.stringify(v))
  return { raw: raw.length, gz: gzipSync(raw).length }
}
const kb = (n: number) => (n / 1024).toFixed(1)

describe('save size after a full year', () => {
  const rows: string[] = []
  for (const c of CAMPAIGNS) {
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
