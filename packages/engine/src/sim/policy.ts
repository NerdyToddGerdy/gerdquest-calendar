// A sensible bot for the balance simulator. Pure TypeScript, no DOM, no clock:
// the only randomness is the game's own seeded RNG inside the reducer.
//
// The bot is deliberately not a perfect player. It reads each check's trait
// and modifiers against the band thresholds, spends abilities when they
// improve the expected outcome, rests when hurt, shops for healing and gear,
// and fights with the same expected-value logic.
import { ability, enemy, item, member } from '../engine/content'
import { combatRounds, d20Mods, resolveRound } from '../engine/combat'
import { isD20, isNat1, pickBand, slotTotal } from '../engine/dice'
import { itemCount, maxHp, stat, usesLeft } from '../engine/hero'
import { isFollower } from '../engine/followers'
import { canPay } from '../engine/pools'
import { rules } from '../engine/ruleset'
import { situationalMods } from '../engine/upgrades'
import { canChangeGear, combatInProgress, currentDay, meetsRequirement, pendingSlots, stepAvailable, stepsDone } from '../engine/state'
import { COMPARTMENTS, craftDef, crewDef, maxIntegrity, shipStat, upgradeDef } from '../engine/vehicle'
import { dogfightInProgress } from '../engine/vehicleActions'
import type { Action } from '../engine/state'
import type { Day, Effect, GameState, GearSlot, Hero, ItemDef, Mod, Option, RollSlot, StatKey } from '../engine/types'

/** Applies one action and returns the new state; the runner wraps the reducer with it. */
export type Dispatch = (a: Action) => GameState

export interface Brain {
  /** Which of the hero choices this run prefers (index among the choices offered). */
  pref: number
}

const WEIGHTS: Partial<Record<StatKey, number>> = { atk: 3, def: 3, dmg: 2.5, maxHp: 0.6, roll: 3, str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }

function gearScore(it: ItemDef): number {
  if (it.kind !== 'gear' && it.kind !== 'upgrade') return 0
  return Object.entries(it.bonus).reduce((n, [k, v]) => n + (WEIGHTS[k as StatKey] ?? 1) * (v ?? 0), 0)
}

// ---------------------------------------------------------------------------
// Scoring outcomes (roughly: 1 point = 1 health)

function effectsScore(s: GameState, effects: Effect[] | undefined): number {
  const hero = s.hero!
  let hp = hero.hp
  let score = 0
  for (const e of effects ?? []) {
    switch (e.type) {
      case 'damage':
        score -= e.amount
        hp -= e.amount
        if (hp <= 0) score -= 12
        break
      case 'heal':
        score += Math.min(e.amount, maxHp(hero) - hp)
        hp += e.amount
        break
      case 'glint':
        score += e.amount * 0.4
        break
      case 'item': {
        const it = item(e.id)
        score += (e.qty ?? 1) * Math.max(1.5, it.price * 0.4)
        break
      }
      case 'condition':
        if (e.poisoned) score -= 3
        if (e.cursed) score -= 3
        break
      case 'pageBonus':
        score += 1
        break
      case 'travel':
        score -= Math.max(0, e.rations - itemCount(hero, 'ration')) * rules(s).rationPenalty
        break
      case 'levelUp':
        score += 25
        break
      case 'boon':
        score += 3
        break
      case 'virtue':
        score += e.amount * 0.5
        break
      case 'ship':
        score += (e.parts ?? 0) * 2 + (e.repair ?? 0) * 2 + (e.give ? 10 : 0)
        break
      default:
        break
    }
  }
  return score
}

function checkMods(s: GameState, opt: Option): Mod[] {
  const check = opt.check!
  const hero = s.hero!
  const mods: Mod[] = d20Mods(hero, check.trait)
  for (const id of hero.abilities) {
    const a = ability(id)
    if (a.kind === 'passive' && a.tags.some((t) => check.tags?.includes(t))) mods.push({ label: a.name, value: a.bonus })
  }
  mods.push(...situationalMods(hero, check))
  return mods
}

function bandScore(s: GameState, opt: Option, total: number, nat1: boolean): number {
  const band = pickBand(opt.bands ?? [{ text: '' }], total, nat1)
  return effectsScore(s, band.effects)
}

