// Compact page-writing helpers for the Ember Road year, plus the dater that
// turns month-by-month drafts into dated pages.
//
// Drafts carry no dates: `datePages` walks the real 2022 calendar from a
// start date, gives each draft the next date, and makes Saturday pages cover
// Saturday + Sunday. It throws (so every test fails loudly) if a draft lands
// in the wrong month, or a weekend draft (`wk`) misses a Saturday.
import { addDays, parseISO, weekday } from '../../../../engine/calendar'
import type { Band, Day, Effect, Option, Scene, Step, Trait } from '../../../../engine/types'

export type Draft = Omit<Day, 'id' | 'month' | 'day' | 'span'> & { wk?: boolean }

/** Text, or text plus effects. */
export type Outcome = string | [string, Effect[]]

const band = (o: Outcome, range: { min?: number; max?: number }): Band =>
  typeof o === 'string' ? { ...range, text: o } : { ...range, text: o[0], effects: o[1] }

// ---------- effects ----------
export const dmg = (amount: number): Effect => ({ type: 'damage', amount })
export const heal = (amount: number): Effect => ({ type: 'heal', amount })
export const gold = (amount: number): Effect => ({ type: 'glint', amount })
export const virtue = (amount: number): Effect => ({ type: 'virtue', amount })
export const item = (id: string, qty = 1): Effect => ({ type: 'item', id, qty })
export const buff = (stat: Extract<Effect, { type: 'pageBonus' }>['stat'], amount: number): Effect => ({ type: 'pageBonus', stat, amount })
export const travel = (rations: number): Effect => ({ type: 'travel', rations })
export const curse: Effect = { type: 'condition', cursed: true }
export const poison: Effect = { type: 'condition', poisoned: true }
export const levelUp: Effect = { type: 'levelUp' }

// ---------- options & steps ----------
/** A d20 + trait check with two outcomes: below `dc` fails. */
export function check(label: string, trait: Trait, tags: string[] | undefined, fail: Outcome, pass: Outcome, dc = 11): Option {
  return { label, check: { trait, tags }, bands: [band(fail, { max: dc - 1 }), band(pass, { min: dc })] }
}

/** A check with three outcomes: below `dc` fails, `great`+ excels. */
export function check3(label: string, trait: Trait, tags: string[] | undefined, fail: Outcome, pass: Outcome, best: Outcome, dc = 10, great = 15): Option {
  return {
    label,
    check: { trait, tags },
    bands: [band(fail, { max: dc - 1 }), band(pass, { min: dc, max: great - 1 }), band(best, { min: great })],
  }
}

/** An option with no roll. */
export const plain = (label: string, result: string, effects?: Effect[]): Option => ({ label, result, effects })

/** A step you must do. */
export const task = (title: string | undefined, option: Option): Step => ({ title, options: [option] })

/** A step where you pick one option (labels get A), B), … ). */
export function pick(title: string | undefined, ...options: Option[]): Step {
  return { title, options: options.map((o, i) => ({ ...o, label: `${'ABCDEF'[i]}) ${o.label}` })) }
}

// ---------- pages ----------
type Extra = Partial<Omit<Draft, 'title' | 'scene' | 'text'>>

export const page = (title: string, scene: Scene, text: string, steps: Step[], extra: Extra = {}): Draft => ({ title, scene, text, steps, ...extra })

/** A combat page. Steps (if any) come first. */
export function fight(
  title: string,
  scene: Scene,
  text: string,
  enemies: string[],
  rounds: number,
  intro: string,
  win: Outcome,
  lose: Outcome,
  extra: Extra = {},
): Draft {
  const [winText, winFx] = typeof win === 'string' ? [win, undefined] : win
  const [loseText, loseFx] = typeof lose === 'string' ? [lose, [dmg(1)]] : lose
  return { title, scene, text, steps: [], ...extra, combat: { enemies, rounds, intro, winText, loseText, win: winFx, lose: loseFx } }
}

/** A solo boss fight (Stun rule: it can only fall in the final round). */
export const boss = (title: string, scene: Scene, text: string, enemy: string, rounds: number, intro: string, win: Outcome, lose: Outcome, extra: Extra = {}): Draft =>
  fight(title, scene, text, [enemy], rounds, intro, win, lose, {
    note: 'A single foe: it can only be destroyed in the final round. A strong hit before then Stuns it, so it can’t hurt you that round.',
    ...extra,
  })

/** A weekend haven: a Rest, usually a market, sometimes followers or a level-up. */
export function haven(
  title: string,
  scene: Scene,
  text: string,
  opts: { shop?: { id: string; price: number }[]; hires?: string[]; steps?: Step[]; level?: string; icons?: Draft['icons']; note?: string } = {},
): Draft {
  const steps = [...(opts.steps ?? [])]
  if (opts.level) steps.push(task('Take stock', plain('Look back on how far you’ve come', opts.level, [levelUp])))
  return {
    title,
    scene,
    text,
    steps,
    rest: true,
    wk: true,
    note: opts.note ?? (opts.level ? 'Rest, level up, and resupply.' : 'Rest and resupply.'),
    ...(opts.shop || opts.hires ? { shop: { items: opts.shop ?? [], hires: opts.hires } } : {}),
    ...(opts.icons ? { icons: opts.icons } : {}),
  }
}

/** Mark any draft as the weekend (Sat/Sun) page. */
export const weekend = (d: Draft): Draft => ({ ...d, wk: true })

// ---------- dating ----------
const LAST_DAY = '2022-12-31'

/**
 * Give each draft its date. Pages run day by day from `start`; a Saturday page
 * covers Saturday + Sunday (except the year's final Saturday, Dec 31).
 * (Tests check that the pages reach Dec 31.)
 */
export function datePages(start: string, months: [number, Draft[]][], firstId: number): Day[] {
  const out: Day[] = []
  let d = start
  let n = firstId
  for (const [month, drafts] of months) {
    for (const draft of drafts) {
      const { year, month: m, day } = parseISO(d)
      const sat = weekday(d) === 6
      if (year !== 2022 || m !== month) throw new Error(`Ember Road: "${draft.title}" lands on ${d}, not in month ${month}`)
      if (sat !== !!draft.wk) throw new Error(`Ember Road: "${draft.title}" lands on ${d}; weekend pages must fall on Saturdays and only there`)
      const span = sat && d !== LAST_DAY ? 2 : 1
      const { wk: _wk, ...rest } = draft
      void _wk
      out.push({ ...rest, id: `er-${n++}`, month: m, day, ...(span === 2 ? { span } : {}) })
      d = addDays(d, span)
    }
  }
  return out
}
