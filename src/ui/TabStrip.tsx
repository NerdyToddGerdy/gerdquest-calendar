import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * The campaign tab strip. Wide screens wrap the tabs onto extra rows (CSS);
 * on phones it scrolls sideways, and this adds the cues that more tabs sit off
 * screen: edge fades, ‹ › buttons, and vertical wheel turning into sideways scroll.
 */
export function TabStrip({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [more, setMore] = useState({ left: false, right: false })

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    const left = el.scrollLeft > 4
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
    setMore((m) => (m.left === left && m.right === right ? m : { left, right }))
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    measure()
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    ro?.observe(el)
    for (const c of Array.from(el.children)) ro?.observe(c)
    el.addEventListener('scroll', measure, { passive: true })
    const wheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      ro?.disconnect()
      el.removeEventListener('scroll', measure)
      el.removeEventListener('wheel', wheel)
    }
  }, [measure, children])

  const nudge = (dir: -1 | 1) => {
    const el = ref.current
    if (!el) return
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: smooth ? 'smooth' : 'auto' })
  }

  return (
    <div className="tabs-bar" data-more-left={more.left} data-more-right={more.right}>
      <div className="tabs" role="tablist" ref={ref}>
        {children}
      </div>
      <button type="button" className="tabs-scroll left" aria-label="Scroll tabs left" tabIndex={-1} hidden={!more.left} onClick={() => nudge(-1)}>
        ‹
      </button>
      <button type="button" className="tabs-scroll right" aria-label="Scroll tabs right" tabIndex={-1} hidden={!more.right} onClick={() => nudge(1)}>
        ›
      </button>
    </div>
  )
}
