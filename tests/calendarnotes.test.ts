import { beforeEach, describe, expect, it } from 'vitest'
import { entriesOn, importEntries, loadEntries, mergeEntries, sanitizeEntries, saveEntries } from '../src/calendarNotes'
import { bundleSaves, parseCalendar, parseSaves } from '../src/save'
import { addMonths, monthCells, shiftCursor, viewTitle, weekCells } from '../src/engine/calview'
import { initialState, reduce } from '../src/engine/state'

function stubStorage() {
  const m = new Map<string, string>()
  ;(globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  }
}

describe('calendar notes', () => {
  beforeEach(stubStorage)

  it('round-trips through storage and tolerates junk', () => {
    expect(loadEntries()).toEqual([])
    saveEntries([{ id: 'a', date: '2026-12-01', text: 'Dentist', time: '09:30' }])
    expect(loadEntries()).toEqual([{ id: 'a', date: '2026-12-01', text: 'Dentist', time: '09:30' }])
    localStorage.setItem('questender.calendar', '{not json')
    expect(loadEntries()).toEqual([])
  })

  it('sanitizes bad entries and times', () => {
    const out = sanitizeEntries([{ id: 'a', date: '2026-12-01', text: ' hi ', time: '25:00' }, { id: '', date: '2026-12-01', text: 'x' }, { id: 'b', date: 'nope', text: 'x' }, null, { id: 'c', date: '2026-12-02', text: '  ' }])
    expect(out).toEqual([{ id: 'a', date: '2026-12-01', text: 'hi' }])
  })

  it('merges by id, keeping existing entries', () => {
    const a = { id: '1', date: '2026-12-01', text: 'mine' }
    const merged = mergeEntries([a], [{ ...a, text: 'theirs' }, { id: '2', date: '2026-12-02', text: 'new' }])
    expect(merged.map((e) => e.text)).toEqual(['mine', 'new'])
    saveEntries([a])
    expect(importEntries([{ id: '2', date: '2026-12-02', text: 'new' }, a])).toHaveLength(2)
    expect(loadEntries()).toHaveLength(2)
  })

  it('lists a date’s entries in time order', () => {
    const list = [
      { id: '1', date: '2026-12-01', text: 'late', time: '18:00' },
      { id: '2', date: '2026-12-01', text: 'early', time: '07:00' },
      { id: '3', date: '2026-12-02', text: 'other' },
    ]
    expect(entriesOn(list, '2026-12-01').map((e) => e.text)).toEqual(['early', 'late'])
  })

  it('Export all carries entries; single-campaign files and old bundles still import', () => {
    const state = reduce(initialState(), { type: 'NEW_GAME', heroId: 'wren', seed: 3, campaignId: 'brightwatch', startDate: '2026-01-05' })
    const entries = [{ id: 'a', date: '2027-01-01', text: 'Future plan' }]
    const text = JSON.stringify(bundleSaves([state], '2026-01-05', entries))
    expect(parseCalendar(text)).toEqual(entries)
    expect(parseSaves(text, '2026-01-05')).toHaveLength(1)
    const old = JSON.stringify(bundleSaves([state], '2026-01-05'))
    expect(parseCalendar(old)).toEqual([])
    expect(parseCalendar(JSON.stringify(state))).toEqual([])
    expect(parseSaves(JSON.stringify(state), '2026-01-05')).toHaveLength(1)
  })
})

describe('calendar navigation', () => {
  it('moves by the current unit', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28')
    expect(addMonths('2026-01-15', -1)).toBe('2025-12-15')
    expect(shiftCursor('2026-11-23', 'week', 1)).toBe('2026-11-30')
    expect(shiftCursor('2026-11-23', 'year', -1)).toBe('2025-11-23')
    expect(shiftCursor('2026-11-23', 'wall', 1)).toBe('2026-12-23')
  })
  it('grids are whole weeks', () => {
    expect(monthCells(2026, 2)).toHaveLength(28) // Feb 2026 starts on Sunday
    expect(monthCells(2026, 11)).toHaveLength(35)
    expect(monthCells(2026, 8)).toHaveLength(42)
    expect(weekCells('2026-11-25')[0]).toBe('2026-11-22')
    expect(viewTitle('2026-11-25', 'week')).toBe('Nov 22 – 28, 2026')
    expect(viewTitle('2026-11-25', 'year')).toBe('2026')
  })
})
