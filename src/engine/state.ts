// Game state and the single reducer that applies every player action.
import { ability, heroDef, item, LOOT_TABLE, member } from './content'
import { authoredDate, campaign, campaignPages, DEFAULT_CAMPAIGN, isLotteryPage, isPageUnlocked, pageDate } from './campaign'
import { combatRounds, d20Mods, resolveRound, rollRound, startCombat } from './combat'
import { resolveDeath } from './death'
import { isD20, isNat1, isNat20, makeSlot, pickBand, slotTotal } from './dice'
import { lottery, sellPrice, travel } from './economy'
import {
  addItem,
  clampVirtue,
  createHero,
  damage,
  heal,
  itemCount,
  levelUp,
  markUsed,
  maxHp,
  usesLeft,
} from './hero'
import { activateWithCard, activateWithDice, canHire, drawCard, freshDeck, shuffle } from './party'
import { rest } from './rest'
import { stat } from './hero'
import { hireFollower, isFollower, payUpkeep, releaseFollower } from './followers'
import { canPay, growPools, pay, refillPools } from './pools'
import { situationalMods } from './upgrades'
import { rules } from './ruleset'
import { makeRng, type Rng } from './rng'
import { applyShipEffect, dogfightDone, stepVehicle, type VehicleAction } from './vehicleActions'
import type {
  Day,
  DayProgress,
  Effect,
  GameState,
  GearSlot,
  Hero,
  JournalEntry,
  Mod,
  RollSlot,
  WoundKind,
} from './types'

export type Action =
  | { type: 'NEW_GAME'; heroId?: string; seed: number; campaignId?: string; startDate?: string }
  | { type: 'CHOOSE'; step: number; option: number }
  | { type: 'USE_ABILITY'; ability: string; slot?: string }
  | { type: 'USE_BOON'; slot: string }
  | { type: 'USE_ITEM'; item: string; slot?: string }
  | { type: 'CALL_MEMBER'; index: number; slot?: string }
  | { type: 'CONFIRM' }
  | { type: 'ROLL_ROUND' }
  | { type: 'ICON'; index: number }
  | { type: 'PICKPOCKET'; take: boolean }
  | { type: 'BUY'; item: string }
  | { type: 'SELL'; item: string }
  | { type: 'HIRE'; member: string }
  | { type: 'DISMISS'; index: number }
  | { type: 'EQUIP'; item: string }
  | { type: 'UNEQUIP'; slot: GearSlot }
  | { type: 'REST'; wound?: WoundKind }
  | { type: 'LOTTERY' }
  /** `today` is the player's local ISO date; the next page must have unlocked by then. */
  | { type: 'NEXT_DAY'; today: string }
  | { type: 'TOGGLE_PARTY_DICE' }
  | { type: 'LOAD'; state: GameState }
  | { type: 'QUIT' }
  | VehicleAction

export function newProgress(day: Day | undefined): DayProgress {
  return {
    steps: (day?.steps ?? []).map(() => null),
    results: (day?.steps ?? []).map(() => null),
    combat: null,
    icons: (day?.icons ?? []).map(() => false),
    rested: false,
    lottery: false,
    canChangeGear: false,
  }
}

export function initialState(seed = 1): GameState {
  return {
    version: 1,
    rng: seed,
    hero: null,
    party: [],
    deck: [],
    partyDice: false,
    dayIndex: 0,
    progress: newProgress(undefined),
    pending: null,
    log: [],
    finished: false,
    campaignId: DEFAULT_CAMPAIGN,
    startDate: authoredDate(campaign(DEFAULT_CAMPAIGN), 0),
    journal: [],
  }
}

export function currentDay(s: GameState): Day | undefined {
  return campaignPages(s.campaignId)[s.dayIndex]
}

/** Snapshot of the page just finished, for the Journal. */
function journalEntry(s: GameState): JournalEntry {
  return {
    page: s.dayIndex,
    date: pageDate(campaign(s.campaignId), s.dayIndex, s.startDate),
    lines: s.log.filter((e) => e.day === s.dayIndex).map((e) => e.text).reverse(),
  }
}

