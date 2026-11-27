// Player tokens: a round avatar and a border, shown top right of the desk.
// Both are earned by play only (nothing here can be bought; see docs/PRINCIPLES.md).
//   - A hero's token is earned by playing that hero (any run, any campaign).
//   - Each campaign unlocks themed borders, and a special emblem token, at its
//     length-of-play milestones (days played in a run of that campaign).
//   - A rare gilded border comes with finishing any campaign.
// Entries share the cosmetics registry shape (id, campaignId, category, days,
// name, hint); a new category means adding entries and a renderer.
import { REWARDS } from './rewards'

export type TokenCategory = 'avatar' | 'border'

export interface TokenCosmetic {
  id: string
  /** The campaign whose days unlock it (null: not tied to a campaign). */
  campaignId: string | null
  category: TokenCategory
  /** Days played in a run of that campaign needed to unlock it. */
  days: number | null
  name: string
  /** Shown while locked; never about the story. */
  hint: string
}

export const DEFAULT_AVATAR = 'default'
export const DEFAULT_BORDER = 'plain'
export const GILDED_BORDER = 'gilded'
/** The achievement that earns the gilded border. */
export const GILDED_ACHIEVEMENT = 'completionist'

/** Hero tokens use the hero's own id as their id. */
export const emblemId = (campaignId: string) => `${campaignId}-emblem`

const LOOKS: Record<string, { title: string; borders: [string, string]; emblem: string }> = {
  brightwatch: { title: 'The Lamp at Brightwatch', borders: ['Lamp-gold rim', 'Sea-glass rim'], emblem: 'Lighthouse emblem' },
  emberroad: { title: 'The Ember Road', borders: ['Frost rim', 'Ember rim'], emblem: 'Waystone emblem' },
  halcyon: { title: 'The Halcyon Debt', borders: ['Neon rim', 'Starfield rim'], emblem: 'Ringed-planet emblem' },
  starwake: { title: 'The Starwake', borders: ['Tide-pearl rim', 'Star-gold rim'], emblem: 'Constellation emblem' },
  verdant: { title: 'The Verdant Accord', borders: ['Moss rim', 'Bark rim'], emblem: 'Green-leaf emblem' },
  santa: { title: 'Saving Santa', borders: ['Holly rim', 'Candy-stripe rim'], emblem: 'Star-topper emblem' },
}

export const BORDER_IDS: Record<string, [string, string]> = Object.fromEntries(Object.keys(LOOKS).map((c) => [c, [`${c}-border1`, `${c}-border2`]]))

/** Milestone rewards: the 1st and 3rd milestones give a border, the last an emblem token. */
export const TOKEN_REWARDS: TokenCosmetic[] = Object.entries(LOOKS).flatMap(([cid, look]) => {
  const days = REWARDS[cid].keepsakes.map((k) => k.days)
  const hint = (n: number) => `Play ${n} days in ${look.title}.`
  return [
    { id: BORDER_IDS[cid][0], campaignId: cid, category: 'border' as const, days: days[0], name: look.borders[0], hint: hint(days[0]) },
    { id: BORDER_IDS[cid][1], campaignId: cid, category: 'border' as const, days: days[2], name: look.borders[1], hint: hint(days[2]) },
    { id: emblemId(cid), campaignId: cid, category: 'avatar' as const, days: days[4], name: look.emblem, hint: hint(days[4]) },
  ]
})

export const RARE_REWARDS: TokenCosmetic[] = [
  { id: GILDED_BORDER, campaignId: null, category: 'border', days: null, name: 'Gilded rim', hint: 'Finish any campaign.' },
]

export const DEFAULT_COSMETICS: TokenCosmetic[] = [
  { id: DEFAULT_AVATAR, campaignId: null, category: 'avatar', days: null, name: 'Plain token', hint: '' },
  { id: DEFAULT_BORDER, campaignId: null, category: 'border', days: null, name: 'Plain rim', hint: '' },
]

/** Every cosmetic that is not a hero token. */
export const COSMETICS: TokenCosmetic[] = [...DEFAULT_COSMETICS, ...TOKEN_REWARDS, ...RARE_REWARDS]

export function cosmeticDef(id: string): TokenCosmetic | undefined {
  return COSMETICS.find((c) => c.id === id)
}

/** Ids of the borders and emblems a run with this many days played has earned. */
export function tokenUnlocksFor(campaignId: string, days: number): string[] {
  return TOKEN_REWARDS.filter((c) => c.campaignId === campaignId && c.days !== null && days >= c.days).map((c) => c.id)
}
