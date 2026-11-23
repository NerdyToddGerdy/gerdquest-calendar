import { ability, item, member } from '@questender/engine/content'
import { sellPrice } from '@questender/engine/economy'
import { itemCount } from '@questender/engine/hero'
import { canHire } from '@questender/engine/party'
import { rules } from '@questender/engine/ruleset'
import type { Action } from '@questender/engine/state'
import type { Day, GameState } from '@questender/engine/types'

interface Props {
  state: GameState
  shop: NonNullable<Day['shop']>
  dispatch: (a: Action) => void
}

export function Shop({ state, shop, dispatch }: Props) {
  const hero = state.hero!
  const busy = !!state.pending
  const rate = rules(state).shop.sellRate
  const cur = rules(state).currencyName
  return (
    <section className="step shop">
      <h3>Market</h3>
      <table>
        <tbody>
          {shop.items.map(({ id, price }) => {
            const it = item(id)
            const have = itemCount(hero, id)
            const sell = sellPrice(price, rate)
            return (
              <tr key={id}>
                <td>
                  <b>{it.name}</b>
                  <div className="muted small">{it.text}</div>
                </td>
                <td className="actions">
                  <button
                    disabled={busy || hero.glint < price}
                    title={hero.glint < price ? `Not enough ${cur}` : `Buy for ${price} ${cur}`}
                    onClick={() => dispatch({ type: 'BUY', item: id })}
                  >
                    Buy {price}g
                  </button>
                  {sell > 0 && (
                    <button
                      disabled={busy || have <= 0}
                      onClick={() => dispatch({ type: 'SELL', item: id })}
                      title={have <= 0 ? 'You have none to sell' : `Sell for ${sell} ${cur}`}
                    >
                      Sell {sell}g
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {shop.hires && shop.hires.length > 0 && (
        <>
          <h4>For hire</h4>
          <div className="hires">
            {shop.hires.map((id) => {
              const def = member(id)
              const hired = state.party.some((p) => p.defId === id)
              return (
                <div key={id} className="hire">
                  <div>
                    <b>{def.name}</b>{' '}
                    <span className="muted small">
                      {def.follower ? `(follower, upkeep ${def.follower.upkeep} per Rest)` : `(${def.kind}, ${def.maxHp} hp)`}
                    </span>
                    <div className="small">{def.text}</div>
                    {def.follower && (
                      <div className="small">
                        Lends:{' '}
                        {def.follower.grants.map((g) => (
                          <span key={g} title={ability(g).text}>
                            <b>{ability(g).name}</b> — {ability(g).text}{' '}
                          </span>
                        ))}
                      </div>
                    )}
                    <ul className="small">
                      {def.abilities.map((a) => (
                        <li key={a.name}>
                          <b>{a.name}</b> — {a.suits.join(' or ')} {a.target}+:{' '}
                          {a.effect.type === 'heal'
                            ? `heal you ${a.effect.amount}`
                            : `+${a.effect.amount} to ${a.effect.slots.join('/')}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    disabled={busy || hired || hero.glint < def.fee || !canHire(state.party, def)}
                    title={hired ? 'Already in your party' : hero.glint < def.fee ? `Not enough ${cur}` : undefined}
                    onClick={() => dispatch({ type: 'HIRE', member: id })}
                  >
                    {hired ? 'In party' : `Hire ${def.fee} ${rules(state).currencyName}`}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}
