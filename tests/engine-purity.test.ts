import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// @questender/engine must stay runnable in Node (Discord bot, Lambdas):
// no React, DOM, browser storage, or imports back into the web app.
const ROOT = join(__dirname, '..', 'packages', 'engine', 'src')

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return sources(p)
    return /\.tsx?$/.test(name) ? [p] : []
  })
}

describe('@questender/engine purity', () => {
  const forbidden: [string, RegExp][] = [
    ['react import', /from\s+'react(-dom)?(\/[^']*)?'/],
    ['web app import', /from\s+'[^']*\/(ui|sound|save|theme|App)(\/|')/],
    ['browser global', /\b(localStorage|sessionStorage|indexedDB)\b|\b(document|window|navigator)\.[a-z]+\(|typeof (window|document)\b/],
  ]
  for (const file of sources(ROOT)) {
    it(file.slice(ROOT.length + 1), () => {
      const text = readFileSync(file, 'utf8')
      for (const [label, re] of forbidden) expect(text, label).not.toMatch(re)
    })
  }
})
