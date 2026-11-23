// What's new, in plain words for players. The newest release comes first, and
// its version is the app's version (a test keeps package.json in step).
// Developer-facing notes live in CHANGELOG.md.

export interface Release {
  version: string
  /** ISO date of the release. */
  date: string
  /** A short headline for the release. */
  title: string
  /** What changed, written for players. */
  changes: string[]
}

export const CHANGELOG: Release[] = [
  {
    version: '0.6.1',
    date: '2026-11-23',
    title: 'One click per weekend',
    changes: [
      'Weekend pages are one stop in Day view: the › arrow now goes straight from Saturday to Monday, and ‹ comes back to Saturday.',
      'The date at the top shows the whole weekend (Sat – Sun) while you’re on a weekend page.',
    ],
  },
  {
    version: '0.6.0',
    date: '2026-11-23',
    title: 'Character portraits',
    changes: [
      'Every hero and boss now has a portrait, drawn in the same style as the page scenes.',
      'See your hero on the hero cards, in the preview, and at the top of your hero sheet.',
      'Your hero now stands in each page’s scene, and bosses face you across it when it’s time to fight.',
    ],
  },
  {
    version: '0.5.0',
    date: '2026-11-23',
    title: 'Settings and a tidier header',
    changes: [
      'A new ⚙ Settings menu holds Import, Export all, and the choice of light, dark or system appearance.',
      'Light mode! Pick it in Settings, or let Questender follow your device.',
      'This “What’s new” list now lives in Settings, so you can see what changed since you last played.',
      'The calendar’s Month, Wall, Week and Year buttons moved up into the header, next to Day and Calendar.',
    ],
  },
  {
    version: '0.4.0',
    date: '2026-11-23',
    title: 'New campaign: The Starwake',
    changes: [
      'The Starwake: the star that held the night sky in place has fallen into the sea. Sail the Saltreach for its shards before a corsair-prince cages it.',
      'Nine months of pages, from a drowned observatory to the edge of the world, with six new heroes to choose from.',
      'New sea backgrounds: salt flats, floating isles, a mirror marsh, the deep, a clockwork island and more.',
      'Months 10–13 are still to come. Month 9 ends on a cliffhanger.',
    ],
  },
  {
    version: '0.3.0',
    date: '2026-11-23',
    title: 'Calendar, notes and dice sounds',
    changes: [
      'A Calendar view shows every campaign’s pages by Month, Wall, Week or Year. Pages you haven’t reached stay sealed.',
      'Write your own entries on any date, and see holidays and moon phases.',
      'Each campaign has a Notes page for your own thoughts. Notes travel with exports.',
      'Preview a hero’s abilities and level-ups before you choose them.',
      'Hover or tap an item to see what it does.',
      'Dice sounds, with a mute button in the header.',
    ],
  },
  {
    version: '0.2.0',
    date: '2026-11-22',
    title: 'Many campaigns at once',
    changes: [
      'Run several campaigns side by side on one desk, each on its own tab.',
      'Pages unlock on real dates. A new campaign starts about a week back, so you get a few warm-up pages.',
      'New campaign: The Ember Road, with followers you can hire and point pools for spells and chi.',
      'New campaign: The Halcyon Debt, with your own ship, crew and dogfights.',
      'Export all saves every campaign into one file you can import on another device.',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-11-22',
    title: 'First voyage',
    changes: [
      'Questender begins: a solo adventure played one page a day.',
      'The Lamp at Brightwatch: six trial heroes, then a year-long hunt for the Sevenfold Peal.',
      'Choices, d20 checks, fights, shops and level-ups, saved in your browser.',
    ],
  },
]

export const APP_VERSION = CHANGELOG[0].version

const SEEN_KEY = 'questender.seenVersion'

/** Has the player opened What's new since the latest release? */
export function seenLatest(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === APP_VERSION
  } catch {
    return true
  }
}

export function markSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, APP_VERSION)
  } catch {
    /* ignore */
  }
}
