// Save format v2: the journal stored as compact references instead of copied text.
//
// In memory a GameState always holds plain text (journal lines are strings), so
// the UI and engine never see references. At the storage boundary (browser storage
// slots, export files, save codes) `toStored` replaces `journal` with `jrnl`,
// and `fromStored` turns it back into the exact same text. Every line is
// verified by decoding it again at encode time; a line that does not round trip
// is kept as a literal string, so v1 text === render(v2) always holds.
//
// A stored line is one of
//   "text"                 a literal (anything we could not abbreviate)
//   [ "r0.1" ]             content coordinate on the page the line belongs to:
//                          r<step>.<option>  option result, b<step>.<option>.<band> a
//                          check result (+ the roll total, absent for a natural 1),
//                          ci/cw/cl combat intro/win/lose, di/dw/dl dogfight ones
//   n  or  [ n, ...args ]  template n of the save's own table `t`, `#` filled from
//                          the numeric args and `$` from the name table `n`
// Engine-generated messages ("You lose 3 health.", "  Gull's Teeth Raider: missed;
// you take 2 damage.") are stored as number/name-abstracted templates in the save
// itself rather than in code: that covers every message the combat, vehicle and
// death modules build without a second catalogue to keep in step, and a save
// stays readable after the engine rewords a message. Authored text, by contrast,
// is not copied at all: it is looked up in the campaign pack.
//
// Drift: `jrnl.v` is the pack's content version stamp (see packVersion.ts). We do
// not store a per-reference text fingerprint (each is a random-looking byte per
// line, and measurements showed it would cost about a fifth of the saving). When
// the stamps differ, references are resolved best effort; a coordinate that no
// longer exists shows NEUTRAL_LINE instead of crashing.
import { campaign, contentVersion, pageDate } from './campaign'
import { contentNames } from './content'
import { COMPARTMENT_NAMES } from './vehicle'
import type { Day, GameState, JournalEntry } from './types'

export const SAVE_FORMAT = 2
export const NEUTRAL_LINE = '(entry from an earlier version)'

export type StoredLine = string | number | (string | number)[]
/** A page's lines; written as the bare line list unless the page index or date is not the derived one. */
export type StoredPage = StoredLine[] | StoredPageX
export interface StoredPageX {
  l: StoredLine[]
  /** Page index, only when it is not the entry's position in the list. */
  p?: number
  /** Real date, only when it differs from the one derived from the pack. */
  d?: string
}
export interface StoredJournal {
  /** Content version stamp of the pack the references were written against. */
  v: string
  /** Line templates (`#` number, `$` name). */
  t: string[]
  /** Names the templates refer to. */
  n: string[]
  p: StoredPage[]
}
export type StoredState = Omit<GameState, 'journal' | 'version'> & { version: 2; jrnl: StoredJournal }

export function isStored(raw: unknown): raw is StoredState {
  const s = raw as { version?: unknown; jrnl?: unknown } | null
  return !!s && s.version === 2 && !!s.jrnl && typeof s.jrnl === 'object'
}

// ---------------------------------------------------------------- authored text

const ROLLED = /^You rolled (\d+)\. /
const NAT1 = 'Natural 1 — automatic failure. '

interface Band {
  coord: string
  label: string
  text: string
}
interface Authored {
  exact: Map<string, string>
  bands: Band[]
}

const authoredCache = new WeakMap<Day, Authored>()

function authoredOf(day: Day): Authored {
  const hit = authoredCache.get(day)
  if (hit) return hit
  const exact = new Map<string, string>()
  const bands: Band[] = []
  const put = (text: unknown, coord: string) => {
    if (typeof text === 'string' && text && !exact.has(text)) exact.set(text, coord)
  }
  day.steps.forEach((step, si) =>
    step.options.forEach((opt, oi) => {
      put(opt.result, `r${si}.${oi}`)
      opt.bands?.forEach((b, bi) => bands.push({ coord: `b${si}.${oi}.${bi}`, label: opt.label, text: b.text }))
    }),
  )
  if (day.combat) {
    put(day.combat.intro, 'ci')
    put(day.combat.winText, 'cw')
    put(day.combat.loseText, 'cl')
  }
  if (day.dogfight) {
    put(day.dogfight.intro, 'di')
    put(day.dogfight.winText, 'dw')
    put(day.dogfight.loseText, 'dl')
  }
  const a = { exact, bands }
  authoredCache.set(day, a)
  return a
}

