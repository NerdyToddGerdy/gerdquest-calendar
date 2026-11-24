import { useState } from 'react'
import { daysBetween, formatLong, WEEKDAY_NAMES, type ISODate } from '@questender/engine/calendar'
import { CAMPAIGN_THEMES } from './campaignThemes'
import { Scene } from './Scene'
import { anchorWeekday, campaign, defaultStartDate, listCatalog, startDateOptions, unlockedThrough } from '@questender/engine/campaign'
import { ability, campaignHeroes, heroDef } from '@questender/engine/content'
import { HeroPreviewButton, HeroPreviewModal } from './HeroPreview'
import { TRAITS } from '@questender/engine/types'
import { slotExists } from '../save'
import { useCampaignPacks } from '../useCampaignPacks'
import { Opening } from './Opening'
import { Portrait } from './Portrait'

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
  const campaigns = listCatalog()
  const [campaignId, setCampaignId] = useState(campaigns[0].id)
  const entry = campaigns.find((c) => c.id === campaignId)!
  const packs = useCampaignPacks([campaignId])
  // The pages (and heroes) arrive with the pack; everything below the cards waits for it.
  const camp = packs.ready ? campaign(campaignId) : null
  const options = startDateOptions(entry, today)
  const [picked, setPicked] = useState<ISODate | null>(null)
  const startDate = picked && options.includes(picked) ? picked : defaultStartDate(entry, today)
  const taken = slotExists(campaignId, startDate)
  const [previewId, setPreviewId] = useState<string | null>(null)

  return (
    <main className="title-screen">
      <h1>New campaign</h1>

      <div className="campaign-picks">
        {campaigns.map((c) => {
          const theme = CAMPAIGN_THEMES[c.id]
          return (
            <button
              key={c.id}
              className={`campaign-pick ${theme?.className ?? ''} ${c.id === campaignId ? 'selected' : ''}`}
              aria-pressed={c.id === campaignId}
              onClick={() => {
                setCampaignId(c.id)
                setPicked(null)
              }}
            >
              {theme && (
                <div className="campaign-banner" aria-hidden="true">
                  <Scene scene={theme.scene} icons={[]} found={[]} disabled onFind={() => {}} />
                  <span className="campaign-ambient" />
                  <span className="campaign-mood">{theme.mood}</span>
                </div>
              )}
              <div className="campaign-body">
                <h3>{c.title}</h3>
                {theme && (
                  <div className="campaign-tags">
                    {theme.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                )}
                <p className="small">{c.blurb}</p>
                <span className="muted small">
                  {c.pageCount} pages · {c.rulesetId} rules
                  {c.chaptersPlanned && c.chaptersWritten && c.chaptersWritten < c.chaptersPlanned ? ` · chapters 1–${c.chaptersWritten} of ${c.chaptersPlanned} so far, more coming` : ''}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {camp ? (
        <>
      <fieldset className="start-picks">
        <legend>
          When does your story begin? <span className="muted small">(always a {WEEKDAY_NAMES[anchorWeekday(entry)]}, like page one)</span>
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
                  {d === defaultStartDate(entry, today) ? ' · recommended' : ''}
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
          <Portrait id={camp.startHero} name={heroDef(camp.startHero).name} className="pick-portrait" />
          <p>
            This campaign opens with <b>{heroDef(camp.startHero).name}</b>, {heroDef(camp.startHero).title}.{' '}
            {camp.heroIds?.includes(camp.startHero)
              ? 'Each week hands the story to a different hero; after the last one, you choose who carries on.'
              : "You'll meet the other heroes as the story goes on."}
          </p>
          <HeroPreviewButton heroId={camp.startHero} label={`Preview ${heroDef(camp.startHero).name.split(' ')[0]}`} />{' '}
          <button className="primary big" disabled={taken} onClick={() => onStart(campaignId, startDate)}>
            Begin
          </button>
        </div>
      ) : (
      <>
      <h2>Choose your hero</h2>
      <div className="hero-picks">
        {campaignHeroes(camp).map((h) => (
          <div key={h.id} className="hero-pick" style={{ ['--hero' as string]: h.color }}>
            <Portrait id={h.id} name={h.name} className="pick-portrait" />
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
            <div className="hero-pick-actions">
              <button className="primary" disabled={taken} onClick={() => onStart(campaignId, startDate, h.id)}>
                Choose {h.name.split(' ')[0]}
              </button>
              <button onClick={() => setPreviewId(h.id)}>Preview</button>
            </div>
          </div>
        ))}
      </div>
      {previewId && (
        <HeroPreviewModal
          heroId={previewId}
          onClose={() => setPreviewId(null)}
          chooseDisabled={taken}
          onChoose={() => onStart(campaignId, startDate, previewId)}
        />
      )}
      </>
      )}
        </>
      ) : (
        <Opening what={entry.title} status={packs} />
      )}
      <button onClick={onCancel}>Back</button>
    </main>
  )
}
