/**
 * Each campaign owns a colour (defined as CSS variables in App.css, with a
 * light and a dark value). A second run of the same campaign on the desk gets
 * a lighter variant so the two can still be told apart.
 */
const KNOWN = new Set(['brightwatch', 'emberroad', 'halcyon', 'starwake', 'verdant'])

interface SlotLike {
  id: string
  state: { campaignId: string }
}

export function campColor(slots: SlotLike[], slot: SlotLike): string {
  const cid = slot.state.campaignId
  const base = KNOWN.has(cid) ? `var(--camp-${cid})` : 'var(--accent)'
  const run = slots.filter((s) => s.state.campaignId === cid).indexOf(slot)
  if (run <= 0) return base
  // Later runs: a lighter wash of the same hue, a bit lighter each time.
  return `color-mix(in srgb, ${base} ${Math.max(35, 62 - (run - 1) * 14)}%, var(--camp-wash))`
}
