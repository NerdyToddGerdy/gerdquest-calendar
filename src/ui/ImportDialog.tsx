import { useRef, useState } from 'react'
import { Modal } from './Modal'

export type ImportResult = 'done' | 'cancelled' | string

interface Props {
  /** Open the pasted code or file text. Resolves 'done', 'cancelled' (stay open) or an error message. */
  onImport: (text: string) => Promise<ImportResult>
  onClose: () => void
}

/** Paste a save code, or choose a code file or an older .json export. */
export function ImportDialog({ onImport, onClose }: Props) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const file = useRef<HTMLInputElement>(null)

  const run = async (raw: string) => {
    setBusy(true)
    setError('')
    const result = await onImport(raw)
    setBusy(false)
    if (result === 'done') onClose()
    else if (result !== 'cancelled') setError(result)
  }

  return (
    <Modal label="Import a save" onClose={onClose}>
      <label className="code-label">
        <span>Paste a save code</span>
        <textarea
          data-autofocus
          className="code-field"
          rows={4}
          value={text}
          placeholder="GQC2.…"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="row">
        <button className="primary" disabled={busy || !text.trim()} onClick={() => run(text)}>
          Open this code
        </button>
        <button disabled={busy} onClick={() => file.current?.click()}>
          Choose a file
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
      <p className="muted small">A file can be a text file holding a save code, or an older .json export.</p>
      <input
        ref={file}
        type="file"
        accept=".txt,.json,text/plain,application/json"
        hidden
        aria-label="Save file"
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) void f.text().then(run, () => setError('That file could not be read.'))
        }}
      />
    </Modal>
  )
}
