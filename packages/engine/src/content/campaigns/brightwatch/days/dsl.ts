// Compact authoring helpers for Brightwatch's year pages.
//
// Pages are written without dates; `week()` stamps Mon–Fri plus a Sat/Sun
// weekend page (span 2) onto them from the Monday's date, so a month file is
// just a list of weeks.
import { addDays, parseISO } from '../../../../engine/calendar'
import type { Band, Day, Effect, HiddenIcon, Option, Scene, StatKey, Step, Trait } from '../../../../engine/types'

/** A page before its date is stamped on. */
export type PageSpec = Omit<Day, 'month' | 'day' | 'span'>

const stamp = (p: PageSpec, iso: string, span?: number): Day => {
  const { month, day } = parseISO(iso)
  return span ? { ...p, month, day, span } : { ...p, month, day }
}

/** Six pages: Monday … Friday, then the Saturday/Sunday weekend page. `monday` is '2024-MM-DD'. */
export function week(monday: string, pages: PageSpec[]): Day[] {
  if (pages.length !== 6) throw new Error(`week ${monday} needs 6 pages, got ${pages.length}`)
  return pages.map((p, i) => (i < 5 ? stamp(p, addDays(monday, i)) : stamp(p, addDays(monday, 5), 2)))
}

/** Consecutive single-day pages from `first` (used for the year's last few days). */
export function days(first: string, pages: PageSpec[]): Day[] {
  return pages.map((p, i) => stamp(p, addDays(first, i)))
}

// ---------- effects ----------

export const dmg = (amount: number): Effect => ({ type: 'damage', amount })
export const heal = (amount: number): Effect => ({ type: 'heal', amount })
export const gl = (amount: number): Effect => ({ type: 'glint', amount })
export const vir = (amount: number): Effect => ({ type: 'virtue', amount })
export const itm = (id: string, qty = 1): Effect => ({ type: 'item', id, qty })
export const buff = (stat: StatKey, amount: number): Effect => ({ type: 'pageBonus', stat, amount })
export const travel = (rations: number): Effect => ({ type: 'travel', rations })
export const poison: Effect = { type: 'condition', poisoned: true }
export const curse: Effect = { type: 'condition', cursed: true }
export const LEVEL: Effect = { type: 'levelUp' }
export const BOON: Effect = { type: 'boon' }

// ---------- options & steps ----------

/** An outcome: plain text, or [text, ...effects]. */
export type Outcome = string | [string, ...Effect[]]
const band = (o: Outcome, range: Pick<Band, 'min' | 'max'>): Band =>
  typeof o === 'string' ? { ...range, text: o } : { ...range, text: o[0], effects: o.slice(1) as Effect[] }

/**
 * A d20 check. Below `dc` → `fail`; `dc`+ → `pass`; optional `great` from `greatAt`.
 */
export function chk(label: string, trait: Trait, tags: string[], dc: number, fail: Outcome, pass: Outcome, great?: [number, Outcome]): Option {
  const bands: Band[] = [band(fail, { max: dc - 1 })]
  if (great) {
    bands.push(band(pass, { min: dc, max: great[0] - 1 }), band(great[1], { min: great[0] }))
  } else {
    bands.push(band(pass, { min: dc }))
  }
  return { label, check: { trait, tags }, bands }
}

/** An option without a roll. */
export function act(label: string, result: string, ...effects: Effect[]): Option {
  return effects.length ? { label, result, effects } : { label, result }
}

/** A step: one option = do it; several = pick one. */
export function step(title: string | undefined, ...options: Option[]): Step {
  return title ? { title, options } : { options }
}

// ---------- combat ----------

export function fight(
  enemies: string[],
  rounds: number,
  intro: string,
  winText: string,
  loseText: string,
  win: Effect[] = [],
  lose: Effect[] = [],
): NonNullable<Day['combat']> {
  return { enemies, rounds, intro, winText, loseText, win, lose }
}

// ---------- page builders ----------

interface Extra {
  note?: string
  combat?: Day['combat']
  shop?: Day['shop']
  rest?: boolean
  icons?: HiddenIcon[]
  anyOrder?: boolean
}

export function pg(id: string, title: string, scene: Scene, text: string, steps: Step[], extra: Extra = {}): PageSpec {
  return { id, title, scene, text, steps, ...extra }
}

/** A combat page: optional lead-in steps, then the fight. */
export function battle(id: string, title: string, scene: Scene, text: string, combat: NonNullable<Day['combat']>, steps: Step[] = [], extra: Extra = {}): PageSpec {
  return { id, title, scene, text, steps, combat, note: extra.note ?? `Fight for up to ${combat.rounds} rounds.`, ...extra }
}

/** A weekend page with a Rest and a market (the Sunday lottery comes from the rules). */
export function weekend(
  id: string,
  title: string,
  scene: Scene,
  text: string,
  steps: Step[],
  market: { id: string; price: number }[],
  extra: Omit<Extra, 'shop'> & { hires?: string[] } = {},
): PageSpec {
  const { hires, ...rest } = extra
  return { id, title, scene, text, steps, rest: true, ...rest, shop: hires ? { items: market, hires } : { items: market } }
}

export const loot = (x: number, y: number): HiddenIcon => ({ kind: 'loot', x, y })
export const purse = (x: number, y: number): HiddenIcon => ({ kind: 'pickpocket', x, y })