function optionScore(s: GameState, opt: Option, brain: Brain, choiceIdx: number, choices: number): number {
  const pick = (opt.effects ?? []).some((e) => e.type === 'setHero')
  let heroBias = pick && choiceIdx === brain.pref % Math.max(1, choices) ? 1000 : 0
  // Choice-decided legacy (an option that records a mark): rotate between the
  // two endings by run, so the sim plays both the honoured and the broken bargain.
  const mark = (opt.effects ?? []).find((e) => e.type === 'legacy')
  if (mark && mark.id.endsWith('_win') === (brain.pref % 2 === 0)) heroBias += 1000
  if (!opt.check) return effectsScore(s, opt.effects) + heroBias
  const bonus = checkMods(s, opt).reduce((n, m) => n + m.value, 0)
  const boons = rules(s).boons
  let sum = 0
  for (let nat = 1; nat <= 20; nat++) sum += bandScore(s, opt, nat + bonus, boons && nat === 1)
  return sum / 20 + effectsScore(s, opt.effects) + heroBias
}

// ---------------------------------------------------------------------------
// Objective of the pending roll(s), used to decide whether to spend resources

function objective(s: GameState, slots: RollSlot[]): number {
  const p = s.pending!
  const hero = s.hero!
  const day = currentDay(s)!
  if (p.type === 'check') {
    const slot = slots[0]
    const opt = day.steps[p.step].options[p.option]
    return bandScore(s, opt, slotTotal(slot), rules(s).boons && isNat1(slot))
  }
  if (p.type === 'combat') {
    const r = rules(s)
    const c = s.progress.combat!
    const rounds = combatRounds(day.combat!.rounds, day.combat!.enemies.length, r.combat.groups)
    const staticDefense = r.combat.defense === 'static' ? 10 + stat(hero, 'def') : undefined
    const res = resolveRound(c, slots, rounds, { boons: r.boons, soloStun: r.combat.soloStun, staticDefense })
    let obj = -res.damageTaken
    if (hero.hp - res.damageTaken <= 0) obj -= 25
    res.combat.enemies.forEach((e, i) => {
      if (e.defeated && !c.enemies[i].defeated) obj += 2 + enemy(e.defId).dmg * Math.max(0, rounds - c.round) * 0.6
    })
    if (res.combat.won) obj += 4
    return obj
  }
  if (p.type === 'dogfight') {
    const f = s.progress.dogfight!
    const ship = s.ship!
    const shield = shipStat(ship, 'shield')
    const rounds = day.dogfight!.rounds
    let obj = 0
    f.craft.forEach((c, i) => {
      if (c.downed) return
      const def = craftDef(c.defId)
      const aim = slots.find((x) => x.id === `${i}:aim`)!
      const eva = slots.find((x) => x.id === `${i}:eva`)!
      if (slotTotal(aim) >= def.evade) {
        obj += 2 + def.dmg * Math.max(0, rounds - f.round) * 0.6
        return
      }
      obj -= 0.8 * Math.max(0, (slotTotal(eva) > def.aim ? def.reduced : def.dmg) - shield)
    })
    return obj
  }
  return 0
}

type Variant = [slot: RollSlot, weight: number]
interface Candidate {
  action: Action
  slotId: string
  variants: Variant[]
  cost: number
}

function dieVariants(slot: RollSlot, sides: number): Variant[] {
  return Array.from({ length: sides }, (_, i) => [{ ...slot, mods: [...slot.mods, { label: 'x', value: i + 1 }] }, 1 / sides])
}

function candidates(s: GameState): Candidate[] {
  const hero = s.hero!
  const out: Candidate[] = []
  for (const slot of pendingSlots(s)) {
    for (const id of hero.abilities) {
      const a = ability(id)
      if (a.kind === 'passive' || a.kind === 'heal') continue
      if (usesLeft(hero, a) <= 0 || !canPay(hero, a)) continue
      const cost = (a.per === 'rest' ? 0.8 : 0.2) + (a.cost ? a.cost.amount * 0.6 : 0)
      const action: Action = { type: 'USE_ABILITY', ability: id, slot: slot.id }
      if (a.kind === 'reroll') {
        if (!isD20(slot)) continue
        out.push({ action, slotId: slot.id, cost, variants: Array.from({ length: slot.die }, (_, n) => [{ ...slot, natural: n + 1 }, 1 / slot.die] as Variant) })
      } else if (a.slots.includes(slot.kind)) {
        out.push({ action, slotId: slot.id, cost, variants: dieVariants(slot, a.die) })
      }
    }
    if (hero.boon && rules(s).boons && isD20(slot)) {
      out.push({ action: { type: 'USE_BOON', slot: slot.id }, slotId: slot.id, cost: 1.5, variants: dieVariants(slot, 4) })
    }
    for (const [id, n] of Object.entries(hero.inventory)) {
      const it = item(id)
      if (n > 0 && it.kind === 'slotDie' && it.slots.includes(slot.kind)) {
        out.push({ action: { type: 'USE_ITEM', item: id, slot: slot.id }, slotId: slot.id, cost: it.price * 0.4, variants: dieVariants(slot, it.die) })
      }
    }
    s.party.forEach((p, index) => {
      const def = member(p.defId)
      if (p.usedPage || p.hp <= 0 || isFollower(def)) return
      const amt = Math.max(0, ...def.abilities.flatMap((x) => (x.effect.type === 'slotBonus' && x.effect.slots.includes(slot.kind) ? [x.effect.amount] : [])))
      if (amt <= 0) return
      out.push({
        action: { type: 'CALL_MEMBER', index, slot: slot.id },
        slotId: slot.id,
        cost: 0.3,
        variants: [[slot, 0.7], [{ ...slot, mods: [...slot.mods, { label: 'x', value: amt }] }, 0.3]],
      })
    })
  }
  return out
}

