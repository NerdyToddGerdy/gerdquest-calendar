// Ships and dogfights (frontier rules, modeled on the 2023 calendar).
//
// - Aim: roll d100 + Aim against each enemy craft. Reaching its `evade`
//   takes it out — no separate damage roll.
// - Evasion: if a craft survives, roll d100 + Evasion against its Aim.
//   Beat it → it deals its reduced damage; otherwise its full damage.
// - Shield is subtracted from each craft's damage.
// - Every remaining point of damage rolls a d6 to pick a compartment, which
//   loses 1 Integrity. At 0 Integrity its crew and upgrade are destroyed;
//   damage landing on a compartment already at 0 hits the hero instead.
import { craftDef, crewDef, shipDef, upgradeDef } from './content'
import { rollD100, isNat1, slotTotal } from './dice'
import type { Rng } from './rng'
import type {
  Compartment,
  CompartmentId,
  DogfightState,
  Mod,
  RollSlot,
  Ship,
  ShipDef,
  ShipStats,
} from './types'

export const COMPARTMENTS: CompartmentId[] = ['drive', 'helm', 'sickbay', 'guns', 'bunks', 'hold']
export const COMPARTMENT_NAMES: Record<CompartmentId, string> = {
  drive: 'Drive Room',
  helm: 'Helm',
  sickbay: 'Sickbay',
  guns: 'Gun Deck',
  bunks: 'Bunkroom',
  hold: 'Hold',
}

export { craftDef, crewDef, shipDef, upgradeDef }

export function createShip(def: ShipDef): Ship {
  return {
    defId: def.id,
    name: def.name,
    compartments: COMPARTMENTS.map((id) => ({ id, integrity: def.integrity })),
    parts: 0,
  }
}

/** Bonuses a compartment's crew and upgrade give (crew only while the compartment holds). */
function compartmentBonuses(c: Compartment): ShipStats[] {
  const out: ShipStats[] = []
  if (c.crew) out.push(crewDef(c.crew).bonus)
  if (c.upgrade) out.push(upgradeDef(c.upgrade).bonus)
  return out
}

export function maxIntegrity(ship: Ship, id: CompartmentId): number {
  const c = ship.compartments.find((x) => x.id === id)!
  return shipDef(ship.defId).integrity + compartmentBonuses(c).reduce((n, b) => n + (b.integrity ?? 0), 0)
}

/** Effective Aim / Evasion / Shield including crew and upgrades. */
export function shipStat(ship: Ship, key: 'aim' | 'evasion' | 'shield'): number {
  let v = shipDef(ship.defId)[key]
  for (const c of ship.compartments) for (const b of compartmentBonuses(c)) v += b[key] ?? 0
  return v
}

export function startDogfight(craft: string[]): DogfightState {
  return { craft: craft.map((defId) => ({ defId, downed: false })), round: 1, done: false, won: false }
}

/** A d100 slot, rolled as two d10s (tens + ones, "00" + "0" = 100). */
export function d100Slot(rng: Rng, id: string, label: string, kind: 'aim' | 'evasion', mods: Mod[]): RollSlot {
  return { id, label, kind, die: 100, natural: rollD100(rng), mods: mods.filter((m) => m.value !== 0) }
}

/** "73 (70 + 3)" breakdown of a d100 result. */
export function d100Parts(n: number): [number, number] {
  return n === 100 ? [0, 0] : [Math.floor(n / 10) * 10, n % 10]
}

/** `extra` applies to every roll of the volley (e.g. a Malfunction penalty). */
export function rollVolley(ship: Ship, fight: DogfightState, rng: Rng, extra: Mod[] = []): RollSlot[] {
  const slots: RollSlot[] = []
  fight.craft.forEach((c, i) => {
    if (c.downed) return
    const name = craftDef(c.defId).name
    slots.push(d100Slot(rng, `${i}:aim`, `${name} · Aim`, 'aim', [{ label: 'Aim', value: shipStat(ship, 'aim') }, ...extra]))
    slots.push(d100Slot(rng, `${i}:eva`, `${name} · Evasion`, 'evasion', [{ label: 'Evasion', value: shipStat(ship, 'evasion') }, ...extra]))
  })
  return slots
}

export interface VolleyResult {
  fight: DogfightState
  ship: Ship
  /** Damage that spilled onto the hero from wrecked compartments. */
  heroDamage: number
  lines: string[]
}

/** Damage one compartment by 1; returns hero damage (0 or 1) and log lines. */
export function hitCompartment(ship: Ship, id: CompartmentId): { ship: Ship; hero: number; lines: string[] } {
  const lines: string[] = []
  const compartments = ship.compartments.map((c) => ({ ...c }))
  const c = compartments.find((x) => x.id === id)!
  if (c.integrity <= 0) {
    lines.push(`    The ${COMPARTMENT_NAMES[id]} is already wrecked — the hit reaches you (−1 health).`)
    return { ship: { ...ship, compartments }, hero: 1, lines }
  }
  c.integrity -= 1
  lines.push(`    ${COMPARTMENT_NAMES[id]} hit (Integrity ${c.integrity}).`)
  if (c.integrity === 0) {
    if (c.crew) lines.push(`    ${crewDef(c.crew).name} is lost with the ${COMPARTMENT_NAMES[id]}.`)
    if (c.upgrade) lines.push(`    The ${upgradeDef(c.upgrade).name} is destroyed.`)
    delete c.crew
    delete c.upgrade
  }
  return { ship: { ...ship, compartments }, hero: 0, lines }
}

