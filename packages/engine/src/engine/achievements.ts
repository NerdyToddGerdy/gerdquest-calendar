// The achievements shelf. Each check is a pure function of the desk's
// campaign states plus the progress record and today's date; the web app runs
// them after every action and records what is newly earned. Hints never say
// anything about future story or page titles.
import { campaign } from './campaign'
import { pagesOwed } from './desk'
import { FEAT_BOSS_CRIT, FEAT_NAT1_WON, hasFeat } from './feats'
import type { Progress } from './progress'
import { keepsakesEarned, rewardTheme } from './rewards'
import { playedDates } from './state'
import type { GameState } from './types'
import type { ISODate } from './calendar'

export interface AchievementContext {
  states: GameState[]
  progress: Progress
  today: ISODate
}

export interface AchievementDef {
  id: string
  name: string
  /** Shown while unearned. */
  hint: string
  /** Shown once earned. */
  text: string
  check: (c: AchievementContext) => boolean
}

const anyRun = (c: AchievementContext, f: (s: GameState) => boolean) => c.states.some(f)

/** Pages this run has completed, as indexes (the page in play counts once it's complete). */
function completedPages(s: GameState): Set<number> {
  const pages = new Set(s.journal.map((j) => j.page))
  const dates = playedDates(s)
  if (dates.length > pages.size && !s.finished) pages.add(s.dayIndex)
  return pages
}

export const QUIET_RUN = 7

/** Seven pages in a row, none with a fight on it. */
export function hasQuietStretch(s: GameState): boolean {
  const done = completedPages(s)
  const c = campaign(s.campaignId)
  let run = 0
  for (let i = 0; i < c.pages.length; i++) {
    run = done.has(i) && !c.pages[i].combat ? run + 1 : 0
    if (run >= QUIET_RUN) return true
  }
  return false
}

/** Both outcomes of one Verdant chapter seen, in any runs. */
export function seenBothRoads(marks: string[]): boolean {
  const chapters = new Set(marks.flatMap((m) => /^va_l(\d+)_(win|loss)$/.exec(m)?.[1] ?? []))
  return [...chapters].some((n) => marks.includes(`va_l${n}_win`) && marks.includes(`va_l${n}_loss`))
}

const FINISHES: [string, string, string, string][] = [
  ['brightwatch', 'The Lamp at Brightwatch', 'The lamp stayed lit', 'You saw the Lamp at Brightwatch through to its last page.'],
  ['emberroad', 'The Ember Road', 'Kept the embers', 'You walked the Ember Road to its end.'],
  ['halcyon', 'The Halcyon Debt', 'Paid in full', 'The Halcyon Debt is closed.'],
  ['starwake', 'The Starwake', 'Followed the wake', 'You sailed the Starwake to its last page.'],
  ['verdant', 'The Verdant Accord', 'Green to the end', 'You finished every page of the Verdant Accord.'],
  ['santa', 'Saving Santa', 'Santa saved', 'Christmas morning came, and the bells rang all over the North.'],
]

/** Virtue a Saving Santa run needs at the end to make the Nice List. */
export const NICE_LIST_VIRTUE = 6

/** Every date from December 1 to 25 of the year this run began in. */
function adventDates(s: GameState): ISODate[] {
  const year = Number(s.startDate.slice(0, 4))
  return Array.from({ length: 25 }, (_, i) => `${year}-12-${String(i + 1).padStart(2, '0')}`)
}

/** A finished Saving Santa run whose every door was opened on its own day (no catching up). */
export function everyDoorOnItsDay(s: GameState, days: ISODate[]): boolean {
  if (s.campaignId !== 'santa' || !s.finished) return false
  const played = new Set(days)
  return adventDates(s).every((d) => played.has(d))
}

