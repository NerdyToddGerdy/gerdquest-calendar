// Portrait descriptions. Every hero and boss is drawn from one of these, in
// the same flat, layered-SVG style as the scene backgrounds (see draw.tsx).
// Drop an image into src/assets/portraits/ named after a character id to use
// real artwork instead (see art.ts).

export type Build = 'slim' | 'broad' | 'armored' | 'robed'
export type Hair = 'short' | 'long' | 'bun' | 'braid' | 'wild' | 'bald' | 'cropped'
export type Headwear =
  | 'none' | 'hood' | 'tricorn' | 'hat' | 'helm' | 'cap' | 'goggles' | 'crown' | 'veil' | 'mask' | 'skull' | 'helmet' | 'bandana' | 'headband'
export type Prop =
  | 'none' | 'staff' | 'coralstaff' | 'halberd' | 'wand' | 'dagger' | 'daggers' | 'mace' | 'censer' | 'lanternmace' | 'hammer' | 'maul'
  | 'bow' | 'harpoon' | 'hook' | 'lanternpole' | 'bell' | 'cane' | 'pistol' | 'rifle' | 'baton' | 'sword' | 'whip' | 'axe' | 'book' | 'fists'

/** A person: heroes and human-shaped bosses. */
export interface FigureSpec {
  kind: 'figure'
  build: Build
  skin: string
  hair: string
  hairStyle: Hair
  beard?: boolean
  /** Main clothing color. */
  outfit: string
  /** Belt, trim, armor plates. */
  trim: string
  /** Trousers / lower body (default: a darker outfit). */
  legs?: string
  cloak?: string
  head?: Headwear
  /** Hat / hood / helm color (default: trim). */
  headColor?: string
  prop: Prop
  /** A shield on the back arm. */
  shield?: boolean
  /** Color of the prop's light or magic, if it glows. */
  glow?: string
  /** Pale, see-through, with glowing eyes (ghosts, reflections). */
  ghost?: string
  /** Draw larger than life (giants). */
  scale?: number
}

export type CreatureShape = 'beast' | 'bird' | 'serpent' | 'crab' | 'construct' | 'ghost' | 'machine' | 'plant' | 'ship' | 'fog' | 'host'

/** Anything else: beasts, constructs, spirits, machines and ships. */
export interface CreatureSpec {
  kind: 'creature'
  shape: CreatureShape
  body: string
  accent: string
  /** Eye / light color. */
  eye: string
  crown?: boolean
  wings?: boolean
}

export type PortraitSpec = FigureSpec | CreatureSpec

/** Drawing box: every portrait is drawn into 0 0 120 140, standing on y = 136, facing right. */
export const BOX = { w: 120, h: 140 } as const