/** Spend abilities, boons, items and companions while they raise the expected outcome. */
function boost(s: GameState, dispatch: Dispatch): GameState {
  for (let guard = 0; guard < 12 && s.pending; guard++) {
    const slots = pendingSlots(s)
    const base = objective(s, slots)
    let best: Candidate | null = null
    let bestGain = 0.3
    for (const c of candidates(s)) {
      let ev = 0
      for (const [v, w] of c.variants) ev += w * objective(s, slots.map((x) => (x.id === c.slotId ? v : x)))
      const gain = ev - base - c.cost
      if (gain > bestGain) {
        best = c
        bestGain = gain
      }
    }
    if (!best) break
    const next = dispatch(best.action)
    if (next === s) break
    s = next
  }
  return s
}

// ---------------------------------------------------------------------------
// Between-roll upkeep: healing, resting, shopping, gear

function hpFrac(h: Hero): number {
  return h.hp / maxHp(h)
}

function needsRest(h: Hero): boolean {
  return hpFrac(h) < 0.85 || h.poisoned || h.cursed || h.wounds.length > 0 || Object.keys(h.usedRest).length > 0
}

/** Heal abilities and healing items when hurt (items only outside fights). */
function tendWounds(s: GameState, dispatch: Dispatch, inFight: boolean): GameState {
  for (let guard = 0; guard < 6 && !s.pending; guard++) {
    const h = s.hero!
    const frac = hpFrac(h)
    if (frac >= 0.7) break
    let next = s
    for (const id of h.abilities) {
      const a = ability(id)
      if (a.kind !== 'heal' || usesLeft(h, a) <= 0 || !canPay(h, a)) continue
      if (maxHp(h) - h.hp < (a.die + 1) / 2 + a.bonus) continue
      next = dispatch({ type: 'USE_ABILITY', ability: id })
      if (next !== s) break
    }
    if (next === s) {
      s.party.forEach((p, index) => {
        if (next !== s || p.usedPage || p.hp <= 0 || isFollower(member(p.defId))) return
        if (member(p.defId).abilities.some((x) => x.effect.type === 'heal')) next = dispatch({ type: 'CALL_MEMBER', index })
      })
    }
    if (next === s && !inFight && frac < 0.4) {
      const heals = Object.keys(h.inventory)
        .map(item)
        .filter((i) => i.kind === 'heal')
        .sort((a, b) => (b.kind === 'heal' && a.kind === 'heal' ? (b.die + 1) / 2 + b.bonus - ((a.die + 1) / 2 + a.bonus) : 0))
      if (heals[0]) next = dispatch({ type: 'USE_ITEM', item: heals[0].id })
    }
    if (next === s) break
    s = next
  }
  return s
}

function doRest(s: GameState, dispatch: Dispatch): GameState {
  const day = currentDay(s)!
  if (!day.rest || s.progress.rested || s.pending || combatInProgress(s)) return s
  const h = s.hero!
  // Heal the worst kind of wound first.
  const order = ['maxHp', 'def', 'atk', 'dmg', 'con', 'str', 'dex', 'int', 'wis', 'cha'] as const
  const wound = order.find((w) => h.wounds.includes(w))
  return dispatch({ type: 'REST', wound })
}

function equipBest(s: GameState, dispatch: Dispatch): GameState {
  for (let guard = 0; guard < 8 && canChangeGear(s); guard++) {
    const h = s.hero!
    let next = s
    for (const [id, n] of Object.entries(h.inventory)) {
      const it = item(id)
      if (n <= 0 || it.kind !== 'gear') continue
      const cur = h.gear[it.slot as GearSlot]
      if (!cur || gearScore(it) > gearScore(item(cur))) {
        next = dispatch({ type: 'EQUIP', item: id })
        if (next !== s) break
      }
    }
    if (next === s) break
    s = next
  }
  return s
}

