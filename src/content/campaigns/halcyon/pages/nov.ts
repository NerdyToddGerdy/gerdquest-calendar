// November — The Long Night. The Combine besieges Fenn’s Shipyard.
import type { Day } from '../../../../engine/types'
import { act, bonus, boon, chk, chk3, cr, dmg, dogfight, fight, give, haven, heal, levelUp, page, parts, repair, step, travel, virtue, week } from '../lib'
import { DOCK_LATE, SHOP_LATE } from '../shops'

const DC = 15

export const NOV: Day[] = [
  // ---------- The siege begins ----------
  ...week(11, 6, [
    page('hd-siegebegins', 'The Siege Begins', 'bridge', 'The Combine fleet arrives at dawn, filling the sky around Fenn’s Shipyard with grey hulls.', [
      step(undefined, chk3('Read their formation', 'wis', ['perception'], 'Too many ships to make sense of.', ['Their flank is thin on the dark side.', bonus('roll', 1)], ['A thin flank, and the Final Notice hanging back, watching.', bonus('roll', 1), boon], DC)),
    ]),
    dogfight('hd-firstwave', 'The First Wave', 'Two cutters and a picket lead the first wave against the yard’s gate.', {
      craft: ['hd_cutter', 'hd_cutter', 'hd_picket'],
      rounds: 3,
      intro: 'The yard’s guns open up around you.',
      winText: 'The first wave breaks.',
      loseText: 'The first wave pulls back, but the gate is damaged.',
      win: [cr(8)],
      lose: [dmg(3)],
    }),
    page('hd-shieldline', 'The Shield Line', 'station', 'The yard’s shield generators are failing under the bombardment.', [
      step(undefined, chk3('Keep the shields up', 'int', ['tech'], ['A generator blows up in your face.', dmg(2)], ['The shields hold, barely.', repair(1)], ['The shields hold — and you push power to the Halcyon Debt’s too.', repair(2), boon], DC)),
    ]),
    fight('hd-breach1', 'The First Breach', 'station', 'Siege troopers in boarding armor break through the yard’s east wall.', {
      enemies: ['hd_siegetrooper', 'hd_siegetrooper'],
      rounds: 3,
      intro: 'Breaching shotguns boom in the corridors.',
      winText: 'The breach is sealed.',
      loseText: 'You hold them back while the breach is sealed behind them.',
      win: [cr(8)],
      lose: [dmg(3)],
    }),
    page('hd-rheearrives', 'Rhee Arrives', 'space', 'A Navy frigate drops out of the dark and opens fire on the Combine’s flank. Rhee has come — alone, against orders.', [
      step(undefined, act('Hail the frigate', '“Captain,” Rhee says, “I believe I owe you a debt.”', virtue(1), boon, give('hd_traumakit'))),
    ]),
    haven('hd-levelseven', 'A Lull in the Siege', 'station', 'The Combine pulls back to regroup. For two days, the yard breathes. Everyone who has fought this week is tougher than they were.', {
      note: 'Rest, level up, and try the weekly lottery.',
      steps: [step('Level up', act('Train between assaults', 'You learn fast when the lessons come with live ammunition.', levelUp))],
      shop: { items: SHOP_LATE },
      dock: DOCK_LATE,
    }),
  ]),

  // ---------- Holding ----------
  ...week(11, 13, [
    page('hd-supplyrun', 'Supply Run', 'space', 'The yard is running low on food. A supply convoy is waiting outside the blockade.', [
      step(undefined, chk3('Run the blockade', 'dex', ['piloting'], ['You get through, but the convoy loses half its cargo.', dmg(2), travel(1)], ['The convoy makes it through.', give('ration', 3)], ['The convoy makes it through, with a crate of medicine besides.', give('ration', 3), give('hd_medgel', 2)], DC)),
    ]),
    dogfight('hd-secondwave', 'The Second Wave', 'The Combine’s second wave is heavier: a lancer and two cutters.', {
      craft: ['hd_lancer', 'hd_cutter', 'hd_cutter'],
      rounds: 3,
      intro: 'The lancer’s great gun fires, and the yard shakes.',
      winText: 'The second wave breaks.',
      loseText: 'The second wave pulls back. The yard is hurting.',
      win: [cr(8), parts(1)],
      lose: [dmg(3)],
    }),
    page('hd-wounded', 'The Wounded', 'station', 'The infirmary is full. Everyone who can hold a bandage is helping.', [
      step(undefined, chk3('Help the medics', 'int', ['medical'], 'You do your best. It isn’t always enough.', ['You save lives today.', virtue(1), heal(2)], ['You save lives, and teach a dozen volunteers to do the same.', virtue(2), heal(3)], DC)),
    ]),
    fight('hd-breach2', 'The Second Breach', 'station', 'Siege troopers and a Combine elite break into the yard’s fuel depot.', {
      enemies: ['hd_siegetrooper', 'hd_elite'],
      rounds: 3,
      intro: 'If the depot goes up, so does the yard.',
      winText: 'The depot is safe.',
      loseText: 'You drive them off, but there’s a fire in the depot.',
      win: [cr(8)],
      lose: [dmg(3)],
    }),
    page('hd-thaleterms', 'Thale’s Terms', 'bridge', 'For the first time, Auditor-General Maren Thale speaks to you directly. Her voice is calm and very tired. “Give me the core, and I will forgive every debt in this yard.”', [
      step(undefined, chk3('Answer Thale', 'cha', ['social'], 'She hears your refusal and cuts the channel.', ['You refuse. Her voice wavers for just a moment.', bonus('roll', 1)], ['You refuse — and broadcast her offer to her own fleet. Three Combine ships defect.', bonus('roll', 1), virtue(1), cr(5)], DC)),
    ]),
    dogfight('hd-nightraid', 'Night Raid', 'In the dark, two lancers and a cutter try to slip past the yard’s guns.', {
      craft: ['hd_lancer', 'hd_lancer', 'hd_cutter'],
      rounds: 3,
      intro: 'Running dark, coming fast.',
      winText: 'The raid is broken.',
      loseText: 'The raiders fall back, but the ship is badly hurt.',
      win: [cr(9), parts(2)],
      lose: [dmg(3)],
    }, [], { note: 'An action weekend: no Rest. Dogfight for up to 3 volleys.' }),
  ]),

  // ---------- The Executor ----------
  ...week(11, 20, [
    page('hd-executorseen', 'The Executor', 'station', 'Thale’s enforcer — the Executor — is leading the assaults in person now. He wears a mask shaped like a seal of office.', [
      step(undefined, chk3('Study the Executor’s tactics', 'wis', ['perception'], 'He seems unstoppable.', ['He always comes in through the east docks.', bonus('def', 1)], ['The east docks, at the same hour every night.', bonus('def', 1), boon], DC)),
    ]),
    page('hd-spikeguns', 'Spiking the Guns', 'wreck', 'The Combine has a gun platform hammering the yard. Someone needs to sneak aboard and spike its guns.', [
      step(undefined, chk3('Spike the guns', 'dex', ['stealth'], ['You’re spotted and have to fight your way out.', dmg(3)], ['The guns go silent.', virtue(1)], ['The guns go silent, and the platform’s ammunition goes up with a bang.', virtue(1), cr(5)], DC)),
    ]),
    fight('hd-breach3', 'The Third Breach', 'station', 'The Executor’s best troopers break into the yard’s main hangar.', {
      enemies: ['hd_siegetrooper', 'hd_siegetrooper', 'hd_elite'],
      rounds: 3,
      intro: 'The hangar doors buckle.',
      winText: 'The hangar holds.',
      loseText: 'You fall back to the inner yard.',
      win: [cr(8)],
      lose: [dmg(3)],
    }),
    page('hd-huntexecutor', 'Hunting the Executor', 'station', 'If the Executor falls, the assaults stop. You wait for him at the east docks.', [
      step(undefined, chk3('Set the ambush', 'wis', ['perception'], 'He spots the ambush.', ['The ambush is ready.', bonus('atk', 1)], ['The ambush is ready, and the dock lights are rigged to blind him.', bonus('atk', 1), bonus('dmg', 1)], DC)),
    ]),
    fight('hd-executorfight', 'Thale’s Executor', 'station', 'The Executor steps through the east docks, a siege trooper at his side, and stops. The mask tilts. “Account closed,” he says.', {
      enemies: ['hd_executor', 'hd_siegetrooper'],
      rounds: 4,
      intro: 'He moves faster than anything that big should.',
      winText: 'The Executor falls. Without him, the Combine’s assaults falter.',
      loseText: 'The Executor withdraws, wounded. The assaults stop anyway.',
      win: [cr(16), give('hd_traumakit', 2)],
      lose: [cr(5), dmg(3)],
    }),
    haven('hd-siegebreaks', 'The Siege Breaks', 'station', 'The Combine fleet pulls back from Fenn’s. The yard is battered, burned and still standing. The cheer goes on for hours.', {
      shop: { items: SHOP_LATE },
      dock: DOCK_LATE,
      steps: [step(undefined, act('Celebrate', 'You can’t remember the last time you laughed this hard.', heal(4), repair(2)))],
    }),
  ]),

  // ---------- Halcyon Point ----------
  ...week(11, 27, [
    page('hd-countcost', 'Counting the Cost', 'station', 'The yard holds a memorial for those lost in the siege. It takes a long time to read every name.', [
      step(undefined, chk('Speak at the memorial', 'cha', ['social'], 'The words won’t come.', ['You say the right words. People nod.', virtue(2)], DC)),
    ]),
    page('hd-thalewithdraws', 'Thale Withdraws', 'bridge', 'The Combine fleet isn’t going home. It’s heading for the deep lane — toward Halcyon Point.', [
      step(undefined, chk3('Track the fleet', 'int', ['tech'], 'You lose them in the lane.', ['They’re going for the Choir’s heart.', bonus('roll', 1)], ['The heart — and they mean to destroy it.', bonus('roll', 1), boon], DC)),
    ]),
    page('hd-halcyonpoint', 'Halcyon Point', 'bridge', 'The core shows Halcyon Point at last: a blue star in the deep network, with the Choir’s heart hung beside it like a tear.', [
      step(undefined, chk3('Ask the core', 'int', ['lore'], 'The core is silent.', ['The heart can open every lane at once — or close them all.', cr(3)], ['Every lane at once, and it must be woken by someone who means to share it.', cr(3), virtue(1)], DC)),
    ]),
    dogfight('hd-rearguard', 'The Rearguard', 'The Combine left a lancer and a cutter to guard the lane.', {
      craft: ['hd_lancer', 'hd_cutter'],
      rounds: 3,
      intro: 'Grey hulls block the lane.',
      winText: 'The rearguard is broken. The lane is open.',
      loseText: 'The rearguard withdraws into the lane.',
      win: [cr(9)],
      lose: [dmg(3)],
    }),
    page('hd-fleetforms', 'The Fleet Forms', 'station', 'Every free ship that can fly gathers at the lane’s mouth. Rhee’s frigate takes the right flank. The Halcyon Debt takes the lead.', [
      step(undefined, chk('Lead the fleet', 'cha', ['social'], 'The fleet is ragged, but it follows.', ['The fleet forms up in a perfect wedge.', bonus('roll', 1), virtue(1)], DC)),
    ]),
    haven('hd-lastrefit', 'The Last Refit', 'station', 'One last refit at Fenn’s before the long flight to Halcyon Point. Bix has saved the good parts for you.', {
      shop: { items: SHOP_LATE },
      dock: DOCK_LATE,
      steps: [step(undefined, act('Refit the Halcyon Debt', 'Bix has been saving the good plating.', repair(3), parts(2)))],
    }),
  ]),
]
