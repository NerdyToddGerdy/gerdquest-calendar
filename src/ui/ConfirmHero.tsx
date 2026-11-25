import { heroDef } from '@questender/engine/content'
import { Modal } from './Modal'
import { Portrait } from './Portrait'

const sign = (n: number) => (n >= 0 ? `+${n}` : `${n}`)

interface Props {
  heroId: string
  /** For a mid-story hand-off: the hero being replaced. */
  replacesId?: string
  onConfirm: () => void
  onCancel: () => void
}

/** "Are you sure?" before a hero is locked in. Nothing is set until the confirm button is pressed. */
export function ConfirmHero({ heroId, replacesId, onConfirm, onCancel }: Props) {
  const h = heroDef(heroId)
  const first = h.name.split(' ')[0]
  return (
    <Modal label={`Play as ${first}?`} onClose={onCancel}>
      <div className="confirm-hero" style={{ ['--hero' as string]: h.color }}>
        <Portrait id={h.id} name={h.name} className="preview-portrait" />
        <h3>{h.name}</h3>
        <div className="muted">{h.title}</div>
        <div className="mini-stats">
          <span>HP {h.maxHp}</span>
          <span>Atk {sign(h.atk)}</span>
          <span>Def {sign(h.def)}</span>
          <span>Damage d{h.dmgDie}</span>
        </div>
        <p>
          {replacesId && replacesId !== heroId
            ? `${heroDef(replacesId).name}’s story ends here; ${h.name} carries on.`
            : 'You’ll play this hero for the whole run.'}
        </p>
        <div className="hero-modal-bar confirm-hero-actions">
          <button className="primary" data-autofocus onClick={onConfirm}>
            Yes, play as {first}
          </button>
          <button onClick={onCancel}>Go back</button>
        </div>
      </div>
    </Modal>
  )
}
