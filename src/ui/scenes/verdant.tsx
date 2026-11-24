import type { ReactNode } from 'react'
import type { VerdantScene } from '@questender/engine/types'

// Backgrounds for The Verdant Accord: deep green forest roads, and the city of
// Highmarrow built inside the ring of an ancient fallen tree. Same style as
// Scene.tsx (400x200 viewBox, layered SVG); every shape here is original to
// Questender.

export const VERDANT_SKIES: Record<VerdantScene, [string, string]> = {
  va_road: ['#5f8fae', '#d9d2a8'],
  va_camp: ['#0c1420', '#2a3a2c'],
  va_forest: ['#1b2c22', '#4d6a46'],
  va_ford: ['#6d8fa0', '#c9cdb4'],
  va_bridge: ['#7a93a3', '#d6c9a0'],
  va_town: ['#9bb3c4', '#e8dcc0'],
  va_city: ['#6f9ec2', '#f0d9a8'],
  va_market: ['#7fa8c8', '#f2e0b8'],
  va_tavern: ['#24150e', '#7a4826'],
  va_mill: ['#4d5a62', '#9aa39a'],
  va_sewer: ['#06090a', '#1c2a24'],
  va_chapel: ['#0d0f10', '#3a3424'],
  va_fair: ['#2d2a4a', '#e8a86a'],
  va_manor: ['#101830', '#3a3a5a'],
  va_clock: ['#2a2620', '#8a6a3a'],
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

/** A broad-leaved tree, trunk base at (x, y). */
const tree = (x: number, y: number, s = 1, leaf = '#2f5a34', trunk = '#3a2a1e') => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-4 0 L-3 -38 L3 -38 L4 0 Z" fill={trunk} />
    <circle cx="0" cy="-50" r="20" fill={leaf} />
    <circle cx="-14" cy="-40" r="13" fill={leaf} />
    <circle cx="14" cy="-42" r="14" fill={leaf} />
    <circle cx="-4" cy="-62" r="12" fill={leaf} opacity="0.9" />
  </g>
)

/** A row of trees along a horizon line. */
const treeline = (y: number, leaf: string, salt = 1, n = 12) => (
  <g>
    {[...Array(n)].map((_, i) => tree(i * (400 / (n - 1)) + rnd(i, salt) * 16 - 8, y + rnd(i, salt + 3) * 8, 0.7 + rnd(i, salt + 6) * 0.5, leaf, '#24180f'))}
  </g>
)

/** The Marrow: the vast grey ring of the ancient stump, with Highmarrow's roofs inside. */
const marrow = (cx: number, base: number, w = 300, h = 90, lit = false) => {
  const rim = base - h
  return (
    <g>
      {/* Houses first, so the rim hides their lower walls: they sit inside the ring. */}
      {[...Array(14)].map((_, i) => {
        const x = cx - w / 2 + 40 + rnd(i, 4) * (w - 80)
        const y = rim - 6 - rnd(i, 7) * 18
        return (
          <g key={i}>
            <rect x={x} y={y} width="14" height={rim + 8 - y} fill="#8a6a4a" />
            <path d={`M${x - 2} ${y} L${x + 7} ${y - 8} L${x + 16} ${y} Z`} fill="#4a6a4a" />
            {lit && <rect x={x + 5} y={y + 4} width="4" height="4" fill="#ffd88a" opacity="0.85" />}
          </g>
        )
      })}
      <path d={`M${cx - w / 2} ${base} L${cx - w / 2 + 10} ${rim} Q${cx - w / 2 + 30} ${rim - 12} ${cx - w / 2 + 44} ${rim + 4} L${cx + w / 2 - 44} ${rim + 4} Q${cx + w / 2 - 30} ${rim - 12} ${cx + w / 2 - 10} ${rim} L${cx + w / 2} ${base} Z`} fill="#6b6256" />
      {[...Array(9)].map((_, i) => (
        <path key={i} d={`M${cx - w / 2 + 20 + i * ((w - 40) / 8)} ${rim + 6} V${base}`} stroke="#5a5248" strokeWidth="2" opacity="0.6" />
      ))}
    </g>
  )
}

