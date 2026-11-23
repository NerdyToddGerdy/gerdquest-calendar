import type { Campaign } from '../../engine/types'
import { brightwatch } from './brightwatch'
import { emberRoad } from './emberroad'
import { halcyon } from './halcyon'

/** Every playable campaign. Add new campaigns here. */
export const CAMPAIGNS: Campaign[] = [brightwatch, emberRoad, halcyon]
