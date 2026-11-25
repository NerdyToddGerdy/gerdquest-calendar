// Runtime registry that lets the engine look up content definitions by id.
//
// Nothing is registered until something calls registerContent / registerCampaign
// (the bundled free campaigns do that from `@questender/engine/content/bundled`).
// Lookups are synchronous; looking up something from a pack that was never
// registered throws, so async callers must load packs before calling the engine.
import type {
  AbilityDef,
  Campaign,
  CampaignEntry,
  ContentPack,
  CraftDef,
  CrewDef,
  EnemyDef,
  HeroDef,
  ItemDef,
  MemberDef,
  ShipDef,
  ShipUpgradeDef,
} from './types'

type Kind = keyof ContentPack

const WHAT: Record<Kind, string> = {
  abilities: 'ability',
  items: 'item',
  enemies: 'enemy',
  heroes: 'hero',
  members: 'party member',
  ships: 'ship',
  crew: 'crew member',
  upgrades: 'ship upgrade',
  craft: 'enemy craft',
}

const tables = new Map<Kind, Map<string, { id: string }>>()
const packs = new Map<string, ContentPack>()

function table(kind: Kind) {
  let t = tables.get(kind)
  if (!t) tables.set(kind, (t = new Map()))
  return t
}

/**
 * Add a pack of definitions under a key (a campaign id, or "base"). Registering
 * the same key again is a no-op; a different pack reusing an existing id throws
 * and registers nothing.
 */
export function registerContent(key: string, pack: ContentPack): void {
  if (packs.has(key)) return
  const kinds = Object.keys(pack) as Kind[]
  for (const kind of kinds) {
    const seen = new Set<string>()
    for (const x of (pack[kind] ?? []) as { id: string }[]) {
      if (table(kind).has(x.id) || seen.has(x.id)) throw new Error(`Duplicate ${WHAT[kind]} id: ${x.id}`)
      seen.add(x.id)
    }
  }
  for (const kind of kinds) for (const x of (pack[kind] ?? []) as { id: string }[]) table(kind).set(x.id, x)
  packs.set(key, pack)
}

function lookup<T extends { id: string }>(kind: Kind) {
  return (id: string): T => {
    const v = table(kind).get(id) as T | undefined
    if (!v) throw new Error(`Unknown ${WHAT[kind]}: ${id} (is its campaign loaded?)`)
    return v
  }
}

export const ability = lookup<AbilityDef>('abilities')
export const item = lookup<ItemDef>('items')
export const enemy = lookup<EnemyDef>('enemies')
export const heroDef = lookup<HeroDef>('heroes')
export const member = lookup<MemberDef>('members')
export const shipDef = lookup<ShipDef>('ships')
export const crewDef = lookup<CrewDef>('crew')
export const upgradeDef = lookup<ShipUpgradeDef>('upgrades')
export const craftDef = lookup<CraftDef>('craft')

/** Display names of every registered definition (heroes, enemies, items…), for the save format's name table. */
export function contentNames(): string[] {
  const out = new Set<string>()
  for (const t of tables.values()) for (const x of t.values()) {
    const name = (x as { name?: unknown }).name
    if (typeof name === 'string' && name.length >= 3) out.add(name)
  }
  return [...out]
}

/** The shared base heroes (registered under the key "base"): the default roster when a campaign names none. */
export function baseHeroIds(): string[] {
  return (packs.get('base')?.heroes ?? []).map((h) => h.id)
}

/** Heroes offered when starting a campaign. */
export function campaignHeroes(c: CampaignEntry): HeroDef[] {
  return (c.heroIds ?? baseHeroIds()).map(heroDef)
}

/** In-world date shown under the real calendar date. */
export function dayLabel(c: Campaign, index: number) {
  return { date: c.inWorldDate ? c.inWorldDate(index) : `Firstfrost ${index + 1}` }
}

/** Default d10 loot table for hidden backpack icons (campaigns may override). */
export const LOOT_TABLE = [
  'ration',
  'emberflask',
  'ironbrew',
  'wardsalve',
  'bramblenut',
  'quickmoss',
  'hearthroot',
  'owlcap',
  'stillleaf',
  'luckglass',
]