export function combatInProgress(s: GameState): boolean {
  return !!s.progress.combat && !s.progress.combat.done
}

export function stepAvailable(s: GameState, step: number): boolean {
  const day = currentDay(s)
  if (!day || s.pending || s.progress.steps[step] !== null) return false
  if (day.anyOrder) return true
  return s.progress.steps.slice(0, step).every((x) => x !== null)
}

/** True when earlier steps must be finished first (ignores pending rolls). */
export function stepLocked(s: GameState, step: number): boolean {
  const day = currentDay(s)
  if (!day || day.anyOrder) return false
  return s.progress.steps.slice(0, step).some((x) => x === null)
}

export function stepsDone(s: GameState): boolean {
  return s.progress.steps.every((x) => x !== null)
}

export function canAdvance(s: GameState): boolean {
  const day = currentDay(s)
  if (!day || !s.hero || s.pending) return false
  if (!stepsDone(s)) return false
  if (day.combat && !s.progress.combat?.done) return false
  if (!dogfightDone(s, day)) return false
  return true
}

export function canChangeGear(s: GameState): boolean {
  const acquireOk = rules(s).gearSwap === 'restOrAcquire' && s.progress.canChangeGear
  return !s.pending && !combatInProgress(s) && (s.progress.rested || acquireOk)
}

/** Rounds the current day's fight lasts under this game's ruleset. */
export function maxRounds(s: GameState): number {
  const c = currentDay(s)?.combat
  return c ? combatRounds(c.rounds, c.enemies.length, rules(s).combat.groups) : 0
}

export function pendingSlots(s: GameState): RollSlot[] {
  if (!s.pending) return []
  if (s.pending.type === 'check') return [s.pending.slot]
  if (s.pending.type === 'combat' || s.pending.type === 'dogfight') return s.pending.slots
  return []
}

// ---------------------------------------------------------------------------

/** Mutable working copy used inside the reducer. */
type Draft = GameState & { hero: Hero }

function log(s: GameState, text: string) {
  s.log = [{ day: s.dayIndex, text }, ...s.log].slice(0, 300)
}

function findSlot(s: GameState, id: string | undefined): RollSlot | undefined {
  return id ? pendingSlots(s).find((x) => x.id === id) : undefined
}

function checkDeath(s: Draft, rng: Rng) {
  if (s.hero.hp > 0) return
  const { hero, lines } = resolveDeath(s.hero, rng, rules(s).death, rules(s).currencyName)
  s.hero = hero
  lines.forEach((l) => log(s, l))
  if (s.progress.combat && !s.progress.combat.done) {
    s.progress.combat = { ...s.progress.combat, done: true, won: false }
    log(s, 'You wake after the fight has ended. The rest of the day goes on without you.')
  }
  s.pending = null
}

function grantBoon(s: Draft) {
  if (!rules(s).boons) return
  if (s.hero.boon) {
    log(s, 'Natural 20! (You already hold a Boon.)')
  } else {
    s.hero = { ...s.hero, boon: true }
    log(s, 'Natural 20! You gain a Boon: add a d4 to a future d20 roll.')
  }
}

