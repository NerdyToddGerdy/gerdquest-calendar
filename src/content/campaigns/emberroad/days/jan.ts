// The Ember Road — first arc (Hearthmoon 1–30). Authored against 2022, whose
// Jan 1 was a Saturday, so the arc opens on a Sat/Sun weekend page.
import type { Day } from '../../../../engine/types'

export const SHOP_BASIC = [
  { id: 'ration', price: 1 },
  { id: 'er_draught', price: 5 },
  { id: 'er_firepot', price: 4 },
  { id: 'er_tonic', price: 3 },
  { id: 'er_cleareye', price: 2 },
]

export const JAN: Day[] = [
  // ---------------- Prologue: Tamsin Reed ----------------
  {
    id: 'er-01', month: 1, day: 1, span: 2, title: 'The Light Goes Out', scene: 'tower',
    text: 'Snow hisses against the glass of the ninth waystone as Tamsin Reed climbs to trim its wick. For three hundred years the Ember Road has been lit end to end by these stones; travelers steer by them through the blizzards. Tonight, while she watches, the flame in the eighth stone down the valley shrinks to a blue bead and dies.',
    note: 'Prologue. You play Tamsin for the first few pages; then the story passes to the hero you choose.',
    steps: [
      {
        title: '1. Tend the ninth stone',
        options: [{
          label: 'Trim the wick and feed the flame', check: { trait: 'wis' },
          bands: [
            { max: 9, text: 'Your hands are numb; you scorch your fingers getting it right.', effects: [{ type: 'damage', amount: 1 }] },
            { min: 10, text: 'The ninth stone burns steady and gold. At least this one is safe.' },
          ],
        }],
      },
      {
        title: '2. Watch the dark stone',
        options: [{
          label: 'Study the dead flame through your spyglass', check: { trait: 'int', tags: ['lore', 'perception'] },
          bands: [
            { max: 10, text: 'All you can see is snow. Something moved down there — you think.' },
            { min: 11, text: 'Pale figures stand around the eighth stone, holding long poles with cups on the ends. Snuffers. Someone put the light out on purpose.', effects: [{ type: 'virtue', amount: 1 }] },
          ],
        }],
      },
    ],
  },
  {
    id: 'er-02', month: 1, day: 3, title: 'Tracks in the Snow', scene: 'harbor',
    text: 'At first light Tamsin goes down to the eighth stone. Its glass is unbroken, its oil untouched. Frost has grown over the lamp from the inside, like breath on a window. A trail of footprints leads away — and beside them, paw prints far too large for any dog.',
    steps: [{
      title: 'Choose one',
      options: [
        {
          label: 'A) Follow the tracks into the pines', check: { trait: 'wis', tags: ['perception', 'travel'] },
          bands: [
            { max: 10, text: 'The trail vanishes on wind-scoured rock. You turn back, cold to the bone.', effects: [{ type: 'damage', amount: 1 }] },
            { min: 11, text: 'The tracks circle back toward the road — toward the next stone. Whoever did this isn’t finished.', effects: [{ type: 'pageBonus', stat: 'roll', amount: 1 }] },
          ],
        },
        {
          label: 'B) Flag down the morning carter and ask what he saw', check: { trait: 'cha', tags: ['social'] },
          bands: [
            { max: 10, text: 'He whips his ponies past without a word. Nobody stops on the road at a dark stone.' },
            { min: 11, text: '“White robes. Mouths sewn up,” he mutters, and presses a coin into your hand. “Get to Cinderford, girl.”', effects: [{ type: 'glint', amount: 2 }] },
          ],
        },
      ],
    }],
  },
  {
    id: 'er-03', month: 1, day: 4, title: 'Hounds Without Breath', scene: 'depths',
    text: 'Halfway to Cinderford, the howling starts. Two grey shapes lope out of the snowfall with ice crusted in their fur — and no steam on their breath at all.',
    note: 'Fight for one round per hound. Under these rules there is no Defense roll: your Defense score (10 + Defense) is compared to each enemy’s attack.',
    steps: [],
    combat: {
      enemies: ['er_frosthound', 'er_frosthound'],
      rounds: 2,
      intro: 'The frost hounds attack!',
      winText: 'The second hound shatters like a dropped icicle. Tamsin limps the last mile to Cinderford.',
      loseText: 'The hounds break off at the edge of town, as if something called them back.',
      lose: [{ type: 'damage', amount: 1 }],
    },
  },
  {
    id: 'er-04', month: 1, day: 5, title: 'The Muster at Cinderford', scene: 'inn',
    text: 'Tamsin tells her story to Reeve Halloran in the smoky common room of the Copper Kettle. By noon the reeve has rung the muster bell: the Ember Road needs keepers who can fight. Six answer. Tamsin, bandaged and furious about it, can only watch — and choose who carries her lantern down the road.',
    note: 'Choose the hero you will play for the rest of the campaign.',
    steps: [{
      title: 'Who takes up the lantern?',
      options: [
        { label: 'A) Garrick Vane, Shieldwright', result: 'Garrick hefts the lantern-pole like a hammer. “Point me at the dark.”', effects: [{ type: 'setHero', heroId: 'er_garrick', carry: ['inventory'] }] },
        { label: 'B) Ysolde Marrow, Frost-Witch', result: 'Ysolde turns the lantern over, frowning. “Winter didn’t do this. Someone asked it to.”', effects: [{ type: 'setHero', heroId: 'er_ysolde', carry: ['inventory'] }] },
        { label: 'C) Pell Quickfinger, Gutter Thief', result: 'Pell grins and pockets the lantern’s spare wick. “For safekeeping.”', effects: [{ type: 'setHero', heroId: 'er_pell', carry: ['inventory'] }] },
        { label: 'D) Sister Odalys, Lantern Cleric', result: 'Odalys blesses the lantern and then, without asking, re-wraps Tamsin’s bandage properly.', effects: [{ type: 'setHero', heroId: 'er_odalys', carry: ['inventory'] }] },
        { label: 'E) Kesh of the Nine Winds, Wandering Monk', result: 'Kesh bows to Tamsin before taking the lantern. “I will walk it back to you lit.”', effects: [{ type: 'setHero', heroId: 'er_kesh', carry: ['inventory'] }] },
        { label: 'F) Wenna Harrowgate, Fell Hunter', result: 'Wenna has already seen the tracks. “Those aren’t wolves. I’ll find what’s leading them.”', effects: [{ type: 'setHero', heroId: 'er_wenna', carry: ['inventory'] }] },
      ],
    }],
  },

  // ---------------- Week 1: up the road ----------------
  {
    id: 'er-05', month: 1, day: 6, title: 'The Reeve’s Charge', scene: 'inn',
    text: '“Seven stones between here and the Fourth Light at Greyfold,” Reeve Halloran says, spreading a stained map. “If the Fourth goes dark, the whole north road goes with it. Relight what you can. Find who’s snuffing them. Come back.”',
    note: 'Do both tasks, then stock up before you leave. You can’t come back to a shop once you’ve moved on.',
    steps: [
      {
        title: '1. Study the reeve’s map',
        options: [{
          label: 'Memorize the stones and shelters', check: { trait: 'int', tags: ['lore'] },
          bands: [
            { max: 9, text: 'Too many names. You’ll manage.' },
            { min: 10, text: 'You note every shelter and shortcut. The road will be kinder for it.', effects: [{ type: 'item', id: 'ration' }] },
          ],
        }],
      },
      {
        title: '2. Ask the town for help',
        options: [{
          label: 'Make the case in the common room', check: { trait: 'cha', tags: ['social'] },
          bands: [
            { max: 9, text: 'They wish you luck. Luck is free.' },
            { min: 10, text: 'A hat goes round the room.', effects: [{ type: 'glint', amount: 4 }] },
          ],
        }],
      },
    ],
    shop: { items: SHOP_BASIC },
  },
  {
    id: 'er-06', month: 1, day: 7, title: 'The Road North', scene: 'harbor',
    text: 'The Ember Road climbs out of Cinderford between walls of snow taller than you. Every mile there should be a waystone glowing. Two miles out, the first one is dark.',
    steps: [{
      title: 'Push through the drifts',
      options: [{
        label: 'Keep a steady pace and watch the weather', check: { trait: 'wis', tags: ['travel'] },
        bands: [
          { max: 9, text: 'A squall catches you on open ground. You dig in and wait it out.', effects: [{ type: 'travel', rations: 2 }] },
          { min: 10, text: 'You read the sky right and shelter before the squall hits.', effects: [{ type: 'travel', rations: 1 }] },
        ],
      }],
    }],
  },
  {
    id: 'er-07', month: 1, day: 8, span: 2, title: 'Thornwick Inn', scene: 'inn', rest: true,
    text: 'Thornwick Inn sits under the sixth stone, which still burns. Travelers have packed in from both directions; nobody wants to sleep on the road. Among them are a few souls who might be persuaded to walk with you — for a price, and a share of the pot every time you rest.',
    note: 'Rest here. Followers cost a hiring fee now and upkeep every time you Rest; unpaid followers leave.',
    steps: [{
      title: 'By the hearth',
      options: [{
        label: 'Trade road stories with the other travelers', check: { trait: 'cha', tags: ['social'] },
        bands: [
          { max: 9, text: 'Mostly you listen. That’s worth something too.' },
          { min: 10, text: 'Your story gets the room buying you drinks — and one old drover a warning: “The white-robes camp at the second stone.”', effects: [{ type: 'glint', amount: 2 }, { type: 'pageBonus', stat: 'int', amount: 1 }] },
        ],
      }],
    }],
    shop: { items: SHOP_BASIC, hires: ['er_f_ambrose', 'er_f_grit'] },
    icons: [{ kind: 'pickpocket', x: 30, y: 62 }],
  },

  // ---------------- Week 2: the Second Stone ----------------
  {
    id: 'er-08', month: 1, day: 10, title: 'The Second Stone', scene: 'tower',
    text: 'The second waystone is dark and furred with frost from the inside out. Someone has scratched a symbol into the stone: a closed mouth, stitched shut.',
    steps: [
      {
        title: '1. Read the mark',
        options: [{
          label: 'Puzzle out the symbol', check: { trait: 'int', tags: ['lore'] },
          bands: [
            { max: 10, text: 'It means nothing to you, which bothers you more than it should.' },
            { min: 11, text: 'The Hush — a winter cult that believes the world should be silent and dark. They were supposed to be a story.', effects: [{ type: 'virtue', amount: 1 }] },
          ],
        }],
      },
      {
        title: '2. Relight the stone',
        options: [{
          label: 'Chip away the frost and strike a flame', check: { trait: 'con', tags: ['physical'] },
          bands: [
            { max: 9, text: 'The cold bites deep before the flame takes.', effects: [{ type: 'damage', amount: 2 }] },
            { min: 10, text: 'The stone catches with a sound like a sigh. Gold light floods the snow.', effects: [{ type: 'glint', amount: 1 }] },
          ],
        }],
      },
    ],
  },
  {
    id: 'er-09', month: 1, day: 11, title: 'The White Robes', scene: 'depths',
    text: 'They come at dusk, silent as falling snow: two figures in white with their lips sewn shut, carrying snuffer-poles sharpened to spear points.',
    steps: [],
    combat: {
      enemies: ['er_cultist', 'er_cultist'],
      rounds: 2,
      intro: 'The Hush cultists attack without a sound.',
      winText: 'The last cultist falls without a cry. In his robe you find gold, and a list of stones — the Fourth Light at Greyfold circled twice.',
      loseText: 'The cultists melt back into the snow, leaving you bruised and the stone guttering.',
      win: [{ type: 'glint', amount: 5 }],
      lose: [{ type: 'damage', amount: 1 }],
    },
  },
  {
    id: 'er-10', month: 1, day: 12, title: 'A Locked Reliquary', scene: 'cellar',
    text: 'In a roadside shrine you find an iron reliquary bound with three locks. The shrine-keeper is long gone; a note in the dust says only: “For the keepers. When the lights fail.”',
    steps: [{
      title: 'Choose one',
      options: [
        {
          label: 'A) Pick the locks', check: { trait: 'dex', tags: ['lockpick', 'stealth'] },
          bands: [
            { max: 10, text: 'One lock gives; the other two don’t. You get a single draught out through the gap.', effects: [{ type: 'item', id: 'er_draught' }] },
            { min: 11, text: 'Click, click, click. Inside: a road-warden’s helm and a purse of old gold.', effects: [{ type: 'item', id: 'er_wardhelm' }, { type: 'glint', amount: 3 }] },
          ],
        },
        {
          label: 'B) Break it open', check: { trait: 'str', tags: ['physical'] },
          bands: [
            { max: 10, text: 'You smash the lid and most of what was inside with it.', effects: [{ type: 'glint', amount: 1 }] },
            { min: 11, text: 'The hinges give. The helm inside is dented but sound.', effects: [{ type: 'item', id: 'er_wardhelm' }] },
          ],
        },
        { label: 'C) Leave it for the keepers it was meant for', result: 'You close the shrine door gently behind you.', effects: [{ type: 'virtue', amount: 1 }] },
      ],
    }],
  },
  {
    id: 'er-11', month: 1, day: 13, title: 'The Frozen Ford', scene: 'seacave',
    text: 'The Ember Road crosses the Tallow River at a ford that should be knee-deep. Today it is a sheet of black ice with water moving underneath.',
    steps: [{
      title: 'Cross the ford',
      options: [{
        label: 'Test the ice and cross', check: { trait: 'con', tags: ['physical', 'travel'] },
        bands: [
          { max: 8, text: 'The ice cracks. You go in to the waist and crawl out shaking.', effects: [{ type: 'damage', amount: 3 }, { type: 'travel', rations: 1 }] },
          { min: 9, max: 14, text: 'Slow, careful, cold — but across.', effects: [{ type: 'travel', rations: 1 }] },
          { min: 15, text: 'You find the shallow line the ice hides and cross dry-footed.' },
        ],
      }],
    }],
  },
  {
    id: 'er-12', month: 1, day: 14, title: 'Wisps over the Marsh', scene: 'seacave',
    text: 'Past the ford, the road runs through a frozen marsh. Lights drift between the reeds — not waystone gold, but a cold blue that leaves frost wherever it passes. Three of them turn toward you.',
    steps: [],
    combat: {
      enemies: ['er_wisp', 'er_wisp', 'er_wisp'],
      rounds: 3,
      intro: 'The ice wisps swirl in.',
      winText: 'The last wisp pops like a soap bubble. The reeds thaw a little where it hung.',
      loseText: 'The wisps lose interest and drift off over the marsh, leaving frost in your hair.',
      win: [{ type: 'glint', amount: 3 }],
      lose: [{ type: 'damage', amount: 1 }],
    },
  },
  {
    id: 'er-13', month: 1, day: 15, span: 2, title: 'Mossgate Market', scene: 'inn', rest: true,
    text: 'Mossgate is a trading village where three roads meet, and its winter market is still running out of stubbornness. Traders sell steel, mules, and charms against the cold. You take a room and sleep for twelve hours.',
    note: 'Rest. The market has upgrades that stack (sharpened edges, tempered grips) and travel gear.',
    steps: [{
      title: 'Work the market',
      options: [{
        label: 'Haggle for a better price', check: { trait: 'cha', tags: ['social'] },
        bands: [
          { max: 9, text: 'The traders have heard every trick. Prices stay where they are.' },
          { min: 10, text: 'A trader knocks a little off and throws in a ration.', effects: [{ type: 'glint', amount: 2 }, { type: 'item', id: 'ration' }] },
        ],
      }],
    }],
    shop: {
      items: [
        ...SHOP_BASIC,
        { id: 'er_whetstone', price: 6 },
        { id: 'er_temper', price: 7 },
        { id: 'er_mule', price: 12 },
        { id: 'er_picks', price: 5 },
        { id: 'er_spicedwine', price: 3 },
        { id: 'er_oakheart', price: 3 },
        { id: 'er_linen', price: 6 },
        { id: 'er_furcloak', price: 10 },
      ],
      hires: ['er_f_ambrose', 'er_f_grit', 'er_f_lio'],
    },
    icons: [{ kind: 'pickpocket', x: 66, y: 74 }],
  },

  // ---------------- Week 3: the Third Stone ----------------
  {
    id: 'er-14', month: 1, day: 17, title: 'The Hermit of Mossgate Wood', scene: 'cellar',
    text: 'The villagers say an old hermit in the wood knows more about the Hush than he should. You find him splitting logs, as if he’d been expecting you.',
    steps: [{
      title: 'Choose one',
      options: [
        {
          label: 'A) Sit with him and listen', check: { trait: 'wis' },
          bands: [
            { max: 10, text: 'He talks about the weather for an hour, then sends you off with soup.', effects: [{ type: 'heal', amount: 2 }] },
            { min: 11, text: '“The Hush can’t snuff the Fourth Light from outside,” he says at last. “They need someone in the warden’s tower. They have someone.”', effects: [{ type: 'pageBonus', stat: 'roll', amount: 1 }, { type: 'virtue', amount: 1 }] },
          ],
        },
        {
          label: 'B) Lean on him until he talks', check: { trait: 'str', tags: ['physical'] },
          bands: [
            { max: 12, text: 'He swings the axe closer than is polite. You leave.', effects: [{ type: 'virtue', amount: -1 }] },
            { min: 13, text: 'He tells you about the warden’s tower — and spits at your boots as you go.', effects: [{ type: 'virtue', amount: -1 }, { type: 'pageBonus', stat: 'roll', amount: 1 }] },
          ],
        },
      ],
    }],
  },
  {
    id: 'er-15', month: 1, day: 18, title: 'The Third Stone', scene: 'tower',
    text: 'The third waystone has been sealed with a ring of carved runes that drink the warmth out of the air. A flame won’t catch until the ring is broken — and breaking the wrong rune will feed it.',
    steps: [{
      title: 'Break the ring',
      options: [{
        label: 'Find the keystone rune', check: { trait: 'int', tags: ['lore'] },
        bands: [
          { max: 9, text: 'Wrong rune. The cold surges up your arm before the ring cracks.', effects: [{ type: 'damage', amount: 2 }, { type: 'condition', cursed: true }] },
          { min: 10, text: 'The ring splits. The third stone blazes up gold.', effects: [{ type: 'glint', amount: 2 }] },
        ],
      }],
    }],
  },
  {
    id: 'er-16', month: 1, day: 19, title: 'Ambush in the Pines', scene: 'depths',
    text: 'Not every danger on the road wears white. Two bandits step out from behind the pines, bows drawn. “The lights are out, friend. Toll’s gone up.”',
    steps: [{
      title: 'Choose one',
      options: [
        {
          label: 'A) Talk them down', check: { trait: 'cha', tags: ['social'] },
          bands: [
            { max: 12, text: 'They laugh. Steel it is.' },
            { min: 13, text: 'They lower their bows… a little. You’ll still have to fight, but they’re rattled.', effects: [{ type: 'pageBonus', stat: 'atk', amount: 2 }] },
          ],
        },
        {
          label: 'B) Pay the toll first, fight on your terms', result: 'You toss them two gold. While they’re counting, you get your footing.', effects: [{ type: 'glint', amount: -2 }, { type: 'pageBonus', stat: 'dmg', amount: 1 }] },
      ],
    }],
    combat: {
      enemies: ['er_bandit', 'er_bandit'],
      rounds: 2,
      intro: 'The bandits rush you.',
      winText: 'The bandits flee into the trees, dropping a purse.',
      loseText: 'The bandits grab what they can reach and run.',
      win: [{ type: 'glint', amount: 4 }],
      lose: [{ type: 'glint', amount: -3 }],
    },
  },
  {
    id: 'er-17', month: 1, day: 20, title: 'Snowblind', scene: 'harbor',
    text: 'A whiteout swallows the road. The waystones are your only guide, and too many of them are dark.',
    steps: [{
      title: 'Find the way',
      options: [{
        label: 'Navigate from stone to stone', check: { trait: 'wis', tags: ['travel', 'perception'] },
        bands: [
          { max: 9, text: 'You walk in a circle for half a day before the snow lifts.', effects: [{ type: 'travel', rations: 2 }, { type: 'damage', amount: 1 }] },
          { min: 10, text: 'You keep the faint glow of the next stone in sight and press on.', effects: [{ type: 'travel', rations: 1 }] },
        ],
      }],
    }],
  },
  {
    id: 'er-18', month: 1, day: 21, title: 'The Hollow Barrow', scene: 'cellar',
    text: 'The storm drives you into an old barrow-mound beside the road. It isn’t empty: someone has been using it as a waystation. White robes hang drying by a cold hearth.',
    note: 'Search the barrow in any order.',
    anyOrder: true,
    steps: [
      {
        title: 'The sleeping alcoves',
        options: [{
          label: 'Creep past and search the packs', check: { trait: 'dex', tags: ['stealth'] },
          bands: [
            { max: 9, text: 'A pack topples. You freeze — nobody comes. You leave with nothing.' },
            { min: 10, text: 'You find a firepot and a handful of gold.', effects: [{ type: 'item', id: 'er_firepot' }, { type: 'glint', amount: 2 }] },
          ],
        }],
      },
      {
        title: 'The carved wall',
        options: [{
          label: 'Read the old barrow-carvings', check: { trait: 'int', tags: ['lore'] },
          bands: [
            { max: 9, text: 'Old kings. Old wars. Nothing useful.' },
            { min: 10, text: 'The Hollow Warden: a road-warden who swore to keep the Fourth Light forever. The Hush has taken that oath and turned it inside out.', effects: [{ type: 'virtue', amount: 1 }] },
          ],
        }],
      },
      {
        title: 'The cold hearth',
        options: [{
          label: 'Light a proper fire and warm up', check: { trait: 'con', tags: ['physical'] },
          bands: [
            { max: 9, text: 'The fire won’t take here. The barrow stays cold.', effects: [{ type: 'damage', amount: 1 }] },
            { min: 10, text: 'The fire roars. For a few hours, you are warm.', effects: [{ type: 'heal', amount: 3 }] },
          ],
        }],
      },
    ],
  },
  {
    id: 'er-19', month: 1, day: 22, span: 2, title: 'Shelter in the Barrow-Keep', scene: 'cellar', rest: true,
    text: 'You hold the barrow through the weekend while the storm blows itself out, sleeping in shifts by the fire you lit. Nobody comes back for the robes.',
    note: 'Rest. There’s no market here — make do with what you carry.',
    steps: [{
      title: 'Tend your gear',
      options: [{
        label: 'Mend, sharpen and repack', check: { trait: 'int' },
        bands: [
          { max: 9, text: 'Everything is wet and nothing is fixable. You wait for it to dry.' },
          { min: 10, text: 'You find a forgotten ration at the bottom of your pack.', effects: [{ type: 'item', id: 'ration' }] },
        ],
      }],
    }],
  },

  // ---------------- Week 4: the Fourth Light ----------------
  {
    id: 'er-20', month: 1, day: 24, title: 'Greyfold in Sight', scene: 'tower',
    text: 'Below you, Greyfold huddles at the head of the valley. Above it, on a crag, the Fourth Light still burns — barely. Its glow is the color of a bruise.',
    steps: [{
      title: 'Choose one',
      options: [
        {
          label: 'A) Scout the tower approach', check: { trait: 'dex', tags: ['stealth'] },
          bands: [
            { max: 10, text: 'Hounds catch your scent; you pull back before they find you.', effects: [{ type: 'damage', amount: 1 }] },
            { min: 11, text: 'You find a goat-path that skirts the hounds’ kennels.', effects: [{ type: 'pageBonus', stat: 'atk', amount: 1 }] },
          ],
        },
        {
          label: 'B) Pray at Greyfold’s little shrine', check: { trait: 'wis' },
          bands: [
            { max: 10, text: 'The shrine is cold. You pray anyway.', effects: [{ type: 'heal', amount: 1 }] },
            { min: 11, text: 'The shrine-lamp flares as you kneel. You stand up lighter.', effects: [{ type: 'heal', amount: 4 }, { type: 'virtue', amount: 1 }] },
          ],
        },
      ],
    }],
  },
  {
    id: 'er-21', month: 1, day: 25, title: 'Kennels of the Hush', scene: 'depths',
    text: 'The Hush keeps its frost hounds in a ruined sheepfold under the crag. Two hounds and their handler stand between you and the tower stair.',
    steps: [],
    combat: {
      enemies: ['er_frosthound', 'er_frosthound', 'er_cultist'],
      rounds: 3,
      intro: 'The handler raises a silent whistle, and the hounds come.',
      winText: 'The handler drops. On his belt hangs an iron key to the tower stair.',
      loseText: 'You break through, but not cleanly.',
      win: [{ type: 'glint', amount: 4 }],
      lose: [{ type: 'damage', amount: 2 }],
    },
  },
  {
    id: 'er-22', month: 1, day: 26, title: 'The Warden’s Riddle', scene: 'tower',
    text: 'A door of black ice blocks the stair, carved with the road-wardens’ oath. Words are missing from it, scraped away. The ice is waiting for you to say them.',
    steps: [{
      title: 'Speak the oath',
      options: [{
        label: 'Reconstruct the missing words', check: { trait: 'int', tags: ['lore'] },
        bands: [
          { max: 10, text: 'You guess wrong. The ice answers with cold that settles in your bones.', effects: [{ type: 'condition', cursed: true }, { type: 'damage', amount: 1 }] },
          { min: 11, text: '“…and keep the light, though I keep it alone.” The door weeps into water.', effects: [{ type: 'virtue', amount: 1 }] },
        ],
      }],
    }],
  },
  {
    id: 'er-23', month: 1, day: 27, title: 'Before the Last Stair', scene: 'tower',
    text: 'A tinker has followed you up from Greyfold — “where there’s heroes, there’s custom” — and set out a blanket of wares at the foot of the stair. Above, something heavy walks back and forth, back and forth.',
    note: 'Last chance to prepare before the Warden.',
    steps: [{
      title: 'Steady yourself',
      options: [{
        label: 'Breathe, check your gear, and wait for the right moment', check: { trait: 'wis' },
        bands: [
          { max: 9, text: 'Your hands won’t stop shaking. You climb anyway.' },
          { min: 10, text: 'You count the Warden’s steps until you know its rhythm.', effects: [{ type: 'pageBonus', stat: 'roll', amount: 1 }] },
        ],
      }],
    }],
    shop: { items: [{ id: 'er_draught', price: 6 }, { id: 'er_firepot', price: 5 }, { id: 'er_tonic', price: 4 }, { id: 'er_linen', price: 7 }] },
  },
  {
    id: 'er-24', month: 1, day: 28, title: 'The Hollow Warden', scene: 'depths',
    text: 'At the top of the tower stands the last road-warden of the Ember Road, armored in frost, its face a hollow helm. It holds the Fourth Light’s great lantern in one gauntlet — and with the other, it is slowly closing the shutter.',
    note: 'A single foe: under these rules it can only be destroyed in the final round. A strong hit before then Stuns it, so it can’t hurt you that round.',
    steps: [],
    combat: {
      enemies: ['er_warden'],
      rounds: 4,
      intro: 'The Hollow Warden turns its empty helm toward you.',
      winText: 'The Warden’s armor falls in on itself like a collapsing snowdrift. The shutter swings open, and gold light pours over the whole valley. On the Warden’s finger, a ring is warm to the touch.',
      loseText: 'You are thrown down the stair. When you climb back up, the Warden is gone — but the shutter stands half open, and the light holds.',
      win: [{ type: 'glint', amount: 10 }, { type: 'item', id: 'er_runering' }],
      lose: [{ type: 'damage', amount: 3 }],
    },
  },
  {
    id: 'er-25', month: 1, day: 29, span: 2, title: 'The Fourth Light Rekindled', scene: 'inn', rest: true,
    text: 'Greyfold throws a feast in the tower’s shadow. Tamsin arrives on the supply sledge, still limping, and climbs straight up to look at the light. When she comes down, she says only: “There are thirty more stones beyond this one. Some of them are already dark.”',
    note: 'Rest, report, and prepare for the road ahead.',
    steps: [{
      title: 'Report to Tamsin',
      options: [{
        label: 'Tell her everything',
        result: 'Tamsin listens without interrupting, then hands back the lantern. “Keep it. You’re a keeper now.” You feel the road has made you stronger.',
        effects: [{ type: 'levelUp' }],
      }],
    }],
    shop: { items: [...SHOP_BASIC, { id: 'er_whetstone', price: 6 }, { id: 'er_temper', price: 7 }, { id: 'er_linen', price: 6 }], hires: ['er_f_ambrose', 'er_f_grit', 'er_f_lio'] },
    icons: [{ kind: 'pickpocket', x: 82, y: 64 }],
  },
]