function healPower(i: ItemDef): number {
  return i.kind === 'heal' ? (i.die + 1) / 2 + i.bonus : 0
}

function shop(s: GameState, day: Day, dispatch: Dispatch): GameState {
  if (!day.shop || s.pending) return s
  for (let guard = 0; guard < 12; guard++) {
    const h = s.hero!
    const heals = Object.entries(h.inventory).reduce((n, [id, c]) => n + (item(id).kind === 'heal' ? c : 0), 0)
    let pick: { id: string; value: number } | null = null
    for (const offer of day.shop.items) {
      if (offer.price > h.glint) continue
      const it = item(offer.id)
      let value = 0
      if (it.kind === 'heal') {
        // Keep two or three draughts; the first is urgent.
        const want = heals === 0 ? 100 : heals < 3 ? 6 : 0
        value = want * (healPower(it) / Math.max(1, offer.price)) + (heals === 0 ? 50 : 0)
        if (heals >= 3) value = 0
      } else if (it.kind === 'ration') {
        value = itemCount(h, 'ration') < 3 ? 5 : 0
      } else if (it.kind === 'cure') {
        value = h.wounds.length > 0 && itemCount(h, it.id) === 0 ? 8 : 0
      } else if (it.kind === 'gear') {
        const cur = h.gear[it.slot]
        const best = Math.max(cur ? gearScore(item(cur)) : 0, ...Object.entries(h.inventory).map(([id, c]) => (c > 0 && item(id).kind === 'gear' && (item(id) as { slot: string }).slot === it.slot ? gearScore(item(id)) : 0)))
        const gain = gearScore(it) - best
        if (gain > 0 && h.glint - offer.price >= (heals === 0 ? 8 : 0)) value = (gain * 12) / Math.max(1, offer.price) + 1
      } else if (it.kind === 'upgrade') {
        if (itemCount(h, it.id) < it.stackMax && offer.price <= h.glint * 0.6) value = (gearScore(it) * 10) / Math.max(1, offer.price)
      }
      if (value > 0 && (!pick || value > pick.value)) pick = { id: offer.id, value }
    }
    if (!pick) break
    const next = dispatch({ type: 'BUY', item: pick.id })
    if (next === s) break
    s = next
  }
  // Hire help when it is cheap compared with the purse.
  for (const id of day.shop.hires ?? []) {
    const def = member(id)
    const h = s.hero!
    const upkeep = def.follower?.upkeep ?? 0
    if (def.fee + upkeep * 6 > h.glint * 0.45 || s.party.length >= 3) continue
    s = dispatch({ type: 'HIRE', member: id })
  }
  return s
}

const CREW_ORDER = ['guns', 'helm', 'drive', 'sickbay', 'hold', 'bunks'] as const

function dock(s: GameState, day: Day, dispatch: Dispatch): GameState {
  if (!day.dock || !s.ship || s.pending || dogfightInProgress(s)) return s
  for (const u of day.dock.upgrades ?? []) {
    const ship = s.ship!
    const comp = ship.compartments.find((c) => c.id === upgradeDef(u.id).compartment)!
    if (comp.upgrade === u.id || comp.integrity <= 0) continue
    const cur = comp.upgrade ? upgradeDef(comp.upgrade) : null
    if (cur && cur.price >= u.price) continue
    if (u.price <= s.hero!.glint * 0.7) s = dispatch({ type: 'BUY_UPGRADE', upgrade: u.id })
  }
  for (const id of day.dock.crew ?? []) {
    if (crewDef(id).fee > s.hero!.glint * 0.5) continue
    for (const compartment of CREW_ORDER) {
      const next = dispatch({ type: 'HIRE_CREW', crew: id, compartment })
      if (next !== s) {
        s = next
        break
      }
    }
  }
  for (let i = 0; i < 6 && day.dock.partsPrice !== undefined && day.dock.partsPrice <= s.hero!.glint * 0.3; i++) {
    const next = dispatch({ type: 'BUY_PARTS' })
    if (next === s) break
    s = next
  }
  return s
}

