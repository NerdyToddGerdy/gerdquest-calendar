// Plays whole campaigns with the policy bot and records what happened.
import { authoredDate, campaign } from '../engine/campaign'
import { campaignHeroes, enemy, item } from '../engine/content'
import { currentDay, initialState, reduce } from '../engine/state'
import type { Action } from '../engine/state'
import { craftDef } from '../engine/vehicle'
import { maxHp } from '../engine/hero'
import type { GameState } from '../engine/types'
import { playPage } from './policy'

export interface MonthSnap {
  month: number
  level: number
  glint: number
  hp: number
  maxHp: number
  healItems: number
}

export interface Death {
  page: number
  month: number
  cause: string
}

export interface RunRecord {
  campaignId: string
  seed: number
  heroId: string
  finished: boolean
  stuckAt: number | null
  pages: number
  deaths: Death[]
  months: MonthSnap[]
}

export interface PageInfo {
  id: string
  title: string
  month: number
  enemies: string[]
}

/** Pages before this index count as the prologue. */
export function prologuePages(campaignId: string): number {
  return campaign(campaignId).prologuePages ?? 7
}

export function pageMonths(campaignId: string): number[] {
  const c = campaign(campaignId)
  return c.pages.map((_, i) => Number(authoredDate(c, i).slice(5, 7)))
}

export function pageInfo(campaignId: string): PageInfo[] {
  const months = pageMonths(campaignId)
  return campaign(campaignId).pages.map((p, i) => ({
    id: p.id,
    title: p.title,
    month: months[i],
    enemies: [...(p.combat?.enemies ?? []).map((e) => enemy(e).name), ...(p.dogfight?.craft ?? []).map((c) => craftDef(c).name)],
  }))
}

const FAR_FUTURE = '2999-01-01'

export function simulate(campaignId: string, seed: number): RunRecord {
  const c = campaign(campaignId)
  const months = pageMonths(campaignId)
  const heroes = campaignHeroes(c)
  const startHero = c.startHero ?? heroes[seed % heroes.length].id
  let st: GameState = reduce(initialState(seed), { type: 'NEW_GAME', seed, campaignId, heroId: startHero })
  const rec: RunRecord = { campaignId, seed, heroId: startHero, finished: false, stuckAt: null, pages: 0, deaths: [], months: [] }

  const dispatch = (a: Action): GameState => {
    // The log and journal only grow; clearing them keeps cloning cheap and shows exactly what this action did.
    const before = { ...st, log: [], journal: [] }
    const day = currentDay(before)
    const next = reduce(before, a)
    if (next === before) return st
    const fallen = next.log.filter((l) => l.text.includes('has fallen')).length
    for (let i = 0; i < fallen; i++) {
      const fight = before.pending?.type === 'combat' && day?.combat ? day.combat.enemies.map((e) => enemy(e).name) : before.pending?.type === 'dogfight' && day?.dogfight ? day.dogfight.craft.map((x) => craftDef(x).name) : []
      rec.deaths.push({ page: before.dayIndex, month: months[before.dayIndex], cause: fight.length ? fight.join(', ') : 'hazard' })
    }
    st = next
    return st
  }

  // Which hero the run prefers at hero-choice pages (rotates so every hero gets played).
  const brain = { pref: seed }
  const total = c.pages.length
  while (st.dayIndex < total && !st.finished) {
    const i = st.dayIndex
    const played = playPage(st, dispatch, brain)
    st = played.s
    if (!played.ok) {
      rec.stuckAt = i
      break
    }
    const last = i === total - 1 || months[i + 1] !== months[i]
    if (last) {
      const h = st.hero!
      const heals = Object.entries(h.inventory).reduce((n, [id, q]) => n + (item(id).kind === 'heal' ? q : 0), 0)
      rec.months.push({ month: months[i], level: h.level, glint: h.glint, hp: h.hp, maxHp: maxHp(h), healItems: heals })
    }
    rec.pages = i + 1
    dispatch({ type: 'NEXT_DAY', today: FAR_FUTURE })
    if (st.dayIndex === i) {
      rec.stuckAt = i
      break
    }
  }
  rec.finished = st.finished
  rec.heroId = st.hero?.defId ?? rec.heroId
  return rec
}
