import { useState } from 'react'
import { formatLong, formatShort, type ISODate } from '@questender/engine/calendar'
import { campaign } from '@questender/engine/campaign'
import { ACHIEVEMENTS } from '@questender/engine/achievements'
import { CHEST_DAYS, chestsAvailable, daysInWeek, type Progress } from '@questender/engine/progress'
import { earnedOn, rewardTheme } from '@questender/engine/rewards'
import { chestLoot } from '@questender/engine/chest'
import { item } from '@questender/engine/content'
import { rules } from '@questender/engine/ruleset'
import { playedDates } from '@questender/engine/state'
import { weekStart } from '@questender/engine/calendar'
import { campColor } from './colors'
import type { DeskSlot } from './Desk'

interface Props {
  slots: DeskSlot[]
  progress: Progress
  today: ISODate
  onOpenChest: (week: ISODate, slotId: string) => void
}

/** The desk's shelf: the weekly chest, each campaign's keepsakes, and the achievements. */
export function Shelf({ slots, progress, today, onOpenChest }: Props) {
  const earned = new Map(progress.achievements.map((a) => [a.id, a.date]))
  return (
    <main className="shelf">
      <h2>Shelf</h2>
      <p className="muted small">
        Rewards for days you turned up, not for unbroken streaks. Missing a day never takes anything away.
      </p>
      <Chest slots={slots} progress={progress} today={today} onOpen={onOpenChest} />

      <section aria-labelledby="keepsakes-h">
        <h3 id="keepsakes-h">Keepsakes</h3>
        <p className="muted small">Each campaign keeps its own shelf, filled by the days you play in it.</p>
        {slots.length === 0 && <p className="muted">Start a campaign to begin a shelf.</p>}
        <div className="keepsake-sets">
          {slots.map((s) => {
            const days = playedDates(s.state)
            const theme = rewardTheme(s.state.campaignId)
            if (theme.keepsakes.length === 0) return null
            return (
              <article key={s.id} className="keepsake-set" style={{ ['--camp' as string]: campColor(slots, s) }}>
                <header>
                  <h4>{campaign(s.state.campaignId).title}</h4>
                  <span className="muted small">
                    {days.length} {days.length === 1 ? 'day' : 'days'} played
                  </span>
                </header>
                <ul>
                  {theme.keepsakes.map((k) => {
                    const on = days.length >= k.days ? earnedOn(days, k.days) : null
                    return on ? (
                      <li key={k.id} className="keepsake earned">
                        <strong>{k.name}</strong>
                        <p>{k.text}</p>
                        <small className="muted">
                          {k.perk ? 'Once a week: one free reroll of a d20. ' : ''}Earned {formatShort(on)}
                        </small>
                      </li>
                    ) : (
                      <li key={k.id} className="keepsake locked">
                        <strong aria-label="Not yet earned">???</strong>
                        <p>Play {k.days} days in this campaign.</p>
                      </li>
                    )
                  })}
                </ul>
              </article>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="ach-h">
        <h3 id="ach-h">Achievements</h3>
        <p className="muted small" aria-live="polite">
          {earned.size} of {ACHIEVEMENTS.length} earned
        </p>
        <ul className="achievements">
          {ACHIEVEMENTS.map((a) => {
            const date = earned.get(a.id)
            return date ? (
              <li key={a.id} className="ach earned">
                <strong>{a.name}</strong>
                <p>{a.text}</p>
                <small className="muted">{formatLong(date)}</small>
              </li>
            ) : (
              <li key={a.id} className="ach locked">
                <strong aria-label="Not yet earned">???</strong>
                <p>{a.hint}</p>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}

function Chest({ slots, progress, today, onOpen }: { slots: DeskSlot[]; progress: Progress; today: ISODate; onOpen: Props['onOpenChest'] }) {
  const weeks = chestsAvailable(progress, today)
  const eligible = slots.filter((s) => !s.state.finished && !s.state.pending && s.state.hero)
  const [pick, setPick] = useState<string>('')
  const chosen = eligible.find((s) => s.id === pick) ?? eligible[0]
  const thisWeek = weekStart(today)
  const days = daysInWeek(progress, thisWeek)
  const opened = progress.chests.find((c) => c.week === thisWeek)
  const loot = chosen ? chestLoot(chosen.state.campaignId) : null

  return (
    <section className="chest" aria-labelledby="chest-h">
      <h3 id="chest-h">The week’s chest</h3>
      {weeks.length > 0 && chosen && loot ? (
        <>
          <p>
            You played on {CHEST_DAYS} or more days in a week. Choose the campaign that receives it: {loot.currency} {rules(chosen.state).currencyName} and a {item(loot.itemId).name}.
          </p>
          <div className="row">
            <label>
              <span className="sr-only">Campaign for the chest</span>
              <select value={chosen.id} onChange={(e) => setPick(e.target.value)}>
                {eligible.map((s) => (
                  <option key={s.id} value={s.id}>
                    {campaign(s.state.campaignId).title}
                  </option>
                ))}
              </select>
            </label>
            {weeks.map((w) => (
              <button key={w} className="primary" onClick={() => onOpen(w, chosen.id)}>
                {w === thisWeek ? 'Open this week’s chest' : `Open the chest for the week of ${formatShort(w)}`}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="muted">
          {opened
            ? `Opened this week in ${campaign(opened.campaignId).title}. A new chest can be earned from next Monday.`
            : `Play pages on ${CHEST_DAYS} different days in a Monday to Sunday week to earn a chest. This week: ${Math.min(days, CHEST_DAYS)} of ${CHEST_DAYS}. Catch-up days count.`}
        </p>
      )}
    </section>
  )
}
