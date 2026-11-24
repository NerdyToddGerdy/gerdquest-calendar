// Async edge for campaign packs (ADR 0003 (b)): fetch packs, register them with
// the engine, then render. The engine and the reducer stay synchronous.
import { useEffect, useState } from 'react'
import { isCampaignLoaded, loadCampaigns } from '@questender/engine/campaign'
import '@questender/engine/content/bundled'

export interface PackStatus {
  /** Every requested pack is registered, so engine lookups are safe. */
  ready: boolean
  /** Why the last attempt failed, if it did. */
  error: string | null
  retry: () => void
}

/** Make sure the packs for `ids` are loaded; re-renders when they are (or fail). */
export function useCampaignPacks(ids: string[]): PackStatus {
  const key = ids.join(',')
  const ready = ids.every(isCampaignLoaded)
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [, bump] = useState(0) // re-render once packs register (readiness is read from the engine)

  useEffect(() => {
    if (ready) return
    let live = true
    loadCampaigns(key ? key.split(',') : []).then(
      () => {
        if (!live) return
        setFailure(null)
        bump((n) => n + 1)
      },
      (e: unknown) => live && setFailure({ key, message: e instanceof Error ? e.message : String(e) }),
    )
    return () => {
      live = false
    }
  }, [key, ready, attempt])

  const error = !ready && failure?.key === key ? failure.message : null
  return {
    ready,
    error,
    retry: () => {
      setFailure(null)
      setAttempt((n) => n + 1)
    },
  }
}
