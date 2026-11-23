import type { MemberDef } from '../engine/types'

export const MEMBERS: MemberDef[] = [
  {
    id: 'nettle',
    name: 'Nettle',
    kind: 'critter',
    maxHp: 3,
    fee: 6,
    text: 'A grumpy hedgehog tinker who rolls into a spiky ball at the first sign of trouble.',
    abilities: [
      { name: 'Prickle Guard', suits: ['clubs', 'spades'], target: 6, effect: { type: 'slotBonus', slots: ['defense'], amount: 2 } },
      { name: 'Tinker’s Trick', suits: ['diamonds'], target: 8, effect: { type: 'slotBonus', slots: ['check'], amount: 2 } },
    ],
  },
  {
    id: 'pip',
    name: 'Pip',
    kind: 'bug',
    maxHp: 2,
    fee: 4,
    text: 'A lantern-moth the size of your palm. It glows brighter when it’s happy, which is mostly when you feed it.',
    abilities: [
      { name: 'Warm Glow', suits: ['hearts'], target: 5, effect: { type: 'heal', amount: 2 } },
      { name: 'Dazzle', suits: ['diamonds', 'hearts'], target: 9, effect: { type: 'slotBonus', slots: ['attack'], amount: 2 } },
    ],
  },
]
