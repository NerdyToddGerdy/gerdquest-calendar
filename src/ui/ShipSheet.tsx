import type { Action } from '@questender/engine/state'
import type { GameState } from '@questender/engine/types'
import { COMPARTMENT_NAMES, crewDef, maxIntegrity, shipStat, upgradeDef } from '@questender/engine/vehicle'
import { canWorkOnShip } from '@questender/engine/vehicleActions'

/** The ship's stats, compartments, crew and upgrades, with Ship Part repairs. */
export function ShipSheet({ state, dispatch }: { state: GameState; dispatch: (a: Action) => void }) {
  const ship = state.ship
  if (!ship) return null
  const workable = canWorkOnShip(state)
  return (
    <section className="ship-sheet">
      <h3>{ship.name}</h3>
      <div className="stat-grid">
        <div>
          <small>Aim</small>
          <b>+{shipStat(ship, 'aim')}</b>
        </div>
        <div>
          <small>Evasion</small>
          <b>+{shipStat(ship, 'evasion')}</b>
        </div>
        <div>
          <small>Shield</small>
          <b>{shipStat(ship, 'shield')}</b>
        </div>
        <div>
          <small>Parts</small>
          <b>{ship.parts}</b>
        </div>
      </div>
      <ul className="compartments">
        {ship.compartments.map((c, i) => {
          const max = maxIntegrity(ship, c.id)
          return (
            <li key={c.id} className={c.integrity <= 0 ? 'wrecked' : ''}>
              <span className="muted small">{i + 1}</span>
              <span className="comp-name">
                {COMPARTMENT_NAMES[c.id]}
                {(c.crew || c.upgrade) && (
                  <small className="muted">
                    {' '}
                    {[c.crew && crewDef(c.crew).name, c.upgrade && upgradeDef(c.upgrade).name].filter(Boolean).join(' · ')}
                  </small>
                )}
              </span>
              <span className="pips" aria-label={`Integrity ${c.integrity} of ${max}`}>
                {[...Array(max)].map((_, k) => (
                  <span key={k} className={k < c.integrity ? 'on' : ''} />
                ))}
              </span>
              <button
                disabled={!workable || ship.parts <= 0 || c.integrity >= max}
                onClick={() => dispatch({ type: 'REPAIR', compartment: c.id })}
                title="Spend a Ship Part to restore 1 Integrity (not during a dogfight)"
              >
                Repair
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
