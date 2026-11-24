// Length-of-play rewards, one set per campaign run. A run's days played (distinct
// dates on which one of its pages was completed; catch-up days count, streaks
// don't) unlock themed keepsakes and looks. Everything here is derived from the
// run's own days, so it travels with that run's save and export, and a deleted
// run takes its rewards with it. Original names and flavour only.

/**
 * Cosmetics form a small registry: { id, campaignId, category, days, name, hint }.
 * Each run stores its choice as a map category -> cosmetic id (GameState.style).
 * A new category (say 'avatar' or 'border') means adding a label here, entries
 * below and a renderer in the web app; no save migration is needed.
 */
export type StyleCategory = 'paper' | 'dice' | 'edge' | (string & {})
export const STYLE_CATEGORIES: StyleCategory[] = ['paper', 'dice', 'edge']
export const STYLE_LABELS: Record<string, string> = { paper: 'Page paper', dice: 'Dice', edge: 'Page edge' }

export interface Keepsake {
  id: string
  name: string
  text: string
  /** Days played in the run needed to earn it. */
  days: number
  /** The free once-a-week d20 reroll (see the KEEPSAKE_REROLL action). */
  perk?: 'reroll'
}

export interface StyleDef {
  /** Also the CSS value of data-paper / data-dice / data-edge. */
  id: string
  campaignId: string
  category: StyleCategory
  name: string
  /** Days played in the run needed to unlock it (its milestone). */
  days: number
  /** Shown while locked; never says anything about the story. */
  hint: string
}

export interface RewardTheme {
  keepsakes: Keepsake[]
  styles: StyleDef[]
}

const STANDARD = [7, 30, 100, 200, 365]
/** Verdant is a partial year (103 pages), so its milestones stop at 100. */
const SHORT = [7, 30, 60, 85, 100]

function theme(
  cid: string,
  milestones: number[],
  keepsakes: [string, string][],
  looks: { paper: string; dice: string; edge: string },
): RewardTheme {
  return {
    keepsakes: keepsakes.map(([name, text], i) => ({
      id: `${cid}-k${milestones[i]}`,
      name,
      text,
      days: milestones[i],
      ...(i === 1 ? { perk: 'reroll' as const } : {}),
    })),
    styles: (['edge', 'paper', 'dice'] as const).map((category, i) => ({
      id: `${cid}-${category}`,
      campaignId: cid,
      category,
      name: looks[category],
      days: milestones[i],
      hint: `Play ${milestones[i]} days in this campaign.`,
    })),
  }
}

export const REWARDS: Record<string, RewardTheme> = {
  brightwatch: theme(
    'brightwatch',
    STANDARD,
    [
      ['Sea-glass shard', 'Green, smooth and warm from your pocket. The tide gave it up on a quiet morning.'],
      ['Brass lens cap', 'The harbourmaster says it earns you a second look. Once a week, it will give you one.'],
      ['Fog bell', 'A bell the size of a thimble. It only rings when the weather is about to turn kind.'],
      ['Annotated tide table', 'Someone has pencilled come back tomorrow beside every line.'],
      ['Lamp-glass medal', 'Cut from a spare lens: a whole year caught in one bright facet.'],
    ],
    { paper: 'Fog chart', dice: 'Sea-glass dice', edge: 'Lamp-gold edge' },
  ),
  emberroad: theme(
    'emberroad',
    STANDARD,
    [
      ['Waystone chip', 'A flake of grey stone that stays faintly warm, however cold the road.'],
      ['Ember-coal pendant', 'It glows when you hold it. Once a week it will let you throw again.'],
      ['Frost-lace mitten', 'Knitted by someone who plainly expected you to come back for it.'],
      ['Road-worn map case', 'Oiled leather, soft as a glove. The creases are in all the right places.'],
      ['Tinderbox of the long road', 'It has lit a thousand small fires and has never once failed you.'],
    ],
    { paper: 'Snowfield paper', dice: 'Frost dice', edge: 'Ember-glow edge' },
  ),
  halcyon: theme(
    'halcyon',
    STANDARD,
    [
      ['Cracked credit chip', 'Worth nothing now, and you would not part with it for anything.'],
      ['Lucky bolt', 'Pulled from a hull that should have failed. Once a week it lets you roll again.'],
      ['Hologram postcard', 'A dockside view that flickers whenever somebody laughs nearby.'],
      ['Dock-pass stamp', 'Every port in the arm has pressed its mark on this one square of card.'],
      ['Zeroed ledger stub', 'A scrap of ledger that finally reads nothing owed, in very small print.'],
    ],
    { paper: 'Star-chart paper', dice: 'Hologram dice', edge: 'Neon edge' },
  ),
  starwake: theme(
    'starwake',
    STANDARD,
    [
      ['Tide pearl', 'Small, grey and quietly lit from inside, like a moon seen through fog.'],
      ['Sextant charm', 'Brass, no bigger than a thumbnail. Once a week it finds you a better angle.'],
      ['Star-chart scrap', 'The corner of a chart, with one star circled twice in a steady hand.'],
      ['Salt-stiff pennant', 'It stands out straight even on windless nights.'],
      ['Pocket constellation', 'Seven pinpricks in a square of sailcloth, which lines up with the sky just so.'],
    ],
    { paper: 'Night-sea paper', dice: 'Tide-pearl dice', edge: 'Star-gold edge' },
  ),
  verdant: theme(
    'verdant',
    SHORT,
    [
      ['Acorn cap', 'Someone drilled a hole in it and threaded a bit of green wool. It has been a lucky charm ever since.'],
      ['Charm of three leaves', 'Pressed flat and stitched between wax paper. Once a week it lets you try again.'],
      ['Carter’s wax tablet', 'Scratched with tallies and a small drawing of a very patient ox.'],
      ['Moss-stitched purse', 'It stays damp in the driest summer and has never once been empty of crumbs.'],
      ['Seal of the green road', 'A wax seal pressed with a leaf. Doors open a little easier for it.'],
    ],
    { paper: 'Leaf-pressed paper', dice: 'Acorn dice', edge: 'Moss edge' },
  ),
}

export function rewardTheme(campaignId: string): RewardTheme {
  return REWARDS[campaignId] ?? { keepsakes: [], styles: [] }
}

export function keepsakesEarned(campaignId: string, days: number): Keepsake[] {
  return rewardTheme(campaignId).keepsakes.filter((k) => days >= k.days)
}

export function stylesUnlocked(campaignId: string, days: number): StyleDef[] {
  return rewardTheme(campaignId).styles.filter((s) => days >= s.days)
}

/** Does a run with this many days played own the free-reroll keepsake? */
export function hasRerollKeepsake(campaignId: string, days: number): boolean {
  return keepsakesEarned(campaignId, days).some((k) => k.perk === 'reroll')
}

/** The day a milestone was reached: the date of the run's n-th distinct day played. */
export function earnedOn(sortedDays: string[], needed: number): string | null {
  return sortedDays[needed - 1] ?? null
}
