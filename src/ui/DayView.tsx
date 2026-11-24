import { legacyLabel } from './legacyLabel'
import { WEEKDAY_NAMES, daysBetween, formatShort, parseISO, weekday } from '@questender/engine/calendar'
import type { ISODate } from '@questender/engine/calendar'
import { campaign, isLotteryPage, pageDate, pageEndDate } from '@questender/engine/campaign'
import { dayLabel, enemy } from '@questender/engine/content'
import { rules } from '@questender/engine/ruleset'
import { nextPageLockedUntil } from '@questender/engine/status'
import { canAdvance, maxRounds, meetsRequirement, stepAvailable, stepLocked, stepsDone, type Action } from '@questender/engine/state'
import { TRAIT_NAMES } from '@questender/engine/types'
import type { Day, GameState } from '@questender/engine/types'
import { HeroPreviewButton } from './HeroPreview'
import { BandScale } from './BandScale'
import { RollPanel } from './RollPanel'
import { Scene } from './Scene'
import { hasPortrait } from './portraits/art'
import { Shop } from './Shop'
import { DockView } from './DockView'
import { DogfightView } from './DogfightView'

/** Month and weekday parts for the sheet header; weekend pages span Sat to Sun. */
function sheetParts(first: ISODate, last: ISODate) {
  const a = parseISO(first)
  const b = parseISO(last)
  const month = (d: { year: number; month: number; day: number }) =>
    new Date(d.year, d.month - 1, d.day).toLocaleString('en', { month: 'long' })
  const same = first === last
  return {
    num: same ? `${a.day}` : `${a.day}–${b.day}`,
    month: a.month === b.month ? month(a) : `${month(a)} – ${month(b)}`,
    weekday: same ? WEEKDAY_NAMES[weekday(first)] : `${WEEKDAY_NAMES[weekday(first)]}–${WEEKDAY_NAMES[weekday(last)]}`,
    year: b.year,
  }
}

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
  const sheet = sheetParts(realDate, realEnd)
  const letters = 'ABCDEFG'

  return (
    <article className="day">
      <Scene
        scene={day.scene}
        icons={day.icons ?? []}
        found={p.icons}
        disabled={!!pend}
        onFind={(index) => dispatch({ type: 'ICON', index })}
        actors={{
          hero: state.hero?.defId,
          // A lone foe with a portrait (a boss) faces the hero.
          foe: day.combat?.enemies.length === 1 && hasPortrait(day.combat.enemies[0]) ? day.combat.enemies[0] : undefined,
        }}
      />
      <header className="day-header sheet-head">
        <div className="sheet-date" aria-label={`${sheet.weekday}, ${sheet.month} ${sheet.num}, ${sheet.year}`}>
          <span className="sheet-num" aria-hidden="true">{sheet.num}</span>
          <span className="sheet-meta" aria-hidden="true">
            <span className="sheet-month">{sheet.month}</span>
            <span className="sheet-weekday">{sheet.weekday}, {sheet.year}</span>
          </span>
        </div>
        <div className="sheet-title">
          <h2>{day.title}</h2>
          <div className="day-num" title="In-world date">
            {inWorld}
          </div>
        </div>
      </header>

      <p className="narrative">{day.text}</p>
      {day.note && <p className="note">{day.note}</p>}

      {pend?.type === 'pickpocket' && (
        <div className="callout">
          <p>
            You spot an unattended purse holding <b>
              {pend.amount} {rules(state).currencyName}
            </b>.
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
          <section key={si} className={`step ${pickOne && chosen !== null ? 'picked' : ''} ${chosen !== null ? 'done' : ''} ${stepLocked(state, si) && chosen === null ? 'locked' : ''}`}>
            {step.title && <h3>{step.title}</h3>}
            {pickOne && chosen === null && <div className="muted small">Choose one:</div>}
            <div className="options">
              {step.options.map((opt, oi) => {
                const isChosen = chosen === oi
                const isRolling = pend?.type === 'check' && pend.step === si && pend.option === oi
                if (chosen !== null && !isChosen) return null
                const locked = !meetsRequirement(state, opt.requires)
                return (
                  <div key={oi} className={`option ${isChosen ? 'chosen' : ''} ${locked ? 'legacy-locked' : ''}`}>
                    <button
                      className="option-btn"
                      disabled={!available || locked}
                      onClick={() => dispatch({ type: 'CHOOSE', step: si, option: oi })}
                    >
                      <span>{pickOne && !/^[A-Z]\)/.test(opt.label) ? `${letters[oi]}) ` : ''}{opt.label}</span>
                      {opt.check && (
                        <span className="check">
                          d20 + {TRAIT_NAMES[opt.check.trait]}
                          {opt.check.tags?.length ? <small> · {opt.check.tags.join(', ')}</small> : null}
                        </span>
                      )}
                      {opt.requires && chosen === null && <span className="legacy-req">{legacyLabel(state, opt.requires, locked)}</span>}
                    </button>
                    {chosen === null &&
                      opt.effects?.map((e, ei) => e.type === 'setHero' && <HeroPreviewButton key={ei} heroId={e.heroId} />)}
                    {opt.bands && chosen === null && !isRolling && <BandScale bands={opt.bands} />}
                    {isRolling && (
                      <RollPanel
                        state={state}
                        slots={[pend.slot]}
                        dispatch={dispatch}
                        confirmLabel="Accept result"
                        bands={opt.bands}
                      />
                    )}
                    {isChosen && p.results[si] && <p className="result">{p.results[si]}</p>}
                  </div>
                )
              })}
            </div>
            {p.results[si] && chosen === null && <p className="result">{p.results[si]}</p>}
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
              <button disabled={p.lottery || !!pend} onClick={() => dispatch({ type: 'LOTTERY' })} title={`d6: −2, −1, +1, +2, +3, +4 ${rules(state).currencyName}`}>
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