function authoredRef(day: Day, line: string): (string | number)[] | null {
  const a = authoredOf(day)
  const coord = a.exact.get(line)
  if (coord) return [coord]
  for (const b of a.bands) {
    const head = `${b.label}: `
    if (!line.startsWith(head)) continue
    const rest = line.slice(head.length)
    if (rest === NAT1 + b.text) return [b.coord]
    const m = ROLLED.exec(rest)
    if (m && rest.slice(m[0].length) === b.text) return [b.coord, Number(m[1])]
  }
  return null
}

function renderAuthored(day: Day | undefined, ref: (string | number)[]): string | undefined {
  const coord = ref[0] as string
  if (!day) return undefined
  const num = (s: string) => (/^\d+$/.test(s) ? Number(s) : -1)
  if (coord[0] === 'r' || coord[0] === 'b') {
    const [si, oi, bi] = coord.slice(1).split('.').map(num)
    const opt = day.steps[si]?.options[oi]
    if (!opt) return undefined
    if (coord[0] === 'r') return opt.result || undefined
    const band = opt.bands?.[bi]
    if (!band) return undefined
    const prefix = typeof ref[1] === 'number' ? `You rolled ${ref[1]}. ` : NAT1
    return `${opt.label}: ${prefix}${band.text}`
  }
  const fight = coord[0] === 'c' ? day.combat : coord[0] === 'd' ? day.dogfight : undefined
  const field = { i: 'intro', w: 'winText', l: 'loseText' }[coord[1] as 'i' | 'w' | 'l']
  return fight && field ? (fight as unknown as Record<string, string>)[field] || undefined : undefined
}

// ---------------------------------------------------------------- templates

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function nameRegex(): RegExp {
  const names = [...new Set([...contentNames(), ...Object.values(COMPARTMENT_NAMES)])].sort((a, b) => b.length - a.length)
  const alt = names.map(escapeRe).join('|')
  const word = String.raw`(?<![\p{L}\p{N}])(?:${alt})(?![\p{L}\p{N}])`
  return new RegExp(names.length ? `(${word})|(\\d+)` : '()(\\d+)', 'gu')
}

function fill(template: string, args: (string | number)[], names: string[]): string | undefined {
  let i = 0
  let bad = false
  const out = template.replace(/[#$]/g, (ch) => {
    const a = args[i++]
    if (typeof a !== 'number') return (bad = true), ''
    if (ch === '#') return String(a)
    const n = names[a]
    return n === undefined ? ((bad = true), '') : n
  })
  return bad || i !== args.length ? undefined : out
}

// ---------------------------------------------------------------- encode / decode

