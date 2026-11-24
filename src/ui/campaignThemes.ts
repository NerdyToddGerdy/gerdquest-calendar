import type { Scene } from '@questender/engine/types'

/** Look and feel for a campaign's card on the New Campaign screen. */
export interface CampaignTheme {
  /** Which scene art to show as the card's banner. */
  scene: Scene
  /** Short mood line, e.g. "Ocean · lighthouse mystery". */
  mood: string
  /** A few words that hint at what the story is about. */
  tags: string[]
  /** CSS class for the themed card (colors and the ambient effect). */
  className: 'theme-ocean' | 'theme-winter' | 'theme-space' | 'theme-starwake' | 'theme-verdant'
}

export const CAMPAIGN_THEMES: Record<string, CampaignTheme> = {
  brightwatch: { scene: 'harbor', mood: 'Ocean', tags: ['Lighthouse', 'Fog & tides', 'Sea voyage'], className: 'theme-ocean' },
  emberroad: { scene: 'er_stonelit', mood: 'Winter', tags: ['Frozen road', 'Waystones', 'The Long Dark'], className: 'theme-winter' },
  starwake: { scene: 'sw_observatory', mood: 'Sea & stars', tags: ['Fallen star', 'Island-hopping', 'Corsair rival'], className: 'theme-starwake' },
  verdant: { scene: 'va_city', mood: 'Forest & city', tags: ['Ancient pact', 'Caravans & riddles', 'Legacy chapters'], className: 'theme-verdant' },
  halcyon: { scene: 'space', mood: 'Space', tags: ['Starship', 'Debts & pirates', 'Dogfights'], className: 'theme-space' },
}
