/**
 * Tear-off page animation. Called by the date bar's next button just before
 * the viewed date changes: the current sheet is cloned and torn away over the
 * live one, which settles into place. User-triggered only; skipped when the
 * player prefers reduced motion.
 */
export function turnPage(): void {
  if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const sheet = document.querySelector<HTMLElement>('.desk .day')
  const host = sheet?.parentElement
  if (!sheet || !host || host.querySelector('.tear-clone')) return
  const clone = sheet.cloneNode(true) as HTMLElement
  clone.classList.add('tear-clone')
  clone.setAttribute('aria-hidden', 'true')
  clone.removeAttribute('id')
  clone.querySelectorAll('button, a, input').forEach((el) => el.setAttribute('tabindex', '-1'))
  const hostBox = host.getBoundingClientRect()
  const box = sheet.getBoundingClientRect()
  clone.style.top = `${box.top - hostBox.top}px`
  clone.style.left = `${box.left - hostBox.left}px`
  clone.style.width = `${box.width}px`
  clone.style.height = `${box.height}px`
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative'
  host.appendChild(clone)
  clone.addEventListener('animationend', (e) => {
    if (e.target === clone) clone.remove()
  })
  window.setTimeout(() => clone.remove(), 700)
  requestAnimationFrame(() => {
    const live = host.querySelector<HTMLElement>('.day:not(.tear-clone)')
    if (!live) return
    live.classList.remove('settle')
    void live.offsetWidth
    live.classList.add('settle')
    live.addEventListener('animationend', (e) => {
      if (e.target === live) live.classList.remove('settle')
    })
  })
}
