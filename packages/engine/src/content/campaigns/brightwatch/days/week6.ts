// Week 6 — Jory Saltmarsh, Dockyard Brawler: Brightwatch under siege.
import type { Day } from '../../../../engine/types'
import { trialIntro, WEEKEND_MARKET } from './helpers'

export const WEEK6: Day[] = [
  {
    id: 'w6-fog-rolls-in',
    month: 2,
    day: 5,
    title: 'The Fog Rolls In',
    scene: 'harbor',
    text:
      'On a still morning the fog comes in off the reef like a wall and does not stop at the shore. It climbs the quay steps. It fills the streets. The lamp burns, but its beam ends a stone’s throw from the tower. Jory Saltmarsh is unloading a barge when the shouting starts.',
    note: 'This week you play Jory Saltmarsh. Do each task in order.',
    steps: [
      trialIntro('bw-jory', 'Take up Jory’s story', 'Jory drops the crate she’s holding, picks up her cargo hook, and runs toward the noise.'),
      {
        title: '2. Get people off the quay',
        options: [
          {
            label: 'Herd the dockhands up to the fortress',
            check: { trait: 'str', tags: ['physical'] },
            bands: [
              { max: 10, text: 'You drag the last stragglers in by their collars and take a few elbows doing it.', effects: [{ type: 'damage', amount: 1 }] },
              { min: 11, text: 'Everyone is inside the walls before the fog reaches the gate.', effects: [{ type: 'virtue', amount: 1 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'w6-barricades',
    month: 2,
    day: 6,
    title: 'Barricades',
    scene: 'tower',
    text: 'Hale orders the lower gates barricaded. Things are moving in the fog — many-legged things, and taller things that walk like people.',
    note: 'Do both tasks.',
    steps: [
      {
        title: '1. Build the barricade',
        options: [
          {
            label: 'Stack crates and barrels across the gate',
            check: { trait: 'str', tags: ['physical'] },
            bands: [
              { max: 10, text: 'The barricade wobbles. So do you, after lifting most of it.', effects: [{ type: 'damage', amount: 2 }] },
              { min: 11, text: 'A wall of cargo three crates high. Nothing is getting through quietly.', effects: [{ type: 'pageBonus', stat: 'def', amount: 1 }] },
            ],
          },
        ],
      },
      {
        title: '2. Arm the dockhands',
        options: [
          {
            label: 'Hand out hooks, oars and courage',
            check: { trait: 'cha', tags: ['social'] },
            bands: [
              { max: 10, text: 'They take the hooks. The courage is harder to give away.' },
              { min: 11, text: '“If Jory’s staying, we’re staying.” Twenty dockhands take the wall with you.', effects: [{ type: 'virtue', amount: 1 }] },
            ],
          },
        ],
      },
    ],
    icons: [{ kind: 'loot', x: 80, y: 74 }],
  },
  {
    id: 'w6-oil',
    month: 2,
    day: 7,
    title: 'The Oil Runs Low',
    scene: 'cellar',
    text: 'The great lamp is burning oil twice as fast against the fog. The reserve casks are in the oil yard — outside the barricade.',
    note: 'Choose how to fetch the oil.',
    steps: [
      {
        options: [
          {
            label: 'A) Haul the casks back yourself, two at a time',
            check: { trait: 'con', tags: ['physical'] },
            bands: [
              { max: 11, text: 'Things snap at you from the fog on every trip.', effects: [{ type: 'damage', amount: 3 }] },
              { min: 12, text: 'Your back will never forgive you, but the lamp is fed.', effects: [{ type: 'damage', amount: 1 }, { type: 'virtue', amount: 1 }] },
            ],
          },
          {
            label: 'B) Rig a chain of dockhands to pass them hand to hand',
            check: { trait: 'cha', tags: ['social'] },
            bands: [
              { max: 11, text: 'The chain breaks twice in the fog. It works, slowly.', effects: [{ type: 'damage', amount: 1 }] },
              { min: 12, text: 'The casks roll in, one after another, like clockwork.', effects: [{ type: 'virtue', amount: 1 }, { type: 'glint', amount: 2 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'w6-the-wall',
    month: 2,
    day: 8,
    title: 'Hold the Wall',
    scene: 'tower',
    text: 'All night, the barricade shudders. Isolde shouts from the tower that the fog is pulsing — like a heartbeat, getting faster.',
    note: 'Do both tasks.',
    steps: [
      {
        title: '1. Keep watch',
        options: [
          {
            label: 'Watch the fog for the next attack',
            check: { trait: 'wis', tags: ['perception'] },
            bands: [
              { max: 10, text: 'They come at you out of nowhere.', effects: [{ type: 'damage', amount: 1 }] },
              { min: 11, text: 'You call the attack before it comes. The defenders are ready.' },
            ],
          },
        ],
      },
      {
        title: '2. Grab some rest',
        options: [
          {
            label: 'Sleep sitting up against the barricade',
            result: 'You doze for an hour with your hook across your knees.',
            effects: [{ type: 'heal', amount: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'w6-swarm',
    month: 2,
    day: 9,
    title: 'The Swarm at the Gate',
    scene: 'harbor',
    text: 'Before dawn the fog-mites come all at once, a tide of chittering mist that pours over the barricade.',
    note: 'Fight for up to 3 rounds.',
    steps: [],
    combat: {
      enemies: ['fogmite', 'fogmite', 'fogmite'],
      rounds: 3,
      intro: 'The fog-mites swarm the barricade!',
      winText: 'The swarm breaks against the gate and boils away. In the quiet afterward, everyone hears it: a bell, tolling far out at sea.',
      loseText: 'The swarm pulls back into the fog on its own — as if called. Far out at sea, a bell tolls.',
      win: [{ type: 'glint', amount: 4 }],
      lose: [{ type: 'damage', amount: 1 }],
    },
  },
  {
    id: 'w6-pale-herald',
    month: 2,
    day: 10,
    span: 2,
    title: 'The Pale Herald',
    scene: 'tower',
    text:
      'It walks up out of the sea on the second night: a giant shape of fog wearing a crown of drowned bells. Every step rings. It comes for the lamp — and all six wardens are on the tower stairs to meet it. But it’s Jory who stands in the doorway.',
    note: 'Choose how to meet it, then fight for up to 5 rounds. Afterwards, rest.',
    rest: true,
    steps: [
      {
        options: [
          {
            label: 'A) Turn the great lamp’s beam onto it',
            check: { trait: 'str', tags: ['physical'] },
            bands: [
              { max: 11, text: 'The lamp housing is too heavy to swing in time.' },
              { min: 12, text: 'The beam swings round and strikes it full in the face. Fog boils off it in sheets.', effects: [{ type: 'pageBonus', stat: 'dmg', amount: 2 }] },
            ],
          },
          {
            label: 'B) Let the other wardens rally behind you',
            check: { trait: 'cha', tags: ['social'] },
            bands: [
              { max: 11, text: 'Everyone shouts at once. You go in alone anyway.' },
              { min: 12, text: 'Wren’s halberd, Isolde’s tide, Corin’s knives, Ottilie’s prayer and Hask’s arrows all strike with you.', effects: [{ type: 'pageBonus', stat: 'atk', amount: 2 }, { type: 'pageBonus', stat: 'def', amount: 1 }] },
            ],
          },
        ],
      },
    ],
    combat: {
      enemies: ['bw-paleHerald'],
      rounds: 5,
      intro: 'The Pale Herald raises an arm of fog, and every bell in its crown rings at once.',
      winText:
        'The Herald comes apart in the lamp’s light, and its bells fall clattering down the stairs. The fog pulls back to the reef. Brightwatch has held — but the herald was only a messenger.',
      loseText:
        'At dawn the Herald turns and walks back into the sea, unhurried, as if it has delivered its message. The fog pulls back to the reef. Brightwatch has held, barely.',
      win: [{ type: 'glint', amount: 10 }, { type: 'item', id: 'bw-fogglass' }],
      lose: [{ type: 'damage', amount: 2 }],
    },
    shop: { items: [...WEEKEND_MARKET, { id: 'dawndew', price: 12 }, { id: 'wardencoat', price: 12 }] },
  },
]
