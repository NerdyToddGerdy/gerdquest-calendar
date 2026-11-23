import { useState } from 'react'
import { daysBetween, formatLong, WEEKDAY_NAMES, type ISODate } from '../engine/calendar'
import { anchorWeekday, defaultStartDate, listCampaigns, startDateOptions, unlockedThrough } from '../engine/campaign'
import { ability, campaignHeroes, heroDef } from '../engine/content'
import { TRAITS } from '../engine/types'
import { slotExists } from '../save'

interface Props {
  today: ISODate
  onStart: (campaignId: string, startDate: ISODate, heroId?: string) => void
  onCancel: () => void
}

/**
 * Choose a campaign, when it begins, then a hero. Campaigns begin about a
 * week back on the weekday their first page was written for, so the warm-up
 * pages double as a tutorial and weekend pages land on real weekends.
 */
export function NewCampaign({ today, onStart, onCancel }: Props) {
  const campaigns = listCampaigns()
  const [campaignId, setCampaignId] = useState(campaigns[0].id)
  const camp = campaigns.find((c) => c.id === campaignId)!
  const options = startDateOptions(camp, today)
  const [picked, setPicked] = useState<ISODate | null>(null)
  const startDate = picked && options.includes(picked) ? picked : defaultStartDate(camp, today)
  const taken = slotExists(campaignId, startDate)

  return (
    <main className="title-screen">
      <h1>New campaign</h1>

      <div className="campaign-picks">
        {campaigns.map((c) => (
          <button
            key={c.id}
            className={`campaign-pick ${c.id === campaignId ? 'selected' : ''}`}
            onClick={() => {
              setCampaignId(c.id)
              setPicked(null)
            }}
          >
            <h3>{c.title}</h3>
            <p className="small">{c.blurb}</p>
            <span className="muted small">
              {c.pages.length} pages · {c.rulesetId} rules
            </span>
          </button>
        ))}
      </div>

      <fieldset className="start-picks">
        <legend>
          When does your story begin? <span className="muted small">(always a {WEEKDAY_NAMES[anchorWeekday(camp)]}, like page one)</span>
        </legend>
        {options.map((d) => {
          const warmup = unlockedThrough(camp, d, today) + 1
          const ago = daysBetween(d, today)
          return (
            <label key={d} className={`start-pick ${d === startDate ? 'selected' : ''}`}>
              <input type="radio" name="start" checked={d === startDate} onChange={() => setPicked(d)} />
              <span>
                <b>{formatLong(d)}</b>
                <span className="muted small">
                  {' '}
                  · {ago === 0 ? 'today' : `${ago} days ago`} · {warmup} page{warmup === 1 ? '' : 's'} to warm up with
                  {d === defaultStartDate(camp, today) ? ' · recommended' : ''}
                </span>
              </span>
            </label>
          )
        })}
      </fieldset>
      {taken && <p className="error">You already have {camp.title} starting on that date. Pick another start date, or delete that run first.</p>}

      {camp.startHero ? (
        <div className="prologue-start">
          {/* A start hero who is also on the roster is a hero-trial week, not a separate prologue character. */}
          <h2>{camp.heroIds?.includes(camp.startHero) ? 'Your first hero' : 'Prologue'}</h2>
          <p>
            This campaign opens with <b>{heroDef(camp.startHero).name}</b>, {heroDef(camp.startHero).title}.{' '}
            {camp.heroIds?.includes(camp.startHero)
              ? 'Each week hands the story to a different hero; after the last one, you choose who carries on.'
              : "You'll meet the other heroes as the story goes on."}
          </p>
          <button className="primary big" disabled={taken} onClick={() => onStart(campaignId, startDate)}>
            Begin
          </button>
        </div>
      ) : (
      <>
      <h2>Choose your hero</h2>
      <div className="hero-picks">
        {campaignHeroes(camp).map((h) => (
          <button
            key={h.id}
            className="hero-pick"
            disabled={taken}
            style={{ ['--hero' as string]: h.color }}
            onClick={() => onStart(campaignId, startDate, h.id)}
          >
            <h3>{h.name}</h3>
            <div className="muted">{h.title}</div>
            <p>{h.blurb}</p>
            <div className="mini-stats">
              <span>HP {h.maxHp}</span>
              <span>Atk +{h.atk}</span>
              <span>Def +{h.def}</span>
              <span>d{h.dmgDie}</span>
            </div>
            <div className="mini-stats">
              {TRAITS.map((t) => (
                <span key={t}>
                  {t.toUpperCase()} {h.traits[t] >= 0 ? '+' : ''}
                  {h.traits[t]}
                </span>
              ))}
            </div>
            <ul className="small">
              {h.abilities.map((id) => (
                <li key={id}>
                  <b>{ability(id).name}</b> — {ability(id).text}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>
      </>
      )}
      <button onClick={onCancel}>Back</button>
    </main>
  )
}
