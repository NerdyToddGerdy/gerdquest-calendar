import { useEffect, useState } from 'react'
import { localISO, type ISODate } from '@questender/engine/calendar'

const OVERRIDE_KEY = 'questender.devToday'

/** Dev builds only: a "pretend today is…" override for testing date locks. */
export function readDevOverride(): ISODate | null {
  if (!import.meta.env.DEV) return null
  try {
    const v = localStorage.getItem(OVERRIDE_KEY)
    return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null
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
