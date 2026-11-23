import { useState } from 'react'
import { rules } from '../engine/ruleset'
import type { Action } from '../engine/state'
import type { CompartmentId, Day, GameState } from '../engine/types'
import { COMPARTMENT_NAMES, crewDef, upgradeDef } from '../engine/vehicle'
import { canWorkOnShip } from '../engine/vehicleActions'

/** A shipyard: hire crew into a compartment, fit or sell upgrades, buy Ship Parts. */
export function DockView({ state, dock, dispatch }: { state: GameState; dock: NonNullable<Day['dock']>; dispatch: (a: Action) => void }) {
  const ship = state.ship
  const hero = state.hero!
  const cur = rules(state).currencyName
  const open = ship?.compartments.filter((c) => !c.crew && c.integrity > 0).map((c) => c.id) ?? []
  const [target, setTarget] = useState<CompartmentId | ''>('')
  const room = target && open.includes(target) ? target : open[0]
  const workable = canWorkOnShip(state)

  if (!ship) return null
  return (
    <section className="step shop dock">
      <h3>Dock</h3>
      {dock.crew && dock.crew.length > 0 && (
        <>
          <h4>Crew for hire</h4>
          <label className="small row">
            Assign to
            <select value={room ?? ''} onChange={(e) => setTarget(e.target.value as CompartmentId)}>
              {open.map((id) => (
                <option key={id} value={id}>
                  {COMPARTMENT_NAMES[id]}
                </option>
              ))}
            </select>
            <span className="muted">Crew can’t move once assigned.</span>
          </label>
          <div className="hires">
            {dock.crew.map((id) => {
              const def = crewDef(id)
              const aboard = ship.compartments.some((c) => c.crew === id)
              return (
                <div key={id} className="hire">
                  <div>
                    <b>{def.name}</b>
                    <div className="small">{def.text}</div>
                  </div>
                  <button
                    disabled={!workable || aboard || !room || hero.glint < def.fee}
                    onClick={() => room && dispatch({ type: 'HIRE_CREW', crew: id, compartment: room })}
                  >
                    {aboard ? 'Aboard' : `Hire ${def.fee} ${cur}`}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
      {dock.upgrades && dock.upgrades.length > 0 && (
        <>
          <h4>Upgrades</h4>
          <table>
            <tbody>
              {dock.upgrades.map(({ id, price }) => {
                const def = upgradeDef(id)
                const fitted = ship.compartments.some((c) => c.upgrade === id)
                return (
                  <tr key={id}>
                    <td>
                      <b>{def.name}</b>
                      <div className="muted small">{def.text}</div>
                    </td>
                    <td className="num">
                      {price} {cur}
                    </td>
                    <td className="actions">
                      <button disabled={!workable || fitted || hero.glint < price} onClick={() => dispatch({ type: 'BUY_UPGRADE', upgrade: id })}>
                        {fitted ? 'Fitted' : 'Fit'}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {ship.compartments
                .filter((c) => c.upgrade)
                .map((c) => (
                  <tr key={`sell-${c.id}`}>
                    <td>
                      <span className="muted small">Sell back: </span>
                      {upgradeDef(c.upgrade!).name}
                    </td>
                    <td className="num">
                      {upgradeDef(c.upgrade!).price} {cur}
                    </td>
                    <td className="actions">
                      <button disabled={!workable} onClick={() => dispatch({ type: 'SELL_UPGRADE', compartment: c.id })}>
                        Sell
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}
      {dock.partsPrice !== undefined && (
        <div className="row">
          <button disabled={!workable || hero.glint < dock.partsPrice} onClick={() => dispatch({ type: 'BUY_PARTS' })}>
            Buy a Ship Part ({dock.partsPrice} {cur})
          </button>
          <span className="muted small">You have {ship.parts}.</span>
        </div>
      )}
    </section>
  )
}
