import type { Action } from '../engine/state'
import { stepsDone } from '../engine/state'
import type { Day, GameState } from '../engine/types'
import { craftDef, shipStat } from '../engine/vehicle'
import { RollPanel } from './RollPanel'

/** A ship-to-ship fight on the current page. */
export function DogfightView({ state, day, dispatch }: { state: GameState; day: Day; dispatch: (a: Action) => void }) {
  const df = day.dogfight!
  const p = state.progress
  const pend = state.pending
  const fight = p.dogfight
  const craft = fight?.craft ?? df.craft.map((defId) => ({ defId, downed: false }))
  return (
    <section className="step combat dogfight">
      <h3>Dogfight</h3>
      {state.ship && (
        <div className="muted small">
          {state.ship.name}: Aim +{shipStat(state.ship, 'aim')} · Evasion +{shipStat(state.ship, 'evasion')} · Shield {shipStat(state.ship, 'shield')}
        </div>
      )}
      <div className="enemies">
        {craft.map((c, i) => {
          const def = craftDef(c.defId)
          return (
            <div key={i} className={`enemy ${c.downed ? 'defeated' : ''}`} title={def.text}>
              <b>{def.name}</b>
              <span>Take out on Aim {def.evade}+</span>
              <span>
                Its Aim {def.aim} · {def.dmg} dmg ({def.reduced} if evaded)
              </span>
            </div>
          )
        })}
      </div>
      {fight && (
        <div className="muted small">
          {fight.done ? (fight.won ? 'Victory.' : 'The dogfight is over.') : `Volley ${fight.round} of ${df.rounds}`}
        </div>
      )}
      {!state.ship ? (
        <p className="muted">You have no ship for this fight.</p>
      ) : pend?.type === 'dogfight' ? (
        <RollPanel state={state} slots={pend.slots} dispatch={dispatch} confirmLabel="Resolve volley" />
      ) : (
        !fight?.done && (
          <button className="primary" disabled={!!pend || !stepsDone(state)} onClick={() => dispatch({ type: 'ROLL_VOLLEY' })}>
            {fight ? `Roll volley ${fight.round}` : 'Engage'}
          </button>
        )
      )}
    </section>
  )
}
