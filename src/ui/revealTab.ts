/** Scroll a campaign tab fully into view inside its (horizontally scrolling) tab strip. */
export function revealTab(el: HTMLElement | null) {
  const strip = el?.parentElement
  if (!el || !strip || strip.scrollWidth <= strip.clientWidth) return
  const e = el.getBoundingClientRect()
  const s = strip.getBoundingClientRect()
  if (e.left < s.left) strip.scrollLeft -= s.left - e.left + 16
  else if (e.right > s.right) strip.scrollLeft += e.right - s.right + 16
}
