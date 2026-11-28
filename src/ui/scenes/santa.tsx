import type { ReactNode } from 'react'
import type { SantaScene } from '@questender/engine/types'

// Backgrounds for Saving Santa, the December advent campaign: the snowy
// village of Pinecrook, the snowwood, the workshop of the winter folk, and the
// Hush's silent palace beyond the aurora. Same style as Scene.tsx (400x200
// viewBox, layered SVG); every shape here is original to GerdQuest Calendar.

export const SANTA_SKIES: Record<SantaScene, [string, string]> = {
  ss_village: ['#1a2440', '#5a6a8f'],
  ss_snowwood: ['#22304a', '#8a9ab8'],
  ss_workshop: ['#2a1a1e', '#6a3a32'],
  ss_cocoa: ['#2a160e', '#7a4022'],
  ss_frozenlake: ['#5a7aa8', '#d8e4f0'],
  ss_belltower: ['#10182e', '#3a4a72'],
  ss_aurora: ['#050a1a', '#1a2a4a'],
  ss_palace: ['#cfe0f0', '#f4f8fc'],
}

// ---------- shared pieces ----------
const rnd = (i: number, salt = 1) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

const stars = (n: number, maxY = 90, salt = 3) => (
  <g>
    {[...Array(n)].map((_, i) => (
      <circle key={i} cx={rnd(i, salt) * 400} cy={rnd(i, salt + 5) * maxY} r={0.5 + rnd(i, salt + 9) * 0.8} fill="#eef4ff" opacity={0.3 + rnd(i, salt + 2) * 0.6} />
    ))}
  </g>
)

/** Falling snow over the whole scene. */
const snowfall = (n: number, salt = 7, color = '#ffffff') => (
  <g>
    {[...Array(n)].map((_, i) => (
      <circle key={i} cx={rnd(i, salt) * 400} cy={rnd(i, salt + 4) * 200} r={0.8 + rnd(i, salt + 8) * 1.6} fill={color} opacity={0.45 + rnd(i, salt + 1) * 0.5} />
    ))}
  </g>
)

/** Rolling snowy ground from height y. */
const drifts = (y: number, color = '#eef3f8', shade = '#c8d4e4') => (
  <>
    <path d={`M0 ${y} Q60 ${y - 10} 120 ${y} T240 ${y - 2} T400 ${y} V200 H0 Z`} fill={shade} />
    <path d={`M0 ${y + 8} Q80 ${y - 2} 160 ${y + 8} T320 ${y + 6} T400 ${y + 8} V200 H0 Z`} fill={color} />
  </>
)

/** A snowy pine, trunk base at (x, y). */
const pine = (x: number, y: number, s = 1, needles = '#1f4a3a') => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-3" y="-10" width="6" height="10" fill="#3a2a1e" />
    <path d="M-24 -10 L0 -44 L24 -10 Z" fill={needles} />
    <path d="M-19 -30 L0 -62 L19 -30 Z" fill={needles} />
    <path d="M-13 -48 L0 -78 L13 -48 Z" fill={needles} />
    <path d="M-24 -10 Q-12 -16 0 -12 Q12 -16 24 -10 L18 -14 Q0 -20 -18 -14 Z" fill="#f4f8fc" />
    <path d="M-19 -30 Q-8 -36 0 -32 Q8 -36 19 -30 L14 -34 Q0 -40 -14 -34 Z" fill="#f4f8fc" />
    <path d="M-6 -66 L0 -78 L6 -66 Q0 -70 -6 -66 Z" fill="#f4f8fc" />
  </g>
)

const pines = (y: number, color: string, salt = 1, n = 12, s = 0.8) => (
  <g>
    {[...Array(n)].map((_, i) => pine((i + rnd(i, salt) * 0.6) * (400 / n), y + rnd(i, salt + 3) * 6, s * (0.75 + rnd(i, salt + 2) * 0.5), color))}
  </g>
)

/** A cottage with a snowy roof and a lit window, base centre at (x, y). */
const cottage = (x: number, y: number, s = 1, wall = '#7a3a2e', door = '#2f5a3a') => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-26" y="-34" width="52" height="34" fill={wall} />
    <path d="M-32 -32 L0 -58 L32 -32 Z" fill="#3a2a2a" />
    <path d="M-34 -31 L0 -60 L34 -31 L28 -30 L0 -52 L-28 -30 Z" fill="#f4f8fc" />
    <rect x="12" y="-62" width="8" height="16" fill="#4a3a34" />
    <rect x="11" y="-64" width="10" height="4" fill="#f4f8fc" />
    <rect x="-18" y="-24" width="12" height="11" fill="#ffd88a" />
    <path d="M-12 -24 V-13 M-18 -18.5 H-6" stroke="#5a3a22" strokeWidth="1.4" />
    <rect x="4" y="-22" width="12" height="22" rx="5" fill={door} />
    <circle cx="10" cy="-26" r="3.4" fill="none" stroke="#2f7a4a" strokeWidth="2.2" />
    <circle cx="10" cy="-23" r="1.2" fill="#c8342e" />
  </g>
)

