import type { Campaign } from '../../../engine/types'
import { CRAFT, CREW, ENEMIES, ITEMS, SHIPS, UPGRADES } from './gear'
import { ABILITIES, CREW_LEADS, HEROES } from './heroes'
import { PAGES } from './pages'

/**
 * The Halcyon Debt — an original sci-fi campaign on the frontier rules
 * (modeled on the 2023 calendar's format: a Sunday prologue week with one
 * fixed hero, then a choice of six; weekend pages; ship dogfights).
 */
export const halcyon: Campaign = {
  id: 'halcyon',
  title: 'The Halcyon Debt',
  blurb: 'A courier, a stolen data core, and a dented long-hauler racing a pirate captain across the Shoal.',
  authoredYear: 2023,
  rulesetId: 'frontier',
  pages: PAGES,
  // Pages 0–5 (Sun Jan 1 – Fri Jan 6) are the prologue; the lottery starts after.
  prologuePages: 6,
  startHero: 'hd_juniper',
  heroIds: CREW_LEADS,
  startItems: { ration: 2, hd_medgel: 1 },
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
