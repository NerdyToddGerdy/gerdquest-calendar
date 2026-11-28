import { useEffect, useId, useRef } from 'react'
import { heroDef } from '@questender/engine/content'
import {
  COSMETICS,
  DEFAULT_AVATAR,
  DEFAULT_BORDER,
  TOKEN_REWARDS,
  type TokenCosmetic,
} from '@questender/engine/tokens'
import type { Progress } from '@questender/engine/progress'
import { PORTRAIT_IMAGES } from './portraits/art'
import { PortraitArt } from './portraits/draw'
import { PORTRAITS } from './portraits/specs'
import { BOX } from './portraits/spec'
import { avatarName, borderName, tokenLabel } from './tokenNames'

/** How each border looks: two colours (outer to inner) and a small motif repeated around the rim. */
type Motif = 'dots' | 'stars' | 'snow' | 'leaf' | 'waves' | 'dash' | 'ticks' | 'diamond' | 'pearl'
const BORDERS: Record<string, { a: string; b: string; motif?: Motif }> = {
  plain: { a: 'var(--muted)', b: 'var(--line)' },
  'brightwatch-border1': { a: '#f0c25a', b: '#b9812a', motif: 'dots' },
  'brightwatch-border2': { a: '#6fd3b4', b: '#2f9c84', motif: 'waves' },
  'emberroad-border1': { a: '#bfe6f8', b: '#5aa7cf', motif: 'snow' },
  'emberroad-border2': { a: '#ff9a55', b: '#c24d17', motif: 'diamond' },
  'halcyon-border1': { a: '#d58cff', b: '#6a45c4', motif: 'dash' },
  'halcyon-border2': { a: '#5d7bd8', b: '#241a4d', motif: 'stars' },
  'starwake-border1': { a: '#eae6f2', b: '#3fbfae', motif: 'pearl' },
  'starwake-border2': { a: '#f3cf62', b: '#c79a22', motif: 'stars' },
  'verdant-border1': { a: '#9fd069', b: '#4a7a1e', motif: 'leaf' },
  'verdant-border2': { a: '#a6743c', b: '#5f3d1c', motif: 'ticks' },
  'santa-border1': { a: '#3f9a5a', b: '#c8342e', motif: 'leaf' },
  'santa-border2': { a: '#f4f0f0', b: '#d02a32', motif: 'dash' },
  gilded: { a: '#fff0a6', b: '#c6911f', motif: 'stars' },
}

/** The head-and-shoulders crop of a 120x140 portrait box. */
const CROP = '34 18 52 52'

function colourOf(heroId: string): string {
  try {
    return heroDef(heroId).color
  } catch {
    return '#8796a3'
  }
}

function Emblem({ campaignId }: { campaignId: string }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 3.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  switch (campaignId) {
    case 'brightwatch':
      return (
        <g {...s}>
          <path d="M42 74 L46 40 H54 L58 74 Z" />
          <path d="M44 40 H56 L50 30 Z" />
          <path d="M30 33 L40 36 M70 33 L60 36 M32 24 L42 31 M68 24 L58 31" />
        </g>
      )
    case 'emberroad':
      return (
        <g {...s}>
          <path d="M50 24 V76 M28 37 L72 63 M28 63 L72 37" />
          <path d="M43 28 L50 34 L57 28 M43 72 L50 66 L57 72" />
        </g>
      )
    case 'halcyon':
      return (
        <g {...s}>
          <circle cx="50" cy="50" r="13" />
          <ellipse cx="50" cy="50" rx="28" ry="8" transform="rotate(-20 50 50)" />
        </g>
      )
    case 'starwake':
      return (
        <g {...s}>
          <path d="M50 24 L56 44 L76 50 L56 56 L50 76 L44 56 L24 50 L44 44 Z" />
        </g>
      )
    case 'santa':
      // A star on top of a little tree.
      return (
        <g {...s}>
          <path d="M50 22 L53 30 L61 30 L55 35 L57 43 L50 38 L43 43 L45 35 L39 30 L47 30 Z" />
          <path d="M50 44 L36 60 H44 L32 74 H68 L56 60 H64 Z" />
        </g>
      )
    default:
      return (
        <g {...s}>
          <path d="M30 70 C28 40 50 24 72 28 C74 52 56 72 30 70 Z" />
          <path d="M30 70 L56 44" />
        </g>
      )
  }
}

