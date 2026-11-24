import type { ReactNode } from 'react'
import type { StarwakeScene } from '@questender/engine/types'

// Backgrounds for The Starwake: a sea of scattered isles under drifting stars.
// Same style as Scene.tsx (400x200 viewBox, layered SVG); every shape here is
// original to GerdQuest Calendar.

export const STARWAKE_SKIES: Record<StarwakeScene, [string, string]> = {
  sw_quay: ['#141d33', '#6c5a5e'],
  sw_observatory: ['#06121c', '#1d3f4a'],
  sw_deck: ['#1b2c4a', '#d9a36a'],
  sw_storm: ['#1a1f26', '#4d5866'],
  sw_saltpan: ['#5d86b0', '#efe6d4'],
  sw_hanging: ['#3f6f9e', '#cfe0ea'],
  sw_marsh: ['#1b2620', '#55705c'],
  sw_calm: ['#d8cfc0', '#b9c2c4'],
  sw_monastery: ['#20304a', '#c48a63'],
  sw_deep: ['#041019', '#0a2a3a'],
  sw_orrery: ['#0d0f22', '#3a3256'],
  sw_rim: ['#050818', '#2b3c7a'],
  sw_tavern: ['#24150e', '#7a4826'],
  sw_isle: ['#2f6fa0', '#f2d6a0'],
  sw_cave: ['#05080b', '#1b2a2e'],
  sw_skysea: ['#0a0d2a', '#4a5aa0'],
  sw_stair: ['#070b24', '#2e3a7a'],
  sw_summit: ['#02030f', '#1e2866'],
}

// ---------- shared pieces ----------
const rnd = (i: number, salt = 1) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** Stars, a few of them smeared sideways: the drifting Night Chart. */
const driftingStars = (n: number, maxY = 100, salt = 4) => (
  <g>
    {[...Array(n)].map((_, i) => {
      const x = rnd(i, salt) * 400
      const y = rnd(i, salt + 5) * maxY
      const smear = rnd(i, salt + 7) > 0.8
      return smear ? (
        <path key={i} d={`M${x} ${y} l${8 + rnd(i, 2) * 10} ${2 + rnd(i, 3) * 3}`} stroke="#e6eeff" strokeWidth="0.8" opacity="0.5" />
      ) : (
        <circle key={i} cx={x} cy={y} r={0.5 + rnd(i, salt + 9) * 0.9} fill="#e6eeff" opacity={0.35 + rnd(i, salt + 2) * 0.6} />
      )
    })}
  </g>
)

const sea = (y: number, top: string, bottom: string) => (
  <>
    <rect x="0" y={y} width="400" height={200 - y} fill={bottom} />
    <path d={`M0 ${y} ${[...Array(20)].map((_, i) => `Q${i * 20 + 10} ${y - 4} ${i * 20 + 20} ${y}`).join(' ')} V${y + 10} H0 Z`} fill={top} />
  </>
)

/** A small sloop (the Second Chance), waterline centered at (x, y). */
const sloop = (x: number, y: number, s = 1, lit = true) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-34 0 L34 0 L26 10 L-26 10 Z" fill="#2a1d16" />
    <rect x="-1.5" y="-58" width="3" height="58" fill="#3a2a1e" />
    <path d="M2 -56 L30 -6 L2 -6 Z" fill="#e8dcc4" />
    <path d="M-2 -50 L-26 -6 L-2 -6 Z" fill="#d6c8ae" />
    {lit && <circle cx="-30" cy="-4" r="9" fill="url(#glow)" />}
    {lit && <circle cx="-30" cy="-4" r="2" fill="#ffd88a" />}
  </g>
)

const palm = (x: number, y: number, s = 1, lean = 1) => (
  <g transform={`translate(${x} ${y}) scale(${s * lean} ${s})`}>
    <path d="M0 0 Q4 -30 12 -58" stroke="#4a3522" strokeWidth="4" fill="none" />
    {[-60, -20, 20, 60, 100].map((a) => (
      <path key={a} d="M12 -58 q18 -6 30 8" stroke="#2f5a34" strokeWidth="4" fill="none" transform={`rotate(${a} 12 -58)`} />
    ))}
  </g>
)

