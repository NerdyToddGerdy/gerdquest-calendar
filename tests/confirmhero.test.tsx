// @vitest-environment node
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { campaign } from '@questender/engine/campaign'
import { campaignHeroes } from '@questender/engine/content'
import { ConfirmHero } from '../src/ui/ConfirmHero'

const [a, b] = campaignHeroes(campaign('brightwatch'))
const first = (n: string) => n.split(' ')[0]

describe('ConfirmHero', () => {
  it('shows the hero and offers confirm (focused) and go back, without acting on render', () => {
    let calls = 0
    const html = renderToStaticMarkup(<ConfirmHero heroId={a.id} onConfirm={() => calls++} onCancel={() => calls++} />)
    expect(calls).toBe(0)
    expect(html).toContain(a.name)
    expect(html).toContain(a.title.replace(/'/g, '&#x27;'))
    expect(html).toContain(`HP ${a.maxHp}`)
    expect(html).toMatch(new RegExp(`<button[^>]*data-autofocus[^>]*>Yes, play as ${first(a.name)}`))
    expect(html).toContain('Go back')
    expect(html).toContain('role="dialog"')
  })
  it('explains a mid-story hand-off', () => {
    const html = renderToStaticMarkup(<ConfirmHero heroId={b.id} replacesId={a.id} onConfirm={() => {}} onCancel={() => {}} />)
    expect(html.replace(/&#x27;/g, "'")).toContain(`${a.name}’s story ends here; ${b.name} carries on.`)
  })
})
