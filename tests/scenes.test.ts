// Scene art coverage: every SceneKind has a sky and drawing, and every Ember
// Road page is set against Ember Road art.
import { describe, expect, it } from 'vitest'
import { campaign } from '../src/engine/campaign'
import { EMBER_SCENES } from '../src/engine/types'
import { EMBER_ART, EMBER_SKIES } from '../src/ui/scenes/emberroad'

const er = campaign('emberroad')
// Classic scenes deliberately kept in Ember Road (none today).
const SHARED: string[] = []

describe('Ember Road scenes', () => {
  it('every Ember Road kind has a sky and a drawing', () => {
    for (const k of EMBER_SCENES) {
      expect(EMBER_SKIES[k], k).toHaveLength(2)
      expect(EMBER_ART[k], k).toBeTruthy()
    }
    expect(Object.keys(EMBER_ART).sort()).toEqual([...EMBER_SCENES].sort())
    expect(Object.keys(EMBER_SKIES).sort()).toEqual([...EMBER_SCENES].sort())
  })

  it('every page uses an Ember Road scene or a deliberate shared one', () => {
    const allowed = new Set<string>([...EMBER_SCENES, ...SHARED])
    const bad = er.pages.filter((d) => !allowed.has(d.scene)).map((d) => `${d.id} ${d.title}: ${d.scene}`)
    expect(bad).toEqual([])
  })

  it('uses a good spread of the new scenes', () => {
    const used = new Set(er.pages.map((d) => d.scene))
    expect(used.size).toBe(EMBER_SCENES.length)
  })
})