function Motifs({ motif, color }: { motif: Motif; color: string }) {
  const n = 12
  return (
    <g fill={color} stroke={color} strokeWidth="1" strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const angle = (360 / n) * i
        const at = `rotate(${angle} 50 50) translate(50 6.5)`
        switch (motif) {
          case 'stars':
            return <path key={i} transform={at} d="M0 -2.6 L0.8 -0.8 L2.6 0 L0.8 0.8 L0 2.6 L-0.8 0.8 L-2.6 0 L-0.8 -0.8 Z" stroke="none" />
          case 'snow':
            return <path key={i} transform={at} d="M0 -2.4 V2.4 M-2.1 -1.2 L2.1 1.2 M-2.1 1.2 L2.1 -1.2" fill="none" strokeWidth="0.9" />
          case 'leaf':
            return <ellipse key={i} transform={`${at} rotate(${i % 2 ? 40 : -40})`} rx="1.1" ry="2.6" stroke="none" />
          case 'waves':
            return <path key={i} transform={at} d="M-2.6 0.6 Q-1.3 -1.6 0 0.6 T2.6 0.6" fill="none" strokeWidth="1" />
          case 'dash':
            return <path key={i} transform={at} d="M0 -2.4 V2.4" fill="none" strokeWidth="1.5" />
          case 'ticks':
            return <path key={i} transform={at} d="M-1.6 -2 L1.6 2" fill="none" strokeWidth="1.1" />
          case 'diamond':
            return <path key={i} transform={at} d="M0 -2.4 L1.8 0 L0 2.4 L-1.8 0 Z" stroke="none" />
          case 'pearl':
            return <circle key={i} transform={at} r={i % 2 ? 1.1 : 1.9} stroke="none" />
          default:
            return <circle key={i} transform={at} r="1.3" stroke="none" />
        }
      })}
    </g>
  )
}

interface TokenProps {
  avatar: string
  border: string
  /** Pixel size (the token is round). */
  size?: number
  /** Accessible name; omit to hide the token from assistive tech (when a label sits beside it). */
  label?: string
  className?: string
}

