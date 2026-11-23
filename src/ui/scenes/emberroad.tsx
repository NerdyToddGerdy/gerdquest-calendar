import type { ReactNode } from 'react'
import type { EmberScene } from '../../engine/types'

// Backgrounds for the Ember Road: a frozen north road, its waystones, and the
// places along it. Same style as Scene.tsx (400x200 viewBox, layered SVG);
// every shape here is original to Questender.

export const EMBER_SKIES: Record<EmberScene, [string, string]> = {
  er_road: ['#2a3550', '#b9c4d2'],
  er_stone: ['#101a2c', '#41526b'],
  er_stonelit: ['#1a2236', '#e0a85a'],
  er_pines: ['#0f1a26', '#4a6072'],
  er_river: ['#1c2c44', '#a9c4d6'],
  er_mere: ['#2b3a37', '#9fb0a2'],
  er_pass: ['#233149', '#c8d2e0'],
  er_village: ['#1c2438', '#d79a5a'],
  er_tavern: ['#1e130d', '#6e4121'],
  er_tourney: ['#4f7fae', '#e8d9b0'],
  er_abbey: ['#161726', '#5a5568'],
  er_siege: ['#2a1a1e', '#a4553a'],
  er_camp: ['#070b16', '#1d2b45'],
  er_cave: ['#06070a', '#1d232b'],
  er_crown: ['#0a0e1c', '#3b4c72'],
  er_blizzard: ['#58667a', '#c9d2dc'],
  er_forge: ['#1a0f0c', '#8a3a1c'],
  er_ashflats: ['#3a2a2a', '#c58a64'],
}

// ---------- shared pieces ----------
/** Cheap deterministic pseudo-random in [0,1) so art never shifts between renders. */
const rnd = (i: number, salt = 1) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

const stars = (n: number, maxY = 90, salt = 3) => (
  <g fill="#e6eeff">
    {[...Array(n)].map((_, i) => (
      <circle key={i} cx={rnd(i, salt) * 400} cy={rnd(i, salt + 5) * maxY} r={0.5 + rnd(i, salt + 9) * 0.9} opacity={0.35 + rnd(i, salt + 2) * 0.6} />
    ))}
  </g>
)

const snowfall = (n: number, salt = 7, color = '#ffffff', op = 0.8) => (
  <g fill={color} opacity={op}>
    {[...Array(n)].map((_, i) => (
      <circle key={i} cx={rnd(i, salt) * 400} cy={rnd(i, salt + 4) * 200} r={0.7 + rnd(i, salt + 8) * 1.2} />
    ))}
  </g>
)

/** A snow-laden pine, base centered at (x, y). */
const pine = (x: number, y: number, s: number, fill = '#142a26', snow = '#dfe8ef') => (
  <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-2" y="-6" width="4" height="8" fill="#241a14" />
    <path d="M-14 -6 L0 -38 L14 -6 Z" fill={fill} />
    <path d="M-11 -24 L0 -52 L11 -24 Z" fill={fill} />
    <path d="M-8 -42 L0 -68 L8 -42 Z" fill={fill} />
    <path d="M0 -68 L-5 -55 L-2 -57 L-4 -48 L0 -52 Z M0 -52 L-8 -34 L-3 -36 L-8 -24 L0 -30 Z" fill={snow} opacity="0.8" />
  </g>
)

/** A waystone: a squat stone obelisk with a lamp cage. */
const waystone = (x: number, base: number, s: number, lit: boolean) => (
  <g transform={`translate(${x} ${base}) scale(${s})`}>
    {lit && <circle cx="0" cy="-62" r="46" fill="url(#glow)" />}
    <path d="M-16 0 L-11 -50 L11 -50 L16 0 Z" fill="#3a4152" />
    <path d="M-16 0 L-11 -50 L-3 -50 L-5 0 Z" fill="#4a5266" />
    <path d="M-14 -50 H14 V-56 H-14 Z" fill="#2a2f3c" />
    <rect x="-8" y="-76" width="16" height="20" fill={lit ? '#ffd88a' : '#1a1e28'} stroke="#2a2f3c" strokeWidth="2" />
    {!lit && <path d="M-3 -62 L0 -68 L3 -62 Z" fill="#3b6da8" opacity="0.8" />}
    <path d="M-10 -76 L0 -86 L10 -76 Z" fill="#2a2f3c" />
    <path d="M-16 0 Q0 -5 16 0 Z" fill="#e8eef5" />
    {/* the Hush's mark: a closed mouth */}
    <path d="M-5 -24 H5" stroke={lit ? '#6f7384' : '#8fb4e8'} strokeWidth="1.6" opacity="0.7" />
  </g>
)

