import { describe, expect, it } from 'vitest'
import { persistenceMessage, shouldRemindBackup, snoozeUntil, type BackupFacts } from '../src/backup'

const base: BackupFacts = { campaigns: 1, playedDays: 5, lastExport: null, snoozedUntil: null, today: '2026-11-24' }
const ask = (o: Partial<BackupFacts>) => shouldRemindBackup({ ...base, ...o })

describe('backup reminder', () => {
  it('stays quiet with no campaigns', () => {
    expect(ask({ campaigns: 0, playedDays: 9 })).toBe(false)
  })
  it('asks a never-exported player only after 3 played days', () => {
    expect(ask({ playedDays: 2 })).toBe(false)
    expect(ask({ playedDays: 3 })).toBe(true)
  })
  it('asks 7 days after the last export, not before', () => {
    expect(ask({ lastExport: '2026-11-18' })).toBe(false)
    expect(ask({ lastExport: '2026-11-17' })).toBe(true)
    expect(ask({ lastExport: '2026-10-30', playedDays: 0 })).toBe(true)
  })
  it('a recent export wins even with many played days', () => {
    expect(ask({ lastExport: '2026-11-24', playedDays: 90 })).toBe(false)
  })
  it('snoozing hides it until the snooze date', () => {
    const until = snoozeUntil('2026-11-24')
    expect(until).toBe('2026-12-01')
    expect(ask({ snoozedUntil: until, today: '2026-11-30' })).toBe(false)
    expect(ask({ snoozedUntil: until, today: '2026-12-01' })).toBe(true)
  })
  it('snooze crosses month and year ends', () => {
    expect(snoozeUntil('2026-12-28')).toBe('2027-01-04')
  })
})

describe('persistence message', () => {
  it('says whether the browser may clear the data', () => {
    expect(persistenceMessage(true)).toMatch(/kept until you clear it/)
    expect(persistenceMessage(false)).toMatch(/may clear it/)
    expect(persistenceMessage(null)).toMatch(/stored on this device/)
  })
})