/** A round token: a hero's head and shoulders (or an emblem or monogram) inside a themed rim. */
export function Token({ avatar, border, size = 40, label, className = '' }: TokenProps) {
  const uid = useId().replace(/:/g, '')
  const look = BORDERS[border] ?? BORDERS.plain
  const emblem = TOKEN_REWARDS.find((c) => c.id === avatar && c.category === 'avatar')
  const spec = PORTRAITS[avatar]
  const img = PORTRAIT_IMAGES[avatar]
  const tint = emblem ? (BORDERS[`${emblem.campaignId}-border1`]?.a ?? '#8796a3') : avatar === DEFAULT_AVATAR || (!spec && !img) ? 'var(--accent)' : colourOf(avatar)
  return (
    <svg
      className={`token ${className}`}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <clipPath id={`clip${uid}`}>
          <circle cx="50" cy="50" r="40" />
        </clipPath>
        <linearGradient id={`rim${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={look.a} />
          <stop offset="1" stopColor={look.b} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="40" style={{ fill: `color-mix(in srgb, ${tint} 30%, var(--panel))` }} />
      <g clipPath={`url(#clip${uid})`}>
        {emblem ? (
          <g style={{ color: tint }}>
            <Emblem campaignId={emblem.campaignId!} />
          </g>
        ) : img ? (
          <svg x="0" y="0" width="100" height="100" viewBox={CROP}>
            <image href={img} x="0" y="0" width={BOX.w} height={BOX.h} preserveAspectRatio="xMidYMax meet" />
          </svg>
        ) : spec ? (
          <svg x="0" y="0" width="100" height="100" viewBox={CROP}>
            <PortraitArt spec={spec} />
          </svg>
        ) : (
          <text x="50" y="64" textAnchor="middle" fontSize="44" fontWeight="700" style={{ fontFamily: 'var(--display)', fill: 'var(--accent)' }}>
            Q
          </text>
        )}
      </g>
      <circle cx="50" cy="50" r="44.5" fill="none" stroke={`url(#rim${uid})`} strokeWidth="8" />
      <circle cx="50" cy="50" r="40.2" fill="none" stroke="#000" strokeOpacity="0.28" strokeWidth="1" />
      <circle cx="50" cy="50" r="48.6" fill="none" stroke="#000" strokeOpacity="0.28" strokeWidth="0.8" />
      {look.motif && <Motifs motif={look.motif} color={look.b === 'var(--line)' ? 'var(--text)' : '#fff'} />}
    </svg>
  )
}


interface PickerProps {
  progress: Progress
  onChoose: (token: Progress['token']) => void
  onClose: () => void
}

/** "Your token": pick among the tokens and borders earned so far; the rest show as ??? with a hint. */
export function TokenPicker({ progress, onChoose, onClose }: PickerProps) {
  const first = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    first.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const ownedAvatars = [DEFAULT_AVATAR, ...progress.avatars.map((a) => a.id)]
  const ownedBorders = [DEFAULT_BORDER, ...progress.borders.map((b) => b.id)]
  const lockedAvatars = COSMETICS.filter((c) => c.category === 'avatar' && c.days !== null && !ownedAvatars.includes(c.id))
  const lockedBorders = COSMETICS.filter((c) => c.category === 'border' && !ownedBorders.includes(c.id) && c.id !== DEFAULT_BORDER)
  const { avatar, border } = progress.token

  const locked = (c: TokenCosmetic) => (
    <li key={c.id} className="token-opt locked">
      <span className="token-q" aria-label="Not yet earned">???</span>
      <small>{c.hint}</small>
    </li>
  )

  return (
    // Backdrop click is a mouse convenience only; keyboard users close with Esc (handled above) or the Close button.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="hero-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="hero-modal token-picker"
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a modal with its own focus trap over a click-away backdrop; native <dialog> would need showModal() and a top-layer rewrite
        role="dialog" aria-modal="true" aria-label="Your token">
        <div className="settings-bar">
          <h2>Your token</h2>
          <button onClick={onClose} aria-label="Close your token">
            ✕
          </button>
        </div>
        <div className="token-preview">
          <Token avatar={avatar} border={border} size={96} label={tokenLabel(avatar, border)} />
          <p className="muted small">Tokens and borders are earned by playing. Playing a hero earns their token; days played in a campaign earn its borders.</p>
        </div>

        <section className="settings-section">
          <h3>Tokens</h3>
          <ul className="token-grid" role="radiogroup" aria-label="Token">
            {ownedAvatars.map((id, i) => (
              <li key={id} className="token-opt">
                <button ref={i === 0 ? first : undefined}
                  // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a styled button in a radiogroup; native radio inputs would need a hidden-input restructure and new CSS
                  role="radio" aria-checked={avatar === id} className={avatar === id ? 'active' : ''} onClick={() => onChoose({ avatar: id, border })}>
                  <Token avatar={id} border={border} size={56} />
                  <span>{avatarName(id)}</span>
                </button>
              </li>
            ))}
            {lockedAvatars.map(locked)}
            <li className="token-opt locked">
              <span className="token-q" aria-label="Not yet earned">???</span>
              <small>Play as a hero to earn their token.</small>
            </li>
          </ul>
        </section>

        <section className="settings-section">
          <h3>Borders</h3>
          <ul className="token-grid" role="radiogroup" aria-label="Border">
            {ownedBorders.map((id) => (
              <li key={id} className="token-opt">
                <button
                  // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a styled button in a radiogroup; native radio inputs would need a hidden-input restructure and new CSS
                  role="radio" aria-checked={border === id} className={border === id ? 'active' : ''} onClick={() => onChoose({ avatar, border: id })}>
                  <Token avatar={avatar} border={id} size={56} />
                  <span>{borderName(id)}</span>
                </button>
              </li>
            ))}
            {lockedBorders.map(locked)}
          </ul>
        </section>
      </div>
    </div>
  )
}