/** The Starwell glow: a shard of Wend's light. */
const shard = (x: number, y: number, r = 5) => (
  <g>
    <circle cx={x} cy={y} r={r * 5} fill="url(#glow)" opacity="0.7" />
    <path d={`M${x} ${y - r * 1.6} L${x + r} ${y} L${x} ${y + r * 1.6} L${x - r} ${y} Z`} fill="#fff4cf" />
  </g>
)

// ---------- scenes ----------
export const STARWAKE_ART: Record<StarwakeScene, ReactNode> = {
  sw_quay: (
    <>
      {driftingStars(40, 80)}
      <path d="M0 110 L30 110 L30 80 L50 70 L70 80 L70 110 L90 110 L90 92 L120 92 L120 110 L150 110 L150 86 L165 76 L180 86 L180 110 L400 110 V140 H0 Z" fill="#191720" />
      {[40, 58, 100, 160].map((x) => <rect key={x} x={x} y="94" width="6" height="7" fill="#f0c27a" opacity="0.7" />)}
      <rect x="0" y="128" width="230" height="10" fill="#3a2a1e" />
      {[10, 60, 110, 160, 210].map((x) => <rect key={x} x={x} y="138" width="6" height="40" fill="#2a1d16" />)}
      {sea(150, '#1d3149', '#0f1b2b')}
      {sloop(300, 156, 1.1)}
    </>
  ),
  sw_observatory: (
    <>
      <path d="M60 200 V90 Q200 -10 340 90 V200 Z" fill="#0a1a22" />
      <path d="M80 200 V96 Q200 10 320 96 V200" fill="none" stroke="#2c5560" strokeWidth="3" />
      <path d="M200 20 L200 96 M120 50 L200 96 L280 50" stroke="#2c5560" strokeWidth="2" opacity="0.7" />
      <path d="M150 120 L250 70 L258 80 L158 130 Z" fill="#6a5a3a" />
      <circle cx="160" cy="125" r="8" fill="#3a3324" />
      {sea(150, '#14404a', '#0a2a33')}
      {[[110, 175], [280, 168], [230, 185]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" fill="#8fe3d0" opacity="0.6" />)}
    </>
  ),
  sw_deck: (
    <>
      {driftingStars(30, 70)}
      <circle cx="80" cy="60" r="22" fill="#f6d79a" opacity="0.5" />
      {sea(120, '#3a4f6e', '#22324a')}
      <path d="M0 150 L400 140 V200 H0 Z" fill="#5a3d26" />
      {[...Array(9)].map((_, i) => <path key={i} d={`M${i * 48} 150 L${i * 48 + 10} 200`} stroke="#3e2a1a" strokeWidth="2" />)}
      <rect x="290" y="20" width="6" height="130" fill="#3a2a1e" />
      <path d="M296 24 L360 120 L296 120 Z" fill="#e8dcc4" opacity="0.9" />
      <path d="M0 146 L400 136" stroke="#2a1d16" strokeWidth="4" />
      <rect x="60" y="128" width="20" height="18" fill="#6b4a2c" />
    </>
  ),
  sw_storm: (
    <>
      <path d="M0 0 H400 V50 Q300 80 200 55 Q100 80 0 50 Z" fill="#0e1218" />
      <path d="M250 0 L235 60 L250 58 L228 120" stroke="#e9f1ff" strokeWidth="2.5" fill="none" />
      {[...Array(30)].map((_, i) => <path key={i} d={`M${rnd(i, 3) * 400} ${rnd(i, 4) * 200} l-6 14`} stroke="#9fb0c4" strokeWidth="1" opacity="0.5" />)}
      <path d="M0 140 Q60 100 120 140 Q180 90 240 140 Q300 100 360 140 Q380 130 400 135 V200 H0 Z" fill="#1d2a36" />
      <g transform="rotate(-12 200 140)">{sloop(200, 140, 1)}</g>
      <path d="M0 165 Q80 140 160 168 Q260 140 400 165 V200 H0 Z" fill="#121c26" />
    </>
  ),
  sw_saltpan: (
    <>
      <path d="M0 110 L400 104 V200 H0 Z" fill="#f2ece0" />
      {[...Array(12)].map((_, i) => <path key={i} d={`M${i * 36} ${130 + (i % 3) * 18} l30 -6 l-10 18 Z`} fill="none" stroke="#c9bfae" strokeWidth="1" />)}
      <path d="M260 106 L300 60 L310 66 L320 106 Z" fill="#6a5a4a" />
      <path d="M300 60 L340 40" stroke="#4a3d30" strokeWidth="3" />
      <path d="M80 110 Q90 70 100 110 Z" fill="#ffffff" opacity="0.8" />
      <path d="M90 108 Q88 60 96 30 Q100 60 98 108" fill="#ffffff" opacity="0.5" />
      <path d="M150 140 L170 128 L200 132 L190 146 Z" fill="#3a2a1e" opacity="0.8" />
      <path d="M168 128 L176 96" stroke="#3a2a1e" strokeWidth="2" />
    </>
  ),
  sw_hanging: (
    <>
      {[[90, 60, 1], [250, 40, 1.3], [340, 100, 0.8]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M-40 0 Q0 -14 40 0 L20 30 L0 46 L-18 28 Z" fill="#5a5048" />
          <path d="M-40 0 Q0 -14 40 0 Q0 -6 -40 0 Z" fill="#5f8a4a" />
          <path d="M0 46 L0 200" stroke="#3a3430" strokeWidth="2" strokeDasharray="5 3" />
        </g>
      ))}
      <path d="M200 10 q8 6 16 0 M140 30 q6 4 12 0" stroke="#2a2a30" strokeWidth="1.5" fill="none" />
      <path d="M0 190 Q100 180 200 188 T400 186 V200 H0 Z" fill="#7aa0bc" opacity="0.6" />
    </>
  ),
  sw_marsh: (
    <>
      <rect x="0" y="120" width="400" height="80" fill="#101612" />
      {[30, 110, 200, 290, 360].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 120 V${40 + (i % 2) * 20}`} stroke="#2a2a1e" strokeWidth="8" />
          <path d={`M${x} 120 q-14 -10 -22 0 M${x} 120 q14 -10 22 0 M${x} 112 q-10 -14 -20 -6`} stroke="#2a2a1e" strokeWidth="3" fill="none" />
          <ellipse cx={x} cy={40 + (i % 2) * 20} rx="34" ry="18" fill="#263a2a" />
          <path d={`M${x} 120 V${200 - (i % 2) * 20}`} stroke="#2a2a1e" strokeWidth="8" opacity="0.35" />
          <ellipse cx={x} cy={200 - (i % 2) * 20} rx="34" ry="18" fill="#263a2a" opacity="0.3" />
        </g>
      ))}
      <path d="M150 150 Q200 144 250 150" stroke="#55705c" strokeWidth="1" opacity="0.6" />
    </>
  ),
  sw_calm: (
    <>
      <rect x="0" y="110" width="400" height="90" fill="#c2c9c8" />
      <path d="M0 110 H400" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
      {[[60, 110, 1], [170, 112, 1.3], [300, 108, 0.9]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity="0.85">
          <path d="M-36 0 L36 0 L28 10 L-28 10 Z" fill="#4a3f36" />
          <rect x="-2" y="-46" width="3" height="46" fill="#4a3f36" />
          <path d="M1 -44 L22 -20 L1 -24 Z" fill="#a89a86" />
          <path d="M-36 0 L-36 -10 L36 -10 L36 0" fill="none" stroke="#4a3f36" />
        </g>
      ))}
      <path d="M96 106 H134 M206 104 H264" stroke="#4a3f36" strokeWidth="2" />
      {[[60, 130], [170, 134], [300, 128]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="36" ry="4" fill="#4a3f36" opacity="0.2" />)}
    </>
  ),
  sw_monastery: (
    <>
      {sea(130, '#38506a', '#22324a')}
      <path d="M80 130 L100 70 L300 70 L320 130 Z" fill="#6a5240" />
      <path d="M120 70 V40 L140 26 L160 40 V70 M240 70 V36 L260 22 L280 36 V70" fill="#7a6250" />
      {[130, 170, 210, 250].map((x) => <path key={x} d={`M${x} 110 V92 q8 -10 16 0 V110 Z`} fill="#f0c27a" opacity="0.6" />)}
      <ellipse cx="200" cy="168" rx="70" ry="16" fill="#05090f" />
      <ellipse cx="200" cy="168" rx="70" ry="16" fill="none" stroke="#9fc4d6" opacity="0.4" />
      <path d="M200 70 V152" stroke="#2a2a2a" strokeWidth="1.5" />
    </>
  ),
  sw_deep: (
    <>
      {[...Array(10)].map((_, i) => <path key={i} d={`M${rnd(i, 6) * 400} 0 l${-20 + rnd(i, 7) * 40} 200`} stroke="#3a7a8a" strokeWidth={4 + rnd(i, 8) * 8} opacity="0.06" />)}
      <g transform="translate(200 90)">
        <path d="M-22 10 Q-22 -26 0 -28 Q22 -26 22 10 Z" fill="#8a6a2a" />
        <circle cx="0" cy="-6" r="8" fill="#f0e2a0" opacity="0.8" />
        <rect x="-26" y="10" width="52" height="5" fill="#6a5020" />
        <path d="M0 -28 V-100" stroke="#5a5a5a" strokeWidth="1.5" />
      </g>
      <circle cx="200" cy="90" r="50" fill="url(#glow)" opacity="0.25" />
      <path d="M30 170 Q120 150 200 175 Q300 140 380 172" stroke="#0e2632" strokeWidth="14" fill="none" />
      <circle cx="330" cy="160" r="2.5" fill="#d8f0ff" />
      {[...Array(12)].map((_, i) => <circle key={i} cx={180 + rnd(i, 9) * 40} cy={rnd(i, 10) * 60} r="1.5" fill="#bfe6f0" opacity="0.5" />)}
    </>
  ),
  sw_orrery: (
    <>
      {driftingStars(35, 120, 8)}
      {[60, 95, 130].map((r, i) => <ellipse key={r} cx="200" cy="100" rx={r} ry={r * 0.32} fill="none" stroke="#c9a45a" strokeWidth="1.5" opacity={0.7 - i * 0.15} />)}
      <circle cx="200" cy="100" r="14" fill="#e8b25a" />
      <circle cx="260" cy="100" r="5" fill="#9fc4e8" />
      <circle cx="130" cy="112" r="6" fill="#c87a5a" />
      <circle cx="320" cy="92" r="4" fill="#d8d8e8" />
      <path d="M0 170 L400 170 V200 H0 Z" fill="#1a1630" />
      {[...Array(8)].map((_, i) => (
        <circle key={i} cx={i * 52 + 26} cy="178" r="16" fill="none" stroke="#4a3d6a" strokeWidth="4" strokeDasharray="4 3" />
      ))}
    </>
  ),
  sw_rim: (
    <>
      {driftingStars(80, 200, 11)}
      <path d="M0 140 L260 140 Q300 140 310 160 L320 200 H0 Z" fill="#14244a" />
      <path d="M260 140 Q300 140 310 160 L320 200" fill="none" stroke="#a9c4ff" strokeWidth="1.5" opacity="0.7" />
      {[...Array(10)].map((_, i) => <path key={i} d={`M${300 + i * 2} ${150 + i * 4} q30 10 60 -30`} stroke="#9fb6ff" strokeWidth="1" opacity={0.15 + i * 0.03} fill="none" />)}
      {sloop(120, 140, 0.9)}
      {shard(360, 60, 6)}
    </>
  ),
  sw_tavern: (
    <>
      <rect x="0" y="150" width="400" height="50" fill="#3a2414" />
      <circle cx="60" cy="70" r="30" fill="none" stroke="#5c3a1f" strokeWidth="6" />
      {[0, 45, 90, 135].map((a) => <path key={a} d="M60 40 V100" stroke="#5c3a1f" strokeWidth="3" transform={`rotate(${a} 60 70)`} />)}
      <circle cx="250" cy="60" r="48" fill="url(#glow)" opacity="0.5" />
      <path d="M250 30 V50" stroke="#2a1a12" strokeWidth="2" />
      <rect x="242" y="50" width="16" height="18" fill="#ffd88a" opacity="0.8" />
      <rect x="150" y="125" width="220" height="12" fill="#5c3a1f" />
      <rect x="160" y="137" width="8" height="40" fill="#5c3a1f" />
      <rect x="352" y="137" width="8" height="40" fill="#5c3a1f" />
      {[200, 240, 300].map((x) => <rect key={x} x={x} y="108" width="12" height="17" rx="2" fill="#c98a3e" />)}
    </>
  ),
  sw_isle: (
    <>
      <circle cx="320" cy="50" r="20" fill="#fff2c4" opacity="0.8" />
      {sea(130, '#3f8ab8', '#2a6f9a')}
      <path d="M60 135 Q180 90 300 135 Z" fill="#e9d29a" />
      <path d="M100 128 Q180 70 260 128 Z" fill="#3a6a3a" />
      {palm(130, 122, 1)}
      {palm(220, 118, 1.1, -1)}
      <path d="M0 175 Q100 165 200 176 T400 172" stroke="#e8f4ff" strokeWidth="1.5" fill="none" opacity="0.6" />
    </>
  ),
  sw_cave: (
    <>
      <path d="M0 0 H400 V60 Q320 110 240 70 Q170 40 110 80 Q50 110 0 70 Z" fill="#020406" />
      <path d="M0 200 V150 Q80 130 160 150 Q260 120 400 150 V200 Z" fill="#0b1316" />
      {[[70, 60], [150, 52], [300, 70], [350, 58]].map(([x, y], i) => <path key={i} d={`M${x - 6} ${y} L${x} ${y + 24} L${x + 6} ${y} Z`} fill="#020406" />)}
      {shard(220, 120, 4)}
      {[[60, 160], [320, 150]].map(([x, y], i) => <path key={i} d={`M${x} ${y} l8 -18 l8 18 Z`} fill="#dfe8e8" opacity="0.7" />)}
    </>
  ),
  sw_skysea: (
    <>
      {driftingStars(70, 110, 14)}
      {/* the Upper Sea: a sea of light, with cloud-stone isles floating on it */}
      <rect x="0" y="120" width="400" height="80" fill="#1d2a6a" />
      <path d="M0 120 H400" stroke="#b9c8ff" strokeWidth="1.5" opacity="0.7" />
      {[...Array(14)].map((_, i) => <path key={i} d={`M${rnd(i, 3) * 380} ${130 + rnd(i, 4) * 60} h${20 + rnd(i, 5) * 30}`} stroke="#8fa4ff" strokeWidth="1" opacity="0.35" />)}
      {[[70, 112, 1], [300, 108, 1.4], [200, 116, 0.6]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M-34 0 Q-10 -18 10 -10 Q28 -16 38 0 Q10 8 -34 0 Z" fill="#cfd8f4" />
          <path d="M-30 2 Q0 12 34 2 L22 14 L-18 14 Z" fill="#8a96c8" />
        </g>
      ))}
      <path d="M0 120 q-6 40 0 80 M14 124 q-8 36 0 76" stroke="#d8e4ff" strokeWidth="3" opacity="0.5" fill="none" />
      {sloop(200, 128, 0.8)}
      {shard(350, 36, 4)}
    </>
  ),
  sw_stair: (
    <>
      {driftingStars(90, 200, 17)}
      {/* a spiral stair of pale light-stone climbing out of sight */}
      {[...Array(16)].map((_, i) => {
        const x = 40 + i * 20
        const y = 190 - i * 11
        return (
          <g key={i} opacity={i > 11 && i % 2 ? 0.25 : 1}>
            <path d={`M${x} ${y} h30 v6 h-30 Z`} fill={i % 3 === 0 ? '#e8f0ff' : '#b9c8ee'} />
            <path d={`M${x} ${y + 6} h30 v4 h-26 Z`} fill="#6a7ab0" />
          </g>
        )
      })}
      <path d="M0 150 L60 150 L60 200" stroke="#2b3c7a" strokeWidth="1" fill="none" />
      <circle cx="170" cy="150" r="30" fill="url(#glow)" opacity="0.5" />
      {shard(360, 20, 5)}
    </>
  ),
  sw_summit: (
    <>
      {driftingStars(110, 200, 21)}
      {/* the Crown: a ring in the sky where Wend belongs, with a landing below */}
      <circle cx="200" cy="64" r="44" fill="none" stroke="#c9d6ff" strokeWidth="3" opacity="0.8" />
      <circle cx="200" cy="64" r="56" fill="url(#glow)" opacity="0.5" />
      <path d="M200 20 V4 M200 108 V124" stroke="#c9d6ff" strokeWidth="2" opacity="0.6" />
      <path d="M120 170 Q200 150 280 170 L300 200 H100 Z" fill="#1b2660" />
      <path d="M120 170 Q200 150 280 170" fill="none" stroke="#e8f0ff" strokeWidth="2" />
      {[150, 200, 250].map((x) => <path key={x} d={`M${x} 160 v-14`} stroke="#e8f0ff" strokeWidth="2" opacity="0.6" />)}
      {shard(200, 64, 6)}
    </>
  ),
}
