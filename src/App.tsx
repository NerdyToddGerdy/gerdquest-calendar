import { useEffect, useRef, useState } from 'react'
import { playDiceSound, setSoundEnabled, soundEnabled } from './sound/audio'
import { diceSoundFor } from './sound/diceEvents'
import type { ISODate } from '@questender/engine/calendar'
import { nextDeskDate, pickTab, startingDate, tabView, turnThrough } from '@questender/engine/desk'
import { achievementDef, newlyEarned } from '@questender/engine/achievements'
import { mergeProgress, recordAchievements, recordChest, recordVisit, syncProgress, welcomeDue } from '@questender/engine/progress'
import { keepsakesEarned, stylesUnlocked } from '@questender/engine/rewards'
import { campaign } from '@questender/engine/campaign'
import { newSeed } from '@questender/engine/rng'
import { canWelcomeBack, initialState, playedDates, reduce, type Action } from '@questender/engine/state'
import { importEntries } from './calendarNotes'
import { requestPersistence } from './deviceStorage'
import { deleteSlot, exportAll, importFile, listSlots, loadSlot, migrateLegacySave, saveSlot, savedCampaignIds, slotIdFor } from './save'
import { useCampaignPacks } from './useCampaignPacks'
import { loadProgress, saveProgress } from './progressStore'
import { Toasts, type ToastItem } from './ui/Toasts'
import { avatarName, borderName } from './ui/Token'
import { Opening } from './ui/Opening'
import { Desk, type DeskSlot } from './ui/Desk'
import { NewCampaign } from './ui/NewCampaign'
import { useToday } from './ui/today'
import { readTheme, writeTheme, type ThemePref } from './theme'
import './App.css'

const TAB_KEY = 'questender.selectedTab'

const byStart = (a: DeskSlot, b: DeskSlot) => a.state.startDate.localeCompare(b.state.startDate) || a.id.localeCompare(b.id)

function loadAll(today: ISODate): DeskSlot[] {
  return listSlots()
    .map((m) => ({ id: m.slotId, state: loadSlot(m.slotId, today) }))
    .filter((s): s is DeskSlot => !!s.state)
    .sort(byStart)
}

function readTab(): string | null {
  try {
    return localStorage.getItem(TAB_KEY)
  } catch {
    return null
  }
}

/**
 * Loading boundary: the campaigns on this device load their packs first, so
 * everything below (reducer, desk, calendar) can use the engine synchronously.
 */
export default function App() {
  const [ids] = useState(savedCampaignIds)
  const packs = useCampaignPacks(ids)
  if (!packs.ready) return <Opening what="your campaigns" status={packs} />
  return <Game />
}

