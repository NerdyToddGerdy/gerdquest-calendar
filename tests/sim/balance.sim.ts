// Opt-in balance simulation: `npm run sim` (see docs/balance/README in REPORT.md).
// Env: SIM_RUNS (default 200), SIM_CAMPAIGNS (comma list), SIM_OUT (raw JSON path),
//      SIM_REPORT (markdown path), SIM_BASELINE (earlier raw JSON for before/after).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { it } from 'vitest'
import { BUNDLED_CATALOG } from '@questender/engine/content/bundled'
import { listCampaigns, loadCampaigns } from '@questender/engine/campaign'
import { simulate } from '../../packages/engine/src/sim/run'
import { renderSummary, summarize } from '../../packages/engine/src/sim/stats'
import type { Summary } from '../../packages/engine/src/sim/stats'

const RUNS = Number(process.env.SIM_RUNS ?? 200)
const only = process.env.SIM_CAMPAIGNS?.split(',')
await loadCampaigns(BUNDLED_CATALOG.map((e) => e.id))
const ids = listCampaigns().map((c) => c.id).filter((id) => !only || only.includes(id))

it('simulates the campaigns', { timeout: 3_600_000 }, () => {
  const summaries: Summary[] = []
  for (const id of ids) {
    const t = Date.now()
    const runs = Array.from({ length: RUNS }, (_, i) => simulate(id, 1000 + i))
    summaries.push(summarize(id, runs))
    console.log(`${id}: ${RUNS} runs in ${((Date.now() - t) / 1000).toFixed(1)}s`)
    if (process.env.SIM_OUT) {
      mkdirSync(dirname(process.env.SIM_OUT), { recursive: true })
      writeFileSync(process.env.SIM_OUT.replace(/\.json$/, `.${id}.runs.json`), JSON.stringify(runs))
    }
  }
  if (process.env.SIM_OUT) writeFileSync(process.env.SIM_OUT, JSON.stringify(summaries, null, 1))
  const before: Summary[] = process.env.SIM_BASELINE ? JSON.parse(readFileSync(process.env.SIM_BASELINE, 'utf8')) : []
  const md: string[] = []
  for (const sm of summaries) {
    const b = before.find((x) => x.campaignId === sm.campaignId)
    if (b) md.push(renderSummary(b, `${sm.campaignId}: before tuning`))
    md.push(renderSummary(sm, b ? `${sm.campaignId}: after tuning` : sm.campaignId))
  }
  const text = md.join('\n')
  if (process.env.SIM_REPORT) {
    mkdirSync(dirname(process.env.SIM_REPORT), { recursive: true })
    writeFileSync(process.env.SIM_REPORT, text)
  } else console.log(text)
})
