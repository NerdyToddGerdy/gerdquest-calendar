import { HALCYON_ENTRY } from './meta'
import type { Campaign } from '../../../engine/types'
import { CRAFT, CREW, ENEMIES, ITEMS, SHIPS, UPGRADES } from './gear'
import { ABILITIES, HEROES } from './heroes'
import { PAGES } from './pages'

/**
 * The Halcyon Debt — an original sci-fi campaign on the frontier rules
 * (modeled on the 2023 calendar's format: a Sunday prologue week with one
 * fixed hero, then a choice of six; weekend pages; ship dogfights).
 */
export const halcyon: Campaign = {
  ...HALCYON_ENTRY,
  pages: PAGES,
  inWorldDate: (i) => `Ring-cycle ${412 + i}`,
  content: {
    heroes: HEROES,
    abilities: ABILITIES,
    items: ITEMS,
    enemies: ENEMIES,
    ships: SHIPS,
    crew: CREW,
    upgrades: UPGRADES,
    craft: CRAFT,
  },
}
