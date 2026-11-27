import { heroDef } from '@questender/engine/content'
import { DEFAULT_AVATAR, DEFAULT_BORDER, cosmeticDef } from '@questender/engine/tokens'

export function nameOf(heroId: string): string {
  try {
    return heroDef(heroId).name
  } catch {
    return 'a hero'
  }
}

export function avatarName(id: string): string {
  if (id === DEFAULT_AVATAR) return 'Plain token'
  return cosmeticDef(id)?.name ?? nameOf(id)
}
export function borderName(id: string): string {
  return cosmeticDef(id)?.name ?? 'Plain rim'
}

/** The accessible name of the player's token. */
export function tokenLabel(avatar: string, border: string): string {
  const who = avatar === DEFAULT_AVATAR ? 'plain token' : (cosmeticDef(avatar)?.name ?? nameOf(avatar))
  return `Your token: ${who}, ${border === DEFAULT_BORDER ? 'plain border' : borderName(border).toLowerCase().replace(' rim', ' border')}`
}