/** Saving Santa runs begun in at least two different Decembers. */
export function adventYears(states: GameState[]): number {
  return new Set(states.filter((s) => s.campaignId === 'santa').map((s) => s.startDate.slice(0, 4))).size
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-light', name: 'First light', hint: 'Finish a page.', text: 'Your first page is done. The calendar has begun to fill.', check: (c) => c.progress.days.length >= 1 },
  { id: 'week-of-pages', name: 'A week of pages', hint: 'Play on seven different days.', text: 'Seven different days at the desk. They needn’t have been in a row.', check: (c) => c.progress.days.length >= 7 },
  { id: 'juggler', name: 'Juggler', hint: 'Keep three campaigns on one desk.', text: 'Three stories going at once, and none of them dropped.', check: (c) => c.states.length >= 3 },
  {
    id: 'all-caught-up',
    name: 'All caught up',
    hint: 'Play on seven days and leave no campaign behind.',
    text: 'Every campaign is up to date. Nothing is waiting on you.',
    check: (c) => c.progress.days.length >= 7 && c.states.length > 0 && c.states.every((s) => pagesOwed(s, c.today) === 0),
  },
  { id: 'fortunes-favourite', name: 'Fortune’s favourite', hint: 'Land a natural 20 with a boss’s final blow.', text: 'A natural 20 on the last blow of a great fight. Luck has noticed you.', check: (c) => anyRun(c, (s) => hasFeat(s, FEAT_BOSS_CRIT)) },
  { id: 'snake-eyes-survivor', name: 'Snake eyes survivor', hint: 'Roll a natural 1 in a fight and still win it.', text: 'The dice turned on you mid-fight, and you won anyway.', check: (c) => anyRun(c, (s) => hasFeat(s, FEAT_NAT1_WON)) },
  { id: 'lottery-fool', name: 'Lottery fool', hint: 'Lose the Sunday lottery five times.', text: 'Five lost tickets. You keep buying them, and that is its own kind of luck.', check: (c) => c.states.reduce((n, s) => n + (s.lotteryLosses ?? 0), 0) >= 5 },
  { id: 'hoarder', name: 'Hoarder', hint: 'Hold 200 of a campaign’s currency at once.', text: 'A purse so heavy it clinks when you breathe.', check: (c) => anyRun(c, (s) => (s.hero?.glint ?? 0) >= 200) },
  { id: 'quiet-stretch', name: 'A quiet stretch', hint: 'Finish seven pages in a row without a fight.', text: 'Seven pages, and not one blade drawn.', check: (c) => anyRun(c, hasQuietStretch) },
  { id: 'both-roads', name: 'Both roads', hint: 'In the Verdant Accord, see both outcomes of one chapter across different runs.', text: 'You have walked both roads of one chapter now, and know what each costs.', check: (c) => seenBothRoads(c.progress.marks) },
  {
    id: 'keepsake-keeper',
    name: 'Keepsake keeper',
    hint: 'Earn every keepsake in one campaign.',
    text: 'The whole shelf is full for one campaign.',
    check: (c) => anyRun(c, (s) => { const n = rewardTheme(s.campaignId).keepsakes.length; return n > 0 && keepsakesEarned(s.campaignId, playedDates(s).length).length === n }),
  },
  { id: 'completionist', name: 'Completionist', hint: 'Finish any campaign.', text: 'You reached the last page of a campaign.', check: (c) => anyRun(c, (s) => s.finished) },
  { id: 'homecoming', name: 'Homecoming', hint: 'Come back after a few days away.', text: 'You were away a while, and the pages kept your place.', check: (c) => anyRun(c, (s) => !!s.welcomedOn) },
  { id: 'first-chest', name: 'First chest', hint: 'Play on five days in one week and open the chest.', text: 'A week of showing up, and a small reward for it.', check: (c) => c.progress.chests.length >= 1 },
  {
    id: 'every-door',
    name: 'Every door on its day',
    hint: 'In Saving Santa, open each of the 25 doors on its own day.',
    text: 'Twenty-five mornings in a row, one door each. Not one opened early, not one left for later.',
    check: (c) => anyRun(c, (s) => everyDoorOnItsDay(s, c.progress.days)),
  },
  {
    id: 'nice-list',
    name: 'On the Nice List',
    hint: `Reach Christmas morning in Saving Santa with ${NICE_LIST_VIRTUE} or more virtue.`,
    text: 'Somewhere in the North, a name has been written down twice, in silver ink, and underlined.',
    check: (c) => anyRun(c, (s) => s.campaignId === 'santa' && s.finished && (s.hero?.virtue ?? 0) >= NICE_LIST_VIRTUE),
  },
  {
    id: 'back-next-year',
    name: 'Back next December',
    hint: 'Play Saving Santa in two different Decembers.',
    text: 'The doors opened again this year, and so did you.',
    check: (c) => adventYears(c.states) >= 2,
  },
  ...FINISHES.map(([id, title, name, text]): AchievementDef => ({
    id: `finish-${id}`,
    name,
    hint: `Finish ${title}.`,
    text,
    check: (c) => anyRun(c, (s) => s.campaignId === id && s.finished),
  })),
]

/** Ids of achievements whose condition holds now and that the record doesn't have yet. */
export function newlyEarned(c: AchievementContext): string[] {
  const have = new Set(c.progress.achievements.map((a) => a.id))
  return ACHIEVEMENTS.filter((a) => !have.has(a.id) && a.check(c)).map((a) => a.id)
}

export function achievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}
