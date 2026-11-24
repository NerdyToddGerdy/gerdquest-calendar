import type { ReactNode } from 'react'
import type { HiddenIcon, Scene as SceneKind } from '@questender/engine/types'
import { EMBER_SKIES, EMBER_ART } from './scenes/emberroad'
import { STARWAKE_SKIES, STARWAKE_ART } from './scenes/starwake'
import { VERDANT_SKIES, VERDANT_ART } from './scenes/verdant'
import { SceneActor } from './Portrait'

interface Props {
  scene: SceneKind
  icons: HiddenIcon[]
  found: boolean[]
  disabled: boolean
  onFind: (index: number) => void
  /** Characters standing in the scene: the hero on the left, a boss facing them on the right. */
  actors?: { hero?: string; foe?: string }
}

const SKIES: Record<SceneKind, [string, string]> = {
  ...EMBER_SKIES,
  ...STARWAKE_SKIES,
  ...VERDANT_SKIES,
  harbor: ['#1d3149', '#7b6a62'],
  tower: ['#22324a', '#c08a52'],
  cellar: ['#14110f', '#3a2d24'],
  depths: ['#07090c', '#1a2027'],
  seacave: ['#071a22', '#1e4a52'],
  inn: ['#2a1a12', '#7a4a26'],
  station: ['#101826', '#2c3b52'],
  bridge: ['#0b1220', '#1b2a3a'],
  space: ['#03040a', '#0d1430'],
  wreck: ['#0a0c10', '#2a2320'],
}