/** A string of coloured lights between two points. */
const lights = (x1: number, y1: number, x2: number, y2: number, n = 9) => {
  const mx = (x1 + x2) / 2
  const my = Math.max(y1, y2) + 10
  const cols = ['#ff5a4a', '#ffd84a', '#5ad06a', '#5ab4ff']
  return (
    <g>
      <path d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} fill="none" stroke="#2a2a2a" strokeWidth="0.8" />
      {[...Array(n)].map((_, i) => {
        const t = (i + 1) / (n + 1)
        const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2
        const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2
        return <circle key={i} cx={x} cy={y + 1.5} r="1.8" fill={cols[i % cols.length]} />
      })}
    </g>
  )
}

const sleigh = (x: number, y: number, s = 1, tipped = false) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tipped ? -18 : 0})`}>
    <path d="M-36 -6 Q-40 -26 -26 -30 L18 -30 Q30 -30 30 -18 L30 -6 Z" fill="#b8282e" />
    <path d="M-30 -28 Q-34 -40 -22 -40" fill="none" stroke="#e8c060" strokeWidth="3" />
    <path d="M-36 -6 H30" stroke="#e8c060" strokeWidth="2.4" />
    <path d="M-40 4 H34 Q44 4 44 -6" fill="none" stroke="#c9ccd4" strokeWidth="2.6" />
    <path d="M-30 4 V-6 M16 4 V-6" stroke="#c9ccd4" strokeWidth="2" />
  </g>
)

const reindeer = (x: number, y: number, s = 1) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="-18" rx="16" ry="8" fill="#8a5a32" />
    <path d="M-12 -12 V0 M-6 -12 V0 M6 -12 V0 M12 -12 V0" stroke="#5a3a22" strokeWidth="2.6" />
    <path d="M12 -22 L20 -34" stroke="#8a5a32" strokeWidth="6" strokeLinecap="round" />
    <ellipse cx="23" cy="-35" rx="6" ry="4" fill="#8a5a32" />
    <path d="M20 -38 L16 -48 M16 -44 L12 -46 M22 -39 L24 -50 M24 -46 L28 -48" stroke="#d8c8a8" strokeWidth="1.6" fill="none" />
    <circle cx="25" cy="-36" r="0.9" fill="#1a1a1a" />
    <circle cx="16" cy="-28" r="2" fill="#e8c060" />
  </g>
)

const moon = (x: number, y: number, r = 14) => (
  <>
    <circle cx={x} cy={y} r={r * 2.4} fill="url(#glow)" opacity="0.35" />
    <circle cx={x} cy={y} r={r} fill="#f4f0dc" />
  </>
)

const aurora = (
  <g opacity="0.75">
    <path d="M-10 60 Q60 10 130 50 T270 40 T410 30 L410 70 Q340 80 270 72 T130 86 T-10 96 Z" fill="#3ad08a" opacity="0.35" />
    <path d="M-10 40 Q80 0 160 30 T320 20 T410 10 L410 40 Q330 50 250 46 T90 62 T-10 66 Z" fill="#8a5ad8" opacity="0.28" />
    <path d="M40 80 Q120 40 200 70 T360 60 L360 84 Q280 96 200 92 T40 100 Z" fill="#5ae0c8" opacity="0.25" />
  </g>
)

export const SANTA_ART: Record<SantaScene, ReactNode> = {
  ss_village: (
    <>
      {stars(40, 70)}
      {moon(330, 36)}
      {pines(120, '#1a3a32', 4, 14, 0.7)}
      {drifts(138)}
      {cottage(70, 160, 1, '#7a3a2e')}
      {cottage(190, 154, 0.85, '#4a5a7a', '#a33a3a')}
      {cottage(310, 162, 1.05, '#6a4a2a')}
      {lights(96, 128, 166, 130)}
      {lights(210, 126, 282, 130)}
      {pine(250, 176, 0.9, '#22503e')}
      {snowfall(60)}
    </>
  ),
  ss_snowwood: (
    <>
      {pines(110, '#2a4a5a', 2, 16, 0.75)}
      {pines(130, '#1f4038', 5, 11, 1)}
      {drifts(150)}
      {sleigh(210, 176, 1.15, true)}
      <path d="M150 182 L138 190 M262 186 L276 192" stroke="#d8c8a8" strokeWidth="2" />
      <rect x="236" y="178" width="12" height="9" fill="#f4eedc" transform="rotate(14 242 182)" />
      <rect x="272" y="184" width="10" height="8" fill="#f4eedc" transform="rotate(-10 277 188)" />
      {pine(40, 196, 1.5, '#1a3a32')}
      {pine(370, 198, 1.7, '#1a3a32')}
      {snowfall(80, 11)}
    </>
  ),
  ss_workshop: (
    <>
      <rect x="0" y="0" width="400" height="200" fill="#3a1e1e" opacity="0.4" />
      {[30, 110, 190, 270, 350].map((x) => (
        <rect key={x} x={x - 6} y="0" width="12" height="200" fill="#4a2a20" />
      ))}
      <rect x="0" y="0" width="400" height="14" fill="#5a3426" />
      <path d="M0 150 H400 V200 H0 Z" fill="#5a3a2a" />
      {[...Array(10)].map((_, i) => (
        <path key={i} d={`M${i * 40} 150 L${i * 40 + 40} 150`} stroke="#3a2418" strokeWidth="1" />
      ))}
      <rect x="40" y="112" width="120" height="10" fill="#7a4a2e" />
      <rect x="48" y="122" width="6" height="28" fill="#5a3a22" />
      <rect x="146" y="122" width="6" height="28" fill="#5a3a22" />
      <rect x="60" y="96" width="18" height="16" fill="#c8342e" />
      <path d="M69 96 V112 M60 104 H78" stroke="#e8c060" strokeWidth="2" />
      <circle cx="100" cy="104" r="8" fill="#3a8a5a" />
      <rect x="120" y="92" width="14" height="20" fill="#5ab4ff" />
      {[250, 290, 330].map((x) => (
        <g key={x}>
          <rect x={x - 6} y="100" width="12" height="40" fill="#a33a3a" />
          <rect x={x - 7} y="92" width="14" height="10" fill="#1f2a4a" />
          <circle cx={x} cy="108" r="4" fill="#e8c8a8" />
          <path d={`M${x - 6} 140 V150 M${x + 6} 140 V150`} stroke="#1f1f1f" strokeWidth="3" />
        </g>
      ))}
      <circle cx="200" cy="40" r="30" fill="url(#glow)" opacity="0.5" />
      <path d="M190 14 V30 M210 14 V30" stroke="#2a1a14" strokeWidth="1.5" />
      <rect x="186" y="30" width="28" height="10" rx="3" fill="#e8c060" />
    </>
  ),
  ss_cocoa: (
    <>
      <rect x="0" y="0" width="400" height="200" fill="#3a1e10" opacity="0.3" />
      <path d="M0 150 H400 V200 H0 Z" fill="#4a2a18" />
      <rect x="150" y="60" width="100" height="90" fill="#5a3a2a" />
      <rect x="140" y="52" width="120" height="12" fill="#7a5a3a" />
      <path d="M168 150 Q168 96 200 96 Q232 96 232 150 Z" fill="#1a0e08" />
      <circle cx="200" cy="128" r="36" fill="url(#glow)" />
      <path d="M184 150 L200 112 L216 150 Z" fill="#f0a040" />
      <path d="M192 150 L200 126 L208 150 Z" fill="#ffe2a0" />
      {[160, 186, 214, 240].map((x, i) => (
        <path key={x} d={`M${x} 52 V44`} stroke={['#c8342e', '#2f7a4a', '#c8342e', '#2f7a4a'][i]} strokeWidth="6" />
      ))}
      {lights(140, 50, 260, 50, 11)}
      {[60, 330].map((x) => (
        <g key={x}>
          <rect x={x - 30} y="120" width="60" height="8" fill="#7a4a2e" />
          <rect x={x - 26} y="128" width="5" height="22" fill="#5a3a22" />
          <rect x={x + 21} y="128" width="5" height="22" fill="#5a3a22" />
          <rect x={x - 12} y="108" width="10" height="12" rx="2" fill="#e8e0d0" />
          <path d={`M${x - 10} 104 q2 -4 0 -8 M${x - 6} 104 q2 -4 0 -8`} stroke="#e8e0d0" strokeWidth="1" fill="none" opacity="0.7" />
          <rect x={x + 4} y="110" width="9" height="10" rx="2" fill="#c8342e" />
        </g>
      ))}
    </>
  ),
  ss_frozenlake: (
    <>
      <path d="M0 96 L60 60 L110 88 L170 46 L240 92 L300 58 L360 84 L400 70 V120 H0 Z" fill="#b8c8dc" />
      <path d="M150 58 L170 46 L188 58 Z M282 68 L300 58 L316 68 Z" fill="#f4f8fc" />
      {pines(118, '#2a4a52', 8, 18, 0.55)}
      <path d="M0 120 H400 V200 H0 Z" fill="#cfe2f0" />
      <path d="M0 120 H400 V128 H0 Z" fill="#f4f8fc" />
      <path d="M40 150 L120 160 M200 140 L300 170 M250 186 L360 176" stroke="#ffffff" strokeWidth="1.4" opacity="0.8" />
      <path d="M120 170 L140 160 L160 174 M300 150 L320 156" stroke="#8aa8c8" strokeWidth="1" fill="none" />
      {reindeer(200, 168, 1)}
      <ellipse cx="208" cy="170" rx="26" ry="3" fill="#8aa8c8" opacity="0.5" />
      {snowfall(30, 19)}
    </>
  ),
  ss_belltower: (
    <>
      {stars(70, 120, 5)}
      {moon(70, 40, 11)}
      <path d="M0 170 Q100 150 200 166 T400 160 V200 H0 Z" fill="#c8d4e4" />
      <rect x="170" y="70" width="60" height="120" fill="#5a6070" />
      <path d="M160 72 L200 24 L240 72 Z" fill="#3a3f4f" />
      <path d="M158 73 L200 22 L242 73 L234 72 L200 32 L166 72 Z" fill="#f4f8fc" />
      <path d="M182 120 Q182 92 200 92 Q218 92 218 120 Z" fill="#1a1e2a" />
      <path d="M190 116 Q190 100 200 100 Q210 100 210 116 Z" fill="#9fdcff" />
      <circle cx="200" cy="108" r="22" fill="url(#glow)" opacity="0.5" />
      {[0, 1, 2, 3].map((r) =>
        [0, 1].map((c) => <rect key={`${r}${c}`} x={174 + c * 34} y={130 + r * 14} width="18" height="2" fill="#4a5060" />),
      )}
      {pine(110, 186, 1.1, '#1a3a32')}
      {pine(300, 184, 1.3, '#1a3a32')}
      {snowfall(50, 23)}
    </>
  ),
  ss_aurora: (
    <>
      {stars(90, 140, 9)}
      {aurora}
      <path d="M0 150 L80 120 L150 140 L230 110 L310 136 L400 118 V200 H0 Z" fill="#2a3a5a" />
      {drifts(160, '#dfe8f2', '#a8b8d0')}
      <g transform="translate(110 168)">
        <ellipse cx="0" cy="0" rx="34" ry="8" fill="#5a4a3a" />
        <path d="M-30 0 Q-30 -30 0 -32 Q30 -30 30 0 Z" fill="#6a5a48" />
        <path d="M-34 -6 Q0 -42 34 -6" fill="#f4f8fc" />
        <rect x="-6" y="-14" width="12" height="14" fill="#2a1a14" />
        <circle cx="16" cy="-12" r="4" fill="#ffd88a" />
      </g>
      {pine(330, 186, 1.2, '#14302a')}
      {pine(368, 190, 0.9, '#14302a')}
    </>
  ),
  ss_palace: (
    <>
      <path d="M0 150 H400 V200 H0 Z" fill="#e8f0f8" />
      <path d="M0 150 H400 V154 H0 Z" fill="#ffffff" />
      <g fill="#d4e6f4" stroke="#a8c8e4" strokeWidth="1">
        <path d="M120 150 V80 L140 50 L160 80 V150 Z" />
        <path d="M240 150 V80 L260 50 L280 80 V150 Z" />
        <path d="M160 150 V60 L200 14 L240 60 V150 Z" />
        <path d="M80 150 V106 L96 86 L112 106 V150 Z" />
        <path d="M288 150 V106 L304 86 L320 106 V150 Z" />
      </g>
      <path d="M184 150 V118 Q200 100 216 118 V150 Z" fill="#9fc4e0" />
      {[134, 254].map((x) => (
        <rect key={x} x={x} y="96" width="12" height="18" rx="6" fill="#b8d4ec" />
      ))}
      <path d="M150 166 L170 176 M230 170 L260 160 M60 180 L100 170" stroke="#c8dcec" strokeWidth="1.2" />
      {snowfall(40, 31, '#cfe0f0')}
    </>
  ),
}
