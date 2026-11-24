// Page-writing helpers for The Verdant Accord. The compact helpers are shared
// with the Ember Road; this file adds the Verdant Accord's dater and a helper
// for legacy marks.
//
// Drafts carry no dates: `datePages` walks the real 2022 calendar from Jan 1,
// gives each draft the next date, and makes Saturday pages cover Saturday +
// Sunday. It throws (so every test fails loudly) if a draft lands in the
// wrong month, or a weekend draft (`wk`) misses a Saturday.
import { addDays, parseISO, weekday } from '../../../../engine/calendar'
import type { Day, Effect, Option, Scene, Trait } from '../../../../engine/types'
import { buff, check, check3, dmg, fight, gold, page, task, type Draft, type Outcome } from '../../emberroad/days/build'

export { boss, buff, check, check3, curse, dmg, fight, gold, haven, heal, item, levelUp, page, pick, plain, poison, task, travel, virtue, weekend } from '../../emberroad/days/build'
export type { Draft, Outcome } from '../../emberroad/days/build'

export const YEAR = 2022

/** One beat of a crisis page: label, trait, tags, the failure text and the success text. */
export type Beat = [label: string, trait: Trait, tags: string[], fail: string, pass: string]

export interface Crisis {
  title: string
  scene: Scene
  /** Where it is happening. */
  place: string
  /** What has gone wrong. */
  crisis: string
  /** What stands in the way. */
  threat: string
  beats: [Beat, Beat]
  /** What the hero gets for seeing it through (text and effects). */
  reward: [string, Effect[]]
  /** The complication on a big failure (default: take 2 damage). */
  bad?: Effect[]
}

/**
 * A civic-crisis or mountain-complication page, built from place + crisis +
 * threat + reward: two checks, the first to get in and the second to see it
 * through. Failing either by a lot is a complication; the second check's best
 * result earns the reward.
 */
export function crisis(c: Crisis): Draft {
  const bad = c.bad ?? [dmg(2)]
  const [a, b] = c.beats
  return page(c.title, c.scene, `${c.place} ${c.crisis} ${c.threat}`, [
    task('1. Get to it', check(a[0], a[1], a[2], [a[3], bad], [a[4], [buff('roll', 1)]])),
    task('2. See it through', check3(b[0], b[1], b[2], [b[3], bad], b[4], [`${b[4]} ${c.reward[0]}`, c.reward[1]])),
  ])
}

/** A sailing check for the whole crew: group success; a bad roll costs time, damage, or a hand overboard. */
export function sailing(weather: string, trait: Trait, tags: string[], fail: Outcome, pass: Outcome = 'The crew works as one. The Mudlark holds her line.', best: Outcome = ['The crew sails her as if she were born to it, and the wind does the rest.', [gold(2)]]) {
  return task(`Sailing: ${weather}`, check3('Whole crew: keep the Mudlark on her course', trait, tags, fail, pass, best))
}


/** Record a legacy mark. */
export const legacy = (id: string): Effect => ({ type: 'legacy', id })

/** Gate an option on a legacy mark ("va_l1_win", or "!va_l1_win" for its absence). */
export const needs = (requires: string, option: Option): Option => ({ ...option, requires })

export function datePages(start: string, months: [number, Draft[]][]): Day[] {
  const out: Day[] = []
  let d = start
  let n = 1
  for (const [month, drafts] of months) {
    for (const draft of drafts) {
      const { year, month: m, day } = parseISO(d)
      const sat = weekday(d) === 6
      if (year !== YEAR || m !== month) throw new Error(`Verdant Accord: "${draft.title}" lands on ${d}, not in month ${month}`)
      if (sat !== !!draft.wk) throw new Error(`Verdant Accord: "${draft.title}" lands on ${d}; weekend pages must fall on Saturdays and only there`)
      const { wk: _wk, ...rest } = draft
      void _wk
      out.push({ ...rest, id: `va-${n++}`, month: m, day, ...(sat ? { span: 2 } : {}) })
      d = addDays(d, sat ? 2 : 1)
    }
  }
  return out
}

/** A chapter's multi-foe finale. Unlike a solo boss it has no Stun rule: every foe fights every round. */
export const bossFight = (title: string, scene: Scene, text: string, enemies: string[], rounds: number, intro: string, win: Outcome, lose: Outcome, extra: Partial<Omit<Draft, 'title' | 'scene' | 'text'>> = {}): Draft =>
  fight(title, scene, text, enemies, rounds, intro, win, lose, { note: 'A boss fight: every foe attacks every round. This fight decides the chapter’s legacy.', ...extra })
