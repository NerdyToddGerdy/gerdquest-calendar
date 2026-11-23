import { bandLabel } from '@questender/engine/dice'
import type { Band } from '@questender/engine/types'

function spoken(b: Band): string {
  if (b.min !== undefined && b.max !== undefined) return `${b.min} to ${b.max}`
  if (b.max !== undefined) return `${b.max} or less`
  if (b.min !== undefined) return `${b.min} or more`
  return 'any roll'
}

/** A small segmented target scale: one segment per outcome band, lowest first. */
export function BandScale({ bands, active }: { bands: Band[]; active?: number }) {
  const n = bands.length
  return (
    <ol className="band-scale" aria-label={`Outcomes: ${bands.map(spoken).join(', ')}`}>
      {bands.map((b, i) => (
        <li
          key={i}
          className={i === active ? 'hit' : active !== undefined ? 'miss' : ''}
          style={{ ['--t' as string]: n > 1 ? i / (n - 1) : 1 }}
          aria-current={i === active ? 'true' : undefined}
        >
          <span className="band-bar" aria-hidden="true" />
          <span className="band-name">{bandLabel(b)}</span>
        </li>
      ))}
    </ol>
  )
}
