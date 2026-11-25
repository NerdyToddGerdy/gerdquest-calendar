import { useEffect, useRef, type ReactNode } from 'react'

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface Props {
  label: string
  onClose: () => void
  children: ReactNode
}

/** An accessible dialog: Esc closes, Tab stays inside, focus returns to where it came from. */
export function Modal({ label, onClose, children }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null
    const root = box.current
    // focus() returns undefined, so pick the target first (the old `a?.focus() ?? b?.focus()` always ran both).
    ;(root?.querySelector<HTMLElement>('[data-autofocus]') ?? root?.querySelector<HTMLElement>(FOCUSABLE))?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close.current()
      } else if (e.key === 'Tab' && root) {
        const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)]
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      before?.focus?.()
    }
  }, [])

  return (
    // Backdrop click is a mouse convenience only; keyboard users close with Esc (handled above) or the Close button.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="hero-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={box} className="hero-modal code-dialog" role="dialog" aria-modal="true" aria-label={label}>
        <div className="settings-bar">
          <h2>{label}</h2>
          <button onClick={onClose} aria-label={`Close ${label.toLowerCase()}`}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