function Game() {
  const [today, refreshToday] = useToday()
  const [slots, setSlots] = useState<DeskSlot[]>(() => {
    migrateLegacySave(today)
    return loadAll(today)
  })
  const [pickedDate, setViewDate] = useState<ISODate>(() => startingDate(slots.map((s) => s.state), today))
  // Never show a date past today (e.g. after changing the dev date).
  const viewDate = pickedDate > today ? today : pickedDate
  const [selected, setSelected] = useState<string | null>(() => pickTab(slots, viewDate, readTab()))
  const [screen, setScreen] = useState<'desk' | 'new'>('desk')
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const dirty = useRef(new Set<string>())

  // Desk-wide progress: days played, achievements, weekly chests. Local to this device.
  const [progress, setProgress] = useState(() => recordVisit(loadProgress(), today))
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const milestones = useRef<Map<string, { keepsakes: Set<string>; looks: Set<string> }> | null>(null)
  useEffect(() => setProgress((p) => recordVisit(p, today)), [today])
  useEffect(() => saveProgress(progress), [progress])

  // After every change: fold in days played, check achievements and per-campaign milestones.
  useEffect(() => {
    const states = slots.map((s) => s.state)
    const synced = syncProgress(progress, states, today)
    const earned = newlyEarned({ states, progress: synced, today })
    const next = earned.length ? recordAchievements(synced, earned, today) : synced
    if (next !== progress) setProgress(next)
    const fresh: ToastItem[] = earned.map((id) => ({ id: `a-${id}`, title: achievementDef(id)!.name, text: achievementDef(id)!.text, label: 'Achievement earned' }))
    const prev = milestones.current
    const cur = new Map(
      slots.map((s) => {
        const days = playedDates(s.state).length
        return [s.id, { keepsakes: new Set(keepsakesEarned(s.state.campaignId, days).map((k) => k.id)), looks: new Set(stylesUnlocked(s.state.campaignId, days).map((x) => x.id)) }] as const
      }),
    )
    if (prev)
      for (const s of slots) {
        const before = prev.get(s.id)
        if (!before) continue
        const days = playedDates(s.state).length
        const title = campaign(s.state.campaignId).title
        for (const k of keepsakesEarned(s.state.campaignId, days)) if (!before.keepsakes.has(k.id)) fresh.push({ id: `k-${s.id}-${k.id}`, title: k.name, text: k.text, label: `New keepsake in ${title}` })
        for (const x of stylesUnlocked(s.state.campaignId, days)) if (!before.looks.has(x.id)) fresh.push({ id: `s-${s.id}-${x.id}`, title: x.name, text: 'Unlocked. Choose it in Settings.', label: `New look in ${title}` })
      }
    if (prev) {
      for (const a of synced.avatars) if (!progress.avatars.some((x) => x.id === a.id)) fresh.push({ id: `t-${a.id}`, title: avatarName(a.id), text: 'A new token for your corner of the desk. Pick it from the token button, top right.', label: 'New token' })
      for (const b of synced.borders) if (!progress.borders.some((x) => x.id === b.id)) fresh.push({ id: `b-${b.id}`, title: borderName(b.id), text: 'A new border for your token. Pick it from the token button, top right.', label: 'New border' })
    }
    milestones.current = cur
    if (fresh.length) setToasts((q) => [...q, ...fresh.filter((f) => !q.some((x) => x.id === f.id))])
  }, [slots, today, progress])

  // Autosave whichever campaigns changed.
  useEffect(() => {
    for (const s of slots) if (dirty.current.has(s.id)) saveSlot(s.state)
    dirty.current.clear()
  }, [slots])

  // Ask the browser to keep our saves (best effort; never blocks play).
  const askedPersist = useRef(false)
  useEffect(() => {
    if (slots.length === 0 || askedPersist.current) return
    askedPersist.current = true
    void requestPersistence()
  }, [slots.length])

  const select = (id: string) => {
    setSelected(id)
    try {
      localStorage.setItem(TAB_KEY, id)
    } catch {
      /* ignore */
    }
  }

  /** Apply a change to the campaign list, marking changed campaigns for autosave. */
  const update = (fn: (prev: DeskSlot[]) => DeskSlot[]) =>
    setSlots((prev) => {
      const next = fn(prev)
      next.forEach((s, i) => {
        if (s.state !== prev[i]?.state) dirty.current.add(s.id)
      })
      return next
    })

  const [theme, setTheme] = useState<ThemePref>(readTheme)
  const changeTheme = (t: ThemePref) => {
    writeTheme(t)
    setTheme(t)
  }

  const [sound, setSound] = useState(soundEnabled)
  const toggleSound = () => {
    setSoundEnabled(!sound)
    setSound(!sound)
  }

  // Dice sounds: compare the campaign the player just acted in with how it was before.
  const acted = useRef<{ id: string; before: DeskSlot['state'] } | null>(null)
  useEffect(() => {
    const a = acted.current
    if (!a) return
    acted.current = null
    const now = slots.find((s) => s.id === a.id)?.state
    const sfx = now && now !== a.before ? diceSoundFor(a.before, now) : null
    if (sfx) playDiceSound(sfx)
  }, [slots])

  const dispatch = (id: string, a: Action) => {
    const before = slots.find((s) => s.id === id)?.state
    if (before) acted.current = { id, before }
    update((prev) => prev.map((s) => (s.id === id ? { ...s, state: reduce(s.state, a) } : s)))
  }

  // Well rested: on the first page opened in a campaign after a return from 3+ days away.
  useEffect(() => {
    if (!welcomeDue(progress, today)) return
    const sel = slots.find((s) => s.id === selected)
    if (sel && tabView(sel.state, viewDate).kind === 'play' && canWelcomeBack(sel.state, today)) dispatch(sel.id, { type: 'WELCOME_BACK', date: today })
  }, [slots, selected, viewDate, progress, today])

  const openChest = (week: string, slotId: string) => {
    const slot = slots.find((s) => s.id === slotId)
    if (!slot) return
    dispatch(slotId, { type: 'OPEN_CHEST', week })
    setProgress((p) => recordChest(p, week, slot.state.campaignId, today))
  }

  /**
   * The › arrow: move to the next date that shows something new (Saturday
   * goes straight to Monday when every campaign is on a weekend page),
   * turning the page in every campaign that completed the page ending on a
   * date passed (campaigns that lag stay where they are).
   */
  const forward = () => {
    const next = nextDeskDate(
      slots.map((s) => s.state),
      viewDate,
      today,
    )
    const turned = slots.map((s) => ({ ...s, state: turnThrough(s.state, viewDate, next) }))
    update(() => turned)
    setViewDate(next)
    // A new page starts at its top, not wherever the last one was scrolled to.
    window.scrollTo({ top: 0, behavior: 'instant' })
    const tab = pickTab(turned, next, selected)
    if (tab) select(tab)
  }

  /** Put campaigns on the desk (replacing any slots listed), then show the first one. */
  const addAll = (states: DeskSlot['state'][], replacing: string[] = []) => {
    const added = states.map((state) => ({ id: slotIdFor(state.campaignId, state.startDate), state }))
    if (!added.length) return
    added.forEach((s) => saveSlot(s.state))
    const ids = new Set([...added.map((s) => s.id), ...replacing])
    setSlots((prev) => [...prev.filter((s) => !ids.has(s.id)), ...added].sort(byStart))
    select(added[0].id)
    setViewDate(startingDate(states, today))
    setScreen('desk')
  }

  const onImport = async (file: File | undefined) => {
    if (!file) return
    setImporting(true)
    try {
      const { states, calendar, progress: incomingProgress } = await importFile(file, today)
      const incoming = new Set(states.map((s) => slotIdFor(s.campaignId, s.startDate)))
      const existing = listSlots().filter((m) => incoming.has(m.slotId))
      if (existing.length) {
        const names = existing.map((m) => `${m.campaignId} from ${m.startDate}`).join(', ')
        if (!confirm(`Replace your existing run${existing.length > 1 ? 's' : ''} (${names}) with this file?`)) return
      }
      existing.forEach((m) => deleteSlot(m.slotId))
      if (calendar.length) importEntries(calendar)
      if (incomingProgress) setProgress((p) => mergeProgress(p, incomingProgress))
      addAll(
        states,
        existing.map((m) => m.slotId),
      )
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => {
          onImport(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      {importing && (
        <p className="muted" role="status">
          Opening your import…
        </p>
      )}
      {error && <p className="error">{error}</p>}
      <Toasts items={toasts} onDismiss={(id) => setToasts((q) => q.filter((x) => x.id !== id))} />
      {screen === 'new' ? (
        <NewCampaign
          today={today}
          onCancel={() => setScreen('desk')}
          onStart={(campaignId, startDate, heroId) =>
            addAll([reduce(initialState(), { type: 'NEW_GAME', heroId, seed: newSeed(), campaignId, startDate })])
          }
        />
      ) : (
        <Desk
          slots={slots}
          viewDate={viewDate}
          today={today}
          selected={selected}
          onSelect={select}
          onDate={setViewDate}
          onForward={forward}
          onDispatch={dispatch}
          onNew={() => setScreen('new')}
          onImport={() => fileRef.current?.click()}
          theme={theme}
          onTheme={changeTheme}
          sound={sound}
          onToggleSound={toggleSound}
          onExportAll={() => exportAll(slots.map((s) => s.state), today)}
          onDelete={(id) => {
            deleteSlot(id)
            setSlots((prev) => prev.filter((s) => s.id !== id))
          }}
          onTodayChanged={refreshToday}
          progress={progress}
          onOpenChest={openChest}
          onToken={(token) => setProgress((p) => ({ ...p, token }))}
        />
      )}
    </>
  )
}