/** A canvas-topped wagon, wheels on y. */
const wagon = (x: number, y: number, s = 1) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-30" y="-22" width="60" height="12" fill="#5a3d26" />
    <path d="M-28 -22 Q0 -52 28 -22 Z" fill="#e6dcc2" />
    <circle cx="-18" cy="-6" r="7" fill="none" stroke="#2a1d16" strokeWidth="3" />
    <circle cx="18" cy="-6" r="7" fill="none" stroke="#2a1d16" strokeWidth="3" />
  </g>
)

const water = (y: number, top: string, bottom: string) => (
  <>
    <rect x="0" y={y} width="400" height={200 - y} fill={bottom} />
    <path d={`M0 ${y} ${[...Array(20)].map((_, i) => `Q${i * 20 + 10} ${y - 3} ${i * 20 + 20} ${y}`).join(' ')} V${y + 8} H0 Z`} fill={top} />
  </>
)

const candle = (x: number, y: number, h = 14) => (
  <g>
    <rect x={x - 2} y={y - h} width="4" height={h} fill="#e8dcc0" />
    <circle cx={x} cy={y - h - 3} r="6" fill="url(#glow)" opacity="0.8" />
    <path d={`M${x} ${y - h - 6} Q${x + 2} ${y - h - 2} ${x} ${y - h} Q${x - 2} ${y - h - 2} ${x} ${y - h - 6} Z`} fill="#ffd88a" />
  </g>
)

const brickWall = (y: number, h: number, fill: string, line: string) => (
  <g>
    <rect x="0" y={y} width="400" height={h} fill={fill} />
    {[...Array(Math.floor(h / 10))].map((_, r) => (
      <g key={r}>
        <path d={`M0 ${y + r * 10} H400`} stroke={line} strokeWidth="1" />
        {[...Array(20)].map((_, c) => (
          <path key={c} d={`M${c * 20 + (r % 2) * 10} ${y + r * 10} V${y + r * 10 + 10}`} stroke={line} strokeWidth="1" />
        ))}
      </g>
    ))}
  </g>
)

const roots = (salt = 2, color = '#cfc7a8', op = 0.55) => (
  <g opacity={op}>
    {[...Array(6)].map((_, i) => {
      const x = rnd(i, salt) * 400
      return <path key={i} d={`M${x} 0 Q${x + 20} 40 ${x - 10} 80 T${x + 10} 150`} stroke={color} strokeWidth={2 + rnd(i, salt + 1) * 4} fill="none" />
    })}
  </g>
)

const bunting = (y: number) => (
  <g>
    <path d={`M0 ${y} Q100 ${y + 20} 200 ${y} T400 ${y}`} stroke="#3a2a1e" strokeWidth="1" fill="none" />
    {[...Array(16)].map((_, i) => {
      const x = 12 + i * 25
      const yy = y + Math.sin((x / 400) * Math.PI * 2) * 8 + 6
      const col = ['#d9534f', '#f0c040', '#5fa86a', '#4f8fd0'][i % 4]
      return <path key={i} d={`M${x - 6} ${yy - 4} L${x + 6} ${yy - 4} L${x} ${yy + 8} Z`} fill={col} />
    })}
  </g>
)

