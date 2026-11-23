import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { item } from '../src/engine/content'
import { ITEMS } from '../src/content/items'
import { ItemTip } from '../src/ui/ItemTip'
import { itemEffect } from '../src/ui/itemEffect'
import { CAMPAIGNS } from '../src/content/campaigns'

const allIds = [...ITEMS.map((i) => i.id), ...CAMPAIGNS.flatMap((c) => c.content?.items?.map((i) => i.id) ?? [])]

describe('item tooltips', () => {
  it('describes what every item in every campaign does', () => {
    expect(allIds.length).toBeGreaterThan(20)
    for (const id of allIds) {
      const it = item(id)
      if (it.kind !== 'ration') expect(itemEffect(it), id).toMatch(/\S/)
      expect(itemEffect(it), id).not.toMatch(/undefined|NaN/)
      const html = renderToStaticMarkup(<ItemTip item={it} />)
      expect(html).toContain('role="tooltip"')
      expect(html).toContain(it.name)
    }
  })
})
