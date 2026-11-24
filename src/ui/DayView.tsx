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
  /** Turn to the next page; undefined when that isn't possible yet. */
  onNext?: () => void
  /** Why the next page isn't available (from the desk). */
  nextHint?: string
}

export function DayView({ state, day, dispatch, today, onNext, nextHint }: Props) {
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
                        today={today}
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
            <RollPanel state={state} slots={pend.slots} dispatch={dispatch} confirmLabel="Resolve round" today={today} />
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
              <button className="rest-btn" disabled={p.rested || !!pend} onClick={() => dispatch({ type: 'REST' })}>
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
        <PageEnd state={state} day={day} today={today} lockedUntil={lockedUntil} onNext={onNext} nextHint={nextHint} />
      </footer>
    </article>
  )
}

/** What's left on this page, in plain words. */
function remaining(state: GameState, day: Day): string[] {
  const left: string[] = []
  if (state.pending) left.push(state.pending.type === 'combat' ? 'Resolve the round you just rolled.' : 'Finish the roll in progress (press Accept result).')
  const open = state.progress.steps.filter((x) => x === null).length
  if (open) left.push(`Complete ${open === 1 ? 'the last step' : `the ${open} remaining steps`} above.`)
  if (day.combat && !state.progress.combat?.done) left.push(state.progress.combat ? 'Finish the fight.' : 'Fight: press Begin the fight once the steps are done.')
  if (day.dogfight && state.ship && !state.progress.dogfight?.done) left.push('Finish the ship battle.')
  return left
}

interface EndProps {
  state: GameState
  day: Day
  today: string
  lockedUntil: string | null
  onNext?: () => void
  nextHint?: string
}

/**
 * The bottom of the page: either what's left to do, or that the page is done
 * and exactly what happens next (turn the page now, or come back on a date).
 */
function PageEnd({ state, day, today, lockedUntil, onNext, nextHint }: EndProps) {
  if (!canAdvance(state)) {
    const left = remaining(state, day)
    return (
      <div className="page-end todo">
        <h3>Not done yet</h3>
        {left.length ? (
          <ul>
            {left.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        ) : (
          <p>Finish everything on this page to move on.</p>
        )}
      </div>
    )
  }
  const optional = day.rest && !state.progress.rested ? ' You can still take a Rest above before you go.' : day.shop ? ' The shop above closes once you turn the page.' : ''
  if (lockedUntil) {
    const n = daysBetween(today, lockedUntil)
    return (
      <div className="page-end done" data-tour="page-locked">
        <h3>✓ Page complete</h3>
        <p>
          That’s everything for today. One new page unlocks each real day, so the story continues{' '}
          <b>{n === 1 ? 'tomorrow' : `in ${n} days`}</b>, on {formatShort(lockedUntil)}.{optional}
        </p>
        <p className="muted small">Until then you can look over your hero, read the Journal, or play a page in another campaign.</p>
      </div>
    )
  }
  return (
    <div className="page-end done">
      <h3>✓ Page complete</h3>
      <p>Your progress is saved.{optional}</p>
      {onNext ? (
        <>
          <button className="primary big" data-tour="next-page" onClick={onNext}>
            Turn to the next page ›
          </button>
          {nextHint && <p className="muted small">{nextHint}</p>}
        </>
      ) : (
        nextHint && <p className="muted small">{nextHint}</p>
      )}
    </div>
  )
}
