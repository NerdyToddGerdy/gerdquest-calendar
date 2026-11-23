// Seeded RNG (mulberry32). All randomness in the engine flows through an Rng
// so games are reproducible and tests can script exact die results.

export interface Rng {
  /** Uniform integer in [1, sides]. */
  int(sides: number): number
  /** Current internal state, to persist in GameState. */
  state(): number
}

export function makeRng(seed: number): Rng {
  let s = seed >>> 0
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    int: (sides) => 1 + Math.floor(next() * sides),
    state: () => s,
  }
}

/** Test helper: returns the given die results in order, then falls back to 1s. */
export function scriptedRng(values: number[]): Rng {
  const queue = [...values]
  return {
    int: (sides) => {
      const v = queue.shift() ?? 1
      if (v < 1 || v > sides) throw new Error(`scripted value ${v} out of range for d${sides}`)
      return v
    },
    state: () => queue.length,
  }
}

export function newSeed(): number {
  return Math.floor(Math.random() * 0xffffffff)
}
