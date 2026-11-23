import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { campaign, defaultStartDate } from '@questender/engine/campaign'
import { initialState, reduce } from '@questender/engine/state'
import { rules } from '@questender/engine/ruleset'
import { DayView } from '../src/ui/DayView'

const today = '2026-11-23'

describe('currency names on the page', () => {
  for (const id of ['brightwatch', 'emberroad', 'halcyon']) {
    it(`${id}: the hidden purse uses the campaign's own currency`, () => {
      const c = campaign(id)
      const s0 = reduce(initialState(), { type: 'NEW_GAME', seed: 9, campaignId: id, startDate: defaultStartDate(c, today), heroId: c.heroIds?.[0] })
      const s = { ...s0, pending: { type: 'pickpocket' as const, icon: 0, amount: 3 } }
      const html = renderToStaticMarkup(<DayView state={s} day={c.pages[s.dayIndex]} dispatch={() => {}} today={today} />)
      const name = rules(s).currencyName
      expect(html).toContain(`3 ${name}`)
      if (name !== 'glint') expect(html.toLowerCase()).not.toContain('glint')
    })
  }
})
