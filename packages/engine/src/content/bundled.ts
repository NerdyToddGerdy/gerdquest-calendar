// The bundled free campaigns, registered with the engine at runtime.
//
// Importing this module registers the shared base content and every bundled
// campaign's small catalog entry, and says how to fetch each campaign's pack
// (its pages and own content) with a dynamic import(), so bundlers emit one
// chunk per campaign. Nothing here loads a pack: call loadCampaign(id) first.
import { registerCampaignLoader, registerCatalog } from '../engine/campaign'
import { registerContent } from '../engine/content'
import type { CampaignEntry } from '../engine/types'
import { ABILITIES } from './abilities'
import { ENEMIES } from './enemies'
import { HEROES } from './heroes'
import { ITEMS } from './items'
import { MEMBERS } from './members'
import { BRIGHTWATCH_ENTRY } from './campaigns/brightwatch/meta'
import { EMBER_ROAD_ENTRY } from './campaigns/emberroad/meta'
import { HALCYON_ENTRY } from './campaigns/halcyon/meta'
import { STARWAKE_ENTRY } from './campaigns/starwake/meta'
import { VERDANT_ENTRY } from './campaigns/verdant/meta'
import { SANTA_ENTRY } from './campaigns/santa/meta'

/** Every bundled campaign's catalog entry, in menu order. Add new campaigns here. */
export const BUNDLED_CATALOG: CampaignEntry[] = [BRIGHTWATCH_ENTRY, EMBER_ROAD_ENTRY, HALCYON_ENTRY, STARWAKE_ENTRY, VERDANT_ENTRY, SANTA_ENTRY]

registerContent('base', { abilities: ABILITIES, enemies: ENEMIES, heroes: HEROES, items: ITEMS, members: MEMBERS })
for (const e of BUNDLED_CATALOG) registerCatalog(e)
registerCampaignLoader('brightwatch', () => import('./campaigns/brightwatch').then((m) => m.brightwatch))
registerCampaignLoader('emberroad', () => import('./campaigns/emberroad').then((m) => m.emberRoad))
registerCampaignLoader('halcyon', () => import('./campaigns/halcyon').then((m) => m.halcyon))
registerCampaignLoader('starwake', () => import('./campaigns/starwake').then((m) => m.starwake))
registerCampaignLoader('verdant', () => import('./campaigns/verdant').then((m) => m.verdant))
registerCampaignLoader('santa', () => import('./campaigns/santa').then((m) => m.santa))
