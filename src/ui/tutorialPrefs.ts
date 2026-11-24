// Tutorial tips: which ones the player has seen, and whether tips are off.
// Stored per device; a tiny subscribe/notify store so Settings can turn tips
// back on while the desk is open.

const KEY = 'questender.tutorial'

/** Tips show during the player's first few days of play. */
export const TUTORIAL_DAYS = 3

export interface TutorialPrefs {
  off: boolean
  /** Tip ids seen. Repeating tips are stored as `id@date`, so they come back the next day. */
  seen: string[]
  /** Real dates (the player's today) on which tips were shown. */
  days: string[]
}

const listeners = new Set<() => void>()
let cache: TutorialPrefs | null = null

export function readTutorial(): TutorialPrefs {
  if (cache) return cache
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<TutorialPrefs> | null
    cache = {
      off: !!raw?.off,
      seen: Array.isArray(raw?.seen) ? raw.seen.filter((x) => typeof x === 'string') : [],
      days: Array.isArray(raw?.days) ? raw.days.filter((x) => typeof x === 'string') : [],
    }
  } catch {
    cache = { off: false, seen: [], days: [] }
  }
  return cache
}

function write(next: TutorialPrefs): void {
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* tips still work for this visit */
  }
  listeners.forEach((l) => l())
}

export function markSeen(key: string): void {
  const t = readTutorial()
  if (!t.seen.includes(key)) write({ ...t, seen: [...t.seen, key] })
}

export function skipTutorial(): void {
  write({ ...readTutorial(), off: true })
}

/** Turn tips back on and show them all again (from Settings). */
export function restartTutorial(): void {
  write({ off: false, seen: [], days: [] })
}

/**
 * Tips are on for the first TUTORIAL_DAYS real days the player opens the
 * desk (counted by visit, not by page, so the warm-up pages of a new
 * campaign don't use them up).
 */
export function tutorialActive(t: TutorialPrefs, today: string): boolean {
  if (t.off) return false
  return t.days.includes(today) || t.days.length < TUTORIAL_DAYS
}

/** Count today as a tutorial day. */
export function recordTutorialDay(today: string): void {
  const t = readTutorial()
  if (!t.off && !t.days.includes(today) && t.days.length < TUTORIAL_DAYS) write({ ...t, days: [...t.days, today] })
}

export function subscribeTutorial(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/**
 * First run of a build with tips: players who already have plenty of pages
 * behind them start with tips off (they can turn them on in Settings).
 */
export function initTutorial(veteran: boolean): void {
  let stored = true
  try {
    stored = localStorage.getItem(KEY) !== null
  } catch {
    /* treat as stored: never force tips off when storage is unreadable */
  }
  if (!stored && veteran) write({ ...readTutorial(), off: true })
}
