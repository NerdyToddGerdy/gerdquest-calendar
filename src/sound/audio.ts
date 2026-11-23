// Dice sounds synthesised with the Web Audio API, so the game ships no audio files.
import type { DiceSound } from './diceEvents'

const PREF_KEY = 'questender.sound'
let ctx: AudioContext | null = null

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) !== 'off'
  } catch {
    return true
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(PREF_KEY, on ? 'on' : 'off')
  } catch {
    /* ignore */
  }
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

let noise: AudioBuffer | null = null
function noiseBuffer(ac: AudioContext): AudioBuffer {
  if (noise) return noise
  noise = ac.createBuffer(1, ac.sampleRate * 0.25, ac.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return noise
}

/** One die hitting the table: a short, filtered click with a woody body. */
function clack(ac: AudioContext, out: AudioNode, at: number, loud: number) {
  const src = ac.createBufferSource()
  src.buffer = noiseBuffer(ac)
  const band = ac.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 1800 + Math.random() * 2200
  band.Q.value = 3
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(loud, at + 0.003)
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.045)
  src.connect(band).connect(g).connect(out)
  src.start(at, Math.random() * 0.2, 0.06)

  const body = ac.createOscillator()
  body.type = 'triangle'
  body.frequency.value = 180 + Math.random() * 120
  const bg = ac.createGain()
  bg.gain.setValueAtTime(loud * 0.5, at)
  bg.gain.exponentialRampToValueAtTime(0.0001, at + 0.05)
  body.connect(bg).connect(out)
  body.start(at)
  body.stop(at + 0.06)
}

function tone(ac: AudioContext, out: AudioNode, at: number, freq: number, dur: number, type: OscillatorType, level: number, glideTo?: number) {
  const o = ac.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freq, at)
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, at + dur)
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(level, at + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  o.connect(g).connect(out)
  o.start(at)
  o.stop(at + dur + 0.02)
}

export function playDiceSound(s: DiceSound) {
  if (!soundEnabled()) return
  const ac = audio()
  if (!ac) return
  const out = ac.createGain()
  out.gain.value = 0.5
  out.connect(ac.destination)
  const t0 = ac.currentTime + 0.01

  if (s.kind === 'card') {
    // A card sliding off the deck.
    const src = ac.createBufferSource()
    src.buffer = noiseBuffer(ac)
    const hp = ac.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 2500
    const g = ac.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16)
    src.connect(hp).connect(g).connect(out)
    src.start(t0, 0, 0.2)
    return
  }

  // Each die bounces a few times, each bounce quieter and closer together.
  let end = t0
  for (let d = 0; d < s.dice; d++) {
    let t = t0 + d * 0.03 + Math.random() * 0.04
    let gap = 0.09 + Math.random() * 0.05
    let loud = 0.5 + Math.random() * 0.3
    const bounces = 4 + Math.floor(Math.random() * 3)
    for (let b = 0; b < bounces; b++) {
      clack(ac, out, t, loud)
      t += gap
      gap *= 0.62
      loud *= 0.6
    }
    end = Math.max(end, t)
  }

  if (s.crit) {
    // Natural 20: a bright rising chime.
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(ac, out, end + 0.05 + i * 0.07, f, 0.35, 'sine', 0.18))
  } else if (s.fumble) {
    // Natural 1: a low, sagging groan.
    tone(ac, out, end + 0.05, 220, 0.5, 'sawtooth', 0.07, 98)
  }
}
