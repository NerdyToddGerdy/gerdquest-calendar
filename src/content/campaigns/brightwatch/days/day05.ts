import type { Day } from '../../../../engine/types'

export const day05: Day = {
  id: 'fogmites',
  month: 1,
  day: 5,
  title: 'Fog-mites',
  scene: 'depths',
  text:
    'The tunnel runs in both directions farther than your lantern can reach. Then the scratching stops. In the dark ahead, pale eyes open — dozens of them — and three shapes of knotted mist scuttle toward you.',
  note: 'Fight for up to 3 rounds. Each round you roll Attack, Damage and Defense against every enemy still standing.',
  steps: [],
  combat: {
    enemies: ['fogmite', 'fogmite', 'fogmite'],
    rounds: 3,
    intro: 'The fog-mites attack!',
    winText: 'The last fog-mite bursts into harmless vapor. Among the remains you find a scatter of coins.',
    loseText: 'The surviving fog-mites scatter into side passages, nipping at you as they go.',
    win: [{ type: 'glint', amount: 3 }],
    lose: [{ type: 'damage', amount: 1 }],
  },
  icons: [{ kind: 'loot', x: 22, y: 30 }],
}