export function applyEffects(s: Draft, effects: Effect[] | undefined, rng: Rng) {
  for (const e of effects ?? []) {
    switch (e.type) {
      case 'damage':
        s.hero = damage(s.hero, e.amount)
        log(s, `You lose ${e.amount} health.`)
        break
      case 'heal':
        s.hero = heal(s.hero, e.amount)
        log(s, `You recover ${e.amount} health.`)
        break
      case 'glint':
        s.hero = { ...s.hero, glint: Math.max(0, s.hero.glint + e.amount) }
        log(s, e.amount >= 0 ? `You gain ${e.amount} ${rules(s).currencyName}.` : `You lose ${-e.amount} ${rules(s).currencyName}.`)
        break
      case 'virtue':
        s.hero = { ...s.hero, virtue: clampVirtue(s.hero.virtue + e.amount) }
        log(s, `Virtue ${e.amount >= 0 ? '+' : ''}${e.amount}.`)
        break
      case 'item': {
        const qty = e.qty ?? 1
        s.hero = addItem(s.hero, e.id, qty)
        if (item(e.id).kind === 'gear') s.progress.canChangeGear = true
        log(s, `You receive ${qty > 1 ? `${qty}× ` : ''}${item(e.id).name}.`)
        break
      }
      case 'condition':
        s.hero = {
          ...s.hero,
          poisoned: e.poisoned ?? s.hero.poisoned,
          cursed: e.cursed ?? s.hero.cursed,
        }
        if (e.poisoned) log(s, `You are ${rules(s).conditions.a.label} (${rules(s).conditions.a.text}).`)
        if (e.cursed) log(s, `You are ${rules(s).conditions.b.label} (${rules(s).conditions.b.text}).`)
        break
      case 'pageBonus':
        s.hero = {
          ...s.hero,
          pageBonus: { ...s.hero.pageBonus, [e.stat]: (s.hero.pageBonus[e.stat] ?? 0) + e.amount },
        }
        log(s, `+${e.amount} ${e.stat === 'roll' ? 'to all rolls' : e.stat} for the rest of today.`)
        break
      case 'travel': {
        const { eaten, missing } = travel(e.rations, itemCount(s.hero, 'ration'))
        s.hero = addItem(s.hero, 'ration', -eaten)
        log(s, `You travel, eating ${eaten} ration${eaten === 1 ? '' : 's'}.`)
        if (missing > 0) {
          s.hero = damage(s.hero, missing * rules(s).rationPenalty)
          log(s, `You go hungry: −${missing * rules(s).rationPenalty} health for missing rations.`)
        }
        break
      }
      case 'levelUp': {
        const spec = heroDef(s.hero.defId).levels[s.hero.level + 1]
        if (!spec) break
        s.hero = growPools(levelUp(s.hero, spec), spec.pools)
        log(s, `Level up! ${s.hero.name} is now level ${s.hero.level} (+${spec.maxHp} max health).`)
        if (spec.ability) log(s, `New ability: ${ability(spec.ability).name}.`)
        break
      }
      case 'boon':
        grantBoon(s)
        break
      case 'setHero': {
        const next = createHero(heroDef(e.heroId))
        const carry = e.carry ?? []
        s.hero = {
          ...next,
          glint: carry.includes('glint') ? s.hero.glint : next.glint,
          inventory: carry.includes('inventory') ? s.hero.inventory : next.inventory,
          gear: carry.includes('gear') ? s.hero.gear : next.gear,
        }
        log(s, `You now play as ${next.name}, ${next.title}.`)
        break
      }
      case 'ship':
        applyShipEffect(s, e, { log, applyEffects, checkDeath })
        break
    }
  }
  checkDeath(s, rng)
}

// ---------------------------------------------------------------------------

export function reduce(state: GameState, action: Action, injected?: Rng): GameState {
  if (action.type === 'LOAD') return action.state
  if (action.type === 'QUIT') return initialState(state.rng)

  const rng = injected ?? makeRng(state.rng)
  const s = structuredClone(state)

  if (action.type === 'NEW_GAME') {
    const fresh = initialState(action.seed)
    fresh.campaignId = action.campaignId ?? fresh.campaignId
    fresh.startDate = action.startDate ?? authoredDate(campaign(fresh.campaignId), 0)
    fresh.rulesetId = campaign(fresh.campaignId).rulesetId
    const camp = campaign(fresh.campaignId)
    const heroId = camp.startHero ?? action.heroId
    if (!heroId) throw new Error('NEW_GAME needs a hero for this campaign')
    const def = heroDef(heroId)
    const r = injected ?? makeRng(action.seed)
    fresh.hero = createHero(def)
    fresh.hero.inventory = { ...(camp.startItems ?? { ration: 2, mendwater: 1 }) }
    fresh.deck = shuffle(freshDeck(), r)
    fresh.progress = newProgress(campaignPages(fresh.campaignId)[0])
    log(fresh, `${def.name}, ${def.title}, begins the journey.`)
    fresh.rng = r.state()
    return fresh
  }

  if (!s.hero) return state
  const d = s as Draft
  const day = currentDay(s)
  if (!day && action.type !== 'TOGGLE_PARTY_DICE') return state

  const changed = step(d, day!, action, rng)
  if (!changed) return state
  d.rng = rng.state()
  return d
}

