// Saving Santa: twenty-five doors, one page a day from December 1 to
// Christmas morning. No weekend pages: an advent calendar has a door for
// every day. Bosses on the 7th, 14th, 21st (the longest night) and the 24th.
import type { Day, Effect } from '../../../../engine/types'
import { boss, buff, check, check3, dmg, fight, gold, haven, heal, item, page, pick, plain, task, travel, virtue, type Draft } from '../../emberroad/days/build'

const SHOP_GREEN = [
  { id: 'ss_cocoa', price: 5 },
  { id: 'ss_candycane', price: 4 },
  { id: 'ration', price: 2 },
  { id: 'ss_scarf', price: 14 },
  { id: 'ss_bobblehat', price: 12 },
]
const SHOP_WORKSHOP = [
  { id: 'ss_cocoa', price: 5 },
  { id: 'ss_figgypudding', price: 9 },
  { id: 'ss_jinglebell', price: 6 },
  { id: 'ss_mittens', price: 15 },
  { id: 'ss_snowboots', price: 16 },
]
const SHOP_AURORA = [
  { id: 'ss_figgypudding', price: 9 },
  { id: 'ss_jinglebell', price: 6 },
  { id: 'ss_candycane', price: 4 },
  { id: 'ration', price: 2 },
]

const nice: Effect = { type: 'virtue', amount: 1 }

