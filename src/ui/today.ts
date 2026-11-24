import { useEffect, useState } from 'react'
import { localISO, type ISODate } from '@questender/engine/calendar'

const OVERRIDE_KEY = 'questender.devToday'

const ISO = /^\d{4}-\d{2}-\d{2}$/

/**
 * End-to-end test builds only (VITE_E2E is never set for the Pages build; Vite
 * replaces it with a literal so this branch is dead code in production): pin
 * "today" with ?today=YYYY-MM-DD, remembered for the tab's session so it
 * survives reloads.
 */
function readE2EToday(): ISODate | null {
  if (!import.meta.env.VITE_E2E) return null
  try {
    const q = new URLSearchParams(location.search).get('today')
    if (q && ISO.test(q)) sessionStorage.setItem('questender.e2eToday', q)
    const v = sessionStorage.getItem('questender.e2eToday')
    return v && ISO.test(v) ? v : null
  } catch {
    return null
  }
}

/** Dev builds only: a "pretend today is…" override for testing date locks. */
export function readDevOverride(): ISODate | null {
  if (!import.meta.env.DEV) return readE2EToday()
  try {
    const v = localStorage.getItem(OVERRIDE_KEY)
    return v && ISO.test(v) ? v : null
  } catch {
    return null
  }
}

export function writeDevOverride(v: ISODate | null) {
  if (!import.meta.env.DEV) return
  try {
    if (v) localStorage.setItem(OVERRIDE_KEY, v)
    else localStorage.removeItem(OVERRIDE_KEY)
  } catch {
    /* ignore */
  }
}

function computeToday(): ISODate {
  return readDevOverride() ?? localISO(new Date())
}

/** The player's local date, re-checked every minute so pages unlock at midnight. */
export function useToday(): [ISODate, () => void] {
  const [today, setToday] = useState(computeToday)
  useEffect(() => {
    const t = setInterval(() => setToday(computeToday()), 60_000)
    return () => clearInterval(t)
  }, [])
  return [today, () => setToday(computeToday())]
}
