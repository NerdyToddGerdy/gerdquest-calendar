import { describe, expect, it } from 'vitest'
import { BAD_CODE, decodeSave, describeLength, encodeSave, looksLikeCode } from '../src/saveCode'

const payload = {
  format: 'questender.bundle',
  version: 1,
  campaigns: [{ version: 1, hero: { name: 'Ünï “Q” ✦' }, log: Array.from({ length: 300 }, (_, i) => ({ day: i, text: `line ${i} of the tale` })) }],
  calendar: [{ date: '2026-03-18', text: 'dentist' }],
  progress: { days: ['2026-03-18'], achievements: [] },
}

describe('save codes', () => {
  it('round trips a payload, including unicode', async () => {
    const code = await encodeSave(payload)
    expect(code.startsWith('GQC1.')).toBe(true)
    expect(code).not.toMatch(/\s/)
    expect(JSON.parse(await decodeSave(code))).toEqual(payload)
  })
  it('is much shorter than the JSON', async () => {
    expect((await encodeSave(payload)).length).toBeLessThan(JSON.stringify(payload).length / 2)
  })
  it('tolerates whitespace and newlines from pasting', async () => {
    const code = await encodeSave(payload)
    const messy = `\n  ${code.slice(0, 40)}\r\n${code.slice(40, 90)} \t${code.slice(90)}\n`
    expect(JSON.parse(await decodeSave(messy))).toEqual(payload)
  })
  it('rejects truncated and altered codes with a clear message', async () => {
    const code = await encodeSave(payload)
    await expect(decodeSave(code.slice(0, code.length - 30))).rejects.toThrow(BAD_CODE)
    await expect(decodeSave(code.slice(0, 20))).rejects.toThrow(BAD_CODE)
    const i = 30
    const flipped = code.slice(0, i) + (code[i] === 'A' ? 'B' : 'A') + code.slice(i + 1)
    await expect(decodeSave(flipped)).rejects.toThrow(BAD_CODE)
    await expect(decodeSave('GQC1.')).rejects.toThrow(BAD_CODE)
  })
  it('versions the prefix', async () => {
    await expect(decodeSave('GQC2.abc.00000000')).rejects.toThrow(/newer version/)
    await expect(decodeSave('hello')).rejects.toThrow(/does not look like a save code/)
    expect(looksLikeCode(' GQC1.abc')).toBe(true)
    expect(looksLikeCode('{"version":1}')).toBe(false)
  })
  it('falls back to an uncompressed code when compression is unavailable', async () => {
    const real = globalThis.CompressionStream
    // @ts-expect-error simulate an older browser
    globalThis.CompressionStream = undefined
    try {
      const code = await encodeSave(payload)
      expect(code.startsWith('GQC1u.')).toBe(true)
      expect(JSON.parse(await decodeSave(code))).toEqual(payload)
    } finally {
      globalThis.CompressionStream = real
    }
  })
  it('describes length in words', () => {
    expect(describeLength('x'.repeat(24012))).toBe('about 24,000 characters')
  })
})
