// Settings menu, changelog and the controllable calendar layout.
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { APP_VERSION, CHANGELOG } from '../src/changelog'
import { campaign, pageDate } from '@questender/engine/campaign'
import type { GameState } from '@questender/engine/types'
import { initialState, reduce } from '@questender/engine/state'
import { CalendarView } from '../src/ui/CalendarView'
import { Settings } from '../src/ui/Settings'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string }
const md = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8')

const cmp = (a: string, b: string) => {
  const [x, y] = [a, b].map((v) => v.split('.').map(Number))
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]
}

describe('changelog', () => {
  it('the newest release is the app version, in package.json and CHANGELOG.md', () => {
    expect(APP_VERSION).toBe(pkg.version)
    for (const r of CHANGELOG) expect(md).toContain(`## [${r.version}]`)
  })

  it('releases run newest first, with unique versions, dates and some changes', () => {
    for (let i = 1; i < CHANGELOG.length; i++) {
      expect(cmp(CHANGELOG[i - 1].version, CHANGELOG[i].version)).toBeGreaterThan(0)
      expect(CHANGELOG[i - 1].date >= CHANGELOG[i].date).toBe(true)
    }
    for (const r of CHANGELOG) {
      expect(r.version).toMatch(/^\d+\.\d+\.\d+$/)
      expect(r.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(r.changes.length).toBeGreaterThan(0)
    }
  })
})

describe('Settings menu', () => {
  const html = (campaigns = 1, slots: { id: string; state: GameState }[] = []) =>
    renderToStaticMarkup(<Settings theme="light" onTheme={() => {}} campaigns={campaigns} slots={slots} onDispatch={() => {}} onImport={() => {}} onExportAll={() => {}} onClose={() => {}} />)

  it('offers appearance, import/export and what’s new', () => {
    const out = html()
    for (const label of ['System', 'Light', 'Dark', 'Export all campaigns', 'Import from file…', 'What’s new', `v${APP_VERSION}`]) expect(out).toContain(label)
    expect(out).toMatch(/aria-checked="true"[^>]*>Light</)
    for (const r of CHANGELOG) expect(out).toContain(r.title)
  })

  it('shows each campaign’s looks: unlocked ones by name, locked ones as ???', () => {
    const c = campaign('brightwatch')
    const base = reduce(initialState(), { type: 'NEW_GAME', heroId: 'wren', seed: 1, campaignId: 'brightwatch', startDate: '2026-01-05' })
    const journal = Array.from({ length: 7 }, (_, page) => ({ page, date: pageDate(c, page, base.startDate), lines: [] }))
    const out = html(1, [{ id: 'a', state: { ...base, journal, dayIndex: 7 } }])
    expect(out).toContain('Campaign looks')
    expect(out).toContain('Lamp-gold edge')
    expect(out).not.toContain('Fog chart')
    expect(out).toContain('???')
    expect(out).toContain('Play 30 days in this campaign.')
    expect(out).not.toMatch(/price|buy|premium|purchase/i)
  })

  it('Export all is disabled with no campaigns', () => {
    expect(html(0)).toMatch(/<button[^>]*disabled=""[^>]*>Export all campaigns/)
  })
})

describe('calendar layout from the header', () => {
  const c = campaign('brightwatch')
  const s = reduce(initialState(), { type: 'NEW_GAME', heroId: c.heroIds?.[0] ?? 'wren', seed: 1, campaignId: 'brightwatch', startDate: '2026-01-05' })

  it('a controlled view wins over the starting layout, and the switch is not repeated inside', () => {
    const out = renderToStaticMarkup(
      <CalendarView slots={[{ id: 'a', state: s }]} viewDate="2026-01-05" today="2026-01-05" onPick={() => {}} view="year" onView={() => {}} initialView="month" initialEntries={[]} />,
    )
    expect(out.match(/class="mini-month"/g)).toHaveLength(12)
    expect(out).not.toContain('Calendar layout')
  })
})
