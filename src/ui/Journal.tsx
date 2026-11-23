import { formatLong } from '../engine/calendar'
import { campaign } from '../engine/campaign'
import type { GameState } from '../engine/types'

/** Read-only record of completed pages. Only past pages ever appear here. */
export function Journal({ state }: { state: GameState }) {
  const c = campaign(state.campaignId)
  const entries = [...state.journal].reverse()
  return (
    <section className="journal">
      <h2>Journal</h2>
      {entries.length === 0 && <p className="muted">Finished pages will be recorded here.</p>}
      {entries.map((e) => {
        const page = c.pages[e.page]
        return (
          <article key={e.page} className="journal-entry">
            <div className="date">{formatLong(e.date)}</div>
            <h3>{page?.title ?? `Page ${e.page + 1}`}</h3>
            {page && <p className="narrative small-narrative">{page.text}</p>}
            <ul>
              {e.lines.map((l, i) => (
                <li key={i} className={l.startsWith('  ') ? 'indent' : ''}>
                  {l.trim()}
                </li>
              ))}
            </ul>
          </article>
        )
      })}
    </section>
  )
}
