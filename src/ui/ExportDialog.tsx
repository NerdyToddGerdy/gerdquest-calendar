import { useEffect, useRef, useState } from 'react'
import { describeLength, encodeSave } from '../saveCode'
import { Modal } from './Modal'

interface Props {
  title: string
  /** Used in the text file name: gerdquest-<name>-<date>.txt */
  name: string
  date: string
  /** The save to turn into a code (a game state or the all-campaigns bundle). */
  payload: unknown
  /** Called once the player has copied or saved the code. */
  onExported: () => void
  onClose: () => void
}

/** Shows the save as one line of text to copy, with a text-file fallback. */
export function ExportDialog({ title, name, date, payload, onExported, onClose }: Props) {
  const [code, setCode] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [note, setNote] = useState('')
  const field = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    let live = true
    encodeSave(payload).then(
      (c) => live && setCode(c),
      () => live && setFailed(true),
    )
    return () => {
      live = false
    }
  }, [payload])

  const copy = async () => {
    if (!code) return
    field.current?.select()
    let ok = false
    try {
      await navigator.clipboard.writeText(code)
      ok = true
    } catch {
      try {
        ok = document.execCommand('copy')
      } catch {
        ok = false
      }
    }
    if (ok) {
      setNote('Code copied. Paste it somewhere safe.')
      onExported()
    } else {
      setNote('Could not copy automatically. The code is selected: press Ctrl+C (or Cmd+C) to copy it.')
    }
  }

  const saveFile = () => {
    if (!code) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([code], { type: 'text/plain' }))
    a.download = `gerdquest-${name}-${date}.txt`
    a.click()
    URL.revokeObjectURL(a.href)
    setNote('Saved a text file holding just the code.')
    onExported()
  }

  return (
    <Modal label={title} onClose={onClose}>
      <p className="muted small">This code holds everything in the save. Paste it into Import on any device to get it back. It stays on your device: nothing is sent anywhere.</p>
      <textarea
        ref={field}
        className="code-field"
        readOnly
        rows={4}
        aria-label="Save code"
        value={code ?? ''}
        placeholder={failed ? '' : 'Making your code…'}
        spellCheck={false}
        onFocus={(e) => e.currentTarget.select()}
      />
      {failed && <p className="error" role="alert">Could not make a code for this save.</p>}
      {code && <p className="muted small">That is {describeLength(code)}: paste it somewhere safe.</p>}
      <div className="row">
        <button className="primary" data-autofocus onClick={copy} disabled={!code}>
          Copy code
        </button>
        <button onClick={saveFile} disabled={!code}>
          Save as text file
        </button>
        <button onClick={onClose}>Done</button>
      </div>
      <p className="muted small" role="status">
        {note}
      </p>
    </Modal>
  )
}