export const DRAFTS: Draft[] = [
  // ---- Week one: the empty sleigh ----
  page('The First Door', 'ss_village',
    'On the first morning of December an advent calendar is waiting on your doorstep in Pinecrook, the last village before the long white North. Nobody in the lane saw who left it. It has twenty-five little paper doors, and as you pick it up the first one swings open by itself. Inside, in hurried silver ink: “Help. Follow the bells. —S.” Somewhere out in the snowwood, sleigh bells ring once, very loudly, and then stop.',
    [
      task('1. Read it again', check('Study the handwriting and the silver ink', 'int', ['lore'], 'It could be a prank. It doesn’t feel like one.', ['The ink is still wet, and smells of pine and cold stars. Whoever wrote this was in a hurry, and very far from home.', [buff('roll', 1)]])),
      task('2. Wrap up warm', plain('Pull on your boots and head for the trees', 'The whole lane is quiet, which it never is. Even the church bell sounds muffled when it strikes the hour.')),
    ],
    { note: 'An advent campaign: a new door opens every day until Christmas morning.' }),
  page('The Sleigh in the Snow', 'ss_snowwood',
    'You find it at the bottom of a long slide of broken branches: a great red sleigh, tipped on its side in a drift, its runners bent. There is no driver. The traces hang empty and the reindeer are gone. A sack has split open across the snow, and the letters inside are blowing away one by one into the trees.',
    [pick('Choose one',
      check('Chase down the letters before they’re lost', 'dex', ['physical'], ['You slip on a frozen root and catch most of them with your face.', [dmg(1)]], ['You catch every last one, and stuff them in your coat. Some are addressed in crayon.', [nice]]),
      check('Look for tracks around the sleigh', 'wis', ['perception', 'travel'], 'The snow has been swept smooth, as if something brushed out every footprint.', ['Hoofprints scatter in four directions. And one other set of tracks: long, narrow, and leading north, with no sound left in the snow around them.', [buff('roll', 1)]]),
    )],
    { icons: [{ kind: 'loot', x: 72, y: 70 }] }),
  fight('The Quiet Things', 'ss_snowwood',
    'While you are wrestling the sleigh upright, the forest goes silent: no wind, no creak of branches, not even your own breath. Small white shapes drop from the boughs, mouths wide, gulping up every sound you make.',
    ['ss_hushling', 'ss_hushling'], 2,
    'Hushlings! Shout as loud as you can. They hate it.',
    ['The last hushling bursts into a puff of snow, and all the sound it swallowed comes back at once: birdsong, bells, a very surprised owl.', [gold(3)]],
    ['They scatter into the trees with a mouthful of your voice. You can only whisper for an hour.', [dmg(1)]]),
  page('The Torn List', 'ss_cocoa',
    'Back in Pinecrook you spread the letters out on a table in Marigold’s cocoa house. Among them is a long scroll, torn in half: a list of names, each with a little mark beside it. Half the names are missing. Someone has scrawled across the bottom in frost that hasn’t melted, even by the fire: NO MORE NOISE.',
    [pick('Choose one',
      check('Write back to the children whose letters got wet', 'cha', ['social'], 'Your handwriting is not what it was, but you try.', ['You write a short note for each one: your letter arrived, it is being looked after. It feels important.', [nice, virtue(1)]]),
      check('Work out what the frost-writing is made of', 'int', ['lore'], 'It’s cold and it won’t melt. That’s all you can tell.', ['It isn’t frost at all. It’s silence, pressed flat and written down. Someone very old and very powerful did this.', [buff('roll', 1)]]),
    )]),
  page('A Reindeer on the Ice', 'ss_frozenlake',
    'A crowd has gathered at the edge of Pinecrook’s frozen lake. Out in the middle, a young reindeer with a silver harness-bell is standing very still on ice that is creaking under her hooves. She is far too frightened to move. Her harness tag says SIXPENCE.',
    [
      task('1. Get out to her', check('Spread your weight and slide out across the ice', 'dex', ['travel'], ['The ice cracks under one boot. Your leg goes in to the knee, and it is very, very cold.', [dmg(2)]], 'You make it to her side, flat on your belly.')),
      task('2. Bring her home', check3('Talk her into following you back', 'wis', ['social', 'travel'], ['She bolts, slips, and knocks you flat before she finds her feet.', [dmg(1)]], 'Step by careful step, she follows you to the shore.', ['She follows you home and nuzzles your pocket for the rest of the day. The whole village cheers.', [nice, gold(2)]])),
    ]),
  haven('The Cocoa House on the Green', 'ss_cocoa',
    'Marigold Puddingstone throws another log on the fire that hasn’t gone out in sixty winters and fills the biggest mug she owns. Half of Pinecrook crowds in to warm up and talk about the sleigh. Sixpence has been given the stable behind the bakery and an alarming quantity of carrots.',
    { shop: SHOP_GREEN, icons: [{ kind: 'pickpocket', x: 30, y: 64 }], note: 'Rest and resupply.' }),
  boss('The Gingerbread Brute', 'ss_village',
    'At dusk the bakery wall bursts open. Something enormous lurches out onto the green: a gingerbread giant, ten feet tall, with a frozen icing grin and gumdrop buttons hard as stone. Frost curls off its shoulders. It turns its head towards the stable where Sixpence is sleeping.',
    'ss_gingerbrute', 3,
    'The Brute stomps across the green!',
    ['With a last blow the Brute cracks down the middle and crumbles into a pile of very cold, very large biscuit. In the rubble you find a ribbon of silver ink: a map, pointing north.', [gold(5), item('ss_cocoa')]],
    ['The Brute crashes away into the snow, shedding crumbs. It has left the stable alone, and it has left you a lot of bruises.', [dmg(2)]]),

  // ---- Week two: the road north and the silent workshop ----
  page('The North Road', 'ss_snowwood',
    'You set out at first light with Sixpence pulling a borrowed sled and the silver map tucked in your mitten. The road north is old and narrow, cut between pines so tall and so loaded with snow that the sky is just a pale stripe overhead.',
    [task('Travel', check3('Keep the sled on the road through the drifts', 'con', ['travel'], ['A drift swallows the sled to its rails. Digging it out costs you supper.', [travel(1), dmg(1)]], ['Long, cold miles, but Sixpence knows the way better than the map.', [travel(1)]], ['Sixpence finds a snowed-under woodcutter’s hut with a full woodpile and a tin of biscuits left out for travellers.', [travel(1), heal(2)]]))]),
  page('Bells Under the Ice', 'ss_frozenlake',
    'The road crosses a long lake frozen clear as glass. Far below, sunk in the dark water, something glitters: a whole string of silver sleigh bells, still on their strap. When you put your ear to the ice, very faintly, they are ringing.',
    [pick('Choose one',
      check('Cut a hole and fish them out', 'str', ['physical'], ['You cut the hole. The water is so cold your arm forgets it belongs to you.', [dmg(2)]], ['Up they come in a spray of icy water, ringing like mad. Sixpence stamps and snorts with joy.', [item('ss_jinglebell', 2)]]),
      check('Listen to the tune they are ringing', 'cha', ['perception', 'social'], 'Just jingling. Isn’t it?', ['It’s a carol, an old one, and it’s a code: the notes rise and fall like the hills on the map. You know which pass to take now.', [buff('roll', 2)]]),
    )]),
  page('The Workshop Gates', 'ss_workshop',
    'Over the last hill the Workshop comes into view: a long, crooked hall of red wood and green shutters, with a hundred chimneys and not one of them smoking. The great gates are frozen shut. Every window is dark. In the snow by the door sits a single mitten, very small, and very lost.',
    [
      task('1. Get the gates open', check('Work the frozen latch loose', 'int', ['lockpick'], ['The latch is frozen solid. You get in through a coal chute, and you look it.', [dmg(1)]], 'The latch gives with a crack like a gunshot. Snow slides off the roof in a great whump.')),
      task('2. Keep the mitten', plain('Tuck the little mitten into your pocket', 'Whoever lost it will want it back.', [nice])),
    ]),
  fight('The Toys Have Gone Wrong', 'ss_workshop',
    'Inside, the workshop floor is covered in half-finished toys. As your lantern swings across them, a row of toy soldiers as tall as men turns their painted heads towards you. Their keys begin to turn by themselves, slowly, with a sound like ice cracking.',
    ['ss_toysoldier', 'ss_toysoldier'], 2,
    'Tick, tick, tick: the soldiers march!',
    ['The soldiers wind down and topple over with a clatter. Underneath one of them, a door in the floor: and from below, someone is knocking.', [gold(4)]],
    ['You smash your way past, but one of them keeps marching after you all evening, very slowly, until its key runs out.', [dmg(1)]]),
  page('The Elves Beneath the Floor', 'ss_workshop',
    'Under the trapdoor, in the warm cellar where the wrapping paper is kept, are the workshop folk: forty of them, small, sharp-eared and very cross, huddled together under a quilt of gift-ribbon. The oldest, a woman called Tansy Brightwick, has one mitten on. “The Hush came on the first of the month,” she says. “She wants the world quiet. She took him north, beyond the lights, to a palace where nothing ever makes a sound.”',
    [pick('Choose one',
      plain('Give Tansy back her mitten', 'Tansy stares at it, then at you, and puts it on very slowly. “Well,” she says. “Well. We had better help you, then.”', [nice, buff('roll', 1)]),
      check('Ask what it would take to follow him', 'wis', ['lore'], 'Tansy shakes her head. “More than you have. More than we have.”', ['“Three things,” Tansy says. “The bell that rings in the first snow. The lantern that the sleigh steers by. And a voice the Hush can’t swallow.” She looks at you hard. “We have the bell tower. The rest is on you.”', [buff('roll', 1)]]),
    )]),
  haven('The Wrapping Room', 'ss_workshop',
    'With the boilers lit again and the chimneys smoking, the workshop folk make you a bed in a mountain of tissue paper and bring you more food than you can eat. Tansy rummages through the stores for anything useful. For the first time since the first door opened, you sleep without dreaming of silence.',
    { shop: SHOP_WORKSHOP, level: 'You came this far on borrowed boots and stubbornness. You are a little stronger for it.' }),
  boss('The Nutcracker General', 'ss_workshop',
    'In the morning the great doors of the toy hall slam open. The workshop’s own nutcracker, twelve feet of painted oak with a sword as long as a sled, marches in with frost in the joints of its jaw. Its eyes have gone white. It points the sword straight at you.',
    'ss_nutgeneral', 3,
    'The Nutcracker General attacks!',
    ['The General’s jaw snaps one last time and it crashes to the floor. The white goes out of its eyes, and it sits up, puzzled and painted and very sorry. It offers you its sword hilt-first.', [gold(6), item('ss_figgypudding')]],
    ['The General marches out into the snow, still under the Hush’s spell. The workshop folk patch you up with bandages made of ribbon.', [dmg(2)]]),

  // ---- Week three: the bell, the lantern and the longest night ----
  page('The Bell of First Snow', 'ss_belltower',
    'The bell tower stands at the edge of the workshop grounds, so old the stones have grown together. At the top hangs a bell of clear blue ice, the one that rings by itself in the first snow of every year. This year it never rang. The stairs inside have frozen into a ramp of glass.',
    [
      task('1. Climb the tower', check('Haul yourself up the frozen stair', 'str', ['physical'], ['You slide all the way down twice before you reach the top.', [dmg(2)]], 'Up and up, until the whole white North lies below you.')),
      task('2. Wake the bell', check3('Ring the ice bell without cracking it', 'dex', ['lore'], ['It rings once, thin and sad, and a crack runs up its side.', [dmg(1)]], 'It rings, clear as a winter morning, and you feel it in your teeth.', ['It rings, and every bell in the North rings back: sleigh bells, church bells, cow bells, the bell on a cat in a cottage forty miles away.', [nice, buff('roll', 1)]])),
    ]),
  page('Carollers in the Dark', 'ss_village',
    'On the road to the far hills you pass through Ashby Under-Snow, a hamlet where the Hush has already been. Nobody speaks. Nobody can. They stand in their doorways moving their lips, and nothing comes out at all.',
    [pick('Choose one',
      check('Sing to them until they can sing back', 'cha', ['social'], 'You sing until your voice cracks. A few of them hum.', ['You start the old song. A child joins in, then her grandmother, then the whole street, louder and louder, until the snow falls off the roofs.', [nice, virtue(1), heal(2)]]),
      check('Find the hushling nest that is drinking their voices', 'wis', ['perception'], ['You find it the hard way, with a face full of snow.', [dmg(1)]], ['Under the well cover: a nest of sleeping hushlings, fat with stolen voices. You bang the cover like a drum and every voice in Ashby comes back at once.', [nice, gold(3)]]),
    )]),
  fight('Down the Coal Mine', 'ss_snowwood',
    'The path to the lantern runs through an old coal mine. Inside, the coal goblins are waiting: the ones who get a lump of coal every year and have decided, after long and bitter thought, that this year nobody gets anything.',
    ['ss_coalgoblin', 'ss_coalgoblin'], 2,
    'Coal goblins! Mind the flying lumps.',
    ['The goblins sit down in the coal dust and sulk. When you leave a candy cane on the cart rail for each of them, the smallest one cries.', [nice, gold(3)]],
    ['You get through, black from head to toe. You will be finding coal dust in your ears until spring.', [dmg(1)]]),
  page('The Star-Lantern', 'ss_belltower',
    'At the bottom of the mine is a cave full of old, dark lanterns, hundreds of them, hung from every rock. Only one of them is meant to guide the sleigh, and it isn’t lit. Tansy’s note says only: The true one is warm.',
    [task('Find the lantern', check3('Feel for the warm one in the dark', 'int', ['lore', 'perception'], ['You burn your hand on a lantern full of goblin coals.', [dmg(1)]], 'There. One lantern, faintly warm, like a mug someone just set down.', ['There: and when you lift it down, it lights itself with a soft gold glow, and a shard of it comes loose in your hand.', [item('ss_starshard')]]))]),
  fight('Sleet Wolves', 'ss_frozenlake',
    'On the way back, the wind changes. Out of the driving sleet come shapes that are made of it: long grey wolves that run without a sound and howl without a sound, closing in on the lantern light.',
    ['ss_sleetwolf', 'ss_sleetwolf'], 2,
    'The Sleet Wolves circle in!',
    ['The last wolf comes apart into a flurry of sleet. Sixpence snorts, unimpressed.', [gold(4)]],
    ['You drive them off, but not before they’ve bitten through your scarf.', [dmg(2)]]),
  haven('The Aurora Inn', 'ss_aurora',
    'The last inn before the lights is a round stone hut with a turf roof, kept by a very old woman who has seen the sleigh fly over every year of her life and never once spoken to its driver. She gives you the bed nearest the stove. Above the hut, green and violet lights ripple across the sky like curtains.',
    { shop: SHOP_AURORA, level: 'Bell, lantern, and the miles behind you. You are stronger than the person who opened the first door.' }),
  boss('The Longest Night', 'ss_aurora',
    'It is the longest night of the year, and something wakes under the snowfield beyond the inn. It rises in a long white coil, bigger than the workshop, bigger than Pinecrook: a wyrm of packed snow and blue ice. It opens its mouth, and all the sound in the world starts to pour into it.',
    'ss_snowwyrm', 3,
    'The Snow Wyrm rises!',
    ['The Wyrm comes apart in an avalanche of soft, ordinary snow. Every sound it swallowed rushes back out: a thousand carols, laughing, a dog barking somewhere very far away. Tomorrow the nights start getting shorter.', [gold(6), heal(3)]],
    ['The Wyrm sinks back under the snow, still full of stolen sound. The night is long and cold, but morning comes.', [dmg(2)]]),

  // ---- The last doors ----
  page('Over the Lights', 'ss_aurora',
    'The workshop folk have mended the sleigh and sent it up the road on a sledge pulled by forty elves. Sixpence’s cousins have come in out of the hills, one by one, following the sound of the ice bell. With the Star-Lantern hung at the front, the sleigh lifts off the snow, and rises up into the lights.',
    [task('Fly', check3('Hold the reins steady through the aurora', 'wis', ['travel'], ['The sleigh spins through a ribbon of green fire. You hang on, but only just.', [dmg(2)]], 'You fly through curtains of light, and out the other side.', ['You fly as if you’d been born to it. Sixpence leads, and the bells ring all the way.', [nice, heal(2)]]))]),
  page('The Silent Palace', 'ss_palace',
    'Beyond the lights, on a sheet of ice that goes on forever, stands a palace of snow-glass where nothing makes any sound at all. Not your boots, not your heartbeat. Through the walls you can see him: a big man in a red coat gone grey with frost, asleep in a chair of ice, his beard frozen to his chest.',
    [
      task('1. Get inside', check('Creep through the halls without a sound', 'dex', ['stealth'], ['Your sleeve brushes a pillar and a hundred hushlings turn their heads.', [dmg(2)]], 'Silent as the palace itself, you slip inside.')),
      pick('2. Wake him',
        check('Hold the Star-Lantern close to warm him', 'int', ['lore'], 'The frost on his coat steams, but he doesn’t wake.', ['The frost melts off his eyelashes. He opens one eye. “Ah,” he says, in a voice like a crackling fire. “You got my letter.”', [nice]]),
        check('Sing him the carol from the ice bells', 'cha', ['social'], 'Your voice vanishes in the silence before it reaches him.', ['He stirs, and hums along, very quietly, and then opens his eyes. “That one was always my favourite,” he says.', [nice]]),
      ),
    ]),
  boss('Christmas Eve', 'ss_palace',
    'She comes down the great stair as he gets to his feet: tall and pale, in a gown of falling snow, with no mouth at all. The Hush. She lifts one long hand, and the silence in the palace grows so heavy you can hardly stand. You raise your voice anyway.',
    'ss_hush', 4,
    'Make as much noise as you can!',
    ['The Hush comes apart like the first snowfall, slowly, gently, until there is nothing left but quiet. Not her quiet: the good kind, the hush of a house on Christmas Eve when everyone is asleep. Santa laughs, and the palace walls ring like a bell.', [gold(8), heal(4)]],
    ['She falls back, and back, and finally drifts away on the wind, not beaten but outnumbered: Santa’s voice, and yours, and the bells. “She’ll be back next year,” he says, helping you up. “She always is. So will we.”', [dmg(2)]]),
  page('Christmas Morning', 'ss_village',
    'You land on Pinecrook green just as the sun comes up, with the sleigh empty and the sack delivered and every bell in the village ringing. Every chimney is smoking, every door is open, and somebody has set out a plate of mince pies the size of a cartwheel. On your own doorstep is a small parcel in brown paper. The tag says: To the one who opened the doors. —S.',
    [
      task('1. Open your present', plain('Untie the string', 'Inside is a silver bell on a red ribbon. When you ring it, far off in the North, someone laughs.', [item('ss_figgypudding'), gold(5)])),
      pick('2. Spend the day',
        plain('Join the carols on the green', 'You sing until you are hoarse, and the tower bell rings so hard it wobbles.', [nice]),
        plain('Share out the mince pies', 'There are enough for everyone in Pinecrook, twice, and Sixpence.', [nice]),
      ),
    ],
    { note: 'The last door. Merry Christmas.' }),
]

/** Give each draft its December date: one page per day, December 1–25. */
export function dateAdvent(drafts: Draft[]): Day[] {
  if (drafts.length !== 25) throw new Error(`Saving Santa needs 25 doors, got ${drafts.length}`)
  return drafts.map((d, i) => {
    const { wk: _wk, ...rest } = d
    void _wk
    return { ...rest, id: `ss-${i + 1}`, month: 12, day: i + 1 }
  })
}

export const DAYS: Day[] = dateAdvent(DRAFTS)
