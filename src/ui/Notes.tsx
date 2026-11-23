import { useEffect, useRef, useState } from 'react'

interface Props {
  title: string
  text: string
  onSave: (text: string) => void
}

const SAVE_DELAY_MS = 500

/**
 * The player's own notes for one campaign run. Typing is kept locally and
 * saved shortly after you pause (and when you leave the page), so notes
 * travel with the campaign's save and its Export / Export all files.
 */
export function Notes({ title, text, onSave }: Props) {
  const [draft, setDraft] = useState(text)
  const [saved, setSaved] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef<string | null>(null)
  const save = useRef(onSave)
  useEffect(() => {
    save.current = onSave
  })

  const flush = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    if (pending.current !== null) {
      save.current(pending.current)
      pending.current = null
      setSaved(true)
    }
  }

  // Save anything still pending when the notes close or the tab changes.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
      if (pending.current !== null) save.current(pending.current)
    },
    [],
  )

  const change = (value: string) => {
    setDraft(value)
    setSaved(false)
    pending.current = value
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(flush, SAVE_DELAY_MS)
  }

  return (
    <article className="day notes">
      <header className="day-header">
        <h2>Notes</h2>
        <span className="muted small" aria-live="polite">
          {saved ? 'Saved' : 'Saving…'}
        </span>
      </header>
      <label className="muted small" htmlFor="campaign-notes">
        Your own notes for {title}: clues, names, plans. They're saved with this campaign and included when you export it.
      </label>
      <textarea
        id="campaign-notes"
        className="notes-text"
        value={draft}
        onChange={(e) => change(e.target.value)}
        onBlur={flush}
        placeholder="Write anything you want to remember…"
        spellCheck
      />
      <p className="muted small">{draft.trim() ? `${draft.trim().split(/\s+/).length} words` : 'Empty'}</p>
    </article>
  )
}
