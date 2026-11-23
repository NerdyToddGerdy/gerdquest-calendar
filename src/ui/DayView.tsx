import { daysBetween, formatLong, formatShort, formatSpan, parseISO } from '../engine/calendar'
import { campaign, isLotteryPage, pageDate, pageEndDate } from '../engine/campaign'
import { dayLabel, enemy } from '../engine/content'
import { nextPageLockedUntil } from '../engine/status'
import { bandLabel } from '../engine/dice'
import { canAdvance, maxRounds, stepAvailable, stepLocked, stepsDone, type Action } from '../engine/state'
import { TRAIT_NAMES } from '../engine/types'
import type { Day, GameState } from '../engine/types'
import { RollPanel } from './RollPanel'
import { Scene } from './Scene'
import { Shop } from './Shop'
import { DockView } from './DockView'
import { DogfightView } from './DogfightView'

interface Props {
  state: GameState
  day: Day
  dispatch: (a: Action) => void
  /** The player's local date (ISO). */
  today: string
}

export function DayView({ state, day, dispatch, today }: Props) {
  const camp = campaign(state.campaignId)
  const realDate = pageDate(camp, state.dayIndex, state.startDate)
  const realEnd = pageEndDate(camp, state.dayIndex, state.startDate)
  const inWorld = dayLabel(camp, state.dayIndex).date
  const lotteryToday = isLotteryPage(camp, state.dayIndex, state.startDate)
  const lockedUntil = nextPageLockedUntil(state, today)
  const p = state.progress
  const pend = state.pending
  const letters = 'ABCDEFG'

  return (
    <article className="day">
      <Scene
        scene={day.scene}
        icons={day.icons ?? []}
        found={p.icons}
        disabled={!!pend}
        onFind={(index) => dispatch({ type: 'ICON', index })}
      />
      <header className="day-header">
        <div>
          <div className="date">{realEnd === realDate ? formatLong(realDate) : `${formatSpan(realDate, realEnd)}, ${parseISO(realEnd).year}`}</div>
          <h2>{day.title}</h2>
        </div>
        <div className="day-num" title="In-world date">
          {inWorld}
        </div>
      </header>

      <p className="narrative">{day.text}</p>
      {day.note && <p className="note">{day.note}</p>}

      {pend?.type === 'pickpocket' && (
        <div className="callout">
          <p>
            You spot an unattended purse holding <b>{pend.amount} glint</b>.
            {pend.amount === 4 && ' Taking this much will weigh on your conscience (−1 Virtue).'}
          </p>
          <div className="row">
            <button className="primary" onClick={() => dispatch({ type: 'PICKPOCKET', take: true })}>
              Take it
            </button>
            <button onClick={() => dispatch({ type: 'PICKPOCKET', take: false })}>Leave it</button>
          </div>
        </div>
      )}

      {day.steps.map((step, si) => {
        const chosen = p.steps[si]
        const available = stepAvailable(state, si)
        const pickOne = step.options.length > 1
        return (
          <section key={si} className={`step ${chosen !== null ? 'done' : ''} ${stepLocked(state, si) && chosen === null ? 'locked' : ''}`}>
            {step.title && <h3>{step.title}</h3>}
            {pickOne && chosen === null && <div className="muted small">Choose one:</div>}
            <div className="options">
              {step.options.map((opt, oi) => {
                const isChosen = chosen === oi
                const isRolling = pend?.type === 'check' && pend.step === si && pend.option === oi
                if (chosen !== null && !isChosen) return null
                return (
                  <div key={oi} className="option">
                    <button
                      className="option-btn"
                      disabled={!available}
                      onClick={() => dispatch({ type: 'CHOOSE', step: si, option: oi })}
                    >
                      <span>{pickOne && !/^[A-Z]\)/.test(opt.label) ? `${letters[oi]}) ` : ''}{opt.label}</span>
                      {opt.check && (
                        <span className="check">
                          d20 + {TRAIT_NAMES[opt.check.trait]}
                          {opt.check.tags?.length ? <small> · {opt.check.tags.join(', ')}</small> : null}
                        </span>
                      )}
                    </button>
                    {opt.bands && chosen === null && !isRolling && (
                      <div className="bands">
                        {opt.bands.map((b, bi) => (
                          <span key={bi}>{bandLabel(b)}</span>
                        ))}
                      </div>
                    )}
                    {isRolling && (
                      <RollPanel state={state} slots={[pend.slot]} dispatch={dispatch} confirmLabel="Accept result" />
                    )}
                  </div>
                )
              })}
            </div>
            {p.results[si] && <p className="result">{p.results[si]}</p>}
          </section>
        )
      })}

      {day.dogfight && <DogfightView state={state} day={day} dispatch={dispatch} />}

      {day.combat && (
        <section className="step combat">
          <h3>Combat</h3>
          <div className="enemies">
            {(p.combat?.enemies ?? day.combat.enemies.map((defId) => ({ defId, defeated: false }))).map((e, i) => {
              const def = enemy(e.defId)
              return (
                <div key={i} className={`enemy ${e.defeated ? 'defeated' : ''}`} title={def.text}>
                  <b>{def.name}</b>
                  <span>Hit on {def.ac}+ · Defeat with {def.toughness}+ dmg</span>
                  <span>Deals {def.dmg} · Block on {def.hits}+</span>
                </div>
              )
            })}
          </div>
          {p.combat && (
            <div className="muted small">
              {p.combat.done
                ? p.combat.won
                  ? 'Victory.'
                  : 'The fight is over.'
                : `Round ${p.combat.round} of ${maxRounds(state)}`}
            </div>
          )}
          {pend?.type === 'combat' ? (
            <RollPanel state={state} slots={pend.slots} dispatch={dispatch} confirmLabel="Resolve round" />
          ) : (
            !p.combat?.done && (
              <button
                className="primary"
                disabled={!!pend || !stepsDone(state)}
                onClick={() => dispatch({ type: 'ROLL_ROUND' })}
              >
                {p.combat ? `Roll round ${p.combat.round}` : 'Begin the fight'}
              </button>
            )
          )}
        </section>
      )}

      {(day.rest || lotteryToday) && (
        <section className="step">
          <h3>{day.rest && lotteryToday ? 'Rest & lottery' : day.rest ? 'Rest' : 'Sunday lottery'}</h3>
          <div className="row">
            {day.rest && (
              <button disabled={p.rested || !!pend} onClick={() => dispatch({ type: 'REST' })}>
                {p.rested ? 'Rested' : 'Take a Rest'}
              </button>
            )}
            {lotteryToday && (
              <button disabled={p.lottery || !!pend} onClick={() => dispatch({ type: 'LOTTERY' })} title="d6: −2, −1, +1, +2, +3, +4 glint">
                {p.lottery ? 'Lottery played' : 'Play the lottery (d6)'}
              </button>
            )}
          </div>
        </section>
      )}

      {day.shop && <Shop state={state} shop={day.shop} dispatch={dispatch} />}
      {day.dock && <DockView state={state} dock={day.dock} dispatch={dispatch} />}

      <footer className="day-footer">
        {canAdvance(state) ? (
          lockedUntil ? (
            <div className="locked-next">
              <span className="muted small">Page complete. The next page unlocks</span>
              <b>{formatShort(lockedUntil)}</b>
              <span className="muted small">
                {(() => {
                  const n = daysBetween(today, lockedUntil)
                  return n === 1 ? 'tomorrow' : `in ${n} days`
                })()}
              </span>
            </div>
          ) : (
            <span className="muted">Page complete — use › at the top to move on.</span>
          )
        ) : (
          <span className="muted small">Finish everything on this page to move on.</span>
        )}
      </footer>
    </article>
  )
}
