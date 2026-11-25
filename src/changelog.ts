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
    version: '0.12.0',
    date: '2026-11-24',
    title: 'Shorter save codes',
    changes: [
      'Save codes are much shorter: a full year of play is now about 7,000 to 10,000 characters instead of about 28,000.',
      'Your saves upgrade themselves the first time they load. Nothing changes in your Journal.',
      'Codes carry your most recent 50 Chronicle entries; the full Chronicle stays on this device.',
      'Old codes and export files still import. New codes start with GQC2 and need this version or newer.',
    ],
  },
  {
    version: '0.11.0',
    date: '2026-11-24',
    title: 'Save codes',
    changes: [
      'Export now gives you a save code: one line of text you can copy and paste somewhere safe, instead of a file. Use Copy code, or Save as text file for a very long one.',
      'Import has a box to paste a save code into. You can also choose a code file, and your older .json export files still work.',
      'A fresh campaign makes a code of about 1,000 characters; a full year of play is about 30,000.',
    ],
  },
  {
    version: '0.10.0',
    date: '2026-11-24',
    title: 'A new name: GerdQuest Calendar',
    changes: [
      'Questender is now called GerdQuest Calendar, with a new web address. Your saves, rewards and tokens come with you automatically.',
      'Old bookmarks to the previous address may stop working: update them to the new one.',
    ],
  },
  {
    version: '0.9.0',
    date: '2026-11-24',
    title: 'Rewards for showing up',
    changes: [
      'The Verdant Accord continues: chapters 5 to 8, from a burning city to a sea voyage, a forbidden island and a sacred peak.',
      'A new Shelf: each campaign gives its own keepsakes and looks (page edges, paper, dice) for the days you play it. Catch-up days count, and missing a day never takes anything away.',
      'Your token: earn a portrait token for every hero you play and themed borders from each campaign. Pick yours from the top right.',
      'Come back after a few days away and your hero starts well rested.',
      'Play on five days in a week to open the week’s chest.',
      'Nineteen achievements to find.',
      'Nothing here is for sale: every reward is earned by playing.',
    ],
  },
  {
    version: '0.8.0',
    date: '2026-11-24',
    title: 'Two new journeys and a front door',
    changes: [
      'New campaign: The Verdant Accord, a legacy campaign told in chapters, where what happens in one chapter opens or closes choices in the next.',
      'The Starwake now runs all year, with October, November and a finale on the longest night.',
      'GerdQuest Calendar has a home page that explains the game. If you already play, you go straight to your desk.',
      'Privacy and terms pages, in plain language. Short version: your progress stays on your device.',
      'Fairer heroes: the most fragile heroes in Brightwatch, Ember Road and Halcyon are tougher now, and the finales are a real fight.',
      'Brightwatch’s late markets have new upgrades worth saving for.',
    ],
  },
  {
    version: '0.7.0',
    date: '2026-11-24',
    title: 'Play at your own pace',
    changes: [
      'The › arrow now moves on as soon as the campaign you’re playing is done for the day. Other campaigns wait for you and show how many pages behind they are.',
      'Faster start: each campaign now downloads only when you open it.',
      'Your progress is safer: the game asks your browser to keep it, Settings shows whether it will, and a gentle reminder suggests an Export all backup now and then.',
      'Add GerdQuest Calendar to your home screen: it now has its own icon.',
      'Fights are fairer: enemies across all four campaigns were rebalanced after thousands of simulated playthroughs, especially early on.',
      'Followers now strengthen a skill your hero already has (+1) instead of doing nothing.',
      'Halcyon’s abilities now spend Surge and Charges, refilled when you rest.',
      'Easier-to-read text in the light theme.',
    ],
  },
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
      'Light mode! Pick it in Settings, or let GerdQuest Calendar follow your device.',
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
      'GerdQuest Calendar begins: a solo adventure played one page a day.',
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
