// Light / dark appearance. The choice is stored per browser and applied as
// `data-theme` on <html>; index.css maps it to colors ("system" follows the OS).

export type ThemePref = 'system' | 'light' | 'dark'

const KEY = 'questender.theme'

export function readTheme(): ThemePref {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

export function applyTheme(pref: ThemePref): void {
  document.documentElement.dataset.theme = pref
}

export function writeTheme(pref: ThemePref): void {
  try {
    localStorage.setItem(KEY, pref)
  } catch {
    /* private mode: the choice lasts until reload */
  }
  applyTheme(pref)
}
