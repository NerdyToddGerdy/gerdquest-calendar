import { useState } from 'react'
import { ability, item, member } from '../engine/content'
import { isD20, isNat1, isNat20, slotTotal } from '../engine/dice'
import { usesLeft } from '../engine/hero'
import { d100Parts } from '../engine/vehicle'
import { isFollower } from '../engine/followers'
import { abilityReady, costLabel } from '../engine/pools'
import type { Action } from '../engine/state'
import type { GameState, RollSlot } from '../engine/types'

interface Props {
  state: GameState
  slots: RollSlot[]
  dispatch: (a: Action) => void
  confirmLabel: string
}

/**
 * Shows rolled dice and lets the player apply abilities, a Boon, items or
 * party members after seeing the result — then confirm.
 */
export function RollPanel({ state, slots, dispatch, confirmLabel }: Props) {
  const [selected, setSelected] = useState(slots[0]?.id)
  const hero = state.hero!
  const slot = slots.find((s) => s.id === selected) ?? slots[0]

  const abilities = hero.abilities.map(ability).filter((a) => {
    if (a.kind === 'reroll') return isD20(slot)
    if (a.kind === 'addDie') return a.slots.includes(slot.kind)
    return false
  })
  const items = Object.keys(hero.inventory)
    .map(item)
    .filter((it) => it.kind === 'slotDie' && it.slots.includes(slot.kind))

  return (
    <div className="roll-panel">
      <div className="slots">
        {slots.map((s) => (
          <button
            key={s.id}
            className={`slot ${s.id === slot.id ? 'selected' : ''} ${isNat1(s) ? 'nat1' : ''} ${isNat20(s) ? 'nat20' : ''}`}
            onClick={() => setSelected(s.id)}
          >
            <span className="slot-label">{s.label}</span>
            <span className="die" data-die={`d${s.die}`}>
              {s.natural}
            </span>
            {s.die === 100 && (
              <small className="d100-split" title="Two d10s: tens + ones">
                {d100Parts(s.natural).join(' + ')}
                {s.natural === 100 ? ' (= 100)' : ''}
              </small>
            )}
            <span className="mods">
              {s.mods.map((m, i) => (
                <span key={i} title={m.label}>
                  {m.value >= 0 ? '+' : '−'}
                  {Math.abs(m.value)} <small>{m.label}</small>
                </span>
              ))}
            </span>
            <span className="total">= {slotTotal(s)}</span>
            {isNat1(s) && <span className="tag bad">Natural 1</span>}
            {isNat20(s) && <span className="tag good">Natural 20</span>}
          </button>
        ))}
      </div>

      <div className="modifiers">
        <div className="mod-heading">Modify <b>{slot.label}</b></div>
        <div className="mod-buttons">
          {abilities.map((a) => {
            const left = usesLeft(hero, a)
            return (
              <button
                key={a.id}
                disabled={!abilityReady(hero, a)}
                onClick={() => dispatch({ type: 'USE_ABILITY', ability: a.id, slot: slot.id })}
                title={a.text}
              >
                {a.name} <small>({costLabel(a) ?? `${left} left`})</small>
              </button>
            )
          })}
          {isD20(slot) && hero.boon && (
            <button onClick={() => dispatch({ type: 'USE_BOON', slot: slot.id })}>Spend Boon (+d4)</button>
          )}
          {items.map((it) => (
            <button key={it.id} onClick={() => dispatch({ type: 'USE_ITEM', item: it.id, slot: slot.id })} title={it.text}>
              {it.name} <small>×{hero.inventory[it.id]}</small>
            </button>
          ))}
          {state.party.map((p, i) => {
            const def = member(p.defId)
            if (isFollower(def)) return null
            return (
              <button
                key={p.defId}
                disabled={p.usedPage}
                onClick={() => dispatch({ type: 'CALL_MEMBER', index: i, slot: slot.id })}
                title={def.abilities.map((a) => `${a.name}: ${a.suits.join('/')} ${a.target}+`).join('\n')}
              >
                Call {def.name} {p.usedPage && <small>(used)</small>}
              </button>
            )
          })}
          {abilities.length + items.length + state.party.length === 0 && !(isD20(slot) && hero.boon) && (
            <span className="muted">Nothing available for this roll.</span>
          )}
        </div>
      </div>

      <button className="primary" onClick={() => dispatch({ type: 'CONFIRM' })}>
        {confirmLabel}
      </button>
    </div>
  )
}
