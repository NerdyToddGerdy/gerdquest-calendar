import { ability, item, member } from '@questender/engine/content'
import { maxHp, stat, usesLeft, woundName } from '@questender/engine/hero'
import { rules } from '@questender/engine/ruleset'
import { isFollower } from '@questender/engine/followers'
import { abilityReady, costLabel, POOL_NAMES } from '@questender/engine/pools'
import { canChangeGear, combatInProgress, type Action } from '@questender/engine/state'
import { TRAITS, TRAIT_NAMES } from '@questender/engine/types'
import { ItemTip } from './ItemTip'
import type { GameState, GearSlot } from '@questender/engine/types'
import { ShipSheet } from './ShipSheet'
import { Portrait } from './Portrait'

const SLOTS: GearSlot[] = ['head', 'body', 'hands', 'feet', 'trinket']
const sign = (n: number) => (n >= 0 ? `+${n}` : `−${-n}`)

export function HeroSheet({ state, dispatch }: { state: GameState; dispatch: (a: Action) => void }) {
  const hero = state.hero!
  const max = maxHp(hero)
  const busy = !!state.pending
  const gearOk = canChangeGear(state)
  const midFight = combatInProgress(state)
  const r = rules(state)

  return (
    <aside className="sheet">
      <div className="sheet-head">
        <Portrait id={hero.defId} name={hero.name} className="sheet-portrait" />
        <div>
          <h2>{hero.name}</h2>
          <div className="muted">
            Level {hero.level} {hero.title}, wielding {/^[aeiou]/i.test(hero.weapon) ? 'an' : 'a'} {hero.weapon.toLowerCase()}
          </div>
        </div>
      </div>

      <div className={`hp ${hero.hp / max <= 0.25 ? 'low' : hero.hp / max < 0.5 ? 'mid' : 'high'}`}>
        <div className="hp-bar" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={hero.hp} aria-label="Health">
          <div style={{ width: `${Math.max(0, Math.min(100, (hero.hp / max) * 100))}%` }} />
        </div>
        <span>
          {hero.hp} / {max} health
        </span>
      </div>

      <div className="stat-grid">
        <div><small>Attack</small><b>{sign(stat(hero, 'atk'))}</b></div>
        <div><small>Defense</small><b>{sign(stat(hero, 'def'))}</b></div>
        <div><small>Damage</small><b>d{hero.dmgDie}{stat(hero, 'dmg') ? sign(stat(hero, 'dmg')) : ''}</b></div>
        <div><small>{r.currencyName}</small><b>{hero.glint}</b></div>
      </div>

      <div className="traits">
        {TRAITS.map((t) => (
          <div key={t} title={TRAIT_NAMES[t]}>
            <small>{t.toUpperCase().slice(0, 1) + t.slice(1)}</small>
            <b>{sign(stat(hero, t))}</b>
          </div>
        ))}
      </div>

      <div className="virtue" title="Virtue: −10 to +10">
        <small>Virtue</small>
        <div className="virtue-track">
          {[...Array(21)].map((_, i) => (
            <span key={i} className={`${i - 10 === hero.virtue ? 'on' : ''} ${i === 10 ? 'zero' : ''}`} />
          ))}
        </div>
        <b>{sign(hero.virtue)}</b>
      </div>

      <div className="status">
        {hero.boon && <span className="tag good">Boon held</span>}
        {hero.poisoned && <span className="tag bad">{r.conditions.a.label}</span>}
        {hero.cursed && <span className="tag bad">{r.conditions.b.label}</span>}
        {hero.wounds.map((w, i) => (
          <span key={i} className="tag bad">Wound: {woundName(w)}</span>
        ))}
        {Object.entries(hero.pageBonus).map(([k, v]) => (
          <span key={k} className="tag">Today: {sign(v ?? 0)} {k === 'roll' ? 'all rolls' : k}</span>
        ))}
      </div>

      {hero.poolMax && Object.keys(hero.poolMax).length > 0 && (
        <div className="pools">
          {(Object.keys(hero.poolMax) as (keyof typeof POOL_NAMES)[]).map((p) => (
            <div key={p} className="pool" title={`${POOL_NAMES[p]} points — refilled on a Rest`}>
              <small>{POOL_NAMES[p]}</small>
              <b>
                {hero.pools?.[p] ?? 0}/{hero.poolMax![p]}
              </b>
            </div>
          ))}
        </div>
      )}

      <h3>Abilities</h3>
      <ul className="abilities">
        {hero.abilities.map(ability).map((a) => {
          const left = usesLeft(hero, a)
          return (
            <li key={a.id}>
              <div>
                <b>{a.name}</b> <span className="muted small">{a.text}</span>
              </div>
              {a.kind !== 'passive' && a.cost && <span className="tag">{costLabel(a)}</span>}
              {a.kind !== 'passive' && !a.cost && (
                <div className="pips" aria-label={`${left} of ${a.uses} uses left`}>
                  {[...Array(a.uses)].map((_, i) => (
                    <span key={i} className={i < left ? 'on' : ''} />
                  ))}
                  <small>/{a.per}</small>
                </div>
              )}
              {a.kind === 'heal' && (
                <button disabled={busy || !abilityReady(hero, a)} onClick={() => dispatch({ type: 'USE_ABILITY', ability: a.id })}>
                  Use
                </button>
              )}
            </li>
          )
        })}
      </ul>

      <h3>Gear {gearOk && <span className="tag good">can change now</span>}</h3>
      <ul className="gear">
        {SLOTS.map((slot) => {
          const id = hero.gear[slot]
          return (
            <li key={slot}>
              <small>{slot}</small>
              <span>{id ? <ItemTip item={item(id)} /> : <span className="muted">—</span>}</span>
              {id && gearOk && <button onClick={() => dispatch({ type: 'UNEQUIP', slot })}>Remove</button>}
            </li>
          )
        })}
      </ul>

      <h3>Pack</h3>
      <ul className="inventory">
        {Object.entries(hero.inventory).length === 0 && <li className="muted">Empty</li>}
        {Object.entries(hero.inventory).map(([id, n]) => {
          const it = item(id)
          let button = null
          if (it.kind === 'gear') {
            button = <button disabled={!gearOk} onClick={() => dispatch({ type: 'EQUIP', item: id })}>Equip</button>
          } else if (it.kind === 'heal') {
            button = <button disabled={busy || midFight} onClick={() => dispatch({ type: 'USE_ITEM', item: id })}>Drink</button>
          } else if (it.kind === 'pageBonus' || (it.kind === 'boon' && !hero.boon) || (it.kind === 'cure' && hero.wounds.length > 0)) {
            button = <button disabled={busy} onClick={() => dispatch({ type: 'USE_ITEM', item: id })}>Use</button>
          }
          return (
            <li key={id}>
              <span>
                <ItemTip item={it} /> {n > 1 && <small>×{n}</small>}
              </span>
              {button}
            </li>
          )
        })}
      </ul>

      <h3>Party</h3>
      {state.party.length === 0 ? (
        <p className="muted small">No companions yet.</p>
      ) : (
        <ul className="party">
          {state.party.map((p, i) => {
            const def = member(p.defId)
            if (isFollower(def)) {
              return (
                <li key={p.defId}>
                  <span>
                    <b>{def.name}</b> <small>upkeep {def.follower!.upkeep} {r.currencyName}/Rest</small>
                  </span>
                  {state.progress.rested && <button onClick={() => dispatch({ type: 'DISMISS', index: i })}>Dismiss</button>}
                </li>
              )
            }
            return (
              <li key={p.defId}>
                <span>
                  <b>{def.name}</b> <small>{p.hp}/{def.maxHp} hp</small>
                </span>
                <button disabled={busy || p.usedPage} onClick={() => dispatch({ type: 'CALL_MEMBER', index: i })} title="Draw for a healing ability outside of rolls">
                  {p.usedPage ? 'Used' : 'Call'}
                </button>
                {state.progress.rested && <button onClick={() => dispatch({ type: 'DISMISS', index: i })}>Dismiss</button>}
              </li>
            )
          })}
        </ul>
      )}
      {r.companions === 'party' && (
      <label className="small toggle">
        <input type="checkbox" checked={state.partyDice} onChange={() => dispatch({ type: 'TOGGLE_PARTY_DICE' })} />
        Use dice instead of cards for companions
      </label>
      )}
      <ShipSheet state={state} dispatch={dispatch} />
    </aside>
  )
}
