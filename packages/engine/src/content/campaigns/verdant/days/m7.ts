// Chapter 7 — Antlermoon (Jul 1–31): The Ashen Isle. Castaways on a volcanic
// jungle island held by the Pale Kiln, bone-potters who fire the dead into
// servants. Explore the island, strike a tense bargain with an imprisoned
// ash-dryad, pass a trap-filled temple and face the Kiln-Born in its lava
// chamber. The boss does not decide the legacy: a choice after the fight does.
// Give the ember-seed relic to the dryad (Accord kept) or keep it (Wilds let in).
import { buff, check, check3, dmg, fight, gold, haven, heal, item, legacy, needs, page, pick, plain, poison, task, virtue, type Draft, type Outcome } from './build'
import type { Beat } from './build'
import { SHOP_CAMP } from './shops'
import type { Step } from '../../../../engine/types'

/** A temple trap: a trigger, what it does, and a twist. A good roll spots the trigger; a bad one springs all three. */
interface Trap {
  trigger: string
  effect: string
  twist: string
  trait: Beat[1]
  tags: string[]
  /** The damage the trap does if sprung. */
  hurt: number
  /** What a clean pass earns, if anything. */
  prize?: Outcome
}

function trap(t: Trap): Step {
  const fail: Outcome = [`${t.trigger}, and ${t.effect}. ${t.twist}`, [dmg(t.hurt)]]
  const pass = t.prize ?? `You spot ${t.trigger.replace(/^(a|an|the) /i, 'the ')} before it matters, and the rest never gets its chance.`
  return task(`Trap: ${t.trigger.replace(/^(An?|The) /i, '')}`, check(`Cross it: ${t.trigger}`, t.trait, t.tags, fail, pass))
}