/** Returns false when the action isn't legal right now (state is left untouched). */
function step(s: Draft, day: Day, action: Action, rng: Rng): boolean {
  const vehicle = stepVehicle(s, day, action, rng, { log, applyEffects, checkDeath })
  if (vehicle !== undefined) return vehicle
  switch (action.type) {
    case 'CHOOSE': {
      if (!stepAvailable(s, action.step)) return false
      const opt = day.steps[action.step]?.options[action.option]
      if (!opt) return false
      if (opt.check) {
        const mods: Mod[] = d20Mods(s.hero, opt.check.trait)
        for (const id of s.hero.abilities) {
          const a = ability(id)
          if (a.kind === 'passive' && a.tags.some((t) => opt.check!.tags?.includes(t))) {
            mods.push({ label: a.name, value: a.bonus })
          }
        }
        mods.push(...situationalMods(s.hero, opt.check))
        s.pending = {
          type: 'check',
          step: action.step,
          option: action.option,
          slot: makeSlot(rng, 'check', opt.label, 'check', 20, mods),
        }
      } else {
        s.progress.steps[action.step] = action.option
        s.progress.results[action.step] = opt.result ?? null
        if (opt.result) log(s, opt.result)
        applyEffects(s, opt.effects, rng)
      }
      return true
    }

    case 'USE_ABILITY': {
      if (!s.hero.abilities.includes(action.ability)) return false
      const a = ability(action.ability)
      if (usesLeft(s.hero, a) <= 0) return false
      if (a.kind === 'passive') return false
      if (!canPay(s.hero, a)) return false
      if (a.kind === 'heal') {
        if (s.pending) return false
        const amt = rng.int(a.die) + a.bonus
        s.hero = heal(pay(markUsed(s.hero, a), a), amt)
        log(s, `${a.name}: you recover ${amt} health.`)
        return true
      }
      const slot = findSlot(s, action.slot)
      if (!slot) return false
      if (a.kind === 'reroll') {
        if (!isD20(slot)) return false
        const before = slot.natural
        slot.natural = rng.int(slot.die)
        log(s, `${a.name}: rerolled ${slot.label} (${before} → ${slot.natural}).`)
      } else {
        if (!a.slots.includes(slot.kind)) return false
        const v = rng.int(a.die)
        slot.mods.push({ label: a.name, value: v })
        log(s, `${a.name}: +${v} to ${slot.label}.`)
      }
      s.hero = pay(markUsed(s.hero, a), a)
      return true
    }

    case 'USE_BOON': {
      const slot = findSlot(s, action.slot)
      if (!slot || !s.hero.boon || !isD20(slot) || !rules(s).boons) return false
      const v = rng.int(4)
      slot.mods.push({ label: 'Boon', value: v })
      s.hero = { ...s.hero, boon: false }
      log(s, `Boon spent: +${v} to ${slot.label}.`)
      return true
    }

    case 'USE_ITEM': {
      if (itemCount(s.hero, action.item) <= 0) return false
      const it = item(action.item)
      switch (it.kind) {
        case 'heal': {
          // Healing draughts only at the start or end of a page, never mid-combat.
          if (s.pending || combatInProgress(s)) return false
          const amt = rng.int(it.die) + it.bonus
          s.hero = heal(addItem(s.hero, it.id, -1), amt)
          log(s, `${it.name}: you recover ${amt} health.`)
          return true
        }
        case 'slotDie': {
          const slot = findSlot(s, action.slot)
          if (!slot || !it.slots.includes(slot.kind)) return false
          const v = rng.int(it.die)
          slot.mods.push({ label: it.name, value: v })
          s.hero = addItem(s.hero, it.id, -1)
          log(s, `${it.name}: +${v} to ${slot.label}.`)
          return true
        }
        case 'pageBonus':
          if (s.pending) return false
          s.hero = addItem(s.hero, it.id, -1)
          applyEffects(s, [{ type: 'pageBonus', stat: it.stat, amount: it.die ? rng.int(it.die) : it.amount }], rng)
          return true
        case 'boon':
          if (s.hero.boon || !rules(s).boons) return false
          s.hero = addItem(s.hero, it.id, -1)
          grantBoon(s)
          return true
        case 'cure':
          if (s.hero.wounds.length === 0) return false
          s.hero = { ...addItem(s.hero, it.id, -1), wounds: s.hero.wounds.slice(1) }
          s.hero = { ...s.hero, hp: Math.min(s.hero.hp, maxHp(s.hero)) }
          log(s, `${it.name}: a Wound is healed.`)
          return true
        default:
          return false
      }
    }

    case 'CALL_MEMBER': {
      const p = s.party[action.index]
      if (!p || p.usedPage || p.hp <= 0) return false
      const def = member(p.defId)
      if (isFollower(def)) return false
      let act
      if (s.partyDice) {
        act = activateWithDice(def, rng)
      } else {
        const drawn = drawCard(s.deck, rng)
        s.deck = drawn.deck
        act = activateWithCard(def, drawn.card)
      }
      const slot = findSlot(s, action.slot)
      const parts: string[] = [`${def.name} ${act.description}`]
      for (const ab of act.triggered) {
        if (ab.effect.type === 'heal') {
          s.hero = heal(s.hero, ab.effect.amount)
          parts.push(`${ab.name}: you recover ${ab.effect.amount} health`)
        } else if (slot && ab.effect.slots.includes(slot.kind)) {
          slot.mods.push({ label: ab.name, value: ab.effect.amount })
          parts.push(`${ab.name}: +${ab.effect.amount} to ${slot.label}`)
        } else {
          parts.push(`${ab.name} triggered, but there was no matching roll`)
        }
      }
      if (act.triggered.length === 0) parts.push('nothing happens')
      let hp = p.hp
      if (act.hurt) {
        hp -= 1
        parts.push(`${def.name} is hurt (−1 health)`)
      }
      if (hp <= 0) {
        s.party = s.party.filter((_, i) => i !== action.index)
        parts.push(`${def.name} has fallen and leaves your party`)
      } else {
        s.party[action.index] = { ...p, hp, usedPage: true }
      }
      log(s, parts.join('; ') + '.')
      return true
    }

    case 'CONFIRM': {
      const pend = s.pending
      if (!pend) return false
      if (pend.type === 'check') {
        const opt = day.steps[pend.step].options[pend.option]
        const total = slotTotal(pend.slot)
        const nat1 = rules(s).boons && isNat1(pend.slot)
        const band = pickBand(opt.bands ?? [{ text: '' }], total, nat1)
        const prefix = nat1 ? 'Natural 1 — automatic failure.' : `You rolled ${total}.`
        s.progress.steps[pend.step] = pend.option
        s.progress.results[pend.step] = `${prefix} ${band.text}`
        s.pending = null
        log(s, `${opt.label}: ${prefix} ${band.text}`)
        if (isNat20(pend.slot)) grantBoon(s)
        applyEffects(s, band.effects, rng)
        return true
      }
      if (pend.type === 'combat') {
        const c = day.combat!
        const r = rules(s)
        const rounds = combatRounds(c.rounds, c.enemies.length, r.combat.groups)
        const staticDefense = r.combat.defense === 'static' ? 10 + stat(s.hero, 'def') : undefined
        const res = resolveRound(s.progress.combat!, pend.slots, rounds, { boons: r.boons, soloStun: r.combat.soloStun, staticDefense })
        s.pending = null
        s.progress.combat = res.combat
        res.lines.forEach((l) => log(s, l))
        if (res.boon) grantBoon(s)
        if (res.damageTaken > 0) s.hero = damage(s.hero, res.damageTaken)
        const died = s.hero.hp <= 0
        checkDeath(s, rng)
        // Dying already ends the fight; don't also apply the win/lose outcome.
        if (s.progress.combat.done && !died) {
          if (s.progress.combat.won) {
            log(s, c.winText)
            applyEffects(s, c.win, rng)
          } else {
            log(s, c.loseText)
            applyEffects(s, c.lose, rng)
          }
        }
        return true
      }
      return false
    }

    case 'ROLL_ROUND': {
      if (!day.combat || s.pending || !stepsDone(s)) return false
      if (!s.progress.combat) {
        s.progress.combat = startCombat(day.combat.enemies)
        log(s, day.combat.intro)
      }
      if (s.progress.combat.done) return false
      s.pending = { type: 'combat', slots: rollRound(s.hero, s.progress.combat, rng, { staticDefense: rules(s).combat.defense === 'static' }) }
      return true
    }

    case 'ICON': {
      const icon = day.icons?.[action.index]
      if (!icon || s.progress.icons[action.index] || s.pending) return false
      if (icon.kind === 'pickpocket') {
        if (rules(s).pickpocket === 'abilityOnly' && !s.hero.abilities.includes('pickpocket')) return false
        s.pending = { type: 'pickpocket', icon: action.index, amount: rng.int(4) }
        return true
      }
      if (!rules(s).lootIcons) return false
      const table = campaign(s.campaignId).lootTable ?? LOOT_TABLE
      const id = table[rng.int(table.length) - 1]
      s.progress.icons[action.index] = true
      s.hero = addItem(s.hero, id)
      log(s, `Hidden cache! You find ${item(id).name}.`)
      return true
    }

    case 'PICKPOCKET': {
      const pend = s.pending
      if (pend?.type !== 'pickpocket') return false
      s.pending = null
      s.progress.icons[pend.icon] = true
      if (!action.take) {
        log(s, 'You leave the purse alone.')
        return true
      }
      s.hero = { ...s.hero, glint: s.hero.glint + pend.amount }
      log(s, `You lift ${pend.amount} ${rules(s).currencyName} from an unattended purse.`)
      if (pend.amount === 4) applyEffects(s, [{ type: 'virtue', amount: -1 }], rng)
      return true
    }

    case 'BUY': {
      const offer = day.shop?.items.find((x) => x.id === action.item)
      if (!offer || s.hero.glint < offer.price || s.pending) return false
      const bought = item(offer.id)
      if (bought.kind === 'upgrade' && itemCount(s.hero, offer.id) >= bought.stackMax) return false
      s.hero = addItem({ ...s.hero, glint: s.hero.glint - offer.price }, offer.id)
      if (item(offer.id).kind === 'gear') s.progress.canChangeGear = true
      log(s, `Bought ${item(offer.id).name} for ${offer.price} ${rules(s).currencyName}.`)
      return true
    }

    case 'SELL': {
      const offer = day.shop?.items.find((x) => x.id === action.item)
      if (!offer || itemCount(s.hero, action.item) <= 0 || s.pending) return false
      const price = sellPrice(offer.price, rules(s).shop.sellRate)
      s.hero = addItem({ ...s.hero, glint: s.hero.glint + price }, offer.id, -1)
      log(s, `Sold ${item(offer.id).name} for ${price} ${rules(s).currencyName}.`)
      return true
    }

    case 'HIRE': {
      if (!day.shop?.hires?.includes(action.member) || s.pending) return false
      const def = member(action.member)
      if (s.hero.glint < def.fee || !canHire(s.party, def)) return false
      if (s.party.some((p) => p.defId === def.id)) return false
      if (isFollower(def)) {
        const hired = hireFollower(s.hero, s.party, def)
        s.hero = hired.hero
        s.party = hired.party
      } else {
        s.hero = { ...s.hero, glint: s.hero.glint - def.fee }
        s.party = [...s.party, { defId: def.id, hp: def.maxHp, usedPage: false }]
      }
      log(s, `${def.name} joins your party (${def.fee} ${rules(s).currencyName}).`)
      return true
    }

    case 'DISMISS': {
      if (!s.progress.rested || !s.party[action.index]) return false
      log(s, `${member(s.party[action.index].defId).name} leaves your party.`)
      s.hero = releaseFollower(s.hero, s.party[action.index])
      s.party = s.party.filter((_, i) => i !== action.index)
      return true
    }

    case 'EQUIP': {
      const it = item(action.item)
      if (it.kind !== 'gear' || !canChangeGear(s) || itemCount(s.hero, it.id) <= 0) return false
      let hero = addItem(s.hero, it.id, -1)
      const old = hero.gear[it.slot]
      if (old) hero = addItem(hero, old)
      hero = { ...hero, gear: { ...hero.gear, [it.slot]: it.id } }
      s.hero = { ...hero, hp: Math.min(hero.hp, maxHp(hero)) }
      log(s, `Equipped ${it.name}.`)
      return true
    }

    case 'UNEQUIP': {
      const id = s.hero.gear[action.slot]
      if (!id || !canChangeGear(s)) return false
      const gear = { ...s.hero.gear }
      delete gear[action.slot]
      const hero = addItem({ ...s.hero, gear }, id)
      s.hero = { ...hero, hp: Math.min(hero.hp, maxHp(hero)) }
      log(s, `Unequipped ${item(id).name}.`)
      return true
    }

    case 'REST': {
      if (!day.rest || s.progress.rested || s.pending) return false
      const labels: [string, string] = [rules(s).conditions.a.label, rules(s).conditions.b.label]
      const r = rest(s.hero, s.party, action.wound, labels)
      s.hero = r.hero
      s.party = r.party
      s.progress.rested = true
      r.lines.forEach((l) => log(s, l))
      s.hero = refillPools(s.hero, rules(s).pools)
      const upkeep = payUpkeep(s.hero, s.party, rules(s).currencyName)
      s.hero = upkeep.hero
      s.party = upkeep.party
      upkeep.lines.forEach((l) => log(s, l))
      return true
    }

    case 'LOTTERY': {
      if (!isLotteryPage(campaign(s.campaignId), s.dayIndex, s.startDate) || s.progress.lottery || s.pending) return false
      const { roll, amount } = lottery(rng)
      s.progress.lottery = true
      s.hero = { ...s.hero, glint: Math.max(0, s.hero.glint + amount) }
      log(s, `Sunday lottery: rolled ${roll}. You ${amount >= 0 ? 'win' : 'lose'} ${Math.abs(amount)} ${rules(s).currencyName}.`)
      return true
    }

    case 'NEXT_DAY': {
      if (!canAdvance(s)) return false
      const camp = campaign(s.campaignId)
      const pages = camp.pages
      // Future pages stay locked until their real date in the play year.
      if (s.dayIndex + 1 < pages.length && !isPageUnlocked(camp, s.dayIndex + 1, s.startDate, action.today)) return false
      s.journal = [...(s.journal ?? []), journalEntry(s)]
      s.dayIndex += 1
      s.hero = { ...s.hero, usedPage: {}, pageBonus: {} }
      s.party = s.party.map((p) => ({ ...p, usedPage: false }))
      s.progress = newProgress(pages[s.dayIndex])
      if (s.dayIndex >= pages.length) {
        s.finished = true
        log(s, 'The first chapter of your story is complete.')
        return true
      }
      if (s.hero.poisoned) {
        s.hero = damage(s.hero, 1)
        log(s, `${rules(s).conditions.a.label}: −1 health.`)
        checkDeath(s, rng)
      }
      return true
    }

    case 'TOGGLE_PARTY_DICE':
      s.partyDice = !s.partyDice
      return true

    default:
      return false
  }
}

