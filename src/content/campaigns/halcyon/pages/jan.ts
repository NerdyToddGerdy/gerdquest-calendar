// The Halcyon Debt — January (the prologue and the first arc). Pages 0–5 are the prologue.

import type { Day } from '../../../../engine/types'
import { CREW_LEADS, HEROES } from '../heroes'

const jan = (day: number, page: Omit<Day, 'month' | 'day'>): Day => ({ month: 1, day, ...page })

const leadOption = (id: string) => {
  const h = HEROES.find((x) => x.id === id)!
  return {
    label: `${h.name} — ${h.title}`,
    result: `Juniper hands ${h.name} the core and the captain’s chair. “You know this life better than I do.”`,
    effects: [{ type: 'setHero' as const, heroId: id, carry: ['glint' as const, 'inventory' as const, 'gear' as const] }],
  }
}

export const JAN: Day[] = [
  // ---------------- Prologue (Juniper) ----------------
  jan(1, {
    id: 'hd-parcel',
    title: 'A Parcel at Shift-Change',
    scene: 'station',
    text: 'Tollgate Ring never sleeps, but at shift-change it blinks. That is when a stranger in a rented pressure suit presses a sealed data core into your hands, pays triple, and says only: “Don’t let it reach Vell.” Then the stranger walks into an airlock and cycles it.',
    note: 'Prologue: you play Juniper Okafor until the crew forms.',
    steps: [
      {
        title: 'The core',
        options: [
          {
            label: 'Inspect the seal without breaking it',
            check: { trait: 'int', tags: ['lore'] },
            bands: [
              { max: 10, text: 'Military-grade casing. That’s all you can tell — and that’s plenty to worry about.' },
              { min: 11, text: 'The seal carries a survey-guild mark from a claim that “never existed.” Someone found something out in the Shoal.', effects: [{ type: 'virtue', amount: 1 }] },
            ],
          },
        ],
      },
    ],
  }),
  jan(2, {
    id: 'hd-inspection',
    title: 'Dock Inspection',
    scene: 'station',
    text: 'Ring security is suddenly very interested in couriers. A checkpoint has gone up between you and your bunk, and the inspector is turning out every bag.',
    note: 'Choose one way past the checkpoint.',
    steps: [
      {
        options: [
          {
            label: 'A) Slip through the maintenance crawlway',
            check: { trait: 'dex', tags: ['stealth'] },
            bands: [
              { max: 10, text: 'You snag your sleeve on a vent grille and leave skin behind.', effects: [{ type: 'damage', amount: 1 }] },
              { min: 11, text: 'You come out behind the checkpoint, dusty and unseen.' },
            ],
          },
          {
            label: 'B) Bluff with an old priority-courier pass',
            check: { trait: 'cha', tags: ['social'] },
            bands: [
              { max: 10, text: 'The inspector fines you for an expired pass but waves you on.', effects: [{ type: 'glint', amount: -2 }] },
              { min: 11, text: 'The inspector salutes. You almost feel bad.' },
            ],
          },
        ],
      },
    ],
    icons: [{ kind: 'pickpocket', x: 70, y: 62 }],
  }),
  jan(3, {
    id: 'hd-ducts',
    title: 'Scrappers in the Ducts',
    scene: 'station',
    text: 'Your bunk has been tossed. Two scrappers are still inside, torches lit, and they’ve heard the core is worth a ship.',
    note: 'Fight for up to 3 rounds.',
    steps: [],
    combat: {
      enemies: ['hd_scrapper', 'hd_scrapper'],
      rounds: 3,
      intro: 'The scrappers turn their torches on you.',
      winText: 'The scrappers flee down the ducts, leaving a credit stick behind.',
      loseText: 'The scrappers get a few burns in before station alarms scare them off.',
      win: [{ type: 'glint', amount: 3 }],
      lose: [{ type: 'damage', amount: 1 }],
    },
  }),
  jan(4, {
    id: 'hd-cantina',
    title: 'The Last Orbit Bar',
    scene: 'station',
    text: 'You need a ship, and you need people who won’t sell you to Vell. The Last Orbit has six regulars who might fit: a pilot, a breacher, a medic, a slicer, a gunner and a smuggler. None of them is cheap; all of them hate Vell.',
    note: 'Do both, in order.',
    steps: [
      {
        title: '1. Make your pitch',
        options: [
          {
            label: 'Tell them about the core',
            check: { trait: 'cha', tags: ['social'] },
            bands: [
              { max: 9, text: 'They listen, skeptical. “Prove it’s worth the trouble.”' },
              { min: 10, text: 'The table goes quiet. Then the smuggler buys a round. You have a crew — if you have a ship.', effects: [{ type: 'virtue', amount: 1 }] },
            ],
          },
        ],
      },
      {
        title: '2. Stock up',
        options: [
          {
            label: 'Raid the bar’s back-room stores (with permission, mostly)',
            result: 'The bartender owes the medic a favor. You leave with supplies.',
            effects: [{ type: 'item', id: 'ration', qty: 2 }],
          },
        ],
      },
    ],
    shop: {
      items: [
        { id: 'ration', price: 1 },
        { id: 'hd_medgel', price: 5 },
        { id: 'hd_arcgrenade', price: 4 },
        { id: 'hd_reflexstim', price: 3 },
      ],
    },
  }),
  jan(5, {
    id: 'hd-lockdown',
    title: 'Lockdown',
    scene: 'station',
    text: 'Vell has bought the Ring’s harbormaster. Every dock is sealed except one: berth nine, where a dented long-hauler called the Halcyon Debt is waiting on a repossession order.',
    note: 'Choose how to reach berth nine.',
    steps: [
      {
        options: [
          {
            label: 'A) Override the berth lock',
            check: { trait: 'int', tags: ['tech'] },
            bands: [
              { max: 10, text: 'The lock sparks and bites back.', effects: [{ type: 'damage', amount: 1 }] },
              { min: 11, text: 'The berth door slides open with a cheerful chime.' },
            ],
          },
          {
            label: 'B) Climb the outside of the spoke in a suit',
            check: { trait: 'con', tags: ['physical'] },
            bands: [
              { max: 10, text: 'Cold seeps through the old suit. You arrive shaking.', effects: [{ type: 'damage', amount: 1 }] },
              { min: 11, text: 'A long, silent climb under the stars. You arrive calm.' },
            ],
          },
        ],
      },
    ],
  }),
  jan(6, {
    id: 'hd-escape',
    title: 'Burn for the Shoal',
    scene: 'space',
    text: 'The Halcyon Debt tears free of berth nine with the docking clamps still attached. Two scav skiffs drop off the Ring’s hull to chase you, harpoon guns swinging.',
    note: 'Take the ship, then survive the dogfight (up to 3 volleys). Each volley you roll Aim and Evasion (d100) against every craft still flying.',
    steps: [
      {
        title: 'The helm',
        options: [
          {
            label: 'Take the chair',
            result: 'Nobody else moves, so you do. The Halcyon Debt is yours — for now.',
            effects: [{ type: 'ship', give: 'hd_halcyon', parts: 2 }],
          },
        ],
      },
    ],
    dogfight: {
      craft: ['hd_skiff', 'hd_skiff'],
      rounds: 3,
      intro: 'Harpoons streak past the canopy.',
      winText: 'Both skiffs tumble away trailing sparks. The Shoal opens ahead of you.',
      loseText: 'The skiffs peel off when you reach the rock fields — but the hull is ringing.',
      win: [{ type: 'glint', amount: 4 }],
    },
  }),

  // ---------------- The crew forms ----------------
  jan(7, {
    id: 'hd-captain',
    span: 2,
    title: 'Who Holds the Chair',
    scene: 'bridge',
    text: 'Two quiet days drifting in the shadow of a rock the size of a moon. Juniper got you this far, but a courier isn’t a captain. Six spacers, one chair. Juniper looks at each of them in turn.',
    note: 'Choose who leads the crew. You’ll play as them from now on. Rest, and try the weekly lottery.',
    rest: true,
    steps: [{ title: 'Choose your captain', options: CREW_LEADS.map(leadOption) }],
  }),

  // ---------------- Week 1: Graveside Drift ----------------
  jan(9, {
    id: 'hd-decode',
    title: 'Cracking the Core',
    scene: 'bridge',
    text: 'The data core wakes up long enough to show a star chart: a dead survey station deep in the Shoal, and coordinates for something under its ice.',
    steps: [
      {
        options: [
          {
            label: 'Read the chart',
            check: { trait: 'int', tags: ['tech', 'lore'] },
            bands: [
              { max: 10, text: 'Half the chart is encrypted. You’ll need better tools.' },
              { min: 11, text: 'You plot a safe course through the rock fields, saving fuel and time.', effects: [{ type: 'item', id: 'ration' }, { type: 'glint', amount: 2 }] },
            ],
          },
        ],
      },
    ],
  }),
  jan(10, {
    id: 'hd-graveside',
    title: 'Graveside Drift',
    scene: 'wreck',
    text: 'A scrapyard built from a hundred dead ships, chained together around a single working dock. Everything is for sale here, including crew.',
    note: 'Hire crew, fit upgrades and buy Ship Parts at the dock.',
    steps: [
      {
        options: [
          {
            label: 'Haggle with the dockmaster for berth fees',
            check: { trait: 'cha', tags: ['social'] },
            bands: [
              { max: 10, text: 'You pay the full berth fee.', effects: [{ type: 'glint', amount: -2 }] },
              { min: 11, text: 'The dockmaster waives the fee — the Halcyon Debt owes him nothing, which surprises everyone.' },
            ],
          },
        ],
      },
    ],
    shop: {
      items: [
        { id: 'ration', price: 1 },
        { id: 'hd_medgel', price: 5 },
        { id: 'hd_targetspike', price: 5 },
        { id: 'hd_chaff', price: 5 },
        { id: 'hd_magboots', price: 8 },
      ],
    },
    dock: {
      crew: ['hd_rook', 'hd_petra'],
      upgrades: [
        { id: 'hd_up_plating', price: 8 },
        { id: 'hd_up_tracking', price: 12 },
      ],
      partsPrice: 3,
    },
    icons: [{ kind: 'pickpocket', x: 20, y: 70 }],
  }),
  jan(11, {
    id: 'hd-salvage',
    title: 'Salvage Rights',
    scene: 'wreck',
    text: 'The dockmaster offers a deal: strip a wrecked freighter for parts and split the take.',
    note: 'Do both tasks.',
    steps: [
      {
        title: '1. Cut through the hull',
        options: [
          {
            label: 'Work the plasma cutter',
            check: { trait: 'str', tags: ['physical'] },
            bands: [
              { max: 10, text: 'The cutter kicks. Your arms will ache all week.', effects: [{ type: 'damage', amount: 1 }] },
              { min: 11, text: 'Clean cuts. The hull opens like a tin.' },
            ],
          },
        ],
      },
      {
        title: '2. Sort the salvage',
        options: [
          {
            label: 'Find the valuable parts',
            check: { trait: 'wis', tags: ['perception'] },
            bands: [
              { max: 10, text: 'Mostly junk. A single usable Ship Part.', effects: [{ type: 'ship', parts: 1 }] },
              { min: 11, text: 'Good finds: two Ship Parts and a share of the take.', effects: [{ type: 'ship', parts: 2 }, { type: 'glint', amount: 3 }] },
            ],
          },
        ],
      },
    ],
  }),
  jan(12, {
    id: 'hd-leeches',
    title: 'Something in the Ducts',
    scene: 'wreck',
    text: 'The freighter wasn’t empty. Pale things uncurl from the air ducts, drawn by your suit heat.',
    note: 'Fight for up to 3 rounds. Leech bites can leave you Infected.',
    steps: [],
    combat: {
      enemies: ['hd_leech', 'hd_leech', 'hd_leech'],
      rounds: 3,
      intro: 'The duct leeches drop toward you.',
      winText: 'The last leech bursts against the bulkhead.',
      loseText: 'You seal the hatch on the rest of them, but not before one bites deep.',
      win: [{ type: 'glint', amount: 2 }],
      lose: [{ type: 'condition', poisoned: true }],
    },
  }),
  jan(13, {
    id: 'hd-tail',
    title: 'A Tail',
    scene: 'space',
    text: 'Someone has been asking about the Halcyon Debt at every bar in Graveside. A blinking transponder is stuck to your hull, still broadcasting.',
    steps: [
      {
        options: [
          {
            label: 'A) Spacewalk out and pry it off',
            check: { trait: 'dex', tags: ['physical'] },
            bands: [
              { max: 10, text: 'Your tether snaps taut; you bang hard against the hull.', effects: [{ type: 'damage', amount: 2 }] },
              { min: 11, text: 'You flick the transponder off into the dark.' },
            ],
          },
          {
            label: 'B) Spoof its signal from inside',
            check: { trait: 'int', tags: ['tech'] },
            bands: [
              { max: 10, text: 'You break it, which tells whoever was listening that you found it.' },
              { min: 11, text: 'The transponder now insists you’re a garbage scow heading the other way.', effects: [{ type: 'virtue', amount: 1 }] },
            ],
          },
        ],
      },
    ],
  }),
  jan(14, {
    id: 'hd-weekend-1',
    span: 2,
    title: 'Shore Leave at Graveside',
    scene: 'station',
    text: 'The crew takes two days. Somebody finds a working shower. Somebody else finds a card game and loses the shower money.',
    note: 'Rest, shop and try the weekly lottery.',
    rest: true,
    steps: [],
    shop: {
      items: [
        { id: 'ration', price: 1 },
        { id: 'hd_medgel', price: 5 },
        { id: 'hd_suture', price: 12 },
        { id: 'hd_visor', price: 10 },
        { id: 'hd_vest', price: 12 },
      ],
    },
  }),

  // ---------------- Week 2: Hunted ----------------
  jan(16, {
    id: 'hd-ice-moon',
    title: 'The Ice Moon',
    scene: 'space',
    text: 'The chart points to a frozen moonlet where the survey station once stood. Fuel is short, so you’ll have to coast most of the way.',
    note: 'Travel uses a ration.',
    steps: [
      {
        title: 'Coast in',
        options: [{ label: 'Cut the drive and drift', result: 'Long, cold, quiet hours.', effects: [{ type: 'travel', rations: 1 }] }],
      },
    ],
  }),
  jan(17, {
    id: 'hd-interceptors',
    title: 'Red Wings',
    scene: 'space',
    text: 'Two of Vell’s interceptors come over the moonlet’s horizon, blood-red and fast. They’re not here to talk.',
    note: 'Dogfight for up to 3 volleys.',
    steps: [],
    dogfight: {
      craft: ['hd_interceptor', 'hd_interceptor'],
      rounds: 3,
      intro: 'The interceptors split to come at you from both sides.',
      winText: 'Both interceptors spin away, smoking. One of them drops its cargo pod in the chaos.',
      loseText: 'The interceptors break off to report your position. That’s worse.',
      win: [{ type: 'glint', amount: 5 }, { type: 'ship', parts: 1 }],
      lose: [{ type: 'damage', amount: 1 }],
    },
  }),
  jan(18, {
    id: 'hd-emp',
    title: 'Static',
    scene: 'bridge',
    text: 'An interceptor’s parting shot was a pulse mine. Every system on the bridge is flickering — including the implant in your ear.',
    steps: [
      {
        options: [
          {
            label: 'Reboot the bridge by hand',
            check: { trait: 'int', tags: ['tech'] },
            bands: [
              { max: 10, text: 'Something in your gear keeps glitching. You are Malfunctioning until you rest.', effects: [{ type: 'condition', cursed: true }] },
              { min: 11, text: 'Panels blink back to life one by one.' },
            ],
          },
        ],
      },
    ],
  }),
  jan(19, {
    id: 'hd-boarding',
    title: 'Boarders',
    scene: 'bridge',
    text: 'A grapple hits the hull. Two of Vell’s enforcers cut through the cargo hatch, rifles up.',
    note: 'Fight for up to 3 rounds.',
    steps: [],
    combat: {
      enemies: ['hd_enforcer', 'hd_enforcer'],
      rounds: 3,
      intro: 'The enforcers advance through the smoke.',
      winText: 'You shove the last enforcer back through his own breach and seal it.',
      loseText: 'The enforcers retreat to their ship with a crate of your supplies.',
      win: [{ type: 'item', id: 'hd_arcgrenade' }, { type: 'glint', amount: 3 }],
      lose: [{ type: 'glint', amount: -3 }],
    },
  }),
  jan(20, {
    id: 'hd-survey',
    title: 'The Survey Station',
    scene: 'wreck',
    text: 'Under the ice: the dead survey station from the chart. Its last log tells of a stable jump-point hidden inside the Shoal — a shortcut worth more than every claim on the Ring combined.',
    steps: [
      {
        options: [
          {
            label: 'Recover the station’s logs',
            check: { trait: 'wis', tags: ['perception', 'lore'] },
            bands: [
              { max: 10, text: 'The logs are damaged, but enough survives. Vell will want them too.' },
              { min: 11, text: 'You also find the station’s emergency cache.', effects: [{ type: 'item', id: 'hd_medgel' }, { type: 'item', id: 'hd_chaff' }] },
            ],
          },
        ],
      },
    ],
  }),
  jan(21, {
    id: 'hd-weekend-2',
    span: 2,
    title: 'Fenn’s Shipyard',
    scene: 'station',
    text: 'A hidden yard inside a hollowed asteroid, run by people who’d rather Vell didn’t exist. They’ll refit the Halcyon Debt for a fair price.',
    note: 'Rest, refit and resupply. Try the weekly lottery.',
    rest: true,
    steps: [
      {
        options: [
          {
            label: 'Let the yard crew patch the hull',
            result: 'Welders crawl over the ship all night.',
            effects: [{ type: 'ship', repair: 1 }],
          },
        ],
      },
    ],
    shop: {
      items: [
        { id: 'ration', price: 1 },
        { id: 'hd_medgel', price: 5 },
        { id: 'hd_suture', price: 12 },
        { id: 'hd_gloves', price: 10 },
        { id: 'hd_comchip', price: 14 },
        { id: 'hd_targetspike', price: 5 },
      ],
    },
    dock: {
      crew: ['hd_oduya', 'hd_rook', 'hd_petra'],
      upgrades: [
        { id: 'hd_up_capacitor', price: 14 },
        { id: 'hd_up_vanes', price: 12 },
        { id: 'hd_up_autodoc', price: 8 },
        { id: 'hd_up_tracking', price: 12 },
      ],
      partsPrice: 3,
    },
  }),

  // ---------------- Week 3: The Undertow ----------------
  jan(23, {
    id: 'hd-plan',
    title: 'Plan of Attack',
    scene: 'bridge',
    text: 'Vell’s gunship, the Undertow, is parked over the jump-point like a cat over a mousehole. The crew argues for hours about how to get past it.',
    steps: [
      {
        options: [
          {
            label: 'A) Plan a fast strike',
            check: { trait: 'wis', tags: ['piloting'] },
            bands: [
              { max: 10, text: 'The plan has holes. You’ll improvise.' },
              { min: 11, text: 'A good plan. Everyone sleeps better.', effects: [{ type: 'heal', amount: 2 }] },
            ],
          },
          {
            label: 'B) Plan a quiet approach',
            check: { trait: 'dex', tags: ['stealth'] },
            bands: [
              { max: 10, text: 'There is no quiet way past a gunship. You’ll fight.' },
              { min: 11, text: 'You map the Undertow’s blind spots.', effects: [{ type: 'virtue', amount: 1 }] },
            ],
          },
        ],
      },
    ],
  }),
  jan(24, {
    id: 'hd-approach',
    title: 'Running Dark',
    scene: 'space',
    text: 'Engines cold, lights off, you drift toward the jump-point through a field of debris.',
    note: 'Travel uses a ration.',
    steps: [
      {
        options: [
          {
            label: 'Drift through the debris',
            check: { trait: 'dex', tags: ['piloting'] },
            bands: [
              { max: 10, text: 'A chunk of rock clips the hull. No harm done — except to your nerves.', effects: [{ type: 'travel', rations: 1 }] },
              { min: 11, text: 'You thread the debris like a needle.', effects: [{ type: 'travel', rations: 1 }] },
            ],
          },
        ],
      },
    ],
  }),
  jan(25, {
    id: 'hd-undertow',
    title: 'The Undertow',
    scene: 'space',
    text: 'The Undertow’s floodlights find you. Its guns swing around, and a last interceptor launches from its belly.',
    note: 'Dogfight for up to 4 volleys.',
    steps: [],
    dogfight: {
      craft: ['hd_gunship', 'hd_interceptor'],
      rounds: 4,
      intro: '“Halcyon Debt,” says a calm voice over the comm. “Let’s settle your account.”',
      winText: 'The Undertow’s drive flickers out. It drifts, crippled, and you match its spin to board.',
      loseText: 'The Undertow is still flying, but its guns have gone quiet. You dock with it anyway.',
      win: [{ type: 'glint', amount: 6 }],
      lose: [{ type: 'damage', amount: 2 }],
    },
  }),
  jan(26, {
    id: 'hd-boarding-vell',
    title: 'Aboard the Undertow',
    scene: 'wreck',
    text: 'The gunship’s corridors are dark and smell of ozone. Somewhere ahead, Vell is waiting — politely.',
    steps: [
      {
        options: [
          {
            label: 'Find the bridge',
            check: { trait: 'wis', tags: ['perception'] },
            bands: [
              { max: 10, text: 'A sentry drone spots you. Vell knows you’re coming.' },
              { min: 11, text: 'You reach the bridge door unseen.', effects: [{ type: 'pageBonus', stat: 'atk', amount: 1 }] },
            ],
          },
        ],
      },
    ],
    icons: [{ kind: 'pickpocket', x: 30, y: 55 }],
  }),
  jan(27, {
    id: 'hd-vell',
    title: 'Captain Oriel Vell',
    scene: 'bridge',
    text: 'Vell stands at the Undertow’s window, hands folded behind his back. “The core, please. I would hate to make this unpleasant.” A sentry drone unfolds beside him.',
    note: 'Fight for up to 4 rounds.',
    steps: [],
    combat: {
      enemies: ['hd_vell', 'hd_drone'],
      rounds: 4,
      intro: 'Vell sighs and draws a pistol with a mother-of-pearl grip.',
      winText: 'Vell yields, bleeding and furious, and the Undertow’s crew surrenders with him. The jump-point is yours.',
      loseText: 'Vell escapes in a lifeboat, but his crew has had enough. They surrender the Undertow.',
      win: [{ type: 'glint', amount: 10 }, { type: 'item', id: 'hd_visor' }],
      lose: [{ type: 'glint', amount: 4 }],
    },
  }),
  jan(28, {
    id: 'hd-aftermath',
    span: 2,
    title: 'Settling Accounts',
    scene: 'station',
    text: 'Word travels fast on the Ring. By the time you dock, the harbormaster has resigned and the repossession order on the Halcyon Debt has quietly disappeared. The jump-point is open. Beyond it: anything.',
    note: 'Rest, level up, and try the weekly lottery. Beyond the jump-point, the year is just beginning.',
    rest: true,
    steps: [
      {
        title: 'Debrief',
        options: [
          {
            label: 'Tell Juniper how it ended',
            result: '“So the Debt’s paid off?” Juniper grins. “Not even close. But it’s a start.” You feel sharper for everything this month has thrown at you.',
            effects: [{ type: 'levelUp' }, { type: 'ship', repair: 3 }],
          },
        ],
      },
    ],
  }),
]
