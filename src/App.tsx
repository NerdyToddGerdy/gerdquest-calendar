import { useEffect, useRef, useState } from 'react'
import { playDiceSound, setSoundEnabled, soundEnabled } from './sound/audio'
import { diceSoundFor } from './sound/diceEvents'
import type { ISODate } from '@questender/engine/calendar'
import { nextDeskDate, pickTab, startingDate, turnThrough } from '@questender/engine/desk'
import { newSeed } from '@questender/engine/rng'
import { initialState, reduce, type Action } from '@questender/engine/state'
import { importEntries } from './calendarNotes'
import { requestPersistence } from './deviceStorage'
import { deleteSlot, exportAll, importFile, listSlots, loadSlot, migrateLegacySave, saveSlot, slotIdFor } from './save'
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

export default function App() {
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
  const fileRef = useRef<HTMLInputElement>(null)
  const dirty = useRef(new Set<string>())

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

  /**
   * The › arrow: move to the next date that shows something new (Saturday
   * goes straight to Monday when every campaign is on a weekend page),
   * turning the page in every campaign whose page ends on a date passed.
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
    try {
      const { states, calendar } = await importFile(file, today)
      const incoming = new Set(states.map((s) => slotIdFor(s.campaignId, s.startDate)))
      const existing = listSlots().filter((m) => incoming.has(m.slotId))
      if (existing.length) {
        const names = existing.map((m) => `${m.campaignId} from ${m.startDate}`).join(', ')
        if (!confirm(`Replace your existing run${existing.length > 1 ? 's' : ''} (${names}) with this file?`)) return
      }
      existing.forEach((m) => deleteSlot(m.slotId))
      if (calendar.length) importEntries(calendar)
      addAll(
        states,
        existing.map((m) => m.slotId),
      )
      setError(null)
    } catch (e) {
      setError((e as Error).message)
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
      {error && <p className="error">{error}</p>}
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
        />
      )}
    </>
  )
}