export function resolveVolley(ship: Ship, fight: DogfightState, slots: RollSlot[], maxRounds: number, rng: Rng): VolleyResult {
  const get = (id: string) => slots.find((s) => s.id === id)!
  const craft = fight.craft.map((c) => ({ ...c }))
  let current = ship
  let heroDamage = 0
  const lines = [`Volley ${fight.round}:`]
  // Shield and stats are read before any compartment is hit this volley.
  const shield = shipStat(ship, 'shield')
  craft.forEach((c, i) => {
    if (c.downed) return
    const def = craftDef(c.defId)
    const aim = get(`${i}:aim`)
    const eva = get(`${i}:eva`)
    if (!isNat1(aim) && slotTotal(aim) >= def.evade) {
      c.downed = true
      lines.push(`  ${def.name}: hit (${slotTotal(aim)} vs ${def.evade}) — taken out!`)
      return
    }
    const evaded = slotTotal(eva) > def.aim
    const raw = evaded ? def.reduced : def.dmg
    const dmg = Math.max(0, raw - shield)
    lines.push(
      `  ${def.name}: missed (${slotTotal(aim)} vs ${def.evade}); ${evaded ? 'you evade' : 'it lines up'} (${slotTotal(eva)} vs ${def.aim}) — ${raw} damage, ${shield} shielded, ${dmg} gets through.`,
    )
    for (let n = 0; n < dmg; n++) {
      const hit = hitCompartment(current, COMPARTMENTS[rng.int(6) - 1])
      current = hit.ship
      heroDamage += hit.hero
      lines.push(...hit.lines)
    }
  })
  const allDown = craft.every((c) => c.downed)
  const done = allDown || fight.round >= maxRounds
  return { fight: { craft, round: fight.round + 1, done, won: allDown }, ship: current, heroDamage, lines }
}

/** Spend one Ship Part to restore 1 Integrity (up to the compartment's max). */
export function repair(ship: Ship, id: CompartmentId): Ship | null {
  const c = ship.compartments.find((x) => x.id === id)
  if (!c || ship.parts <= 0 || c.integrity >= maxIntegrity(ship, id)) return null
  return {
    ...ship,
    parts: ship.parts - 1,
    compartments: ship.compartments.map((x) => (x.id === id ? { ...x, integrity: x.integrity + 1 } : x)),
  }
}

/** Restore every compartment by up to `n` Integrity (e.g. a shipyard refit). */
export function repairAll(ship: Ship, n: number): Ship {
  return {
    ...ship,
    compartments: ship.compartments.map((c) => ({ ...c, integrity: Math.min(maxIntegrity(ship, c.id), c.integrity + n) })),
  }
}

/** Crew go into a compartment that has no crew and isn't wrecked; they can't move afterwards. */
export function assignCrew(ship: Ship, crewId: string, id: CompartmentId): Ship | null {
  const c = ship.compartments.find((x) => x.id === id)
  if (!c || c.crew || c.integrity <= 0) return null
  if (ship.compartments.some((x) => x.crew === crewId)) return null
  const next = { ...ship, compartments: ship.compartments.map((x) => (x.id === id ? { ...x, crew: crewId } : x)) }
  return withIntegrityBonus(ship, next, id)
}

/** Fit an upgrade into its compartment, returning the replaced one (if any). */
export function fitUpgrade(ship: Ship, upgradeId: string): { ship: Ship; replaced?: string } | null {
  const def = upgradeDef(upgradeId)
  const c = ship.compartments.find((x) => x.id === def.compartment)!
  if (c.integrity <= 0) return null
  const next = { ...ship, compartments: ship.compartments.map((x) => (x.id === def.compartment ? { ...x, upgrade: upgradeId } : x)) }
  const fitted = withIntegrityBonus(ship, next, def.compartment)
  return { ship: clampIntegrity(fitted), replaced: c.upgrade }
}

export function removeUpgrade(ship: Ship, id: CompartmentId): { ship: Ship; removed: string } | null {
  const c = ship.compartments.find((x) => x.id === id)
  if (!c?.upgrade) return null
  const next = { ...ship, compartments: ship.compartments.map((x) => (x.id === id ? { ...x, upgrade: undefined } : x)) }
  return { ship: clampIntegrity(next), removed: c.upgrade }
}

/** A new Integrity bonus also raises current Integrity by the same amount. */
function withIntegrityBonus(before: Ship, after: Ship, id: CompartmentId): Ship {
  const gain = maxIntegrity(after, id) - maxIntegrity(before, id)
  if (gain <= 0) return after
  return { ...after, compartments: after.compartments.map((x) => (x.id === id ? { ...x, integrity: x.integrity + gain } : x)) }
}

function clampIntegrity(ship: Ship): Ship {
  return { ...ship, compartments: ship.compartments.map((c) => ({ ...c, integrity: Math.min(c.integrity, maxIntegrity(ship, c.id)) })) }
}
