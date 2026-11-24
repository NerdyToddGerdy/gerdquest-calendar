// @vitest-environment node
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { build, type Rollup } from 'vite'
import { listCampaigns } from '@questender/engine/campaign'

// Campaign pages must not ship in the entry chunk: that keeps the first load
// small and stops anyone reading future pages out of the main bundle.
describe('built bundle', () => {
  const outDir = mkdtempSync(join(tmpdir(), 'gerdquest-bundle-'))
  let chunks: Rollup.OutputChunk[] = []

  beforeAll(async () => {
    const result = (await build({ logLevel: 'silent', build: { outDir, emptyOutDir: true, write: false } })) as Rollup.RollupOutput
    chunks = result.output.filter((o): o is Rollup.OutputChunk => o.type === 'chunk')
  }, 120_000)
  afterAll(() => rmSync(outDir, { recursive: true, force: true }))

  it('keeps every campaign out of the entry chunk and in its own chunk', () => {
    const entry = chunks.find((c) => c.isEntry)!
    for (const c of listCampaigns()) {
      // Late-year pages: a title from each of the last pages, plus the first page's text.
      const late = c.pages.slice(-5).map((p) => p.title)
      for (const title of late) {
        expect(entry.code, `${c.id}: "${title}" leaked into the entry chunk`).not.toContain(title)
        expect(chunks.filter((k) => k.code.includes(title)).length, `${c.id}: "${title}" should live in one lazy chunk`).toBeGreaterThan(0)
      }
    }
  })

  it('emits a separate dynamic chunk per campaign', () => {
    const dynamic = chunks.filter((c) => c.isDynamicEntry)
    expect(dynamic.length).toBeGreaterThanOrEqual(listCampaigns().length)
  })
})
