import { useEffect, useState } from 'react'
import { persistenceMessage } from '../backup'
import { isPersisted, requestPersistence } from '../deviceStorage'
import { APP_VERSION, CHANGELOG } from '../changelog'
import { formatLong } from '@questender/engine/calendar'
import type { ThemePref } from '../theme'
import { campaign } from '@questender/engine/campaign'
import { STYLE_CATEGORIES, STYLE_LABELS, rewardTheme } from '@questender/engine/rewards'
import { playedDates, type Action } from '@questender/engine/state'
import type { DeskSlot } from './Desk'

interface Props {
  theme: ThemePref
  onTheme: (t: ThemePref) => void
  /** Number of campaigns on the desk (Export all needs at least one). */
  campaigns: number
  /** The campaigns on the desk, for their per-campaign looks. */
  slots: DeskSlot[]
  onDispatch: (id: string, a: Action) => void
  onImport: () => void
  onExportAll: () => void
  onClose: () => void
}

const THEMES: { id: ThemePref; label: string; hint: string }[] = [
  { id: 'system', label: 'System', hint: 'Match your device' },
  { id: 'light', label: 'Light', hint: 'Light paper' },
  { id: 'dark', label: 'Dark', hint: 'Lantern-lit' },
]

/** The ⚙ menu: appearance, saving/loading your data, and what's new. */
export function Settings({ theme, onTheme, campaigns, slots, onDispatch, onImport, onExportAll, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const [latest, ...rest] = CHANGELOG
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [canPersist] = useState(() => typeof navigator !== 'undefined' && !!navigator.storage?.persist)
  useEffect(() => {
    void isPersisted().then(setPersisted)
  }, [])

  return (
    <div className="hero-modal-backdrop" onClick={onClose}>
      <div className="hero-modal settings" role="dialog" aria-modal="true" aria-label="Settings" onClick={(e) => e.stopPropagation()}>
        <div className="settings-bar">
          <h2>Settings</h2>
          <button onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </div>

        <section className="settings-section">
          <h3>Appearance</h3>
          <div className="segmented" role="radiogroup" aria-label="Appearance">
            {THEMES.map((t) => (
              <button
                key={t.id}
                role="radio"
                aria-checked={theme === t.id}
                className={theme === t.id ? 'active' : ''}
                title={t.hint}
                onClick={() => onTheme(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {slots.some((s) => rewardTheme(s.state.campaignId).styles.length > 0) && (
          <section className="settings-section" aria-label="Campaign looks">
            <h3>Campaign looks</h3>
            <p className="muted small">Each campaign unlocks its own page paper, dice and page edge as you play days in it. The look shows when that campaign’s tab is selected.</p>
            {slots.map((s) => {
              const days = playedDates(s.state).length
              const styles = rewardTheme(s.state.campaignId).styles
              if (!styles.length) return null
              return (
                <fieldset key={s.id} className="looks">
                  <legend>{campaign(s.state.campaignId).title}</legend>
                  {STYLE_CATEGORIES.map((cat) => {
                    const options = styles.filter((x) => x.category === cat)
                    if (!options.length) return null
                    const current = s.state.style?.[cat] ?? ''
                    return (
                      <div key={cat} className="look-row">
                        <span className="look-label">{STYLE_LABELS[cat]}</span>
                        <div className="segmented" role="radiogroup" aria-label={`${STYLE_LABELS[cat]} for ${campaign(s.state.campaignId).title}`}>
                          <button role="radio" aria-checked={current === ''} className={current === '' ? 'active' : ''} onClick={() => onDispatch(s.id, { type: 'SET_STYLE', category: cat, id: null })}>
                            Default
                          </button>
                          {options.map((o) => {
                            const open = days >= o.days
                            return (
                              <button
                                key={o.id}
                                role="radio"
                                aria-checked={current === o.id}
                                className={current === o.id ? 'active' : ''}
                                disabled={!open}
                                title={open ? o.name : o.hint}
                                onClick={() => onDispatch(s.id, { type: 'SET_STYLE', category: cat, id: o.id })}
                              >
                                {open ? o.name : '???'}
                              </button>
                            )
                          })}
                        </div>
                        {options.some((o) => days < o.days) && <span className="muted small">{options.find((o) => days < o.days)?.hint}</span>}
                      </div>
                    )
                  })}
                </fieldset>
              )
            })}
          </section>
        )}

        <section className="settings-section">
          <h3>Your data</h3>
          <p className="muted small">
            Progress, achievements and keepsakes are saved in this browser. Export a file to keep a backup or to carry your campaigns to another device, then Import it there.
          </p>
          <div className="row">
            <button onClick={onExportAll} disabled={campaigns === 0} title="Download one file with every campaign">
              Export all campaigns
            </button>
            <button onClick={onImport} title="Load a single-campaign or Export all file">
              Import from file…
            </button>
          </div>
          <p className="muted small">{persistenceMessage(persisted)}</p>
          {canPersist && persisted !== true && (
            <div className="row">
              <button onClick={() => void requestPersistence().then((r) => r !== null && setPersisted(r))} title="Ask the browser to keep your saves">
                Ask the browser to keep my progress
              </button>
            </div>
          )}
          <p className="muted small">To export just one campaign, use Export on that campaign’s tab.</p>
        </section>

        <section className="settings-section" aria-label="What’s new">
          <h3>What’s new</h3>
          <ReleaseNotes release={latest} open />
          {rest.length > 0 && (
            <details>
              <summary className="small">Earlier updates</summary>
              {rest.map((r) => (
                <ReleaseNotes key={r.version} release={r} />
              ))}
            </details>
          )}
        </section>

        <p className="muted small center-text">Questender v{APP_VERSION}</p>
        <nav className="settings-legal small center-text" aria-label="Legal">
          <a href="../privacy.html">Privacy</a>
          <a href="../terms.html">Terms</a>
        </nav>
      </div>
    </div>
  )
}

function ReleaseNotes({ release, open = false }: { release: (typeof CHANGELOG)[number]; open?: boolean }) {
  return (
    <article className={`release ${open ? 'latest' : ''}`}>
      <header>
        <strong>{release.title}</strong>
        <span className="muted small">
          v{release.version} · {formatLong(release.date).split(', ').slice(1).join(', ')}
        </span>
      </header>
      <ul>
        {release.changes.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
    </article>
  )
}