// ---------- scenes ----------
export const VERDANT_ART: Record<VerdantScene, ReactNode> = {
  va_road: (
    <>
      {treeline(120, '#3f6a42', 1, 10)}
      <path d="M0 200 L0 130 H400 V200 Z" fill="#4f7a3e" />
      <path d="M160 200 Q190 160 200 130 L214 130 Q230 160 280 200 Z" fill="#a89a72" />
      {tree(40, 190, 1.4, '#2f5a34')}
      {tree(360, 196, 1.6, '#2a5230')}
      {wagon(230, 168, 0.9)}
      {wagon(205, 150, 0.6)}
    </>
  ),
  va_camp: (
    <>
      {stars(50, 80)}
      {treeline(130, '#14241a', 5, 12)}
      <path d="M0 200 V140 H400 V200 Z" fill="#1a2a1c" />
      {wagon(90, 162, 1.1)}
      {wagon(310, 160, 1)}
      <circle cx="200" cy="160" r="40" fill="url(#glow)" opacity="0.9" />
      <path d="M188 166 L200 140 L212 166 Z" fill="#f0a040" />
      <path d="M194 166 L200 150 L206 166 Z" fill="#ffd88a" />
      <path d="M182 168 L218 168" stroke="#3a2a1e" strokeWidth="4" />
    </>
  ),
  va_forest: (
    <>
      {treeline(110, '#22402a', 9, 14)}
      {[20, 90, 170, 250, 330, 390].map((x, i) => (
        <rect key={x} x={x - 8} y="0" width={14 + (i % 3) * 4} height="200" fill="#2a1e14" />
      ))}
      <path d="M0 200 V160 Q200 150 400 162 V200 Z" fill="#2f4a2a" />
      <path d="M60 180 Q200 150 340 176" stroke="#4a3a26" strokeWidth="14" fill="none" />
      {[...Array(10)].map((_, i) => (
        <path key={i} d={`M${rnd(i, 12) * 400} ${140 + rnd(i, 13) * 40} l6 -10 l6 10`} fill="#3f6a42" />
      ))}
      <path d="M0 0 H400 V40 Q200 70 0 40 Z" fill="#1b2c22" opacity="0.9" />
    </>
  ),
  va_ford: (
    <>
      {treeline(110, '#3f6a42', 14, 10)}
      <path d="M0 130 H400 V140 H0 Z" fill="#6a7a4a" />
      {water(138, '#6a8fa0', '#3f6472')}
      {[60, 130, 210, 290].map((x) => (
        <ellipse key={x} cx={x} cy={160 + (x % 3) * 6} rx="12" ry="4" fill="#8aa0a8" opacity="0.6" />
      ))}
      <path d="M250 150 Q300 135 380 150" stroke="#4a3a26" strokeWidth="9" fill="none" />
      <path d="M270 148 l10 -14 M320 140 l6 -16 M350 145 l12 -10" stroke="#4a3a26" strokeWidth="4" />
    </>
  ),
  va_bridge: (
    <>
      {treeline(105, '#3f6a42', 20, 10)}
      {water(150, '#5f7f8a', '#38525a')}
      <path d="M40 150 Q200 70 360 150 L360 124 Q200 46 40 124 Z" fill="#7a7a6a" />
      <path d="M150 150 Q200 104 250 150 Z" fill="#38525a" />
      <path d="M40 124 Q200 46 360 124" stroke="#4f6a3a" strokeWidth="4" fill="none" />
      <rect x="180" y="62" width="44" height="10" rx="4" fill="#5a3d26" />
      <path d="M150 112 V100 M250 112 V100" stroke="#6a6a5a" strokeWidth="4" />
    </>
  ),
  va_town: (
    <>
      {treeline(110, '#4a7a4a', 26, 10)}
      <path d="M0 200 V130 H400 V200 Z" fill="#8a8470" />
      {[20, 90, 160, 240, 310].map((x, i) => (
        <g key={x}>
          <rect x={x} y={100 - (i % 2) * 10} width="54" height={40 + (i % 2) * 10} fill="#a8865a" />
          <path d={`M${x - 6} ${100 - (i % 2) * 10} L${x + 27} ${76 - (i % 2) * 10} L${x + 60} ${100 - (i % 2) * 10} Z`} fill="#6a4a3a" />
          <rect x={x + 20} y={118} width="12" height="22" fill="#3a2a1e" />
        </g>
      ))}
      {water(168, '#7aa0b0', '#4a7080')}
      <path d="M0 160 H400" stroke="#5a4a3a" strokeWidth="3" />
    </>
  ),
  va_city: (
    <>
      {marrow(200, 150, 320, 70)}
      {treeline(170, '#2f5a34', 31, 12)}
      <path d="M0 200 V178 H400 V200 Z" fill="#3f6a42" />
      <path d="M180 200 L196 150 L204 150 L220 200 Z" fill="#a89a72" />
      <rect x="186" y="128" width="28" height="22" fill="#3a2a1e" />
      <path d="M186 128 Q200 114 214 128" fill="#3a2a1e" />
    </>
  ),
  va_market: (
    <>
      {marrow(200, 110, 420, 60)}
      <path d="M0 200 V110 H400 V200 Z" fill="#9a8a6a" />
      {[...Array(6)].map((_, i) => {
        const x = 20 + i * 64
        const col = ['#c0504a', '#e0b040', '#5f8f5a', '#4f7ab0'][i % 4]
        return (
          <g key={i}>
            <rect x={x} y="140" width="50" height="30" fill="#6a4a2e" />
            <path d={`M${x - 6} 140 L${x + 25} 122 L${x + 56} 140 Z`} fill={col} />
            <circle cx={x + 14} cy="148" r="4" fill="#e8c060" />
            <circle cx={x + 30} cy="150" r="4" fill="#a0c060" />
          </g>
        )
      })}
      <path d="M0 176 H400 V200 H0 Z" fill="#7a6a4e" />
    </>
  ),
  va_tavern: (
    <>
      <rect x="0" y="0" width="400" height="200" fill="#3a2414" opacity="0.6" />
      {[0, 100, 200, 300].map((x) => (
        <rect key={x} x={x} y="0" width="8" height="200" fill="#24150e" />
      ))}
      <rect x="0" y="40" width="400" height="8" fill="#24150e" />
      <rect x="260" y="90" width="90" height="70" fill="#1a0f0a" />
      <circle cx="305" cy="140" r="34" fill="url(#glow)" opacity="0.9" />
      <path d="M290 150 L305 124 L320 150 Z" fill="#f0a040" />
      <rect x="40" y="150" width="160" height="10" fill="#6b4a2c" />
      <rect x="50" y="160" width="8" height="40" fill="#4a3020" />
      <rect x="182" y="160" width="8" height="40" fill="#4a3020" />
      <rect x="80" y="136" width="12" height="14" fill="#c9a06a" />
      <rect x="130" y="134" width="12" height="16" fill="#c9a06a" />
      <circle cx="160" cy="20" r="10" fill="#c9a06a" opacity="0.8" />
      <path d="M160 0 V10" stroke="#24150e" strokeWidth="2" />
    </>
  ),
  va_mill: (
    <>
      <rect x="40" y="50" width="120" height="100" fill="#6a5a4a" />
      <path d="M30 50 L100 14 L170 50 Z" fill="#3a3a3a" />
      {[60, 110].map((x) => (
        <rect key={x} x={x} y="76" width="18" height="22" fill="#ffd88a" opacity="0.5" />
      ))}
      <g transform="translate(220 120)">
        <circle r="46" fill="none" stroke="#4a3a2a" strokeWidth="6" />
        {[...Array(8)].map((_, i) => (
          <path key={i} d="M0 0 L0 -46" stroke="#4a3a2a" strokeWidth="5" transform={`rotate(${i * 45})`} />
        ))}
      </g>
      <rect x="290" y="70" width="90" height="80" fill="#5a4e42" />
      {water(130, '#6a6e5a', '#3a4a40')}
      <path d="M90 160 L130 160 L124 168 L96 168 Z" fill="#3a2a1e" />
    </>
  ),
  va_sewer: (
    <>
      <path d="M0 0 H400 V200 H0 Z" fill="#0d1412" />
      <path d="M60 200 V90 Q200 -10 340 90 V200 Z" fill="#1c241f" />
      {brickWall(90, 70, '#22302a', '#141c18')}
      <path d="M80 200 V100 Q200 20 320 100 V200" fill="none" stroke="#2c3a32" strokeWidth="6" />
      {water(162, '#2a4a3a', '#16261e')}
      {roots(6, '#8a7a56', 0.75)}
      <circle cx="120" cy="120" r="22" fill="url(#glow)" opacity="0.5" />
      <circle cx="120" cy="120" r="4" fill="#7fe08a" />
    </>
  ),
  va_chapel: (
    <>
      <path d="M0 200 V60 Q200 -40 400 60 V200 Z" fill="#1a1812" />
      {[...Array(7)].map((_, i) => (
        <path key={i} d={`M200 20 Q${60 + i * 46} 40 ${20 + i * 60} 90`} stroke="#3a3426" strokeWidth="3" fill="none" />
      ))}
      <rect x="170" y="100" width="60" height="50" fill="#3a5a4a" />
      <rect x="182" y="70" width="36" height="30" fill="#4a6a5a" />
      {[40, 70, 100, 300, 330, 360].map((x, i) => (
        <g key={x}>{candle(x, 130 + (i % 3) * 6, 10 + (i % 2) * 6)}</g>
      ))}
      {water(160, '#2a3a30', '#1a221c')}
    </>
  ),
  va_fair: (
    <>
      {stars(30, 60, 8)}
      {marrow(200, 120, 440, 50, true)}
      <path d="M0 200 V120 H400 V200 Z" fill="#5a4a3a" />
      {bunting(40)}
      {bunting(70)}
      {[60, 200, 340].map((x, i) => (
        <g key={x}>
          <path d={`M${x - 40} 170 L${x} ${110 - i * 6} L${x + 40} 170 Z`} fill={['#c0504a', '#e0b040', '#4f7ab0'][i]} />
          <rect x={x - 34} y="170" width="68" height="20" fill="#3a2a1e" />
        </g>
      ))}
      {[30, 120, 260, 380].map((x) => (
        <circle key={x} cx={x} cy="100" r="12" fill="url(#glow)" opacity="0.8" />
      ))}
    </>
  ),
  va_manor: (
    <>
      {stars(50, 70, 11)}
      <circle cx="330" cy="40" r="16" fill="#f2e6c0" opacity="0.75" />
      <rect x="90" y="60" width="220" height="90" fill="#2a2a3a" />
      <path d="M80 60 L200 20 L320 60 Z" fill="#1a1a28" />
      {[110, 150, 190, 230, 270].map((x) => (
        <rect key={x} x={x} y="80" width="18" height="30" fill="#ffd88a" opacity="0.55" />
      ))}
      <path d="M0 200 V150 H400 V200 Z" fill="#1f3020" />
      {[20, 60, 340, 380].map((x) => (
        <path key={x} d={`M${x - 14} 170 Q${x} 130 ${x + 14} 170 Z`} fill="#2a4a2c" />
      ))}
      <path d="M170 200 L190 150 L210 150 L230 200 Z" fill="#6a6a6a" />
    </>
  ),
  va_clock: (
    <>
      <rect x="0" y="0" width="400" height="200" fill="#1e1a14" opacity="0.6" />
      <g transform="translate(200 90)">
        <circle r="62" fill="#e8dcc0" />
        <circle r="62" fill="none" stroke="#8a6a3a" strokeWidth="6" />
        {[...Array(12)].map((_, i) => (
          <path key={i} d="M0 -54 V-46" stroke="#3a2a1e" strokeWidth="3" transform={`rotate(${i * 30})`} />
        ))}
        <path d="M0 0 L0 -40" stroke="#3a2a1e" strokeWidth="4" transform="rotate(-24)" />
        <path d="M0 0 L0 -28" stroke="#3a2a1e" strokeWidth="5" />
      </g>
      {[[60, 150, 30], [340, 140, 38], [80, 60, 22], [330, 50, 26]].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r={r} fill="none" stroke="#a8864a" strokeWidth="5" strokeDasharray="6 4" />
          <circle r="5" fill="#a8864a" />
        </g>
      ))}
      <path d="M0 186 H400 V200 H0 Z" fill="#3a2a1e" />
    </>
  ),
}