/** Procedural scene art, drawn in SVG so the game ships with no image assets. */
export function Scene({ scene, icons, found, disabled, onFind, actors }: Props) {
  const [top, bottom] = SKIES[scene]
  return (
    <div className="scene">
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={`sky-${scene}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={top} />
            <stop offset="1" stopColor={bottom} />
          </linearGradient>
          <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffd88a" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffd88a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="200" fill={`url(#sky-${scene})`} />
        {SCENES[scene]}
        {actors?.foe && <SceneActor id={actors.foe} x={300} y={197} height={150} flip />}
        {actors?.hero && <SceneActor id={actors.hero} x={96} y={197} height={112} />}
      </svg>
      {icons.map((icon, i) =>
        found[i] ? null : (
          <button
            key={i}
            className="hidden-icon"
            style={{ left: `${icon.x}%`, top: `${icon.y}%` }}
            disabled={disabled}
            onClick={() => onFind(i)}
            title={icon.kind === 'pickpocket' ? 'An unattended purse…' : 'Something tucked away…'}
            aria-label={icon.kind === 'pickpocket' ? 'Hidden purse' : 'Hidden cache'}
          >
            {icon.kind === 'pickpocket' ? <PurseGlyph /> : <PackGlyph />}
          </button>
        ),
      )}
    </div>
  )
}

function PurseGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d="M8 6 L16 6 L14 9 Q20 12 19 17 Q18 21 12 21 Q6 21 5 17 Q4 12 10 9 Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 4 L15 4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function PackGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <rect x="5" y="7" width="14" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 7 Q9 3 12 3 Q15 3 15 7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="9" y="12" width="6" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

const waves = (y: number, color: string, opacity = 1) => (
  <path
    d={`M0 ${y} Q25 ${y - 6} 50 ${y} T100 ${y} T150 ${y} T200 ${y} T250 ${y} T300 ${y} T350 ${y} T400 ${y} V200 H0 Z`}
    fill={color}
    opacity={opacity}
  />
)

const lighthouse = (x: number, base: number, scale = 1) => (
  <g transform={`translate(${x} ${base}) scale(${scale})`}>
    <circle cx="0" cy="-118" r="40" fill="url(#glow)" />
    <path d="M-14 0 L-9 -100 L9 -100 L14 0 Z" fill="#1a1a22" />
    <path d="M-11 -40 L11 -40 L11.5 -32 L-11.5 -32 Z M-10 -70 L10 -70 L10.4 -62 L-10.4 -62 Z" fill="#7a2f2a" />
    <rect x="-8" y="-114" width="16" height="14" fill="#ffd88a" />
    <path d="M-11 -114 L0 -126 L11 -114 Z" fill="#1a1a22" />
    <path d="M0 -107 L-120 -130 L-120 -90 Z" fill="#ffe2a0" opacity="0.12" />
  </g>
)

const SCENES: Record<SceneKind, ReactNode> = {
  ...EMBER_ART,
  ...STARWAKE_ART,
  ...VERDANT_ART,
  harbor: (
    <>
      <path d="M0 120 L60 105 L110 115 L150 100 L190 118 L400 112 V200 H0 Z" fill="#2c3440" opacity="0.6" />
      {lighthouse(300, 150)}
      <path d="M240 150 Q300 128 360 150 L370 200 H230 Z" fill="#17181d" />
      {waves(160, '#152536')}
      {waves(176, '#0e1b28')}
      <path d="M60 168 L95 168 L90 176 L66 176 Z M78 168 L78 145 L92 165 Z" fill="#0b0f14" />
    </>
  ),
  tower: (
    <>
      <path d="M0 200 L0 80 L60 60 L60 200 Z" fill="#1b2230" />
      {lighthouse(200, 200, 1.4)}
      <path d="M0 170 H400 V200 H0 Z" fill="#2a2a30" />
      {[...Array(10)].map((_, i) => (
        <rect key={i} x={i * 40 + 6} y="160" width="26" height="10" fill="#2a2a30" />
      ))}
      <circle cx="340" cy="40" r="14" fill="#f2e2b0" opacity="0.6" />
    </>
  ),
  cellar: (
    <>
      {[40, 160, 280].map((x) => (
        <path key={x} d={`M${x} 200 V90 Q${x + 40} 40 ${x + 80} 90 V200 Z`} fill="#0b0907" />
      ))}
      <path d="M0 180 H400 V200 H0 Z" fill="#20303a" opacity="0.8" />
      {[...Array(14)].map((_, i) => (
        <path key={i} d={`M${i * 30 + 5} 180 q8 -30 -4 -60 q-6 -14 6 -26`} stroke="#5d6b5a" strokeWidth="2" fill="none" opacity="0.7" />
      ))}
      <circle cx="200" cy="70" r="30" fill="url(#glow)" opacity="0.4" />
    </>
  ),
  depths: (
    <>
      <ellipse cx="200" cy="110" rx="120" ry="80" fill="#000" opacity="0.7" />
      {[[150, 95], [170, 102], [230, 90], [250, 98], [205, 120], [190, 80], [215, 82]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="2" fill="#d8e6ef" />
          <circle cx={x + 6} cy={y} r="2" fill="#d8e6ef" />
        </g>
      ))}
      <path d="M0 0 Q60 60 0 200 Z M400 0 Q340 60 400 200 Z" fill="#11161b" />
    </>
  ),
  seacave: (
    <>
      <path d="M0 0 H400 V40 Q300 90 200 60 Q100 90 0 40 Z" fill="#06121a" />
      {waves(150, '#0f3a44', 0.9)}
      {waves(172, '#0a2a33')}
      <g transform="translate(200 120)">
        <path d="M-18 0 Q-18 -30 0 -32 Q18 -30 18 0 Z" fill="#6f5a2a" />
        <rect x="-22" y="0" width="44" height="5" fill="#5a4822" />
      </g>
      <path d="M270 150 L272 70 Q285 55 298 70 L300 150 Z" fill="#0d1a1c" opacity="0.9" />
      <circle cx="285" cy="78" r="3" fill="#8fe3d0" />
    </>
  ),
  inn: (
    <>
      <rect x="0" y="150" width="400" height="50" fill="#3a2414" />
      <rect x="40" y="40" width="70" height="60" fill="#f0c27a" opacity="0.55" />
      <path d="M75 40 V100 M40 70 H110" stroke="#2a1a12" strokeWidth="4" />
      <circle cx="260" cy="60" r="50" fill="url(#glow)" opacity="0.5" />
      <rect x="150" y="125" width="200" height="12" fill="#5c3a1f" />
      <rect x="160" y="137" width="8" height="40" fill="#5c3a1f" />
      <rect x="332" y="137" width="8" height="40" fill="#5c3a1f" />
      <rect x="200" y="108" width="12" height="17" rx="2" fill="#c98a3e" />
      <rect x="240" y="110" width="12" height="15" rx="2" fill="#c98a3e" />
      <rect x="290" y="106" width="12" height="19" rx="2" fill="#c98a3e" />
    </>
  ),
  station: (
    <>
      <rect x="0" y="0" width="400" height="200" fill="#0e1520" opacity="0.4" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={20 + i * 78} y="30" width="60" height="110" rx="6" fill="#1a2536" stroke="#33465f" />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={30 + i * 78} y="44" width="40" height="22" rx="3" fill="#7fd4ff" opacity="0.18" />
      ))}
      <rect x="0" y="150" width="400" height="50" fill="#121a26" />
      <path d="M0 150 H400" stroke="#4fa3c7" strokeWidth="2" opacity="0.6" />
      <circle cx="320" cy="100" r="40" fill="url(#glow)" opacity="0.25" />
    </>
  ),
  bridge: (
    <>
      <path d="M0 0 H400 V40 L330 70 H70 L0 40 Z" fill="#081018" />
      <path d="M70 70 H330 L360 140 H40 Z" fill="#04070d" stroke="#2c4157" />
      <circle cx="30" cy="20" r="1" fill="#dfe8ff" opacity="0.8" />
      <circle cx="80" cy="60" r="1.2" fill="#dfe8ff" opacity="0.6" />
      <circle cx="140" cy="30" r="0.8" fill="#dfe8ff" opacity="0.9" />
      <circle cx="200" cy="15" r="1" fill="#dfe8ff" opacity="0.7" />
      <circle cx="260" cy="50" r="1.3" fill="#dfe8ff" opacity="0.5" />
      <circle cx="320" cy="25" r="0.9" fill="#dfe8ff" opacity="0.8" />
      <circle cx="370" cy="70" r="1" fill="#dfe8ff" opacity="0.6" />
      <circle cx="50" cy="120" r="0.8" fill="#dfe8ff" opacity="0.5" />
      <circle cx="110" cy="150" r="1" fill="#dfe8ff" opacity="0.7" />
      <circle cx="350" cy="140" r="0.8" fill="#dfe8ff" opacity="0.6" />
      <circle cx="230" cy="110" r="1" fill="#dfe8ff" opacity="0.4" />
      <rect x="40" y="140" width="320" height="60" fill="#162232" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={60 + i * 50} y="152" width="34" height="10" rx="2" fill={i % 2 ? '#4fa3c7' : '#e8b25a'} opacity="0.55" />
      ))}
    </>
  ),
  space: (
    <>
      <circle cx="30" cy="20" r="1" fill="#dfe8ff" opacity="0.8" />
      <circle cx="80" cy="60" r="1.2" fill="#dfe8ff" opacity="0.6" />
      <circle cx="140" cy="30" r="0.8" fill="#dfe8ff" opacity="0.9" />
      <circle cx="200" cy="15" r="1" fill="#dfe8ff" opacity="0.7" />
      <circle cx="260" cy="50" r="1.3" fill="#dfe8ff" opacity="0.5" />
      <circle cx="320" cy="25" r="0.9" fill="#dfe8ff" opacity="0.8" />
      <circle cx="370" cy="70" r="1" fill="#dfe8ff" opacity="0.6" />
      <circle cx="50" cy="120" r="0.8" fill="#dfe8ff" opacity="0.5" />
      <circle cx="110" cy="150" r="1" fill="#dfe8ff" opacity="0.7" />
      <circle cx="350" cy="140" r="0.8" fill="#dfe8ff" opacity="0.6" />
      <circle cx="230" cy="110" r="1" fill="#dfe8ff" opacity="0.4" />
      <circle cx="330" cy="150" r="90" fill="#7a2a1a" opacity="0.55" />
      <circle cx="330" cy="150" r="90" fill="url(#glow)" opacity="0.15" />
      <path d="M60 110 L120 100 L135 108 L120 116 L60 112 Z" fill="#c8d2e0" />
      <path d="M60 110 L48 104 M60 112 L48 118" stroke="#7fd4ff" strokeWidth="2" />
    </>
  ),
  wreck: (
    <>
      <circle cx="30" cy="20" r="1" fill="#dfe8ff" opacity="0.8" />
      <circle cx="80" cy="60" r="1.2" fill="#dfe8ff" opacity="0.6" />
      <circle cx="140" cy="30" r="0.8" fill="#dfe8ff" opacity="0.9" />
      <circle cx="200" cy="15" r="1" fill="#dfe8ff" opacity="0.7" />
      <circle cx="260" cy="50" r="1.3" fill="#dfe8ff" opacity="0.5" />
      <circle cx="320" cy="25" r="0.9" fill="#dfe8ff" opacity="0.8" />
      <circle cx="370" cy="70" r="1" fill="#dfe8ff" opacity="0.6" />
      <circle cx="50" cy="120" r="0.8" fill="#dfe8ff" opacity="0.5" />
      <circle cx="110" cy="150" r="1" fill="#dfe8ff" opacity="0.7" />
      <circle cx="350" cy="140" r="0.8" fill="#dfe8ff" opacity="0.6" />
      <circle cx="230" cy="110" r="1" fill="#dfe8ff" opacity="0.4" />
      <path d="M40 160 L120 90 L220 110 L260 70 L340 120 L300 170 L180 180 Z" fill="#1c1a18" stroke="#3a332c" />
      <path d="M120 90 L140 130 M220 110 L210 150 M260 70 L280 120" stroke="#3a332c" strokeWidth="3" />
      <circle cx="230" cy="135" r="4" fill="#e07a5a" opacity="0.8" />
    </>
  ),
}
