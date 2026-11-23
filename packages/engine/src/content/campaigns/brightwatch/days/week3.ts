// Week 3 — Corin Vale, Gutter Charmer: the Saltmarket.
import type { Day } from '../../../../engine/types'
import { trialIntro, WEEKEND_MARKET } from './helpers'

export const WEEK3: Day[] = [
  {
    id: 'w3-saltmarket',
    month: 1,
    day: 15,
    title: 'The Saltmarket',
    scene: 'harbor',
    text:
      'Down the coast, the dock town of Saltmarket never sleeps. Corin Vale owes money to half of it. This morning someone is selling “fogglass” on the quay — lenses that glitter like frost — and Hale wants to know where it comes from.',
    note: 'This week you play Corin Vale. Do each task in order.',
    steps: [
      trialIntro('corin', 'Take up Corin’s story', 'Corin pulls his hood up, grins, and slips into the crowd.'),
      {
        title: '2. Work the crowd',
        options: [
          {
            label: 'Chat up the fogglass sellers',
            check: { trait: 'cha', tags: ['social'] },
            bands: [
              { max: 10, text: 'They clam up the moment you mention the warden’s pass.' },
              { min: 11, text: 'One of them lets slip that the glass comes from “the Gull Syndicate’s boats.”', effects: [{ type: 'pageBonus', stat: 'roll', amount: 1 }] },
            ],
          },
        ],
      },
    ],
    icons: [{ kind: 'pickpocket', x: 30, y: 72 }],
    shop: { items: [{ id: 'ration', price: 1 }, { id: 'ironbrew', price: 3 }, { id: 'bw-fogglass', price: 16 }] },
  },
  {
    id: 'w3-cards',
    month: 1,
    day: 16,
    title: 'A Hand of Cards',
    scene: 'inn',
    text:
      'The Syndicate’s quartermaster plays cards every night at the Leaky Lantern. Corin knows the game. Corin also knows how to win it in ways the rules don’t mention.',
    note: 'Choose how you play.',
    steps: [
      {
        options: [
          {
            label: 'A) Play it straight',
            check: { trait: 'wis' },
            bands: [
              { max: 11, text: 'You lose three hands and your dignity.', effects: [{ type: 'glint', amount: -2 }] },
              { min: 12, text: 'You win fair and square. The quartermaster respects that, and talks.', effects: [{ type: 'glint', amount: 3 }, { type: 'virtue', amount: 1 }] },
            ],
          },
          {
            label: 'B) Palm a card or two',
            check: { trait: 'dex', tags: ['stealth'] },
            bands: [
              { max: 11, text: 'A card slides out of your sleeve at the worst moment. You leave quickly.', effects: [{ type: 'damage', amount: 2 }] },
              { min: 12, text: 'You clean him out. He’s drunk enough to brag about a warehouse on Gull Row.', effects: [{ type: 'glint', amount: 5 }, { type: 'virtue', amount: -1 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'w3-warehouse',
    month: 1,
    day: 17,
    title: 'Gull Row',
    scene: 'cellar',
    text:
      'The warehouse on Gull Row is full of crates stamped with a gull in a circle. Inside them, packed in seaweed, are raw chunks of fogglass — still cold, still faintly steaming.',
    note: 'Do both tasks.',
    steps: [
      {
        title: '1. Get inside',
        options: [
          {
            label: 'Slip past the night watch',
            check: { trait: 'dex', tags: ['stealth'] },
            bands: [
              { max: 10, text: 'A guard dog finds you. You find a window. Both of you are unhappy.', effects: [{ type: 'damage', amount: 1 }] },
              { min: 11, text: 'You’re a shadow among shadows.' },
            ],
          },
        ],
      },
      {
        title: '2. Read the ledgers',
        options: [
          {
            label: 'Find out where the glass is gathered',
            check: { trait: 'int' },
            bands: [
              { max: 10, text: 'The ledgers are in a cipher you can’t crack tonight.' },
              { min: 11, text: 'The glass is harvested at low tide from the reef — right where the second bell is marked on Isolde’s map.', effects: [{ type: 'glint', amount: 2 }] },
            ],
          },
        ],
      },
    ],
    icons: [{ kind: 'loot', x: 74, y: 58 }],
  },
  {
    id: 'w3-rooftops',
    month: 1,
    day: 18,
    title: 'Over the Rooftops',
    scene: 'harbor',
    text:
      'Someone saw you leave Gull Row. By morning, Syndicate runners are asking after a hooded card sharp. You need to get the ledgers back to Brightwatch.',
    note: 'Choose a route.',
    steps: [
      {
        options: [
          {
            label: 'A) Run the rooftops',
            check: { trait: 'dex', tags: ['physical'] },
            bands: [
              { max: 10, text: 'A gutter gives way. You land in a rain barrel and keep running, soaked.', effects: [{ type: 'damage', amount: 2 }] },
              { min: 11, text: 'You leap the last gap and leave the runners swearing on the far side.' },
            ],
          },
          {
            label: 'B) Talk your way onto a fishing boat',
            check: { trait: 'cha', tags: ['social'] },
            bands: [
              { max: 10, text: 'The skipper takes your money and your boots.', effects: [{ type: 'glint', amount: -2 }] },
              { min: 11, text: 'The skipper hates the Syndicate more than you do. You sail home for free.', effects: [{ type: 'virtue', amount: 1 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'w3-thugs',
    month: 1,
    day: 19,
    title: 'Paid by the Bruise',
    scene: 'harbor',
    text:
      'The Syndicate catches up with you on the Brightwatch causeway. Two thugs block the way, cracking their knuckles, while a third waits to see how it goes.',
    note: 'Fight for up to 3 rounds.',
    steps: [],
    combat: {
      enemies: ['bw-dockThug', 'bw-dockThug'],
      rounds: 3,
      intro: 'The thugs close in.',
      winText: 'The thugs end up in the harbor. The third one decides he was never there.',
      loseText: 'They take your purse but miss the ledgers sewn into your coat lining.',
      win: [{ type: 'glint', amount: 4 }],
      lose: [{ type: 'glint', amount: -3 }],
    },
  },
  {
    id: 'w3-deal',
    month: 1,
    day: 20,
    span: 2,
    title: 'The Syndicate’s Price',
    scene: 'inn',
    text:
      'The Gull Syndicate’s boss sends word: she’ll trade. Her harvesters have started coming home strange — quiet, cold, sleepwalking. Something on the reef is getting into them. She wants it to stop as badly as Hale does.',
    note: 'Strike a deal, then rest. Companions are for hire this weekend.',
    rest: true,
    steps: [
      {
        options: [
          {
            label: 'A) Trade the ledgers for safe passage on the reef',
            result: 'She agrees. The Syndicate will not stand in the wardens’ way — for now.',
            effects: [{ type: 'virtue', amount: 1 }],
          },
          {
            label: 'B) Sell the ledgers back to her',
            result: 'She pays well. Hale will be less pleased.',
            effects: [{ type: 'glint', amount: 8 }, { type: 'virtue', amount: -1 }],
          },
        ],
      },
    ],
    shop: { items: WEEKEND_MARKET, hires: ['nettle', 'pip'] },
  },
]
