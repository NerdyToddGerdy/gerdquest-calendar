// Real artwork overrides. Put an image in src/assets/portraits/ named after a
// hero or enemy id (e.g. `sw_bram.png`, `er_kennelmaster.webp`) and it
// replaces that character's drawn portrait everywhere: hero cards, the hero
// sheet and the page scene. No code changes needed; rebuild to pick it up.
//
// Best results: a transparent PNG or WebP, the character standing and facing
// right, about 6:7 (e.g. 600 x 700), feet near the bottom edge.
import { PORTRAITS } from './specs'

const files = import.meta.glob('../../assets/portraits/*.{png,jpg,jpeg,webp,avif,svg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

/** id → image URL, from the file names in src/assets/portraits/. */
export const PORTRAIT_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace(/\.[^.]+$/, ''), url]),
)

/** Does this character have a portrait (drawn or imported)? */
export const hasPortrait = (id: string): boolean => id in PORTRAIT_IMAGES || id in PORTRAITS
