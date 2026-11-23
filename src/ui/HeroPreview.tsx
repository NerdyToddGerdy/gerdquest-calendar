import { useEffect, useRef, useState } from 'react'
import { ability, heroDef } from '@questender/engine/content'
import { POOL_NAMES, costLabel } from '@questender/engine/pools'
import { TRAITS, type HeroDef, type PoolId } from '@questender/engine/types'
import { Portrait } from './Portrait'

const sign = (n: number) => (n >= 0 ? `+${n}` : `${n}`)

function Ability({ id }: { id: string }) {
  const a = ability(id)
  const cost = costLabel(a)
  return (
    <li>
      <b>{a.name}</b>
      {cost && <span className="muted small"> ({cost})</span>} — {a.text}
    </li>
  )
}

/** Everything about a hero's starting kit and growth; never shows story content. */
export function HeroPreview({ hero }: { hero: HeroDef }) {
  const h = hero
  const pools = Object.entries(h.pools ?? {}) as [PoolId, number][]
  const levels = Object.keys(h.levels)
    .map(Number)
    .filter((l) => l >= 2 && l <= 8)
    .sort((a, b) => a - b)
  return (
    <article className="hero-preview" style={{ ['--hero' as string]: h.color }} aria-label={`${h.name} preview`}>
      <Portrait id={h.id} name={h.name} className="preview-portrait" />
      <h3>{h.name}</h3>
      <div className="muted">{h.title}</div>
      <p>{h.blurb}</p>
      <div className="mini-stats">
        <span>HP {h.maxHp}</span>
        <span>Atk {sign(h.atk)}</span>
        <span>Def {sign(h.def)}</span>
        <span>Damage d{h.dmgDie}</span>
        <span>Weapon: {h.weapon}</span>
        <span>Glint {h.glint}</span>
      </div>
      <div className="mini-stats">
        {TRAITS.map((t) => (
          <span key={t}>
            {t.toUpperCase()} {sign(h.traits[t])}
          </span>
        ))}
      </div>
      {pools.length > 0 && (
        <div className="mini-stats">
          {pools.map(([p, n]) => (
            <span key={p}>
              {POOL_NAMES[p]} pool {n}
            </span>
          ))}
        </div>
      )}
      <h4>Starting abilities</h4>
      <ul className="small">
        {h.abilities.map((id) => (
          <Ability key={id} id={id} />
        ))}
      </ul>
      {levels.length > 0 && (
        <>
          <h4>Level progression</h4>
          <div className="level-table-wrap">
            <table className="level-table">
              <thead>
                <tr>
                  <th>Lv</th>
                  <th>Gains</th>
                  <th>Ability</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((l) => {
                  const s = h.levels[l]
                  const gains = [
                    `HP +${s.maxHp}`,
                    s.atk ? `Atk ${sign(s.atk)}` : '',
                    s.def ? `Def ${sign(s.def)}` : '',
                    s.dmgDie ? `Damage die d${s.dmgDie}` : '',
                    ...TRAITS.filter((t) => s.traits?.[t]).map((t) => `${t.toUpperCase()} ${sign(s.traits![t]!)}`),
                    ...Object.entries(s.pools ?? {}).map(([p, n]) => `${POOL_NAMES[p as PoolId]} pool ${sign(n)}`),
                  ].filter(Boolean)
                  return (
                    <tr key={l}>
                      <td>{l}</td>
                      <td>{gains.join(', ')}</td>
                      <td>
                        {s.ability ? (
                          <ul className="small">
                            <Ability id={s.ability} />
                          </ul>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </article>
  )
}

interface ModalProps {
  heroId: string
  onClose: () => void
  /** If given, shows a choose button inside the modal. */
  onChoose?: () => void
  chooseDisabled?: boolean
}

/** Dialog wrapper: Esc or backdrop click closes; focus moves in and returns on close. */
export function HeroPreviewModal({ heroId, onClose, onChoose, chooseDisabled }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const hero = heroDef(heroId)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [onClose])
  return (
    <div className="hero-modal-backdrop" onClick={onClose}>
      <div className="hero-modal" role="dialog" aria-modal="true" aria-label={`${hero.name} preview`} onClick={(e) => e.stopPropagation()}>
        <div className="hero-modal-bar">
          {onChoose && (
            <button className="primary" disabled={chooseDisabled} onClick={onChoose}>
              Choose {hero.name.split(' ')[0]}
            </button>
          )}
          <button ref={closeRef} onClick={onClose}>
            Close
          </button>
        </div>
        <HeroPreview hero={hero} />
      </div>
    </div>
  )
}

/** A "Preview" button that opens the modal; self-contained for use anywhere. */
export function HeroPreviewButton({ heroId, label = 'Preview hero' }: { heroId: string; label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className="preview-btn" onClick={() => setOpen(true)}>
        {label}
      </button>
      {open && <HeroPreviewModal heroId={heroId} onClose={() => setOpen(false)} />}
    </>
  )
}
