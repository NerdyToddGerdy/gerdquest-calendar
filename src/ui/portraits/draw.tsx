import type { ReactNode } from 'react'
import type { CreatureSpec, FigureSpec, Headwear, Prop, PortraitSpec } from './spec'

// Procedural character art in the scene style: flat layered shapes, a few
// tones per figure, light only where something glows. Drawn into a 120x140
// box (standing on y = 136, facing right). Every shape is original.

const INK = '#1a1410'
const WOOD = '#6b4a2c'
const METAL = '#b9c2ca'
const DARK_METAL = '#5d6670'

/** Darken (amt < 0) or lighten (amt > 0) a #rrggbb color. */
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)))
  const r = f((n >> 16) & 255)
  const g = f((n >> 8) & 255)
  const b = f(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

const glowDot = (x: number, y: number, r: number, color: string) => (
  <>
    <circle cx={x} cy={y} r={r * 3.2} fill={color} opacity="0.22" />
    <circle cx={x} cy={y} r={r * 1.8} fill={color} opacity="0.35" />
    <circle cx={x} cy={y} r={r} fill={color} />
  </>
)

// ---------- figures ----------

const WIDTH = { slim: [15, 12], broad: [22, 17], armored: [21, 16], robed: [16, 14] } as const

/** The thing in the front hand, which sits at (79, 86). */
function drawProp(p: Prop, glow: string | undefined, skin: string, trim: string): ReactNode {
  const g = glow ?? '#ffd88a'
  switch (p) {
    case 'staff':
      return (
        <>
          <path d="M81 38 L78 134" stroke={WOOD} strokeWidth="3.2" strokeLinecap="round" />
          {glow ? glowDot(81, 36, 3.2, g) : <circle cx="81" cy="37" r="3.5" fill={shade(WOOD, -0.2)} />}
        </>
      )
    case 'coralstaff':
      return (
        <>
          <path d="M81 42 L78 134" stroke={WOOD} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M81 44 L76 32 M81 44 L86 30 M84 37 L90 33 M78 37 L73 34" stroke="#e0757a" strokeWidth="2.4" strokeLinecap="round" />
          {glow && glowDot(81, 34, 2, g)}
        </>
      )
    case 'halberd':
      return (
        <>
          <path d="M82 26 L77 134" stroke={WOOD} strokeWidth="3" strokeLinecap="round" />
          <path d="M82 30 Q96 32 95 44 Q88 40 81 42 Z" fill={METAL} />
          <path d="M81 32 Q72 30 74 40" stroke={METAL} strokeWidth="2.2" fill="none" />
          <path d="M82 26 L84 18" stroke={METAL} strokeWidth="2" />
        </>
      )
    case 'hook':
      return (
        <>
          <path d="M80 86 L86 60" stroke={DARK_METAL} strokeWidth="3" strokeLinecap="round" />
          <path d="M86 60 Q96 56 95 66 Q94 72 88 70" stroke={METAL} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )
    case 'wand':
      return (
        <>
          <path d="M80 86 L95 72" stroke={WOOD} strokeWidth="2" strokeLinecap="round" />
          {glowDot(96, 71, 2, g)}
        </>
      )
    case 'dagger':
    case 'daggers':
      return <path d="M82 84 L97 74 L84 89 Z" fill={METAL} />
    case 'sword':
      return (
        <>
          <path d="M81 85 L104 50" stroke={METAL} strokeWidth="2" strokeLinecap="round" />
          <path d="M76 82 L86 88" stroke={trim} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )
    case 'mace':
    case 'lanternmace':
      return (
        <>
          <path d="M80 86 L90 68" stroke={WOOD} strokeWidth="2.6" strokeLinecap="round" />
          {p === 'lanternmace' ? (
            <>
              {glowDot(92, 64, 3.5, g)}
              <rect x="88" y="59" width="8" height="10" rx="1.5" fill="none" stroke={DARK_METAL} strokeWidth="1.6" />
            </>
          ) : (
            <circle cx="91" cy="66" r="5.5" fill={DARK_METAL} />
          )}
        </>
      )
    case 'censer':
      return (
        <>
          <path d="M80 88 L84 108" stroke={DARK_METAL} strokeWidth="1" />
          {glowDot(85, 112, 2.5, g)}
          <path d="M80 110 Q85 104 90 110 L88 117 L82 117 Z" fill={trim} />
        </>
      )
    case 'hammer':
      return (
        <>
          <path d="M80 87 L89 60" stroke={WOOD} strokeWidth="3" strokeLinecap="round" />
          <rect x="81" y="50" width="18" height="10" rx="1.5" fill={DARK_METAL} transform="rotate(18 90 55)" />
        </>
      )
    case 'maul':
      return (
        <>
          <path d="M80 88 L90 52" stroke={WOOD} strokeWidth="3.5" strokeLinecap="round" />
          <rect x="80" y="38" width="24" height="15" rx="2" fill={DARK_METAL} transform="rotate(16 92 45)" />
        </>
      )
    case 'axe':
      return (
        <>
          <path d="M80 88 L90 56" stroke={WOOD} strokeWidth="3" strokeLinecap="round" />
          <path d="M88 56 Q102 52 100 68 Q94 62 86 64 Z" fill={METAL} />
        </>
      )
    case 'bow':
      return (
        <>
          <path d="M84 54 Q102 86 84 118" stroke={WOOD} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M84 54 L84 118" stroke="#e8e2d0" strokeWidth="0.7" />
        </>
      )
    case 'harpoon':
      return (
        <>
          <path d="M66 110 L106 44" stroke={WOOD} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M106 44 L110 34 L101 42 Z M104 48 L99 46" fill={METAL} stroke={METAL} strokeWidth="1.4" />
          <path d="M66 110 Q60 120 70 122 Q80 122 72 114" stroke="#d6c8ae" strokeWidth="1.2" fill="none" />
        </>
      )
    case 'lanternpole':
      return (
        <>
          <path d="M80 30 L78 134" stroke={DARK_METAL} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M80 30 L92 30 L92 34" stroke={DARK_METAL} strokeWidth="1.6" fill="none" />
          {glowDot(92, 40, 3.5, g)}
          <rect x="88" y="34" width="8" height="11" rx="1.5" fill="none" stroke={DARK_METAL} strokeWidth="1.5" />
        </>
      )
    case 'bell':
      return (
        <>
          <path d="M80 89 L82 104" stroke={DARK_METAL} strokeWidth="1.2" />
          <path d="M74 118 Q74 104 82 104 Q90 104 90 118 Z" fill="#b8862e" />
          <circle cx="82" cy="119" r="1.8" fill="#8a6420" />
        </>
      )
    case 'cane':
      return (
        <>
          <path d="M79 86 L85 134" stroke={WOOD} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="85" cy="134" r="1.8" fill="#c9a45a" />
          <path d="M77 85 Q79 80 83 83" stroke="#c9a45a" strokeWidth="2.2" fill="none" />
        </>
      )
    case 'pistol':
      return (
        <>
          <rect x="80" y="80" width="15" height="4.5" rx="1" fill={DARK_METAL} />
          <rect x="80" y="83" width="4" height="7" rx="1" fill={WOOD} />
          {glow && glowDot(96, 82, 1.4, g)}
        </>
      )
    case 'rifle':
      return (
        <>
          <rect x="62" y="80" width="46" height="5" rx="1.5" fill={DARK_METAL} transform="rotate(-8 85 82)" />
          <rect x="64" y="84" width="10" height="8" rx="1.5" fill={trim} transform="rotate(-8 85 82)" />
          {glow && glowDot(108, 76, 1.5, g)}
        </>
      )
    case 'baton':
      return (
        <>
          <path d="M80 86 L92 64" stroke={DARK_METAL} strokeWidth="3" strokeLinecap="round" />
          {glowDot(92, 63, 2, glow ?? '#7fd4ff')}
        </>
      )
    case 'whip':
      return <path d="M80 86 Q100 70 98 96 Q96 120 112 116" stroke={glow ?? '#7fd4ff'} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    case 'book':
      return <rect x="72" y="74" width="13" height="16" rx="1.5" fill={trim} stroke={shade(trim, -0.4)} />
    case 'fists':
    case 'none':
      return null
  }
  void skin
}

function drawHeadwear(h: Headwear, color: string, skin: string): { back?: ReactNode; front?: ReactNode } {
  switch (h) {
    case 'hood':
      return {
        back: <circle cx="60" cy="40" r="15" fill={color} />,
        front: <path d="M46 40 Q47 24 60 24 Q73 24 74 40 Q68 30 60 30 Q52 30 46 40 Z" fill={color} />,
      }
    case 'tricorn':
      return { front: <path d="M42 32 L78 32 L71 21 L60 26 L49 21 Z" fill={color} stroke={shade(color, 0.3)} strokeWidth="0.8" /> }
    case 'hat':
      return {
        front: (
          <>
            <ellipse cx="60" cy="31" rx="20" ry="3.6" fill={color} />
            <path d="M51 31 L52 19 L68 19 L69 31 Z" fill={color} />
            <rect x="51.5" y="27" width="17" height="2.6" fill={shade(color, 0.35)} />
          </>
        ),
      }
    case 'helm':
      return {
        front: (
          <>
            <path d="M47 44 L47 38 Q47 25 60 25 Q73 25 73 38 L73 44 Z" fill={color} />
            <rect x="57" y="37" width="15" height="3" fill={INK} />
            <path d="M60 25 L60 44" stroke={shade(color, 0.3)} strokeWidth="1" />
          </>
        ),
      }
    case 'cap':
      return { front: <path d="M48 37 Q49 26 60 26 Q71 26 72 37 Q60 33 48 37 Z" fill={color} /> }
    case 'goggles':
      return {
        front: (
          <>
            <path d="M48 37 Q49 26 60 26 Q71 26 72 37 Q60 33 48 37 Z" fill={color} />
            <circle cx="58" cy="32" r="3.2" fill="#9fd7ef" stroke={DARK_METAL} strokeWidth="1.2" />
            <circle cx="66" cy="32" r="3.2" fill="#9fd7ef" stroke={DARK_METAL} strokeWidth="1.2" />
          </>
        ),
      }
    case 'crown':
      return { front: <path d="M49 31 L49 22 L54 27 L60 19 L66 27 L71 22 L71 31 Z" fill={color} /> }
    case 'veil':
      return {
        back: <path d="M44 46 Q44 22 60 22 Q76 22 76 46 L80 74 L40 74 Z" fill={color} />,
        front: <path d="M47 38 Q48 25 60 25 Q72 25 73 38 Q66 31 60 31 Q54 31 47 38 Z" fill={color} />,
      }
    case 'mask':
      return {
        front: (
          <>
            <path d="M53 33 Q60 29 72 34 L71 46 Q64 52 57 48 Z" fill={color} />
            <path d="M62 38 L68 38" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          </>
        ),
      }
    case 'skull':
      return {
        front: (
          <>
            <path d="M48 42 Q47 25 61 25 Q75 26 76 40 L80 45 L72 48 L66 52 L56 50 Z" fill="#e6dccb" />
            <circle cx="66" cy="38" r="2.6" fill={INK} />
            <path d="M69 47 L71 50 M73 46 L75 49" stroke={INK} strokeWidth="1" />
          </>
        ),
      }
    case 'helmet':
      return {
        front: (
          <>
            <circle cx="60" cy="40" r="15" fill="#bfe6ff" opacity="0.18" stroke={color} strokeWidth="2.4" />
            <path d="M51 31 Q55 27 60 27" stroke="#ffffff" strokeWidth="1.6" opacity="0.6" fill="none" />
          </>
        ),
      }
    case 'bandana':
      return {
        front: (
          <>
            <path d="M48 35 Q60 28 72 35 L72 32 Q60 24 48 32 Z" fill={color} />
            <path d="M48 34 L42 40 L46 41 Z" fill={color} />
          </>
        ),
      }
    case 'headband':
      return { front: <path d="M49 35 Q60 31 71 35" stroke={color} strokeWidth="2.6" fill="none" /> }
    case 'none':
      return {}
  }
  void skin
}

function Figure({ s }: { s: FigureSpec }) {
  const [sh, waist] = WIDTH[s.build]
  const legs = s.legs ?? shade(s.outfit, -0.4)
  const headColor = s.headColor ?? s.trim
  const hw = drawHeadwear(s.head ?? 'none', headColor, s.skin)
  const fists = s.prop === 'fists'
  const hand: [number, number] = fists ? [81, 74] : [79, 86]
  const eye = s.ghost ?? INK
  const hairBack = s.hairStyle === 'long' || s.hairStyle === 'braid'
  const showHair = !['helm', 'skull', 'helmet', 'veil'].includes(s.head ?? 'none') && s.hairStyle !== 'bald'

  const body = (
    <>
      <ellipse cx="60" cy="136" rx="26" ry="3.5" fill="#000" opacity="0.25" />
      {s.cloak && <path d={`M${60 - sh - 1} 56 Q${60 - sh - 12} 100 ${60 - sh - 9} 131 L${60 + sh - 6} 131 Q${60 + sh - 2} 96 ${60 + sh - 1} 56 Z`} fill={s.cloak} />}
      {/* back arm */}
      <path d={`M${60 - sh + 4} 60 L${60 - sh + 2} 97`} stroke={shade(s.outfit, -0.25)} strokeWidth="7" strokeLinecap="round" />
      <circle cx={60 - sh + 2} cy="100" r="3.6" fill={s.skin} />
      {s.prop === 'daggers' && <path d={`M${60 - sh} 101 L${60 - sh - 4} 116 L${60 - sh + 4} 102 Z`} fill={METAL} />}
      {s.shield && (
        <g>
          <path d={`M${60 - sh - 12} 70 L${60 - sh + 10} 70 L${60 - sh + 10} 92 Q${60 - sh - 1} 108 ${60 - sh - 12} 92 Z`} fill={s.trim} stroke={shade(s.trim, -0.4)} strokeWidth="1.5" />
          <circle cx={60 - sh - 1} cy="84" r="3" fill={shade(s.trim, 0.4)} />
        </g>
      )}
      {/* legs */}
      {s.build === 'robed' ? (
        <path d={`M${60 - waist} 96 L${60 - waist - 9} 134 L${60 + waist + 9} 134 L${60 + waist} 96 Z`} fill={s.outfit} />
      ) : (
        <>
          <rect x={60 - waist + 1} y="96" width={waist - 2} height="34" fill={legs} />
          <rect x="61" y="96" width={waist - 2} height="34" fill={shade(legs, -0.15)} />
          <rect x={60 - waist} y="128" width={waist} height="7" rx="2" fill="#2a1d16" />
          <rect x="61" y="128" width={waist + 2} height="7" rx="2" fill="#2a1d16" />
        </>
      )}
      {/* torso */}
      <path d={`M${60 - sh} 58 Q60 52 ${60 + sh} 58 L${60 + waist} 100 L${60 - waist} 100 Z`} fill={s.outfit} />
      {s.build === 'armored' && (
        <>
          <path d={`M${60 - waist + 2} 64 Q60 60 ${60 + waist - 2} 64 L${60 + waist - 4} 88 Q60 92 ${60 - waist + 4} 88 Z`} fill={s.trim} opacity="0.55" />
          <circle cx={60 - sh + 3} cy="59" r="7" fill={s.trim} />
          <circle cx={60 + sh - 3} cy="59" r="7" fill={s.trim} />
        </>
      )}
      {s.build !== 'robed' && <rect x={60 - waist} y="93" width={waist * 2} height="5" fill={s.trim} />}
      {s.build === 'robed' && <path d={`M60 56 L60 132`} stroke={s.trim} strokeWidth="3" />}
      {/* neck, head, hair */}
      {hw.back}
      {showHair && hairBack && <path d="M47 36 Q46 58 51 63 L69 63 Q74 58 73 36 Z" fill={s.hair} />}
      {showHair && s.hairStyle === 'braid' && <path d="M50 60 Q46 72 49 84" stroke={s.hair} strokeWidth="4" strokeLinecap="round" fill="none" />}
      {showHair && s.hairStyle === 'bun' && <circle cx="48" cy="33" r="5.5" fill={s.hair} />}
      <rect x="56" y="47" width="8" height="10" fill={shade(s.skin, -0.12)} />
      <circle cx="60" cy="40" r="11" fill={s.skin} />
      <circle cx="65" cy="39.5" r={s.ghost ? 1.8 : 1.3} fill={eye} />
      {s.ghost && <circle cx="65" cy="39.5" r="4" fill={s.ghost} opacity="0.35" />}
      {showHair && s.hairStyle !== 'bald' && (
        <path
          d={
            s.hairStyle === 'wild'
              ? 'M48 38 L46 30 L51 32 L52 25 L57 29 L60 23 L63 28 L68 25 L69 31 L74 30 L72 37 Q64 31 56 33 Z'
              : s.hairStyle === 'cropped'
                ? 'M50 34 Q51 28.5 60 28.5 Q69 28.5 70 34 Q63 31.5 56 32.5 Z'
                : 'M49 37 Q49 27 60 27 Q71 27 72 36 Q64 31 56 33 Q52 34 49 37 Z'
          }
          fill={s.hair}
        />
      )}
      {s.beard && <path d="M52 45 Q55 57 63 56 Q70 54 70 44 Q65 50 60 50 Q55 50 52 45 Z" fill={s.hair} />}
      {hw.front}
      {/* front arm and prop */}
      {s.prop === 'bow' || s.prop === 'harpoon' || s.prop === 'rifle' ? drawProp(s.prop, s.glow, s.skin, s.trim) : null}
      <path d={`M${60 + sh - 4} 60 L${hand[0]} ${hand[1]}`} stroke={s.outfit} strokeWidth="7" strokeLinecap="round" />
      <circle cx={hand[0]} cy={hand[1]} r={fists ? 5.2 : 3.8} fill={s.skin} />
      {fists && <circle cx={60 - sh + 2} cy="100" r="5" fill={s.skin} />}
      {s.prop !== 'bow' && s.prop !== 'harpoon' && s.prop !== 'rifle' ? drawProp(s.prop, s.glow, s.skin, s.trim) : null}
    </>
  )

  const scaled = s.scale ? <g transform={`translate(60 136) scale(${s.scale}) translate(-60 -136)`}>{body}</g> : body
  return s.ghost ? <g opacity="0.8">{scaled}</g> : scaled
}

// ---------- creatures ----------

const eyes = (pts: [number, number][], color: string, r = 2) => pts.map(([x, y], i) => <g key={i}>{glowDot(x, y, r, color)}</g>)

function Creature({ s }: { s: CreatureSpec }) {
  const { body, accent, eye } = s
  const dark = shade(body, -0.35)
  const ground = <ellipse cx="60" cy="136" rx="42" ry="4" fill="#000" opacity="0.25" />
  const crown = (x: number, y: number) => <path d={`M${x - 10} ${y} L${x - 10} ${y - 9} L${x - 5} ${y - 4} L${x} ${y - 12} L${x + 5} ${y - 4} L${x + 10} ${y - 9} L${x + 10} ${y} Z`} fill={accent} />
  switch (s.shape) {
    case 'beast':
      return (
        <>
          {ground}
          {[30, 44, 74, 86].map((x, i) => <rect key={x} x={x} y="104" width="9" height="30" rx="3" fill={i % 2 ? dark : body} />)}
          <ellipse cx="58" cy="96" rx="36" ry="22" fill={body} />
          <path d="M28 88 Q40 74 62 76" stroke={accent} strokeWidth="3" fill="none" opacity="0.6" />
          <circle cx="92" cy="78" r="15" fill={body} />
          <ellipse cx="105" cy="84" rx="8" ry="6" fill={dark} />
          <path d="M84 66 L86 56 L92 64 Z M96 64 L100 55 L102 66 Z" fill={dark} />
          {eyes([[97, 74]], eye, 1.8)}
          <path d="M100 90 L102 95 M106 89 L107 94" stroke="#f0e8d8" strokeWidth="1.4" />
          {s.crown && crown(92, 62)}
        </>
      )
    case 'bird':
      return (
        <>
          {ground}
          <path d="M58 76 L4 30 L22 70 L8 84 L50 92 Z" fill={dark} />
          <path d="M64 76 L116 26 L104 70 L118 86 L72 92 Z" fill={body} />
          <path d="M20 44 L30 60 M100 40 L92 58" stroke={accent} strokeWidth="1.5" opacity="0.8" />
          <ellipse cx="60" cy="94" rx="18" ry="24" fill={body} />
          <path d="M50 116 L40 132 L60 120 L80 132 L70 116 Z" fill={dark} />
          <circle cx="66" cy="66" r="11" fill={body} />
          <path d="M75 63 L90 68 L75 71 Z" fill={accent} />
          {eyes([[69, 63]], eye, 1.7)}
          <path d="M54 118 L52 134 M66 118 L68 134" stroke={accent} strokeWidth="2.5" />
          {s.crown && crown(66, 56)}
        </>
      )
    case 'serpent':
      return (
        <>
          {ground}
          {s.wings && <path d="M56 70 L14 24 L30 62 L18 70 L52 86 Z" fill={dark} opacity="0.9" />}
          <path d="M10 132 C34 96 84 128 74 88 S54 38 92 34" stroke={body} strokeWidth="20" fill="none" strokeLinecap="round" />
          <path d="M10 132 C34 96 84 128 74 88 S54 38 92 34" stroke={accent} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.5" strokeDasharray="6 5" />
          <ellipse cx="98" cy="34" rx="16" ry="10" fill={body} />
          <path d="M100 40 L116 44 L100 46 Z" fill={dark} />
          <path d="M104 41 L106 45 M109 42 L110 45" stroke="#f0e8d8" strokeWidth="1.2" />
          {eyes([[101, 30]], eye, 2)}
          {s.wings && <path d="M70 66 L110 14 L100 52 L114 58 L78 80 Z" fill={body} opacity="0.95" />}
          {s.crown && crown(96, 24)}
        </>
      )
    case 'crab':
      return (
        <>
          {ground}
          {[24, 34, 44, 76, 86, 96].map((x, i) => <path key={x} d={`M${x} 104 L${x + (i < 3 ? -10 : 10)} 132`} stroke={dark} strokeWidth="3.5" strokeLinecap="round" />)}
          <ellipse cx="60" cy="98" rx="38" ry="20" fill={body} />
          {[44, 60, 76].map((x) => <path key={x} d={`M${x} 80 Q${x + 2} 96 ${x} 114`} stroke={dark} strokeWidth="1.5" fill="none" />)}
          <path d="M26 88 L14 66 M94 88 L106 66" stroke={body} strokeWidth="7" strokeLinecap="round" />
          <path d="M6 60 Q8 46 20 50 L14 60 L24 62 Q20 72 8 68 Z M114 60 Q112 46 100 50 L106 60 L96 62 Q100 72 112 68 Z" fill={accent} />
          <path d="M52 80 L50 68 M68 80 L70 68" stroke={dark} strokeWidth="2" />
          {eyes([[50, 66], [70, 66]], eye, 2)}
        </>
      )
    case 'construct':
      return (
        <>
          {ground}
          <rect x="40" y="104" width="14" height="30" rx="2" fill={dark} />
          <rect x="66" y="104" width="14" height="30" rx="2" fill={dark} />
          <rect x="24" y="56" width="13" height="48" rx="5" fill={dark} />
          <rect x="34" y="50" width="52" height="58" rx="6" fill={body} />
          <rect x="83" y="56" width="13" height="48" rx="5" fill={body} />
          {[42, 78].map((x) => [58, 100].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" fill={accent} />))}
          {glowDot(60, 76, 5, eye)}
          <rect x="46" y="22" width="28" height="28" rx="4" fill={body} />
          <rect x="52" y="32" width="18" height="5" rx="2" fill={eye} />
          <circle cx="61" cy="34.5" r="12" fill={eye} opacity="0.15" />
          {s.crown && crown(60, 22)}
        </>
      )
    case 'ghost':
      return (
        <>
          <g opacity="0.85">
            <path d="M60 18 Q32 26 30 68 Q24 110 14 134 Q30 124 42 132 Q52 122 60 134 Q70 122 80 132 Q92 124 106 134 Q96 110 90 68 Q88 26 60 18 Z" fill={body} />
            <path d="M34 70 Q20 84 18 100 M86 70 Q100 82 104 96" stroke={body} strokeWidth="8" strokeLinecap="round" />
            <ellipse cx="60" cy="44" rx="15" ry="18" fill={dark} />
            <path d="M44 34 Q60 14 76 34" stroke={accent} strokeWidth="2" fill="none" opacity="0.7" />
          </g>
          {eyes([[54, 44], [67, 44]], eye, 2)}
          {s.crown && crown(60, 24)}
        </>
      )
    case 'machine':
      return (
        <>
          {ground}
          <rect x="12" y="110" width="96" height="22" rx="11" fill={dark} />
          {[24, 44, 64, 84, 98].map((x) => <circle key={x} cx={x} cy="121" r="7" fill={shade(dark, -0.3)} stroke={accent} strokeWidth="1.2" />)}
          <rect x="22" y="62" width="74" height="50" rx="4" fill={body} />
          <rect x="30" y="30" width="9" height="34" fill={dark} />
          <circle cx="34" cy="24" r="6" fill="#8a8a8a" opacity="0.4" />
          <g transform="translate(72 52)">
            <circle r="20" fill="none" stroke={accent} strokeWidth="6" strokeDasharray="5 4" />
            <circle r="11" fill={accent} />
            <circle r="4" fill={dark} />
          </g>
          {glowDot(44, 86, 3.5, eye)}
          <path d="M96 92 L114 84 L114 104 L96 100 Z" fill={dark} />
          <path d="M100 92 L104 96 L108 90 L112 96" stroke="#e6e0d4" strokeWidth="1.5" fill="none" />
        </>
      )
    case 'plant':
      return (
        <>
          {ground}
          {[...Array(13)].map((_, i) => {
            const x = 18 + i * 7
            return <path key={i} d={`M${x} 134 Q${x + (i % 2 ? 10 : -10)} 90 ${x + (i % 3) * 4 - 4} ${36 + (i % 4) * 8}`} stroke={i % 2 ? body : dark} strokeWidth="5" fill="none" strokeLinecap="round" />
          })}
          <ellipse cx="60" cy="74" rx="22" ry="28" fill={dark} />
          <path d="M42 98 Q60 112 78 98" stroke={accent} strokeWidth="2" fill="none" />
          {eyes([[52, 68], [68, 68]], eye, 2.2)}
          <circle cx="60" cy="92" r="5" fill={accent} opacity="0.8" />
          {s.crown && crown(60, 46)}
        </>
      )
    case 'ship':
      return (
        <>
          <path d="M0 124 Q30 118 60 124 T120 122 V140 H0 Z" fill="#1d3149" opacity="0.6" />
          <path d="M8 104 L112 104 L100 124 L18 124 Z" fill={body} />
          <path d="M8 104 L112 104" stroke={accent} strokeWidth="2.5" />
          {[30, 50, 70, 90].map((x) => <rect key={x} x={x} y="109" width="6" height="5" fill={dark} />)}
          <rect x="44" y="20" width="3" height="84" fill={dark} />
          <rect x="74" y="30" width="3" height="74" fill={dark} />
          <path d="M47 24 Q66 40 47 62 Z M47 66 Q70 80 47 98 Z" fill={accent} opacity="0.9" />
          <path d="M77 34 Q94 48 77 66 Z M77 70 Q96 84 77 98 Z" fill={accent} opacity="0.75" />
          <path d="M45 20 L45 10 L58 14 L45 18" fill={eye} />
          {glowDot(108, 100, 2.5, eye)}
        </>
      )
    case 'fog':
      return (
        <>
          {[[30, 90, 26], [60, 70, 32], [92, 88, 26], [46, 110, 24], [78, 112, 26], [60, 40, 22]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? body : dark} opacity="0.55" />
          ))}
          {eyes([[50, 66], [72, 66]], eye, 2.6)}
          <path d="M48 84 Q60 92 74 84" stroke={accent} strokeWidth="2" fill="none" opacity="0.8" />
          {s.crown && crown(61, 34)}
        </>
      )
    case 'host':
      return (
        <>
          {ground}
          {[[22, 0.7], [98, 0.7], [40, 0.85], [80, 0.85], [60, 1]].map(([x, sc], i) => (
            <g key={i} transform={`translate(${x} 136) scale(${sc}) translate(-60 -136)`} opacity={0.65 + i * 0.07}>
              <path d="M46 136 L48 76 Q60 66 72 76 L74 136 Z" fill={i % 2 ? dark : body} />
              <circle cx="60" cy="60" r="12" fill={i % 2 ? dark : body} />
              {glowDot(64, 59, 1.4, eye)}
            </g>
          ))}
          <path d="M10 130 Q60 120 110 130" stroke={accent} strokeWidth="2" fill="none" opacity="0.5" />
        </>
      )
  }
}

/** The drawing alone (an SVG fragment in the 120x140 box). */
export function PortraitArt({ spec }: { spec: PortraitSpec }) {
  return spec.kind === 'figure' ? <Figure s={spec} /> : <Creature s={spec} />
}
