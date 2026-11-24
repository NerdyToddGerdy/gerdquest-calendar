import { useEffect, useRef } from 'react'

export interface ToastItem {
  id: string
  label: string
  title: string
  text: string
}

const SHOW_MS = 7000

/**
 * A small notice for something just earned. One at a time, in a polite live
 * region so screen readers announce it without interrupting; it dismisses
 * itself, or on click. Motion is a short fade and is off for reduced motion.
 */
export function Toasts({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: string) => void }) {
  const first = items[0]
  const dismiss = useRef(onDismiss)
  dismiss.current = onDismiss
  const firstId = first?.id
  useEffect(() => {
    if (!firstId) return
    const t = setTimeout(() => dismiss.current(firstId), SHOW_MS)
    return () => clearTimeout(t)
  }, [firstId])
  return (
    <div className="toast-region" role="status" aria-live="polite" aria-atomic="true">
      {first && (
        <div className="toast" key={first.id}>
          <div className="toast-body">
            <div className="toast-label">{first.label}</div>
            <strong className="toast-title">{first.title}</strong>
            <p className="toast-text">{first.text}</p>
            {items.length > 1 && <p className="toast-more">{items.length - 1} more to show</p>}
          </div>
          <button className="icon-btn toast-close" aria-label={`Dismiss ${first.title}`} onClick={() => onDismiss(first.id)}>
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
