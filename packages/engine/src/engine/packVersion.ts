// Content version stamp for a campaign pack.
//
// Saves store journal lines as references into the pack's pages (see
// saveFormat.ts), so each save records which version of the pack it was written
// against. The stamp is a 32-bit FNV-1a hash of the pack's pages (computed once
// when the pack is registered) plus the optional explicit `version` in the
// campaign's meta.ts. It is only a drift signal: equal stamps mean every
// reference resolves exactly as written; unequal stamps mean the content was
// edited since, so references are resolved best effort and may degrade.
import type { Campaign } from './types'

export function fnv1a(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(36)
}

export function packVersion(c: Campaign): string {
  const hash = fnv1a(JSON.stringify(c.pages))
  return c.version ? `${c.version}.${hash}` : hash
}
