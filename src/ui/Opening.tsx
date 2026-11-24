import type { PackStatus } from '../useCampaignPacks'

/**
 * Calm placeholder shown while a campaign's pages download. Reserves the height
 * of the content it stands in for so nothing jumps when the pack arrives.
 */
export function Opening({ what, status, className = '' }: { what: string; status: Pick<PackStatus, 'error' | 'retry'>; className?: string }) {
  return (
    <div className={`opening ${className}`} role="status" aria-live="polite">
      {status.error ? (
        <>
          <p className="error">We couldn’t open {what}. Check your connection and try again.</p>
          <button className="primary" onClick={status.retry}>
            Try again
          </button>
        </>
      ) : (
        <p className="muted">Opening {what}…</p>
      )}
    </div>
  )
}