/** Distant mountains, with snowcaps. */
const mountains = (y: number, fill: string, cap = '#e6edf5', sc = 1) => (
  <g transform={`translate(0 ${y}) scale(1 ${sc})`}>
    <path d="M-10 0 L50 -60 L90 -30 L150 -85 L210 -25 L260 -70 L320 -35 L370 -75 L410 -20 V80 H-10 Z" fill={fill} />
    <path d="M50 -60 L38 -44 L48 -48 L56 -40 L64 -50 Z M150 -85 L134 -62 L146 -68 L156 -58 L166 -70 Z M260 -70 L246 -50 L256 -55 L266 -46 L274 -56 Z M370 -75 L356 -55 L366 -60 L376 -50 Z" fill={cap} opacity="0.85" />
  </g>
)

const drift = (y: number, fill: string, amp = 8, op = 1) => (
  <path
    d={`M0 ${y} Q50 ${y - amp} 110 ${y} T230 ${y - 2} T330 ${y + 2} T400 ${y - amp / 2} V200 H0 Z`}
    fill={fill}
    opacity={op}
  />
)

const fire = (x: number, y: number, s = 1) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx="0" cy="-10" r="44" fill="url(#glow)" />
    <path d="M-14 2 L14 -4 M-14 -4 L14 2" stroke="#3a2418" strokeWidth="4" strokeLinecap="round" />
    <path d="M0 -4 Q-10 -12 -4 -24 Q-2 -16 3 -22 Q10 -12 0 -4 Z" fill="#ff9a3c" />
    <path d="M0 -4 Q-5 -9 -1 -16 Q3 -10 0 -4 Z" fill="#ffe28a" />
  </g>
)

const lamp = (x: number, y: number, w: number, h: number, c = '#ffcf7a') => (
  <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill={c} opacity="0.9" />
)

/** A small snow-roofed house. */
const house = (x: number, base: number, w: number, h: number, lit = true) => (
  <g key={`${x}`}>
    <rect x={x} y={base - h} width={w} height={h} fill="#2b2230" />
    <path d={`M${x - 4} ${base - h} L${x + w / 2} ${base - h - w * 0.45} L${x + w + 4} ${base - h} Z`} fill="#3c3446" />
    <path d={`M${x - 4} ${base - h} L${x + w / 2} ${base - h - w * 0.45} L${x + w + 4} ${base - h} Q${x + w / 2} ${base - h - 5} ${x - 4} ${base - h} Z`} fill="#e8eef5" />
    {lit && lamp(x + w * 0.2, base - h * 0.7, w * 0.22, h * 0.25)}
    {lit && lamp(x + w * 0.6, base - h * 0.7, w * 0.2, h * 0.25)}
  </g>
)

