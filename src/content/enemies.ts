import type { EnemyDef } from '../engine/types'

export const ENEMIES: EnemyDef[] = [
  { id: 'fogmite', name: 'Fog-mite', ac: 11, toughness: 4, hits: 12, dmg: 2, text: 'A chittering knot of mist and mandibles.' },
  { id: 'brinecrab', name: 'Brine Crab', ac: 13, toughness: 5, hits: 12, dmg: 3, text: 'Shell crusted with barnacles and old coins.' },
  { id: 'keeper', name: 'The Drowned Keeper', ac: 14, toughness: 7, hits: 14, dmg: 4, text: 'A long-dead bell-ringer, still tolling for a ship that never came home.' },
]
