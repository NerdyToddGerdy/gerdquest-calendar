// Registry that lets the engine look up content definitions by id.
import { ABILITIES } from '../content/abilities'
import { ENEMIES } from '../content/enemies'
import { HEROES } from '../content/heroes'
import { ITEMS } from '../content/items'
import { MEMBERS } from '../content/members'
import { CAMPAIGNS } from '../content/campaigns'
import type { AbilityDef, Campaign, ContentPack, EnemyDef, HeroDef, ItemDef, MemberDef } from './types'

/** Base content plus every campaign's own pack. */
function all<T>(key: keyof ContentPack, base: T[]): T[] {
  return [...base, ...CAMPAIGNS.flatMap((c) => (c.content?.[key] ?? []) as T[])]
}

function lookup<T extends { id: string }>(list: T[], what: string) {
  const map = new Map<string, T>()
  for (const x of list) {
    if (map.has(x.id)) throw new Error(`Duplicate ${what} id: ${x.id}`)
    map.set(x.id, x)
  }
  return (id: string): T => {
    const v = map.get(id)
    if (!v) throw new Error(`Unknown ${what}: ${id}`)
    return v
  }
}

export const ability = lookup<AbilityDef>(all('abilities', ABILITIES), 'ability')
export const item = lookup<ItemDef>(all('items', ITEMS), 'item')
export const enemy = lookup<EnemyDef>(all('enemies', ENEMIES), 'enemy')
export const heroDef = lookup<HeroDef>(all('heroes', HEROES), 'hero')
export const member = lookup<MemberDef>(all('members', MEMBERS), 'party member')

/** Heroes offered when starting a campaign. */
export function campaignHeroes(c: Campaign): HeroDef[] {
  return (c.heroIds ?? HEROES.map((h) => h.id)).map(heroDef)
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