function repairShip(s: GameState, dispatch: Dispatch): GameState {
  for (let guard = 0; guard < 20 && s.ship && s.ship.parts > 0 && !s.pending && !dogfightInProgress(s); guard++) {
    const worst = [...COMPARTMENTS]
      .filter((id) => s.ship!.compartments.find((c) => c.id === id)!.integrity < maxIntegrity(s.ship!, id))
      .sort((a, b) => s.ship!.compartments.find((c) => c.id === a)!.integrity - s.ship!.compartments.find((c) => c.id === b)!.integrity)[0]
    if (!worst) break
    const next = dispatch({ type: 'REPAIR', compartment: worst })
    if (next === s) break
    s = next
  }
  return s
}

// ---------------------------------------------------------------------------

function playRounds(s: GameState, dispatch: Dispatch, kind: 'combat' | 'dogfight'): GameState {
  for (let guard = 0; guard < 40; guard++) {
    const done = kind === 'combat' ? s.progress.combat?.done : s.progress.dogfight?.done
    if (done) break
    s = tendWounds(s, dispatch, true)
    const next = dispatch({ type: kind === 'combat' ? 'ROLL_ROUND' : 'ROLL_VOLLEY' })
    if (next === s) break
    s = boost(next, dispatch)
    const after = dispatch({ type: 'CONFIRM' })
    if (after === s) break
    s = after
  }
  return s
}

function applyBoosters(s: GameState, dispatch: Dispatch): GameState {
  const h = s.hero!
  for (const [id, n] of Object.entries(h.inventory)) {
    const it = item(id)
    if (n <= 0) continue
    if ((it.kind === 'boon' && !h.boon && rules(s).boons) || (it.kind === 'cure' && h.wounds.length > 1)) s = dispatch({ type: 'USE_ITEM', item: id })
    else if (it.kind === 'pageBonus') s = dispatch({ type: 'USE_ITEM', item: id })
  }
  return s
}

/** Plays the current page to its end (without advancing). Returns false if the bot got stuck. */
export function playPage(s: GameState, dispatch: Dispatch, brain: Brain): { s: GameState; ok: boolean } {
  const day = currentDay(s)!
  s = dispatch({ type: 'LOTTERY' })
  s = shop(s, day, dispatch)
  s = dock(s, day, dispatch)
  if (hpFrac(s.hero!) < 0.6 || s.hero!.poisoned || s.hero!.cursed) s = doRest(s, dispatch)
  s = equipBest(s, dispatch)
  s = repairShip(s, dispatch)
  for (let i = 0; i < (day.icons?.length ?? 0); i++) {
    const next = dispatch({ type: 'ICON', index: i })
    s = next.pending?.type === 'pickpocket' ? dispatch({ type: 'PICKPOCKET', take: true }) : next
  }
  // Steps.
  for (let guard = 0; guard < 30 && !stepsDone(s); guard++) {
    s = tendWounds(s, dispatch, false)
    let best: { step: number; option: number; score: number } | null = null
    day.steps.forEach((st, step) => {
      if (!stepAvailable(s, step)) return
      const picks = st.options.filter((o) => (o.effects ?? []).some((e) => e.type === 'setHero')).length
      let idx = -1
      st.options.forEach((o, option) => {
        // Legacy-gated options the run hasn't earned can't be chosen.
        if (!meetsRequirement(s, o.requires)) return
        const isPick = (o.effects ?? []).some((e) => e.type === 'setHero')
        if (isPick) idx++
        const score = optionScore(s, o, brain, isPick ? idx : -1, picks)
        if (!best || score > best.score) best = { step, option, score }
      })
    })
    if (!best) return { s, ok: false }
    const choice: { step: number; option: number } = best
    const next = dispatch({ type: 'CHOOSE', step: choice.step, option: choice.option })
    if (next === s) return { s, ok: false }
    s = next
    if (s.pending?.type === 'check') {
      s = boost(s, dispatch)
      const after = dispatch({ type: 'CONFIRM' })
      if (after === s) return { s, ok: false }
      s = after
    }
  }
  s = equipBest(s, dispatch)
  if (day.dogfight && s.ship) {
    if (needsRest(s.hero!)) s = doRest(s, dispatch)
    s = repairShip(s, dispatch)
    s = playRounds(s, dispatch, 'dogfight')
  }
  if (day.combat) {
    if (needsRest(s.hero!)) s = doRest(s, dispatch)
    s = equipBest(s, dispatch)
    if (day.combat.rounds >= 4) s = applyBoosters(s, dispatch)
    s = playRounds(s, dispatch, 'combat')
  }
  s = tendWounds(s, dispatch, false)
  if (needsRest(s.hero!)) s = doRest(s, dispatch)
  s = tendWounds(s, dispatch, false)
  s = equipBest(s, dispatch)
  return { s, ok: true }
}