/** Journal entries to their stored form. Pure; needs the campaign loaded for references. */
export function encodeJournal(campaignId: string, startDate: string, journal: JournalEntry[]): StoredJournal {
  let pages: Day[] | undefined
  let version = ''
  try {
    pages = campaign(campaignId).pages
    version = contentVersion(campaignId)
  } catch {
    /* pack not loaded: everything is kept as literal text */
  }
  const re = nameRegex()
  const tpls: string[] = []
  const tplIndex = new Map<string, number>()
  const nameList: string[] = []
  const nameIndex = new Map<string, number>()

  // Pass 1: classify every line.
  type Cls = { kind: 'lit'; text: string } | { kind: 'ref'; ref: (string | number)[] } | { kind: 'tpl'; tpl: string; args: number[]; names: string[] }
  const counts = new Map<string, number>()
  const classes = journal.map((entry) =>
    entry.lines.map((line): Cls => {
      const ref = pages?.[entry.page] ? authoredRef(pages[entry.page], line) : null
      if (ref) return { kind: 'ref', ref }
      if (/[#$]/.test(line)) return { kind: 'lit', text: line }
      const args: number[] = []
      const used: string[] = []
      const tpl = line.replace(re, (_m, name?: string, num?: string) => {
        if (name) {
          used.push(name)
          args.push(-1)
          return '$'
        }
        args.push(Number(num))
        return '#'
      })
      counts.set(tpl, (counts.get(tpl) ?? 0) + 1)
      return { kind: 'tpl', tpl, args, names: used }
    }),
  )

  const p: StoredPage[] = journal.map((entry, i) => {
    const lines = classes[i].map((c, k): StoredLine => {
      const text = entry.lines[k]
      if (c.kind === 'ref') return renderAuthored(pages?.[entry.page], c.ref) === text ? c.ref : text
      if (c.kind === 'lit') return text
      if (!c.args.length && (counts.get(c.tpl) ?? 0) < 2) return text
      let t = tplIndex.get(c.tpl)
      if (t === undefined) tplIndex.set(c.tpl, (t = tpls.push(c.tpl) - 1))
      let ni = 0
      const args = c.args.map((a) => {
        if (a >= 0) return a
        const name = c.names[ni++]
        let n = nameIndex.get(name)
        if (n === undefined) nameIndex.set(name, (n = nameList.push(name) - 1))
        return n
      })
      const stored: StoredLine = args.length ? [t, ...args] : t
      // Verify: anything that would not decode to the same text stays literal.
      return fill(tpls[t], args, nameList) === text ? stored : text
    })
    const out: StoredPageX = { l: lines }
    if (entry.page !== i) out.p = entry.page
    let derived: string | undefined
    try {
      derived = pages ? pageDate(campaign(campaignId), entry.page, startDate) : undefined
    } catch {
      derived = undefined
    }
    if (entry.date !== derived) out.d = entry.date
    return out.p === undefined && out.d === undefined ? out.l : out
  })
  // Final guard: the whole journal must decode to the text it came from.
  const stored: StoredJournal = { v: version, t: tpls, n: nameList, p }
  const back = decodeJournal(stored, campaignId, startDate)
  return back.every((e, i) => e.page === journal[i].page && e.date === journal[i].date && e.lines.length === journal[i].lines.length && e.lines.every((l, k) => l === journal[i].lines[k]))
    ? stored
    : { v: version, t: [], n: [], p: journal.map((e): StoredPage => ({ l: e.lines, p: e.page, d: e.date })) }
}

/** Stored journal back to text. Never throws: unresolvable references show NEUTRAL_LINE. */
export function decodeJournal(j: StoredJournal, campaignId: string, startDate: string): JournalEntry[] {
  let camp: ReturnType<typeof campaign> | undefined
  try {
    camp = campaign(campaignId)
  } catch {
    camp = undefined
  }
  const t = Array.isArray(j.t) ? j.t : []
  const n = Array.isArray(j.n) ? j.n : []
  return (Array.isArray(j.p) ? j.p : []).map((stored, i) => {
    const entry: StoredPageX = Array.isArray(stored) ? { l: stored } : (stored ?? { l: [] })
    const page = typeof entry.p === 'number' ? entry.p : i
    let date = entry.d
    if (!date) {
      try {
        date = camp ? pageDate(camp, page, startDate) : ''
      } catch {
        date = ''
      }
    }
    const lines = (Array.isArray(entry.l) ? entry.l : []).map((line): string => {
      if (typeof line === 'string') return line
      try {
        if (typeof line === 'number') return t[line] !== undefined ? (fill(t[line], [], n) ?? NEUTRAL_LINE) : NEUTRAL_LINE
        if (Array.isArray(line) && typeof line[0] === 'number') return t[line[0]] !== undefined ? (fill(t[line[0]], line.slice(1), n) ?? NEUTRAL_LINE) : NEUTRAL_LINE
        if (Array.isArray(line) && typeof line[0] === 'string') return renderAuthored(camp?.pages[page], line) ?? NEUTRAL_LINE
      } catch {
        /* fall through */
      }
      return NEUTRAL_LINE
    })
    return { page, date: date ?? '', lines }
  })
}

/** A game state in its stored (v2) form. */
export function toStored(s: GameState): StoredState {
  const { journal, ...rest } = s
  return { ...rest, version: SAVE_FORMAT, jrnl: encodeJournal(s.campaignId, s.startDate, journal ?? []) }
}

/** Stored v2 form back to an in-memory state (journal as text). Does not touch v1 states. */
export function fromStored(raw: StoredState): GameState {
  const { jrnl, ...rest } = raw
  return { ...rest, version: SAVE_FORMAT, journal: decodeJournal(jrnl, raw.campaignId, raw.startDate) } as GameState
}

/** True when a stored save was written against different campaign content than is loaded now. */
export function journalDrifted(raw: StoredState): boolean {
  return raw.jrnl.v !== contentVersion(raw.campaignId)
}