export const M7: Draft[] = [
  // ---- Jul 1 ----
  page('Castaways', 'va_isle',
    'The Mudlark lies on her side on the black sand, her mast across the shallows and her crew sitting on the beach with a look you have seen on every refugee in Highmarrow. The surf has taken half the stores. The Seedcrown, wrapped in a shirt in your pack, is warm to the touch, and it is warmer here than it has been anywhere. Above the beach the jungle rises in tiers toward a mountain with a red mouth.',
    [
      task('1. What can be saved', check3('Wade out to the wreck and salvage the stores', 'str', ['physical'], ['A wave takes you off the hull, and the stores with you.', [dmg(2)]], ['You haul a crate of sodden biscuit and a lantern ashore.', [item('ration', 2), item('va_lanternoil')]], ['You find the barge’s medicine chest, dry in a sealed locker.', [item('va_heartsap'), item('ration', 3)]])),
      pick('2. Where to go',
        check('Read the island from the beach', 'wis', ['perception', 'lore'], 'The smoke obscures everything.', ['You see a column of white smoke from three different places, evenly spaced: not volcanic, but worked. Someone is firing something.', [buff('roll', 1)]]),
        needs('va_l6_win', plain('Ask Pike to read the coast', 'Pike takes one long look at the sky and the surf. “That spit leads round to fresh water,” she says. “The Mudlark’s luck lasted. So will yours.”', [heal(2), buff('roll', 1)])),
        needs('va_l6_loss', plain('Wade the wreck’s last timbers for supplies', 'You haul a crate of rope-ends and a keg of the barge’s own pitch from the shallows. It is grim work, and Pike does not help.', [item('va_firepot', 2), dmg(1)])),
      ),
    ]),
  haven('The Wreck-Camp', 'va_camp',
    'The crew builds a camp from the Mudlark’s planks, a sail-tent and a driftwood fire. Pike counts rope, Ottoline takes stock of her tools, and nobody says what everybody is thinking: that there is no ship home. By evening you have a plan, a perimeter and a few tins of beans. In the dark the kilns glow along the ridge.',
    { shop: SHOP_CAMP, hires: ['va_f_pike', 'va_f_ottoline'], steps: [task('Rest', plain('Sleep in the lee of the wreck', 'You sleep like a stone, and wake to the cry of a bird you have never heard.', [heal(2)]))] }),

  // ---- Week of Jul 4 ----
  fight('The Web Groves', 'va_isle',
    'The jungle’s first tier is a forest of silk. Strands of white thread run between the trunks like sails, and in them hang the husks of things that used to be birds. A Grove Weaver, big as a handcart, lowers itself from a branch above your head.',
    ['va_grovespinner', 'va_grovespinner'], 2,
    'The silk shivers with the weight of something coming.',
    ['The weavers drop out of the canopy in a dry rattle. You cut a path through the silk and find, in the husks, a pouch of black pearls.', [gold(3)]],
    ['A fang finds you before the silk is cut.', [dmg(2), poison]],
  ),
  page('The Marsh of the Risen', 'va_isle',
    'A black marsh lies between the beach and the ridge, and in it, half-sunk in the reeds, stand the Pale Kiln’s servants: fired-clay figures with bone showing at the joint, patient and silent, up to their waists in mud. They have been standing there for a long time. They do not look at you. They do not need to.',
    [
      task('1. The causeway', check3('Cross on the old stone causeway without a sound', 'dex', ['stealth'], ['A pebble clicks. Every head turns.', [dmg(2)]], 'You cross the causeway on your toes.', ['You cross in a few quiet strides, and pick a clay pot off a servant’s belt as you pass.', [gold(2)]])),
      pick('2. The risen',
        check('Slip past the nearest servants', 'dex', ['stealth'], ['A clay hand takes your ankle. You tear free.', [dmg(2)]], 'You walk through the line of servants like a breeze through reeds.'),
        check('Read their glyphs and learn what they were', 'int', ['lore'], 'The glyphs are cramped, cold, hard to read.', ['They are names. Every servant carries the name of the person it was fired from, written on its chest in white slip.', [virtue(1)]]),
      ),
    ]),
  page('Springs of Many Colours', 'va_isle',
    'The jungle steams. At the foot of the ridge a terrace of hot springs steps down the hillside, each pool a different colour: blue as a summer sky, red as a wound, yellow as sulphur, green as a spring leaf. Ottoline sniffs and writes something on her sleeve.',
    [pick('Which pool',
      check('Bathe in the blue pool and rest your bones', 'wis', ['lore'], ['The blue is only cold. And the bottom is full of urchins.', [dmg(1)]], ['The blue pool is warm as milk and smells of lavender. Aches you didn’t know you had dissolve away.', [heal(4), buff('roll', 1)]]),
      check('Skim the red pool for crystals', 'dex', ['physical'], ['The red is hot enough to scald. You pull out blistered, with a single crystal.', [dmg(3), gold(1)]], ['The red pool’s crystals are black-glass, bright as embers. You pocket a handful of them.', [gold(5)]]),
      check('Fill a flask from the yellow spring', 'con', ['physical'], ['The fumes make your head spin. You lose the flask and your breakfast.', [dmg(1), poison]], ['The yellow water is mineral-sharp. In small doses, Pike says, it is the best medicine on the coast.', [item('va_mossbalm'), item('va_fernleaf')]]),
    )]),
  page('The Black-Glass Ridge', 'va_isle',
    'The island’s spine is a ridge of black volcanic glass, knapped by weather into a thousand blades. It sings in the wind. Crossing it is a matter of choosing your footing carefully and not looking down; the lowest edge of the ridge overlooks a Kiln road.',
    [
      task('1. The climb', check3('Climb the glass without cutting yourself to ribbons', 'dex', ['physical'], ['A shelf gives, and the glass opens your palms and shins.', [dmg(3)]], 'You climb the ridge on your fingertips.', ['You find a shard the length of your forearm and knap it clean as you climb: a blade, with a handle of wrapped cloth.', [item('va_glassshard')]])),
      pick('2. At the top',
        check('Look down at the Kiln road', 'wis', ['perception'], 'Too much smoke. You see only fire.', ['A column of white-masked scouts is moving along the road, with a barrow of bones and a hooked pole. They are looking for castaways.', [buff('roll', 1)]]),
        check('Scout the plateau beyond', 'int', ['travel'], 'The plateau is too far.', ['A flat shelf of grass, a stone circle and, in the middle, a kiln-cage with a living tree in it.', [virtue(1)]]),
      ),
    ]),
  fight('Kiln Scouts', 'va_isle',
    'Three scouts of the Pale Kiln block the ridge-road, in masks of white slip. “More,” one says in a dry voice. “They always send more.” They are not interested in your name, only your bones.',
    ['va_kilnscout', 'va_kilnscout'], 2,
    '“We have a place for you in the kilns.”',
    ['The scouts go over the glass edge, and you take their hooked poles and a map of the road scratched on a bone.', [gold(3), buff('roll', 1)]],
    ['They fight like potters: cold, careful, and without a wasted blow.', [dmg(3)]],
  ),
  haven('The Lava-Tube', 'va_camp',
    'You shelter the night in a lava-tube on the plateau’s edge: a long tunnel of black glass, warm from the mountain, with a vent that carries the smoke away. Ottoline lays out her tools and begins, quietly, to take the Crown’s measure. It is, she says, getting warmer. It likes this island.',
    { shop: SHOP_CAMP, hires: ['va_f_pike', 'va_f_ottoline'], steps: [task('Rest', plain('Sleep in the glass tunnel', 'The mountain’s breathing is slow and steady. You sleep.', [heal(3)]))] }),

  // ---- Week of Jul 11 ----
  page('The Plateau', 'va_isle',
    'A shelf of grass, a stone circle and, in the middle of the circle, a living tree in a kiln-cage. The tree’s bark is silver-ash and its leaves are red as coals. Kiln guards walk its perimeter. A woman’s voice, thin and furious, comes from the tree: “If you are here to rescue me, you are late. If you are here to fire me, you will need a bigger kiln.”',
    [pick('How you approach',
      check('Study the guards’ patrol', 'wis', ['perception'], 'Their pattern is too irregular.', ['They walk the cage’s circuit in threes, and every third circuit the path is empty for a count of forty.', [buff('roll', 1)]]),
      check('Sneak up to the tree', 'dex', ['stealth'], ['A guard sees you and you retreat.', [dmg(1)]], 'You slip through the stone circle to the tree’s foot.'),
    )]),
  page('The Ash-Dryad’s Cage', 'va_isle',
    'The woman steps out of the tree’s bark as a ripple of ash and ember. Emberlind, last dryad of the Ash Grove, has been kept in this cage for sixty years by the Pale Kiln, who feed on her and call it firing. Her voice is dry as ash: “Ask me what you came to ask. But be quick. They come back every third circuit.”',
    [
      pick('What you ask',
        check('Ask her what the Kiln is doing on this island', 'int', ['lore'], 'She answers with a riddle you cannot follow.', ['They have a lava chamber under the temple, and in it a giant dead things made, and a seed. An ember-seed: the last seed of her grove. They want it to fire a bigger servant than the island has ever seen.', [virtue(1), buff('roll', 1)]]),
        check('Ask her what she knows of the Seedcrown', 'cha', ['social'], 'She is not interested in your Crown.', ['“It is the forest’s,” she says. “Or it was. Carry it to the Wardens of the Kindling, if you can.”', [virtue(1)]]),
      ),
      task('Her cage', check('Examine the cage for a lock', 'int', ['lockpick'], 'It is a clay lattice with no obvious lock.', ['The cage is closed with a clay seal. Break it from the inside with her own bark, she says, and not before.', [buff('roll', 1)]])),
    ]),
  page('The Bargain', 'va_isle',
    'Emberlind will tell you how to pass the temple, but not for free. Her terms, and the Kiln’s, are written on a flame-carved stone: she will give you the way through the temple’s traps and the name of the Kiln-Born, if you will take the ember-seed from the lava chamber and *give it to her*, to plant in the ash. She watches you closely. “Say it,” she says. “And mean it.”',
    [
      task('1. Her terms', check3('Hear her terms and haggle for more', 'cha', ['social'], ['She is not a woman to haggle with. You are the poorer for trying.', [gold(-3)]], 'She softens a hair’s breadth. “Fair,” she says.', ['She smiles, and a leaf curls in her hair. “You are a good bargainer. I will teach you the temple’s secrets too.”', [buff('roll', 2)]])),
      task('2. Her warning', check('Listen for the lie in her words', 'wis', ['social'], 'You miss it, if it is there.', ['There is none, only a bone-deep fear: if the ember-seed is kept, it will be used.', [virtue(1)]])),
      pick('3. Your promise',
        plain('Swear to give her the seed', 'Emberlind inclines her ashen head. “Then a bargain is struck.” A small flame leaps from her fingers to yours and sits, a warm weight against your palm. “If you break it, you will feel it.”', [virtue(2), buff('roll', 1)]),
        check('Swear to try, and no more', 'int', ['social'], ['She sees through the hedging. “A bargain is a bargain, or it is nothing,” she says, and turns her back on you.', [buff('roll', -1)]], 'She nods, slowly. “Honest. I will take honest.”'),
      ),
    ],
    { note: 'A tense bargain: three steps, in order. What you promise here you will be asked to keep at the end of the chapter.' }),
  fight('Breaking the Cage', 'va_isle',
    'The cage is a work of art: a lattice of fired clay with kiln-script across every bar. As you work at the seal a horn sounds along the plateau, and the guards return at the double. Emberlind says nothing at all, which is itself a message.',
    ['va_kilnguard', 'va_kilnscout'], 2,
    '“Stop,” says the guard. “That is not yours.”',
    ['The seal cracks and the tree’s bark pulls back. Emberlind steps out onto the grass, free for the first time in sixty years, and stands in the sun with her eyes closed. “Go,” she says. “The temple is waiting.”', [gold(3), virtue(2), heal(2)]],
    ['The guards drive you from the cage. The seal holds.', [dmg(3)]],
  ),
  page('Up the Temple Stair', 'va_temple',
    'A flight of ten thousand steps, carved into the mountain’s shoulder, climbs from the plateau to the Kiln’s temple. Every hundred steps there is a white-slip mask in a niche. Every thousand there is a pot, full of ash. Emberlind has told you what each one means: the pots are tallies.',
    [
      task('1. The climb', check3('Climb the stair without tiring', 'con', ['physical', 'travel'], ['At the sixth thousand you are breathing like a bellows. You rest, and lose time.', [dmg(1), buff('roll', -1)]], 'You reach the top as the sun does.', ['You climb at a steady pace and arrive at the top with breath to spare.', [buff('roll', 1)]])),
      pick('2. The masks',
        check('Take a mask from a niche to pass as a Kiln acolyte', 'dex', ['stealth'], ['The mask’s slip is still wet, and clings.', [dmg(1)]], ['You wear the white mask and walk to the temple gate unchallenged.', [buff('def', 1)]]),
        check('Read the pot-tallies for the Kiln’s numbers', 'int', ['lore'], 'The numbers are too long.', ['The tallies show a great many pots, and one empty row, waiting.', [virtue(1)]]),
      ),
    ]),
  haven('Beneath the Portico', 'va_temple',
    'The temple has a portico as large as a village, carved with potters, kilns and long processions of the fired dead. In its shelter you camp for the night, the stone warm beneath you. Ottoline sketches the lintel, Pike counts the pots, and Emberlind’s promise sits in your palm like a coal.',
    { shop: SHOP_CAMP, hires: ['va_f_pike', 'va_f_ottoline'], steps: [task('Rest', plain('Sleep on warm stone', 'The temple hums under your head, slow and low. Dreams are strange.', [heal(3)]))] }),

  // ---- Week of Jul 18 ----
  page('The Hall of Lore', 'va_temple',
    'The first hall is a library of clay tablets, shelf after shelf of fired records. Each tablet is a person: their name, their trade, their last words, and a note on which servant they became. At the hall’s end a locked door bears a riddle in kiln-script: *“I am the last thing a potter makes, and the first thing a potter breaks.”*',
    [
      task('1. The riddle', check3('Solve the riddle on the door', 'int', ['lore'], ['You answer wrong. The door spits a jet of hot ash.', [dmg(2)]], '“A mould,” you say. The door swings open.', ['“A mould,” you say, and the tablets on the shelves tilt toward you, whispering the other answers to the riddle for free.', [buff('roll', 1)]])),
      pick('2. The records',
        check('Search the tablets for the ember-seed', 'wis', ['lore', 'perception'], 'The tablets are too many.', ['The ember-seed is kept in the lava chamber, in a vessel marked with a seed and a flame. The Kiln-Born stands over it.', [virtue(1)]]),
        check('Search for a name you recognise', 'cha', ['lore'], 'Nothing you know.', ['A clay tablet is signed with a clockmaker’s spindle and a star, in an older hand: a Founder’s signature.', [buff('roll', 1)]]),
      ),
    ]),
  page('The Hall of Statues', 'va_temple',
    'A long hall of stone figures, each in a different pose of work or worship, each lit by a coal in a clay bowl. At the end of the hall a door has no handle, only a ring of seven hollows the shape of hands. Emberlind’s hint: *“Each statue is doing the work it was made for. Put them in order.”*',
    [
      task('1. The order', check3('Work out the order of the seven poses', 'int', ['lore'], ['You press the wrong hollow. The statues turn their heads, and the nearest swings its stone arm.', [dmg(3)]], 'Seven hands, seven hollows, one door.', ['You solve it in three moves, and the hollows glow in order as you press them.', [item('va_thornseed'), gold(2)]])),
      pick('2. At the door',
        check('Press the seventh hollow with exactly the right pressure', 'dex', ['lockpick'], 'You press too hard. Something inside the wall clunks.', 'The door rolls aside on silent runners.'),
        check('Scan the statues’ eyes for a hidden mechanism', 'wis', ['perception'], 'Their eyes are only eyes.', ['One statue’s eyes are glass, and there is a lever behind them.', [buff('roll', 1)]]),
      ),
    ]),
  page('The Corridor of Trials', 'va_temple',
    'A long, narrow corridor of black glass runs ahead, its floor polished, its walls lined with niches and its ceiling hung with clay bells. Emberlind’s warning was short: *“There are nine traps. The first three are honest.”*',
    [
      trap({ trigger: 'A loose floor-tile', effect: 'darts spray from the left wall', twist: 'They are tipped with a sticky fire-resin.', trait: 'dex', tags: ['physical', 'perception'], hurt: 3 }),
      trap({ trigger: 'A tripwire at ankle height', effect: 'a block of clay swings from the ceiling', twist: 'It is hollow, and full of angry wasps.', trait: 'wis', tags: ['perception'], hurt: 2 }),
      trap({ trigger: 'A gap in the floor, three paces wide', effect: 'you fall into the pit below', twist: 'It is lined with sharpened potsherds.', trait: 'dex', tags: ['physical'], hurt: 3, prize: ['You clear the pit in a single leap, and find a potsherd with a name on it, wedged in the wall: a mercy you carry out.', [virtue(1), gold(1)]] }),
    ],
    { anyOrder: false, note: 'Three traps in a row. Spot the trigger and you pass; spring it and you pay.' }),
  page('The Corridor of Trials, Continued', 'va_temple',
    'The corridor narrows, and the traps grow clever. The fourth trap is loud, the fifth is quiet, and the sixth is the sort of thing a potter would build if she thought a hero too foolish to see the first five.',
    [
      trap({ trigger: 'A pressure-plate under a bone-white tile', effect: 'a spike-wall slides in from the right', twist: 'The wall is slow, and the exit is closing.', trait: 'dex', tags: ['physical'], hurt: 3 }),
      trap({ trigger: 'A whispering bell in a niche', effect: 'the floor tips and the corridor slides toward a vent', twist: 'The vent breathes fire every ten heartbeats.', trait: 'con', tags: ['physical'], hurt: 3 }),
      trap({ trigger: 'A tablet that asks you to read it aloud', effect: 'the words are a summoning, and ash rises from the floor', twist: 'The ash has hands, and they are not gentle.', trait: 'int', tags: ['lore'], hurt: 2, prize: ['You read the first line, stop, and read the last line instead. The ash falls back to the floor with a sigh, and a tile behind you slides open on a cache of torches.', [item('va_lanternoil', 2)]] }),
    ],
    { note: 'Three more traps. Emberlind’s hint was right: they are less honest.' }),
  fight('The Statues Wake', 'va_temple',
    'At the corridor’s end, in a vaulted chamber, the statues from the hall are waiting. They have walked ahead while you were occupied. One of them turns a stone head, slowly, and says in a voice like a grindstone: “Hold.”',
    ['va_livingstatue', 'va_livingstatue'], 3,
    'Stone creaks. Fire flickers behind a hundred eyes.',
    ['The statues crash into rubble. Among them is the first of the Kiln’s tablets with your name already on it, left blank.', [gold(4), virtue(1)]],
    ['A stone fist leaves you winded in the rubble before the statues stand aside.', [dmg(3)]],
  ),
  haven('The Antechamber', 'va_temple',
    'A small round chamber at the temple’s heart, warm and dry, with a ring of clay benches and a spring in the centre. You make a camp. Tomorrow you go down to the lava chamber. Ottoline is quiet. Pike is quieter. The Seedcrown, in your pack, is nearly too hot to hold.',
    { shop: SHOP_CAMP, hires: ['va_f_pike', 'va_f_ottoline'], steps: [task('Rest', plain('Sleep beside the spring', 'You sleep deeply, and the Crown glows.', [heal(3)]))] }),

  // ---- Week of Jul 25 ----
  page('Down to the Lava Chamber', 'va_lava',
    'The stair spirals down into the mountain’s root, and the air gets thicker and hotter with every turn. The walls glow dull red, and the last hundred steps are bridged across a chasm of pure heat. At the bottom, a door of fired clay as high as a house. Behind it, you can hear something very large, breathing.',
    [pick('How you prepare',
      check('Study the lava’s flow for a safe path', 'wis', ['perception', 'lore'], 'The lava’s patterns are too chaotic.', ['The lava rises and falls on a slow, regular beat, like breathing.', [buff('roll', 1)]]),
      needs('va_l6_win', plain('Recall Pike’s sea-sense for rhythm', 'Pike’s timing of the tide comes back to you: count to nine, then move. The lava breathes on the same rhythm.', [buff('def', 1), heal(2)])),
      needs('va_l5_win', plain('Use the Steward’s lantern-oil to light the way', 'Halloran Vey’s lantern-oil burns white. It shows the safe path across the floor as a line of cooler stone.', [buff('roll', 1), item('va_lanternoil')])),
      needs('va_l5_loss', plain('Think of the Steward’s hall', 'You think of the burning city and the old man’s keys, and your hands steady. It is a grim kind of focus, but it works.', [buff('atk', 1), dmg(1)])),
    )]),
  page('The Potters’ Workshop', 'va_lava',
    'Ahead of the lava chamber is the Kiln’s last workshop: benches of clay, racks of bones, a table of unfinished faces. On the wall, in a hundred hands, is the Kiln’s whole creed: *“We are not unkind. We simply cannot bear waste.”* There is a ledger, and your own name is in it, in a hand you have not seen.',
    [
      task('1. The workshop', check3('Search the workshop for something useful', 'int', ['perception', 'lore'], ['You touch a bench of wet clay and it tries to keep your hand.', [dmg(2)]], ['You find a bag of white slip, a clay mask and a bundle of ash-salve.', [item('va_mossbalm'), item('va_fernleaf')]], ['You find a potter’s pouch, with silver in it and a note: *We will need more bone.*', [gold(5), item('va_stagbrew')]])),
      pick('2. The ledger',
        check('Read your own name in the ledger', 'wis', ['lore'], 'It is too bright.', ['The ledger lists you under “future”, with a sketch of your face on a clay mask. It is a very good likeness.', [buff('roll', 1)]]),
        check('Tear out the last page', 'dex', ['stealth'], ['The paper tears, and an alarm bell sounds somewhere.', [dmg(1)]], 'You pocket the page. Whoever comes for you will be one name short.'),
      ),
    ]),
  fight('The Kiln Guard', 'va_lava',
    'The chamber’s door is guarded by the last of the Kiln’s sentries: a pair of fired-clay halberdiers in white-slip masks. They do not speak. They simply lower their halberds across the door and wait to be asked something.',
    ['va_kilnguard', 'va_risen'], 3,
    'The halberds come down together.',
    ['The guards crumble. The door of fired clay swings open on the lava chamber, and the heat takes your breath.', [gold(4)]],
    ['The halberds find you twice, and the door stays shut.', [dmg(3)]],
  ),
  page('The Floor Is Lava', 'va_lava',
    'The chamber is a cathedral of fire. The ceiling is a black dome pocked with vents; the floor, where there is any, is a scatter of basalt plates floating on a sea of lava. At the centre, on a stone island, stands a clay vessel marked with a seed and a flame. Behind it, still as a dead tree, a giant waits.',
    [
      task('1. The first plates', check3('Cross the basalt plates to the central island', 'dex', ['physical'], ['A plate tips. You burn.', [dmg(3)]], 'You skip across the basalt on your toes.', ['You cross in four long strides, and the lava doesn’t even touch your boots.', [buff('def', 1)]])),
      pick('2. At the island',
        check('Sidle to the vessel without waking the giant', 'dex', ['stealth'], ['The giant’s head turns. It is awake.', [buff('def', -1)]], ['You lift the lid of the vessel. Inside, on a bed of ash, is a seed, glowing like a coal. You do not take it yet.', [buff('roll', 1)]]),
        check('Study the giant’s cracks for a weakness', 'wis', ['perception'], 'It is only a very large, very hot statue.', ['The cracks glow brightest at the left shoulder. It is where the kiln-fire is thinnest.', [buff('atk', 1)]]),
      ),
    ]),
  fight('The Kiln-Born', 'va_lava',
    'The giant opens its eyes, and they are two holes of white fire. It rises out of its stone crouch in a shower of cinders, every crack in its body glowing, and the basalt plates beneath your feet begin to tilt. “The Kiln,” it says in a voice like a collapsing furnace, “does not waste.”',
    ['va_kilnborn'], 4,
    'The floor bucks. The giant swings.',
    ['You put the last blow in at the giant’s left shoulder, where the kiln-fire is thinnest. The Kiln-Born comes apart along its cracks, and the fire goes out of its eyes like a lamp snuffed. The lava, relieved, settles. In the clay vessel at the island’s heart the ember-seed glows steadily on, untouched.', [gold(6)]],
    ['The giant swings once, and you are flat on a plate of hot basalt with the sky gone red. It does not follow up. It stands, patient as a kiln, and waits for you to get up.', [dmg(3)]],
    {
      steps: [task('The hazard: the floor', check3('Keep your footing as the plates tilt and the lava rises', 'dex', ['physical'], ['The plate dips and the lava licks your boots. You come out of it scorched.', [dmg(3)]], 'You ride the plate down and hop to the next. The lava passes under you.', ['You dance across the tilting basalt like a ship’s boy on a rolling deck, and the lava is just more weather.', [buff('def', 1)]]))],
      note: 'A single foe: it can only be destroyed in the final round. A strong hit before then Stuns it, so it can’t hurt you that round. The floor is a hazard: how you cross it comes first. The legacy is decided afterwards, by your choice.',
    },
  ),
  haven('The Seed in Your Hand', 'va_lava',
    'The Kiln-Born lies in pieces across the basalt, its cracks gone dark, its fire out. The lava is calm. In your hand, or in the clay vessel at your feet, the ember-seed glows like a coal that has never once gone out. Emberlind’s promise is in your palm. Ottoline, silent, holds Pike’s arm. The Seedcrown, in your pack, is warm as a living thing.',
    {
      shop: SHOP_CAMP,
      hires: ['va_f_pike', 'va_f_ottoline'],
      steps: [
        pick('The ember-seed',
          plain('Take the seed to the ash-dryad and give it to her, as you swore', 'You walk down the ten thousand steps with the seed in your cupped hands. At the plateau, Emberlind stands in the sun. You put the seed in her palm, and the ash around her feet turns green. “The Accord,” she says quietly, “has a friend.”', [virtue(3), heal(3), legacy('va_l7_win')]),
          plain('Keep the seed, for the Seedcrown’s sake, and your own', 'You close your hand over the seed. It is warm and heavy, and it will do a great many things for a person who holds it. You do not stop at the plateau. Behind you, Emberlind watches you go, and says nothing, which is the worst thing she could say.', [item('va_embercharm'), gold(5), legacy('va_l7_loss')]),
        ),
      ],
      level: 'The Ashen Isle has tried you in every way it could, and you came out of it with the Seedcrown still warm in your pack. You are stronger for the island, and for the choice.',
      note: 'Rest, resupply, and choose what becomes of the ember-seed. Your choice decides the chapter’s legacy.',
    }),
]
