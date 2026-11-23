// Small builders that keep the year's ~290 pages readable.
import { addDays, parseISO, toISO } from '../../../engine/calendar'
import type { Band, Day, Effect, Option, Scene, Step, Trait } from '../../../engine/types'

export type PageSpec = Omit<Day, 'month' | 'day' | 'span'>
type Six = [PageSpec, PageSpec, PageSpec, PageSpec, PageSpec, PageSpec]

/**
 * One calendar week of 2023: Monday–Friday pages plus a Saturday/Sunday page.
 * `month`/`day` is the Monday; every page's date is computed from it.
 */
export function week(month: number, day: number, pages: Six): Day[] {
  const monday = toISO(2023, month, day)
  return pages.map((p, i) => {
    const d = parseISO(addDays(monday, i))
    return { ...p, month: d.month, day: d.day, ...(i === 5 ? { span: 2 } : {}) }
  })
}

// ---------- Effects ----------
export const dmg = (amount: number): Effect => ({ type: 'damage', amount })
export const heal = (amount: number): Effect => ({ type: 'heal', amount })
export const cr = (amount: number): Effect => ({ type: 'glint', amount })
export const virtue = (amount: number): Effect => ({ type: 'virtue', amount })
export const give = (id: string, qty?: number): Effect => ({ type: 'item', id, ...(qty ? { qty } : {}) })
export const parts = (n: number): Effect => ({ type: 'ship', parts: n })
export const repair = (n: number): Effect => ({ type: 'ship', repair: n })
export const travel = (rations = 1): Effect => ({ type: 'travel', rations })
export const levelUp: Effect = { type: 'levelUp' }
export const boon: Effect = { type: 'boon' }
export const infected: Effect = { type: 'condition', poisoned: true }
export const malfunction: Effect = { type: 'condition', cursed: true }
export const cured: Effect = { type: 'condition', poisoned: false, cursed: false }
export const bonus = (stat: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha' | 'atk' | 'def' | 'dmg' | 'roll', amount: number): Effect => ({
  type: 'pageBonus',
  stat,
  amount,
})

// ---------- Options & steps ----------
type Outcome = string | [string, ...Effect[]]
const band = (o: Outcome, range: Pick<Band, 'min' | 'max'>): Band =>
  typeof o === 'string' ? { ...range, text: o } : { ...range, text: o[0], effects: o.slice(1) as Effect[] }

/** A two-band check: below `dc` fails, `dc` or more succeeds. */
export function chk(label: string, trait: Trait, tags: string[], fail: Outcome, pass: Outcome, dc = 11): Option {
  return { label, check: { trait, tags }, bands: [band(fail, { max: dc - 1 }), band(pass, { min: dc })] }
}

/** A three-band check: below `dc` fails, `dc`…`dc+4` is partial, `dc+5`+ is a great success. */
export function chk3(label: string, trait: Trait, tags: string[], fail: Outcome, mid: Outcome, great: Outcome, dc = 11): Option {
  return {
    label,
    check: { trait, tags },
    bands: [band(fail, { max: dc - 1 }), band(mid, { min: dc, max: dc + 4 }), band(great, { min: dc + 5 })],
  }
}

/** An option with no roll. */
export function act(label: string, result: string, ...effects: Effect[]): Option {
  return { label, result, ...(effects.length ? { effects } : {}) }
}

export const step = (title: string | undefined, ...options: Option[]): Step => ({ ...(title ? { title } : {}), options })

// ---------- Pages ----------
export function page(id: string, title: string, scene: Scene, text: string, steps: Step[], extra: Partial<PageSpec> = {}): PageSpec {
  return { id, title, scene, text, steps, ...extra }
}

interface FightSpec {
  enemies: string[]
  rounds: number
  intro: string
  winText: string
  loseText: string
  win?: Effect[]
  lose?: Effect[]
}

/** A ground fight (optionally after some steps). */
export function fight(id: string, title: string, scene: Scene, text: string, f: FightSpec, steps: Step[] = [], extra: Partial<PageSpec> = {}): PageSpec {
  return {
    id,
    title,
    scene,
    text,
    note: `Fight for up to ${f.rounds} rounds.`,
    steps,
    combat: { ...f, win: f.win ?? [], lose: f.lose ?? [] },
    ...extra,
  }
}

interface DogfightSpec {
  craft: string[]
  rounds: number
  intro: string
  winText: string
  loseText: string
  win?: Effect[]
  lose?: Effect[]
}

/** A ship-to-ship fight (optionally after some steps). */
export function dogfight(id: string, title: string, text: string, f: DogfightSpec, steps: Step[] = [], extra: Partial<PageSpec> = {}): PageSpec {
  return {
    id,
    title,
    scene: 'space',
    text,
    note: `Dogfight for up to ${f.rounds} volleys.`,
    steps,
    dogfight: { ...f, win: f.win ?? [], lose: f.lose ?? [] },
    ...extra,
  }
}

/** A weekend Rest stop, with optional shop/dock and an optional story step. */
export function haven(id: string, title: string, scene: Scene, text: string, extra: Partial<PageSpec> = {}): PageSpec {
  return {
    id,
    title,
    scene,
    text,
    note: extra.note ?? 'Rest and resupply. The weekly lottery is open.',
    rest: true,
    steps: extra.steps ?? [step(undefined, act('Stand down for the weekend', 'The crew sleeps in shifts. Nobody shoots at anybody.'))],
    ...extra,
  }
}
