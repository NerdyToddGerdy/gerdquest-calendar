import { ability, item, member } from '../engine/content'
import { sellPrice } from '../engine/economy'
import { itemCount } from '../engine/hero'
import { canHire } from '../engine/party'
import { rules } from '../engine/ruleset'
import type { Action } from '../engine/state'
import type { Day, GameState } from '../engine/types'

interface Props {
  state: GameState
  shop: NonNullable<Day['shop']>
  dispatch: (a: Action) => void
}

export function Shop({ state, shop, dispatch }: Props) {
  const hero = state.hero!
  const busy = !!state.pending
  const rate = rules(state).shop.sellRate
  return (
    <section className="step shop">
      <h3>Market</h3>
      <table>
        <tbody>
          {shop.items.map(({ id, price }) => {
            const it = item(id)
            const have = itemCount(hero, id)
            return (
              <tr key={id}>
                <td>
                  <b>{it.name}</b>
                  <div className="muted small">{it.text}</div>
                </td>
                <td className="num">{price}g</td>
                <td className="actions">
                  <button disabled={busy || hero.glint < price} onClick={() => dispatch({ type: 'BUY', item: id })}>
                    Buy
                  </button>
                  <button
                    disabled={busy || have <= 0}
                    onClick={() => dispatch({ type: 'SELL', item: id })}
                    title={`Sell for ${sellPrice(price, rate)} ${rules(state).currencyName}`}
                  >
                    Sell {sellPrice(price, rate)}g
                  </button>
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
                      {def.follower ? `(follower · upkeep ${def.follower.upkeep} per Rest)` : `(${def.kind}, ${def.maxHp} hp)`}
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
