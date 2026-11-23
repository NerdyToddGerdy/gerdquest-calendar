import type { Rng } from './rng'

/** Shops buy back items they sell, at `rate` × their current price (rounded down). */
export function sellPrice(shopPrice: number, rate = 0.5): number {
  return Math.floor(shopPrice * rate)
}

/** Weekly lottery: d6 → −2, −1, +1, +2, +3, +4 glint. */
export const LOTTERY_TABLE = [-2, -1, 1, 2, 3, 4]

export function lottery(rng: Rng): { roll: number; amount: number } {
  const r = rng.int(6)
  return { roll: r, amount: LOTTERY_TABLE[r - 1] }
}

/** Traveling eats rations; each missing ration costs 1 health. */
export function travel(rations: number, have: number): { eaten: number; missing: number } {
  const eaten = Math.min(rations, have)
  return { eaten, missing: rations - eaten }
}
