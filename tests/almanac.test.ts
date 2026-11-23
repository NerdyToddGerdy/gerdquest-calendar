import { describe, expect, it } from 'vitest'
import { addDays } from '@questender/engine/calendar'
import { easter, holidaysOn, moonOn, phaseJD } from '@questender/engine/almanac'

const utcDay = (jd: number) => Math.floor(jd - 2440587.5)
const day = (iso: string) => Date.parse(iso) / 86400000

describe('holidays', () => {
  it('floating and fixed holidays', () => {
    expect(holidaysOn('2026-11-26')).toContain('Thanksgiving')
    expect(holidaysOn('2026-01-19')).toContain('Martin Luther King Jr. Day')
    expect(holidaysOn('2026-02-16')).toContain("Presidents' Day")
    expect(holidaysOn('2026-05-25')).toContain('Memorial Day')
    expect(holidaysOn('2026-05-10')).toContain("Mother's Day")
    expect(holidaysOn('2026-06-21')).toContain("Father's Day")
    expect(holidaysOn('2026-09-07')).toContain('Labor Day')
    expect(holidaysOn('2026-10-12')).toContain("Columbus / Indigenous Peoples' Day")
    expect(holidaysOn('2026-12-25')).toContain('Christmas')
    expect(holidaysOn('2026-10-31')).toContain('Halloween')
    expect(holidaysOn('2026-12-31')).toContain("New Year's Eve")
    expect(holidaysOn('2026-03-17')).toContain("St. Patrick's Day")
    expect(holidaysOn('2026-11-25')).toEqual([])
  })
  it('Easter via computus', () => {
    expect(easter(2026)).toBe('2026-04-05')
    expect(easter(2025)).toBe('2025-04-20')
    expect(easter(2024)).toBe('2024-03-31')
    expect(holidaysOn('2026-04-05')).toContain('Easter')
  })
})

describe('moon', () => {
  it('phase instants match published dates (UTC)', () => {
    // Full moon 2026-11-24, new moon 2026-11-09, first quarter 2026-11-17 (UTC).
    const k = Math.round((Date.UTC(2026, 10, 24) - Date.UTC(2000, 0, 6)) / 86400000 / 29.530588861 - 0.5) + 0.5
    expect(Math.abs(utcDay(phaseJD(k)) - day('2026-11-24'))).toBeLessThanOrEqual(1)
    expect(Math.abs(utcDay(phaseJD(k - 0.5)) - day('2026-11-09'))).toBeLessThanOrEqual(1)
    expect(Math.abs(utcDay(phaseJD(k - 0.25)) - day('2026-11-17'))).toBeLessThanOrEqual(1)
  })
  it('local-date lookup finds a full moon within a day of 2026-11-24, and about four phases a month', () => {
    expect([-1, 0, 1].map((n) => moonOn(addDays('2026-11-24', n)))).toContain('full')
    let count = 0
    for (let i = 0; i < 30; i++) if (moonOn(addDays('2026-11-01', i))) count++
    expect(count).toBeGreaterThanOrEqual(3)
    expect(count).toBeLessThanOrEqual(5)
    expect([-1, 0, 1].map((n) => moonOn(addDays('2000-01-06', n)))).toContain('new')
  })
})
