// Save codes: a save (or the all-campaigns bundle) as one line of text.
//   GQC1.<base64url of deflate-raw JSON>.<8 hex CRC-32 of those bytes>
//   GQC1u.<base64url of plain UTF-8 JSON>.<crc>   (browsers without CompressionStream)
// The payload is exactly the JSON the old file export held, so decoding gives
// back text that parseSaves already understands. Pure: no storage, no DOM.

export const CODE_PREFIX = 'GQC1.'
export const CODE_PREFIX_PLAIN = 'GQC1u.'
export const BAD_CODE = 'This save code is incomplete or mistyped. Check that you copied all of it.'

/** True for text that looks like a save code (so old JSON files take the other path). */
export function looksLikeCode(text: string): boolean {
  return /^\s*GQC\d/i.test(text)
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(bytes: Uint8Array): string {
  let c = 0xffffffff
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return ((c ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0')
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): Uint8Array {
  const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(bin, (ch) => ch.charCodeAt(0))
}

const canCompress = () => typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined'

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const writer = stream.writable.getWriter()
  void writer.write(bytes as BufferSource).catch(() => {})
  void writer.close().catch(() => {})
  return new Uint8Array(await new Response(stream.readable).arrayBuffer())
}

/** Turn a save payload (a game state or the bundle) into a one-line code. */
export async function encodeSave(payload: unknown): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(payload))
  const packed = canCompress()
  const bytes = packed ? await pipe(json, new CompressionStream('deflate-raw')) : json
  return `${packed ? CODE_PREFIX : CODE_PREFIX_PLAIN}${toBase64Url(bytes)}.${crc32(bytes)}`
}

/** Turn a code back into the JSON text it holds. Throws a player-readable Error. */
export async function decodeSave(code: string): Promise<string> {
  const text = code.replace(/\s+/g, '')
  const plain = text.startsWith(CODE_PREFIX_PLAIN)
  if (!plain && !text.startsWith(CODE_PREFIX)) {
    if (/^GQC\d/i.test(text)) throw new Error('This save code is from a newer version of GerdQuest Calendar. Update the game, then try again.')
    throw new Error('That does not look like a save code. Codes start with GQC1.')
  }
  const parts = text.slice(plain ? CODE_PREFIX_PLAIN.length : CODE_PREFIX.length).split('.')
  if (parts.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(parts[0]) || !/^[0-9a-f]{8}$/i.test(parts[1])) throw new Error(BAD_CODE)
  let bytes: Uint8Array
  try {
    bytes = fromBase64Url(parts[0])
  } catch {
    throw new Error(BAD_CODE)
  }
  if (crc32(bytes) !== parts[1].toLowerCase()) throw new Error(BAD_CODE)
  if (plain) return new TextDecoder().decode(bytes)
  if (!canCompress()) throw new Error('This browser cannot open compressed save codes. Try a newer browser.')
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(await pipe(bytes, new DecompressionStream('deflate-raw')))
  } catch {
    throw new Error(BAD_CODE)
  }
}

/** "about 24,000 characters" in plain words, for the export dialog. */
export function describeLength(code: string): string {
  const n = code.length
  const rounded = n < 1000 ? Math.round(n / 10) * 10 : Math.round(n / 100) * 100
  return `about ${rounded.toLocaleString('en-US')} characters`
}