// ---------- the scenes ----------
export const EMBER_ART: Record<EmberScene, ReactNode> = {
  // A snowy road winding to a distant lit stone.
  er_road: (
    <>
      {stars(18, 50, 11)}
      {mountains(105, '#46566e', '#eef3f8')}
      {drift(118, '#c9d4e0', 6)}
      {[40, 90, 330, 370].map((x, i) => pine(x, 124 + (i % 2) * 4, 0.55 + (i % 2) * 0.1, '#1d3330'))}
      {waystone(235, 118, 0.35, true)}
      {drift(140, '#e3eaf2', 8)}
      <path d="M150 200 Q190 170 215 150 Q232 136 240 128 L246 128 Q238 142 232 156 Q226 176 270 200 Z" fill="#9fb0c4" />
      <path d="M165 200 Q200 174 222 154 M255 200 Q235 175 238 160" stroke="#7d8fa6" strokeWidth="1.2" fill="none" />
      {pine(40, 190, 1.2, '#16282a')}
      {pine(365, 195, 1.4, '#16282a')}
      {snowfall(45, 2)}
    </>
  ),
  // An unlit waystone under the stars.
  er_stone: (
    <>
      {stars(60, 100, 4)}
      <circle cx="320" cy="42" r="15" fill="#dfe8f5" opacity="0.75" />
      <circle cx="326" cy="38" r="13" fill="#101a2c" opacity="0.35" />
      {mountains(115, '#1c2740', '#7e92b4', 0.9)}
      {drift(140, '#7f90a8', 7)}
      {pine(40, 150, 0.9, '#0c1a20')}
      {pine(78, 154, 0.6, '#0c1a20')}
      {pine(360, 152, 0.8, '#0c1a20')}
      {drift(158, '#cdd9e6', 6)}
      {waystone(200, 178, 1.5, false)}
      <ellipse cx="200" cy="180" rx="60" ry="6" fill="#8fb4e8" opacity="0.12" />
      {snowfall(35, 9, '#e8f0ff', 0.7)}
    </>
  ),
  // The same stone, relit.
  er_stonelit: (
    <>
      {stars(30, 60, 6)}
      <circle cx="200" cy="106" r="150" fill="url(#glow)" opacity="0.35" />
      {mountains(120, '#2c2f48', '#f3d8a8', 0.9)}
      {drift(142, '#b9a79a', 7)}
      {pine(40, 152, 0.9, '#13232a')}
      {pine(365, 154, 0.9, '#13232a')}
      {drift(160, '#f2dcc0', 6)}
      <path d="M170 190 L200 160 L230 190 Z" fill="#ffd88a" opacity="0.16" />
      {waystone(200, 180, 1.5, true)}
      {snowfall(30, 13, '#fff1d0', 0.85)}
    </>
  ),
  // Dense, dark pine woods.
  er_pines: (
    <>
      {mountains(100, '#324356', '#dce5ee', 0.8)}
      <rect y="90" width="400" height="110" fill="#1a2c34" opacity="0.5" />
      {[...Array(14)].map((_, i) => pine(i * 31 + rnd(i, 2) * 10, 118 + rnd(i, 4) * 10, 0.55, '#1b3436', '#c6d4de'))}
      {drift(135, '#d3deea', 5)}
      {[...Array(11)].map((_, i) => pine(i * 38 + rnd(i, 8) * 14 - 6, 160 + rnd(i, 3) * 14, 0.9 + rnd(i, 6) * 0.3, '#0f2024'))}
      <path d="M150 200 Q190 175 200 150 Q205 140 215 138 Q210 160 235 200 Z" fill="#aebdcd" />
      {[...Array(5)].map((_, i) => pine(i * 95 + 40, 205, 1.7, '#0a171b'))}
      {snowfall(40, 5, '#ffffff', 0.6)}
    </>
  ),
  // A frozen river with a stone bridge.
  er_river: (
    <>
      {mountains(88, '#4a5f78', '#f0f5fa', 0.8)}
      {drift(98, '#dbe6f0', 4)}
      {[30, 70, 340, 375].map((x, i) => pine(x, 104 + (i % 2) * 5, 0.6, '#1e3a3a'))}
      <path d="M0 108 L400 108 V200 H0 Z" fill="#8eb3cc" />
      <path d="M0 108 Q120 120 200 130 Q300 145 400 118 V108 Z" fill="#a8c8dc" />
      <path d="M0 200 Q110 150 190 130 Q270 118 400 112 V130 Q300 138 250 160 Q200 190 230 200 Z" fill="#cfe3ef" opacity="0.7" />
      <path d="M80 160 L110 150 L130 160 L170 148 M240 170 L270 160 L300 172 M200 140 L215 150 L205 162" stroke="#f4fbff" strokeWidth="1.4" fill="none" opacity="0.85" />
      <path d="M0 105 Q100 100 200 106 T400 104 V112 H0 Z" fill="#2e4256" />
      <path d="M250 112 Q300 90 350 112 L350 100 Q300 78 250 100 Z" fill="#59647a" />
      <path d="M262 112 Q300 92 338 112 Z" fill="#2a3b4c" />
      {snowfall(30, 21, '#ffffff', 0.7)}
    </>
  ),
  // The Mere road: thaw, floodwater, reeds, drowned stones.
  er_mere: (
    <>
      <rect y="70" width="400" height="30" fill="#c1cdc0" opacity="0.35" />
      {mountains(98, '#59685f', '#dfe6e0', 0.6)}
      <rect y="96" width="400" height="104" fill="#4a6a68" />
      <path d="M0 110 Q100 104 200 110 T400 108 V200 H0 Z" fill="#5e8481" opacity="0.8" />
      {[120, 135, 150, 170, 190].map((y, i) => (
        <path key={y} d={`M${10 + i * 30} ${y} H${70 + i * 40}`} stroke="#c4d8d2" strokeWidth="1.2" opacity="0.5" />
      ))}
      <path d="M0 96 Q60 88 120 96 T240 94 T400 98 V104 H0 Z" fill="#8c9d8c" />
      <g transform="translate(270 150)">
        <path d="M-14 0 L-10 -40 L10 -40 L14 0 Z" fill="#3a4a52" />
        <rect x="-7" y="-60" width="14" height="18" fill="#1d2a2e" stroke="#2a3b40" strokeWidth="2" />
        <path d="M-10 -60 L0 -69 L10 -60 Z" fill="#2a3b40" />
        <ellipse cx="0" cy="2" rx="24" ry="4" fill="#9fc2bc" opacity="0.5" />
      </g>
      {[...Array(26)].map((_, i) => {
        const x = i * 16 + rnd(i, 5) * 8
        const h = 26 + rnd(i, 9) * 26
        return <path key={i} d={`M${x} 200 Q${x + 3} ${200 - h / 2} ${x + 6 - rnd(i, 3) * 10} ${200 - h}`} stroke={i % 3 ? '#2a3b2c' : '#4a5a32'} strokeWidth="2" fill="none" />
      })}
      {[...Array(3)].map((_, i) => (
        <circle key={i} cx={90 + i * 70} cy={120 + i * 8} r="2.5" fill="#bff7e6" opacity="0.8" />
      ))}
    </>
  ),
  // A high mountain pass, narrow switchback.
  er_pass: (
    <>
      {stars(14, 40, 14)}
      {mountains(90, '#506078', '#f2f6fb', 1.15)}
      <path d="M0 200 V70 L60 60 L90 100 L120 130 L170 150 L190 200 Z" fill="#232c3d" />
      <path d="M0 70 L60 60 L48 76 L26 70 L12 82 Z" fill="#e8eef5" />
      <path d="M400 200 V60 L350 50 L320 90 L290 125 L250 150 L240 200 Z" fill="#2a3446" />
      <path d="M400 60 L350 50 L362 68 L380 64 L392 74 Z" fill="#e8eef5" />
      <path d="M205 200 L195 170 L215 150 L190 130 L225 112 L205 96 L232 84" stroke="#c4d0de" strokeWidth="14" fill="none" strokeLinejoin="round" opacity="0.9" />
      <path d="M205 200 L195 170 L215 150 L190 130 L225 112 L205 96 L232 84" stroke="#95a6bb" strokeWidth="2" fill="none" strokeDasharray="6 5" />
      {waystone(233, 90, 0.22, false)}
      {snowfall(50, 17, '#ffffff', 0.7)}
    </>
  ),
  // A snowbound village at dusk, windows lit.
  er_village: (
    <>
      {stars(22, 60, 19)}
      <circle cx="80" cy="150" r="100" fill="url(#glow)" opacity="0.18" />
      {mountains(112, '#2f3350', '#f0d8b4', 0.7)}
      {drift(130, '#c5b3b3', 6)}
      {house(20, 150, 46, 30)}
      {house(80, 156, 56, 38)}
      {house(150, 152, 40, 26, false)}
      <g>
        <rect x="205" y="98" width="26" height="60" fill="#3a3140" />
        <path d="M201 98 L218 72 L235 98 Z" fill="#e8eef5" />
        <rect x="213" y="104" width="10" height="14" fill="#ffcf7a" />
        <rect x="232" y="124" width="40" height="34" fill="#2b2230" />
        <path d="M228 124 L252 104 L276 124 Z" fill="#3c3446" />
        <path d="M228 124 L252 104 L276 124 Q252 118 228 124 Z" fill="#e8eef5" />
        {lamp(244, 134, 10, 14)}
      </g>
      {house(300, 156, 50, 34)}
      {house(360, 152, 44, 28)}
      {[110, 190, 290].map((x) => (
        <g key={x}>
          <rect x={x} y="150" width="3" height="14" fill="#2a1d14" />
          <circle cx={x + 1.5} cy="148" r="9" fill="url(#glow)" />
        </g>
      ))}
      {drift(162, '#eef3f9', 5)}
      <path d="M0 200 Q100 172 200 178 T400 172 V200 Z" fill="#cdd8e4" />
      {pine(24, 190, 1.1, '#15262a')}
      {pine(380, 192, 1.2, '#15262a')}
      {snowfall(35, 23)}
    </>
  ),
  // Interior of a roadside inn: hearth, beams, a table.
  er_tavern: (
    <>
      <rect width="400" height="200" fill="#2a1a12" />
      {[0, 80, 160, 240, 320].map((x) => (
        <rect key={x} x={x} y="0" width="6" height="150" fill="#3a2414" opacity="0.8" />
      ))}
      <rect x="0" y="22" width="400" height="10" fill="#3d2616" />
      <rect x="0" y="75" width="400" height="6" fill="#331f12" />
      <rect x="40" y="70" width="90" height="84" fill="#2d2622" />
      <path d="M52 154 V96 Q85 66 118 96 V154 Z" fill="#0d0907" />
      <circle cx="85" cy="130" r="55" fill="url(#glow)" opacity="0.7" />
      <path d="M85 152 Q68 140 76 120 Q80 132 88 124 Q100 140 85 152 Z" fill="#ff9a3c" />
      <path d="M85 152 Q76 144 82 134 Q90 142 85 152 Z" fill="#ffe28a" />
      <rect x="250" y="44" width="70" height="56" fill="#2a3b58" />
      <rect x="250" y="44" width="70" height="56" fill="#cfe0f2" opacity="0.2" />
      <path d="M285 44 V100 M250 72 H320" stroke="#2a1a12" strokeWidth="4" />
      <circle cx="270" cy="60" r="1.5" fill="#fff" />
      <circle cx="300" cy="86" r="1.5" fill="#fff" />
      <path d="M244 100 H326" stroke="#e8eef5" strokeWidth="5" />
      <rect y="150" width="400" height="50" fill="#3a2414" />
      <path d="M0 165 H400 M0 182 H400" stroke="#2a190d" strokeWidth="2" />
      <rect x="170" y="128" width="190" height="12" fill="#6a4524" />
      <rect x="180" y="140" width="8" height="40" fill="#5c3a1f" />
      <rect x="342" y="140" width="8" height="40" fill="#5c3a1f" />
      {[210, 250, 300].map((x, i) => (
        <rect key={x} x={x} y={112 + (i % 2) * 2} width="12" height={16 - (i % 2) * 2} rx="2" fill="#c98a3e" />
      ))}
      <circle cx="256" cy="106" r="30" fill="url(#glow)" opacity="0.25" />
    </>
  ),
  // Kingsfair lists: pavilions, pennants, a sunny field.
  er_tourney: (
    <>
      <path d="M0 98 Q90 80 170 96 T320 90 T400 96 V120 H0 Z" fill="#8a9a7a" opacity="0.7" />
      <g fill="#a99a8c">
        <rect x="300" y="52" width="60" height="50" />
        <rect x="295" y="40" width="14" height="62" />
        <rect x="350" y="44" width="14" height="58" />
        <path d="M295 40 L302 28 L309 40 Z M350 44 L357 32 L364 44 Z" fill="#9a4a3e" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={312 + i * 10} y="46" width="5" height="6" />)}
      </g>
      <rect y="100" width="400" height="100" fill="#6a8b4f" />
      <rect y="100" width="400" height="100" fill="#d8c88a" opacity="0.18" />
      <rect x="0" y="146" width="400" height="5" fill="#e8dcc4" />
      {[...Array(10)].map((_, i) => <rect key={i} x={i * 44 + 8} y="140" width="4" height="22" fill="#9a4a3e" />)}
      {([[40, '#b5453a'], [130, '#3d6aa8'], [250, '#c9a43a']] as const).map(([x, c]) => (
        <g key={x}>
          <path d={`M${x} 128 L${x + 28} 98 L${x + 56} 128 Z`} fill={c} />
          <rect x={x + 8} y="128" width="40" height="20" fill="#e8dcc4" />
          <path d={`M${x + 28} 98 V84`} stroke="#4a3a2a" strokeWidth="2" />
          <path d={`M${x + 28} 84 L${x + 42} 89 L${x + 28} 94 Z`} fill={c} />
        </g>
      ))}
      <path d="M0 200 H400 V170 Q200 156 0 170 Z" fill="#c8b98a" />
      <path d="M0 0 H400 V30 Q300 20 200 28 T0 22 Z" fill="#fff" opacity="0.35" />
    </>
  ),
  // The Abbey of Silence: a tall cloister on a cliff, shuttered windows, no bell.
  er_abbey: (
    <>
      {stars(24, 70, 29)}
      <circle cx="70" cy="46" r="18" fill="#ddd6e8" opacity="0.7" />
      {mountains(110, '#2a2a3c', '#b8b4c8', 0.8)}
      <path d="M110 190 L120 120 L290 120 L300 190 Z" fill="#1c1c2b" />
      <rect x="180" y="40" width="42" height="90" fill="#1c1c2b" />
      <path d="M176 40 L201 12 L226 40 Z" fill="#2a2a3c" />
      <rect x="194" y="54" width="14" height="26" rx="7" fill="#0a0a12" />
      <path d="M201 56 V70" stroke="#3a3a50" strokeWidth="1.5" />
      <rect x="120" y="82" width="62" height="48" fill="#222233" />
      <rect x="222" y="82" width="62" height="48" fill="#222233" />
      <path d="M120 82 L151 64 L182 82 Z M222 82 L253 64 L284 82 Z" fill="#2c2c40" />
      {[130, 150, 232, 258].map((x) => <path key={x} d={`M${x} 124 V100 Q${x + 6} 90 ${x + 12} 100 V124 Z`} fill="#0a0a12" />)}
      <rect x="196" y="100" width="10" height="18" rx="5" fill="#a9b6d8" opacity="0.8" />
      {[...Array(8)].map((_, i) => <rect key={i} x={110 + i * 24} y="128" width="14" height="62" fill="#17172a" opacity="0.5" />)}
      <path d="M0 175 Q100 160 200 168 T400 164 V200 H0 Z" fill="#262637" />
      <path d="M0 190 Q120 176 240 184 T400 180 V200 H0 Z" fill="#c4c8d8" opacity="0.8" />
      {snowfall(30, 31, '#e8ecff', 0.6)}
    </>
  ),
  // Siege walls at dusk: ramparts, a ram, banners, enemy fires beyond.
  er_siege: (
    <>
      <circle cx="320" cy="150" r="100" fill="url(#glow)" opacity="0.25" />
      <path d="M0 112 Q100 100 200 108 T400 102 V200 H0 Z" fill="#33222a" />
      {([[70, 122], [140, 128], [210, 122]] as const).map(([x, y]) => (
        <g key={x}>
          <path d={`M${x - 14} ${y} L${x} ${y - 20} L${x + 14} ${y} Z`} fill="#d8d4d0" opacity="0.7" />
          <circle cx={x + 24} cy={y - 2} r="4" fill="#ff9a3c" />
          <circle cx={x + 24} cy={y - 2} r="14" fill="url(#glow)" opacity="0.6" />
        </g>
      ))}
      <path d="M90 112 Q80 90 100 70 Q90 50 110 30" stroke="#6a5a5a" strokeWidth="8" fill="none" opacity="0.3" />
      <g transform="translate(290 142)">
        <rect x="-40" y="-14" width="80" height="12" fill="#3a2a1e" />
        <path d="M-40 -14 L-26 -34 H26 L40 -14 Z" fill="#5a3a22" />
        <path d="M40 -8 H62" stroke="#c9d2dc" strokeWidth="6" strokeLinecap="round" />
        <circle cx="-26" cy="0" r="7" fill="#2a1a10" />
        <circle cx="26" cy="0" r="7" fill="#2a1a10" />
      </g>
      <path d="M0 200 V146 H400 V200 Z" fill="#1c1a22" />
      {[...Array(10)].map((_, i) => <rect key={i} x={i * 42 + 4} y="132" width="26" height="16" fill="#1c1a22" />)}
      <path d="M0 166 H400 M0 184 H400" stroke="#2c2a34" strokeWidth="2" />
      {[60, 200, 330].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 134 V86`} stroke="#4a3a2a" strokeWidth="2.5" />
          <path d={`M${x} 88 L${x + 26} 94 L${x + 18} 100 L${x + 26} 108 L${x} 104 Z`} fill={i % 2 ? '#c9a43a' : '#b5453a'} />
        </g>
      ))}
      {([[150, 60], [160, 70], [240, 50]] as const).map(([x, y]) => <path key={x} d={`M${x} ${y} L${x + 14} ${y + 10}`} stroke="#d8cfc4" strokeWidth="1.4" />)}
    </>
  ),
  // Night camp: tents around a fire, stars, sleeping road.
  er_camp: (
    <>
      {stars(70, 110, 37)}
      {mountains(124, '#0f1a2e', '#506388', 0.8)}
      {drift(150, '#18253c', 6)}
      {pine(30, 150, 0.8, '#0a141c')}
      {pine(60, 153, 0.55, '#0a141c')}
      {pine(380, 150, 0.9, '#0a141c')}
      <rect y="156" width="400" height="44" fill="#d3dcea" opacity="0.18" />
      <path d="M0 200 Q200 150 400 200 Z" fill="#c9d4e4" opacity="0.2" />
      <path d="M60 174 L100 126 L140 174 Z" fill="#6b4a3a" />
      <path d="M100 126 L100 174" stroke="#3a2418" strokeWidth="2" />
      <path d="M92 174 L100 150 L108 174 Z" fill="#1a0f0a" />
      <path d="M270 176 L305 134 L340 176 Z" fill="#4a5a6a" />
      <path d="M305 134 V176" stroke="#2a3340" strokeWidth="2" />
      <path d="M298 176 L305 156 L312 176 Z" fill="#101820" />
      {fire(200, 182, 1.5)}
      {[0, 1, 2].map((i) => <circle key={i} cx={196 + i * 6} cy={130 - i * 14} r="1.2" fill="#ffb25a" opacity={0.8 - i * 0.2} />)}
      {snowfall(20, 41, '#dbe6ff', 0.6)}
    </>
  ),
  // Cave / tunnels beneath the road: stalactites, cold glow, hanging ice.
  er_cave: (
    <>
      <rect width="400" height="200" fill="#07080c" />
      <circle cx="200" cy="110" r="130" fill="#3b6da8" opacity="0.1" />
      <path d="M0 0 H400 V30 L380 60 L350 28 L335 70 L300 24 L280 50 L240 20 L200 52 L170 18 L140 60 L110 26 L80 66 L50 30 L20 56 L0 40 Z" fill="#14181f" />
      <path d="M0 200 V90 Q20 70 36 100 Q44 140 40 200 Z M400 200 V80 Q380 60 364 96 Q356 140 360 200 Z" fill="#0e1218" />
      <path d="M0 150 Q100 135 200 150 T400 148 V200 H0 Z" fill="#161c26" />
      <path d="M60 175 Q200 160 340 178 L330 200 H70 Z" fill="#1d2a38" />
      {[[95, 30, 26], [140, 60, 30], [235, 20, 38], [300, 24, 30], [200, 52, 22]].map(([x, y, h], i) => (
        <path key={i} d={`M${x - 7} ${y - 4} L${x} ${y + h} L${x + 7} ${y - 4} Z`} fill="#7fb0d8" opacity="0.5" />
      ))}
      <path d="M120 150 L124 176 L130 150 Z M290 150 L296 182 L302 150 Z" fill="#9ccaee" opacity="0.4" />
      <circle cx="200" cy="130" r="22" fill="url(#glow)" opacity="0.35" />
      <circle cx="200" cy="130" r="3" fill="#ffd88a" />
      {[[150, 118], [168, 118], [240, 100], [258, 100]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" fill="#bfe3ff" opacity="0.8" />)}
    </>
  ),
  // The Crown of Stones: a ring of standing stones on a summit under aurora.
  er_crown: (
    <>
      {stars(70, 100, 43)}
      <path d="M0 50 Q80 10 160 40 T320 30 T400 50 V70 Q320 50 240 66 T80 60 T0 80 Z" fill="#4fe0b0" opacity="0.14" />
      <path d="M0 70 Q100 40 200 58 T400 52 V80 Q300 70 200 80 T0 90 Z" fill="#7a8cff" opacity="0.14" />
      {mountains(135, '#1a2442', '#8da2c8', 0.9)}
      <path d="M-10 200 V160 Q60 138 140 128 Q200 122 260 128 Q340 138 410 160 V200 Z" fill="#2a3556" />
      <path d="M-10 168 Q60 146 140 136 Q200 130 260 136 Q340 146 410 168 V176 H-10 Z" fill="#c4d0e4" opacity="0.6" />
      {[...Array(11)].map((_, i) => {
        const a = (i / 11) * Math.PI * 2
        return { cx: 200 + Math.cos(a) * 110, cy: 160 + Math.sin(a) * 18 }
      })
        .sort((p, q) => p.cy - q.cy)
        .map(({ cx, cy }, i) => {
          const s = 0.7 + (cy - 142) / 40
          return (
            <g key={i} transform={`translate(${cx} ${cy}) scale(${s})`}>
              <path d="M-9 0 L-7 -42 L-1 -50 L7 -44 L9 0 Z" fill="#3a4258" />
              <path d="M-9 0 L-7 -42 L-1 -50 L-2 0 Z" fill="#4c566e" />
              <circle cx="0" cy="-30" r="1.8" fill="#8fe8d0" opacity="0.8" />
            </g>
          )
        })}
      <ellipse cx="200" cy="162" rx="30" ry="6" fill="#3b4666" />
      <circle cx="200" cy="150" r="30" fill="url(#glow)" opacity="0.25" />
      {snowfall(24, 47, '#e8f0ff', 0.6)}
    </>
  ),
  // Whiteout: a storm eating the road.
  er_blizzard: (
    <>
      <rect width="400" height="200" fill="#8a97a8" opacity="0.35" />
      {mountains(100, '#7d8b9e', '#f4f7fb', 0.7)}
      <rect y="40" width="400" height="90" fill="#dfe6ee" opacity="0.4" />
      {[60, 120, 300, 350].map((x, i) => pine(x, 128 + (i % 2) * 6, 0.7, '#4a5f62', '#f4f7fb'))}
      <rect y="70" width="400" height="80" fill="#e8edf3" opacity="0.5" />
      <path d="M0 200 Q100 150 190 152 T400 140 V200 Z" fill="#eef2f7" />
      <path d="M190 200 Q200 170 214 150 L220 152 Q214 176 250 200 Z" fill="#b6c2d0" opacity="0.8" />
      <circle cx="318" cy="118" r="18" fill="url(#glow)" opacity="0.55" />
      <g transform="translate(318 130) scale(0.25)">
        <path d="M-16 0 L-11 -50 L11 -50 L16 0 Z" fill="#6a7284" />
        <rect x="-8" y="-76" width="16" height="20" fill="#ffd88a" />
      </g>
      {[...Array(40)].map((_, i) => {
        const x = rnd(i, 51) * 420 - 10
        const y = rnd(i, 53) * 200
        return <path key={i} d={`M${x} ${y} l-22 8`} stroke="#ffffff" strokeWidth={1 + rnd(i, 57)} opacity={0.5 + rnd(i, 59) * 0.4} />
      })}
      {snowfall(50, 55, '#ffffff', 0.9)}
    </>
  ),
  // Ember Forge: glassworks, furnaces, molten glow, glass.
  er_forge: (
    <>
      <rect width="400" height="200" fill="#1a0f0c" />
      <circle cx="200" cy="140" r="170" fill="#d4551c" opacity="0.2" />
      {[0, 100, 300].map((x) => <path key={x} d={`M${x} 200 V60 Q${x + 50} 10 ${x + 100} 60 V200 Z`} fill="#2a1814" opacity={0.9} />)}
      <path d="M0 0 H400 V24 H0 Z" fill="#12090a" />
      <rect x="150" y="70" width="100" height="90" fill="#3a1e18" />
      <path d="M165 160 V108 Q200 72 235 108 V160 Z" fill="#ff7a22" />
      <path d="M180 160 V120 Q200 96 220 120 V160 Z" fill="#ffd36a" />
      <circle cx="200" cy="130" r="70" fill="url(#glow)" opacity="0.6" />
      <rect x="135" y="160" width="130" height="12" fill="#241210" />
      {[40, 70, 330, 360].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 24 V${48 + i * 4}`} stroke="#3a3030" strokeWidth="2" />
          <path d={`M${x - 8} ${48 + i * 4} Q${x} ${34 + i * 4} ${x + 8} ${48 + i * 4} Q${x + 10} ${70 + i * 4} ${x} ${74 + i * 4} Q${x - 10} ${70 + i * 4} ${x - 8} ${48 + i * 4} Z`} fill="#ff9a3c" opacity="0.55" />
        </g>
      ))}
      <rect y="172" width="400" height="28" fill="#120a09" />
      {[[30, 184], [90, 190], [300, 186], [350, 182]].map(([x, y]) => <path key={x} d={`M${x} ${y} l6 -14 l5 14 Z`} fill="#8fd8e8" opacity="0.6" />)}
      {[...Array(20)].map((_, i) => <circle key={i} cx={150 + rnd(i, 61) * 100} cy={40 + rnd(i, 63) * 80} r="1.1" fill="#ffd36a" opacity={0.5 + rnd(i, 65) * 0.5} />)}
    </>
  ),
  // The Ashflats: grey cinder plains, glowing cracks, smoky red sky, a caravan.
  er_ashflats: (
    <>
      <circle cx="300" cy="96" r="30" fill="#e8a070" opacity="0.5" />
      <circle cx="300" cy="96" r="80" fill="url(#glow)" opacity="0.2" />
      <path d="M0 100 Q60 90 120 100 T240 98 T400 100 V120 H0 Z" fill="#6a4a46" opacity="0.7" />
      <path d="M0 200 V122 Q80 100 180 122 T400 114 V200 Z" fill="#5a4440" />
      <path d="M0 200 V140 Q120 120 220 142 T400 136 V200 Z" fill="#473532" />
      <path d="M0 150 Q120 140 240 152" stroke="#7a5a52" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M40 200 L70 170 L60 160 L95 140 M150 200 L170 180 L200 176 M280 200 L300 172 L330 168" stroke="#ff7a3c" strokeWidth="1.6" fill="none" opacity="0.8" />
      <path d="M340 110 Q330 80 350 60 Q340 40 360 20" stroke="#7a5a58" strokeWidth="10" fill="none" opacity="0.35" strokeLinecap="round" />
      <g transform="translate(120 134) scale(0.5)">
        <path d="M-16 0 L-11 -50 L11 -50 L16 0 Z" fill="#3a3038" />
        <rect x="-8" y="-76" width="16" height="20" fill="#1a1418" />
      </g>
      <g transform="translate(240 148)" fill="#1e1416">
        <path d="M0 0 Q4 -14 20 -14 Q36 -14 40 0 Z" fill="#d8c8a8" opacity="0.8" />
        <rect x="-2" y="0" width="44" height="6" />
        <circle cx="8" cy="8" r="6" />
        <circle cx="32" cy="8" r="6" />
      </g>
      {snowfall(36, 67, '#caa8a0', 0.5)}
    </>
  ),
}
