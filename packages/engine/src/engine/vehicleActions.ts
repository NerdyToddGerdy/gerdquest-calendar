// Reducer steps for ships and dogfights. Kept apart from state.ts; state.ts
// hands every action here first and uses the result when it isn't undefined.
import { damage } from './hero'
import { rules } from './ruleset'
import type { Rng } from './rng'
import type { CompartmentId, Day, Effect, GameState, Hero } from './types'
import {
  assignCrew,
  COMPARTMENT_NAMES,
  createShip,
  crewDef,
  fitUpgrade,
  removeUpgrade,
  repair,
  repairAll,
  resolveVolley,
  rollVolley,
  shipDef,
  startDogfight,
  upgradeDef,
} from './vehicle'

export type VehicleAction =
  | { type: 'ROLL_VOLLEY' }
  | { type: 'REPAIR'; compartment: CompartmentId }
  | { type: 'HIRE_CREW'; crew: string; compartment: CompartmentId }
  | { type: 'BUY_UPGRADE'; upgrade: string }
  | { type: 'SELL_UPGRADE'; compartment: CompartmentId }
  | { type: 'BUY_PARTS' }

type Draft = GameState & { hero: Hero }

export interface Helpers {
  log: (s: GameState, text: string) => void
  applyEffects: (s: Draft, effects: Effect[] | undefined, rng: Rng) => void
  checkDeath: (s: Draft, rng: Rng) => void
}

export function dogfightInProgress(s: GameState): boolean {
  return !!s.progress.dogfight && !s.progress.dogfight.done
}

/** May the ship be worked on right now (repairs, refits)? Not mid-dogfight. */
export function canWorkOnShip(s: GameState): boolean {
  return !!s.ship && !s.pending && !dogfightInProgress(s)
}

/** The page's dogfight (if any) is finished. Without a ship there's nothing to fight with. */
export function dogfightDone(s: GameState, day: Day): boolean {
  return !day.dogfight || !s.ship || !!s.progress.dogfight?.done
}

/** The `ship` effect: give a ship, add Ship Parts, or repair everything. */
export function applyShipEffect(s: Draft, e: Extract<Effect, { type: 'ship' }>, h: Helpers) {
  if (e.give) {
    s.ship = createShip(shipDef(e.give))
    h.log(s, `You take command of the ${s.ship.name}.`)
  }
  if (!s.ship) return
  if (e.parts) {
    s.ship = { ...s.ship, parts: s.ship.parts + e.parts }
    h.log(s, `+${e.parts} Ship Part${e.parts === 1 ? '' : 's'}.`)
  }
  if (e.repair) {
    s.ship = repairAll(s.ship, e.repair)
    h.log(s, `The ${s.ship.name} is patched up (+${e.repair} Integrity everywhere).`)
  }
}

/** Handle vehicle actions (and CONFIRM of a pending volley). Undefined = not ours. */
export function stepVehicle(s: Draft, day: Day, action: { type: string }, rng: Rng, h: Helpers): boolean | undefined {
  const a = action as VehicleAction | { type: 'CONFIRM' }
  const cur = rules(s).currencyName
  switch (a.type) {
    case 'ROLL_VOLLEY': {
      const df = day.dogfight
      if (!df || !s.ship || s.pending || s.progress.steps.some((x) => x === null)) return false
      if (!s.progress.dogfight) {
        s.progress.dogfight = startDogfight(df.craft)
        h.log(s, df.intro)
      }
      if (s.progress.dogfight.done) return false
      // Malfunction (frontier's second condition) also throws off ship systems: −10 to Aim and Evasion.
      const extra = s.hero.cursed ? [{ label: rules(s).conditions.b.label, value: -10 }] : []
      s.pending = { type: 'dogfight', slots: rollVolley(s.ship, s.progress.dogfight, rng, extra) }
      return true
    }

    case 'CONFIRM': {
      if (s.pending?.type !== 'dogfight' || !s.ship || !day.dogfight) return undefined
      const df = day.dogfight
      const res = resolveVolley(s.ship, s.progress.dogfight!, s.pending.slots, df.rounds, rng)
      s.pending = null
      s.ship = res.ship
      s.progress.dogfight = res.fight
      res.lines.forEach((l) => h.log(s, l))
      if (res.heroDamage > 0) s.hero = damage(s.hero, res.heroDamage)
      const died = s.hero.hp <= 0
      h.checkDeath(s, rng)
      if (died && !s.progress.dogfight.done) {
        s.progress.dogfight = { ...s.progress.dogfight, done: true, won: false }
        h.log(s, 'You come to after the fight. The enemy is gone.')
      }
      if (s.progress.dogfight.done && !died) {
        h.log(s, s.progress.dogfight.won ? df.winText : df.loseText)
        h.applyEffects(s, s.progress.dogfight.won ? df.win : df.lose, rng)
      }
      return true
    }

    case 'REPAIR': {
      if (!canWorkOnShip(s)) return false
      const next = repair(s.ship!, a.compartment)
      if (!next) return false
      s.ship = next
      h.log(s, `Ship Part used: ${COMPARTMENT_NAMES[a.compartment]} repaired.`)
      return true
    }

    case 'HIRE_CREW': {
      if (!canWorkOnShip(s) || !day.dock?.crew?.includes(a.crew)) return false
      const def = crewDef(a.crew)
      if (s.hero.glint < def.fee) return false
      const next = assignCrew(s.ship!, a.crew, a.compartment)
      if (!next) return false
      s.ship = next
      s.hero = { ...s.hero, glint: s.hero.glint - def.fee }
      h.log(s, `${def.name} joins the crew in the ${COMPARTMENT_NAMES[a.compartment]} (${def.fee} ${cur}).`)
      return true
    }

    case 'BUY_UPGRADE': {
      const offer = day.dock?.upgrades?.find((u) => u.id === a.upgrade)
      if (!canWorkOnShip(s) || !offer || s.hero.glint < offer.price) return false
      const fitted = fitUpgrade(s.ship!, a.upgrade)
      if (!fitted) return false
      s.ship = fitted.ship
      s.hero = { ...s.hero, glint: s.hero.glint - offer.price }
      h.log(s, `Fitted the ${upgradeDef(a.upgrade).name} (${offer.price} ${cur}).`)
      if (fitted.replaced) {
        // The old upgrade is sold back at full price.
        const back = upgradeDef(fitted.replaced).price
        s.hero = { ...s.hero, glint: s.hero.glint + back }
        h.log(s, `Sold the old ${upgradeDef(fitted.replaced).name} for ${back} ${cur}.`)
      }
      return true
    }

    case 'SELL_UPGRADE': {
      // Upgrades resell at full price, but only to a dock that deals in upgrades.
      if (!canWorkOnShip(s) || !day.dock?.upgrades?.length) return false
      const out = removeUpgrade(s.ship!, a.compartment)
      if (!out) return false
      const price = upgradeDef(out.removed).price
      s.ship = out.ship
      s.hero = { ...s.hero, glint: s.hero.glint + price }
      h.log(s, `Sold the ${upgradeDef(out.removed).name} for ${price} ${cur}.`)
      return true
    }

    case 'BUY_PARTS': {
      const price = day.dock?.partsPrice
      if (!canWorkOnShip(s) || price === undefined || s.hero.glint < price) return false
      s.ship = { ...s.ship!, parts: s.ship!.parts + 1 }
      s.hero = { ...s.hero, glint: s.hero.glint - price }
      h.log(s, `Bought a Ship Part (${price} ${cur}).`)
      return true
    }

    default:
      return undefined
  }
}
