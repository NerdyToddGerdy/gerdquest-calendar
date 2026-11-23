import type { LogEntry } from '../engine/types'

export function Log({ entries }: { entries: LogEntry[] }) {
  return (
    <section className="log">
      <h3>Chronicle</h3>
      <ol>
        {entries.slice(0, 60).map((e, i) => (
          <li key={entries.length - i} className={e.text.startsWith('  ') ? 'indent' : ''}>
            <span className="muted">D{e.day + 1}</span> {e.text.trim()}
          </li>
        ))}
      </ol>
    </section>
  )
}
