import { member } from './content'
import type { Rng } from './rng'
import type { Card, MemberAbility, MemberDef, PartyMember, Suit } from './types'

export const MAX_PER_KIND = 5

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']

export function freshDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    const color = suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black'
    for (let rank = 1; rank <= 13; rank++) deck.push({ suit, rank, color })
  }
  deck.push({ suit: 'joker', rank: 0, color: 'red' }, { suit: 'joker', rank: 0, color: 'black' })
  return deck
}

export function shuffle<T>(arr: T[], rng: Rng): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng.int(i + 1) - 1
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function drawCard(deck: Card[], rng: Rng): { card: Card; deck: Card[] } {
  const d = deck.length > 0 ? deck : shuffle(freshDeck(), rng)
  return { card: d[0], deck: d.slice(1) }
}

export function isFace(card: Card): boolean {
  return card.suit === 'joker' || card.rank >= 11
}

/** Face cards and jokers count as 10. */
export function cardValue(card: Card): number {
  return isFace(card) ? 10 : card.rank
}

export function cardSuits(card: Card): Suit[] {
  if (card.suit !== 'joker') return [card.suit]
  return card.color === 'red' ? ['hearts', 'diamonds'] : ['clubs', 'spades']
}

export function cardName(card: Card): string {
  if (card.suit === 'joker') return `${card.color} Joker`
  const r = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }[card.rank] ?? String(card.rank)
  const s = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }[card.suit]
  return `${r}${s}`
}

export interface Activation {
  description: string
  triggered: MemberAbility[]
  /** Member takes 1 damage (face card, or d12 ≥ 10). */
  hurt: boolean
}

export function activateWithCard(def: MemberDef, card: Card): Activation {
  const suits = cardSuits(card)
  const value = cardValue(card)
  return {
    description: `drew ${cardName(card)}`,
    triggered: def.abilities.filter((a) => a.suits.some((s) => suits.includes(s)) && value >= a.target),
    hurt: isFace(card),
  }
}

/**
 * Dice substitute: d4 for the suit (single-suit abilities need a 4,
 * two-suit abilities need 3–4) and d12 for the value (≥10 hurts the member).
 */
export function activateWithDice(def: MemberDef, rng: Rng): Activation {
  const suitRoll = rng.int(4)
  const value = rng.int(12)
  return {
    description: `rolled d4=${suitRoll}, d12=${value}`,
    triggered: def.abilities.filter((a) => {
      const needed = a.suits.length >= 2 ? 3 : 4
      return suitRoll >= needed && value >= a.target
    }),
    hurt: value >= 10,
  }
}

export function canHire(party: PartyMember[], def: MemberDef): boolean {
  return party.filter((p) => member(p.defId).kind === def.kind).length < MAX_PER_KIND
}
