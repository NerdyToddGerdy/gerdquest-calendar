import { useState } from 'react'
import { ability, item, member } from '@questender/engine/content'
import { isD20, isNat1, isNat20, pickBand, slotTotal } from '@questender/engine/dice'
import { usesLeft } from '@questender/engine/hero'
import { d100Parts } from '@questender/engine/vehicle'
import { isFollower } from '@questender/engine/followers'
import { abilityReady, costLabel } from '@questender/engine/pools'
import type { Action } from '@questender/engine/state'
import type { Band, GameState, RollSlot } from '@questender/engine/types'
import { BandScale } from './BandScale'

interface Props {
  state: GameState
  slots: RollSlot[]
  dispatch: (a: Action) => void
  confirmLabel: string
  /** Outcome bands of the check being rolled; the band the total lands in is highlighted. */
  bands?: Band[]
}

const SHAPES: Record<number, string> = {
  4: '50,6 94,88 6,88',
  6: '14,14 86,14 86,86 14,86',
  8: '50,4 90,50 50,96 10,50',
  10: '50,4 92,40 50,96 8,40',
  12: '50,5 94,38 78,90 22,90 6,38',
  20: '50,4 90,27 90,73 50,96 10,73 10,27',
  100: '50,4 90,27 90,73 50,96 10,73 10,27',
}

function DieFace({ slot }: { slot: RollSlot }) {
  const pts = SHAPES[slot.die] ?? SHAPES[20]
  return (
    <span className={`die-face ${isNat20(slot) ? 'nat20' : ''} ${isNat1(slot) ? 'nat1' : ''}`} data-die={`d${slot.die}`} role="img" aria-label={`d${slot.die} showing ${slot.natural}`} key={`${slot.id}-${slot.natural}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <polygon points={pts} className="die-body" strokeLinejoin="round" />
        {slot.die === 20 && <polygon points="50,24 74,66 26,66" className="die-facet" strokeLinejoin="round" />}
        {slot.die === 12 && <polygon points="50,28 70,42 62,66 38,66 30,42" className="die-facet" strokeLinejoin="round" />}
        {slot.die === 8 && <line x1="10" y1="50" x2="90" y2="50" className="die-facet" />}
        {isNat1(slot) && <path d="M52 14 L44 40 L56 52 L46 80" className="die-crack" />}
      </svg>
      <span className="die-num">{slot.natural}</span>
      <span className="die-kind">d{slot.die}</span>
    </span>
  )
}

/**
 * Shows rolled dice and lets the player apply abilities, a Boon, items or
 * party members after seeing the result — then confirm.
 */
export function RollPanel({ state, slots, dispatch, confirmLabel, bands }: Props) {
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

  const hasModifiers =
    abilities.length + items.length > 0 ||
    (isD20(slot) && !!hero.boon) ||
    state.party.some((p) => !isFollower(member(p.defId)))

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
            <DieFace slot={s} />
            {s.die === 100 && (
              <small className="d100-split" title="Two d10s: tens + ones">
                {d100Parts(s.natural).join(' + ')}
                {s.natural === 100 ? ' (= 100)' : ''}
              </small>
            )}
            <span className="equation">
              <span className="term">
                {s.natural}
                <small>rolled</small>
              </span>
              {s.mods.map((m, i) => (
                <span key={i} className="term">
                  <i aria-hidden="true">{m.value >= 0 ? '+' : '−'}</i>
                  <span className="sr-only">{m.value >= 0 ? 'plus' : 'minus'}</span>
                  {Math.abs(m.value)}
                  <small>{m.label}</small>
                </span>
              ))}
            </span>
            <span className="total">
              <small>total</small>
              {slotTotal(s)}
            </span>
            {isNat1(s) && <span className="tag bad">Natural 1</span>}
            {isNat20(s) && <span className="tag good">Natural 20</span>}
          </button>
        ))}
      </div>

      {bands && slots.length === 1 && (
        <BandScale bands={bands} active={bands.indexOf(pickBand(bands, slotTotal(slot), isNat1(slot)))} />
      )}

      {hasModifiers && (
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
        </div>
      </div>
      )}

      <button className="primary" onClick={() => dispatch({ type: 'CONFIRM' })}>
        {confirmLabel}
      </button>
    </div>
  )
}
