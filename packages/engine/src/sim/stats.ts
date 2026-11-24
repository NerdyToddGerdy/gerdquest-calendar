// Turns raw simulation runs into the numbers the balance report shows.
import { pageInfo, prologuePages } from './run'
import type { RunRecord } from './run'

export interface Spread {
  p10: number
  median: number
  p90: number
}

export function percentile(xs: number[], q: number): number {
  if (xs.length === 0) return 0
  const a = [...xs].sort((x, y) => x - y)
  const pos = (a.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return a[lo] + (a[hi] - a[lo]) * (pos - lo)
}

export function spread(xs: number[]): Spread {
  return { p10: percentile(xs, 0.1), median: percentile(xs, 0.5), p90: percentile(xs, 0.9) }
}

export interface MonthSummary {
  month: number
  runs: number
  deaths: number
  /** Share of runs that hit the death table at least once this month. */
  deathRunPct: number
  level: Spread
  glint: Spread
  hpPct: Spread
  healItems: number
}

export interface Summary {
  campaignId: string
  runs: number
  finishedPct: number
  stuck: number
  deathsPerRun: Spread
  months: MonthSummary[]
  prologue: { pages: number; meanZeroHp: number; runPct: number }
  topPages: { id: string; title: string; enemies: string[]; month: number; deaths: number; runPct: number }[]
  topCauses: { cause: string; deaths: number }[]
  byHero: { hero: string; runs: number; deathsPerRun: number }[]
}

export function summarize(campaignId: string, runs: RunRecord[]): Summary {
  const info = pageInfo(campaignId)
  const pro = prologuePages(campaignId)
  const monthNums = [...new Set(info.map((p) => p.month))]
  const pct = (n: number, d: number) => (d ? (100 * n) / d : 0)

  const months: MonthSummary[] = monthNums.map((month) => {
    const reached = runs.filter((r) => r.months.some((m) => m.month === month))
    const snaps = reached.map((r) => r.months.find((m) => m.month === month)!)
    const deaths = reached.map((r) => r.deaths.filter((d) => d.month === month).length)
    return {
      month,
      runs: reached.length,
      deaths: deaths.reduce((a, b) => a + b, 0),
      deathRunPct: pct(deaths.filter((d) => d > 0).length, reached.length),
      level: spread(snaps.map((m) => m.level)),
      glint: spread(snaps.map((m) => m.glint)),
      hpPct: spread(snaps.map((m) => (100 * m.hp) / m.maxHp)),
      healItems: snaps.length ? percentile(snaps.map((m) => m.healItems), 0.5) : 0,
    }
  })

  const perPage = new Map<number, { deaths: number; runs: Set<number> }>()
  const causes = new Map<string, number>()
  runs.forEach((r, ri) => {
    for (const d of r.deaths) {
      const e = perPage.get(d.page) ?? { deaths: 0, runs: new Set<number>() }
      e.deaths++
      e.runs.add(ri)
      perPage.set(d.page, e)
      if (d.cause !== 'hazard') causes.set(d.cause, (causes.get(d.cause) ?? 0) + 1)
    }
  })
  const topPages = [...perPage.entries()]
    .sort((a, b) => b[1].deaths - a[1].deaths)
    .slice(0, 10)
    .map(([page, e]) => ({ id: info[page].id, title: info[page].title, enemies: info[page].enemies, month: info[page].month, deaths: e.deaths, runPct: pct(e.runs.size, runs.length) }))

  const prologueZero = runs.map((r) => r.deaths.filter((d) => d.page < pro).length)
  const heroes = [...new Set(runs.map((r) => r.heroId))]
  return {
    campaignId,
    runs: runs.length,
    finishedPct: pct(runs.filter((r) => r.finished).length, runs.length),
    stuck: runs.filter((r) => r.stuckAt !== null).length,
    deathsPerRun: spread(runs.map((r) => r.deaths.length)),
    months,
    prologue: { pages: pro, meanZeroHp: prologueZero.reduce((a, b) => a + b, 0) / Math.max(1, runs.length), runPct: pct(prologueZero.filter((n) => n > 0).length, runs.length) },
    topPages,
    topCauses: [...causes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([cause, deaths]) => ({ cause, deaths })),
    byHero: heroes.map((hero) => {
      const rs = runs.filter((r) => r.heroId === hero)
      return { hero, runs: rs.length, deathsPerRun: rs.reduce((n, r) => n + r.deaths.length, 0) / rs.length }
    }),
  }
}

const f = (n: number, d = 0) => n.toFixed(d)
const sp = (x: Spread) => `${f(x.median)} (${f(x.p10)}–${f(x.p90)})`

/** Markdown tables for one campaign. */
export function renderSummary(sm: Summary, title: string): string {
  const L: string[] = []
  L.push(`### ${title}`, '')
  L.push(`${sm.runs} runs. Finished the year: ${f(sm.finishedPct, 1)}%${sm.stuck ? ` (${sm.stuck} bot stalls)` : ''}. Death-table hits per run: median ${f(sm.deathsPerRun.median)} (p10 ${f(sm.deathsPerRun.p10)}, p90 ${f(sm.deathsPerRun.p90)}).`)
  L.push(`Prologue (first ${sm.prologue.pages} pages): ${f(sm.prologue.runPct, 1)}% of runs hit 0 HP, ${f(sm.prologue.meanZeroHp, 2)} times per run on average.`, '')
  L.push('| Month | Runs | Deaths | % runs with a death | Level med (p10–p90) | Currency med (p10–p90) | HP % at month end | Heal items (median) |')
  L.push('|---|---|---|---|---|---|---|---|')
  for (const m of sm.months) L.push(`| ${m.month} | ${m.runs} | ${m.deaths} | ${f(m.deathRunPct, 1)}% | ${sp(m.level)} | ${sp(m.glint)} | ${sp(m.hpPct)} | ${f(m.healItems)} |`)
  L.push('', 'Most lethal pages:', '', '| Page | Month | Enemies | Deaths | % runs |', '|---|---|---|---|---|')
  for (const p of sm.topPages) L.push(`| ${p.id} ${p.title} | ${p.month} | ${p.enemies.join(', ') || 'hazard'} | ${p.deaths} | ${f(p.runPct, 1)}% |`)
  L.push('', 'Deaths per hero: ' + sm.byHero.map((h) => `${h.hero} ${f(h.deathsPerRun, 2)} (${h.runs} runs)`).join(', '), '')
  return L.join('\n')
}
