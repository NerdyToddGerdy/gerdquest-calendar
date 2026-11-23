import { useEffect, useRef, useState } from 'react'
import { addDays, type ISODate } from './engine/calendar'
import { pickTab, startingDate, turnPast } from './engine/desk'
import { newSeed } from './engine/rng'
import { initialState, reduce, type Action } from './engine/state'
import { deleteSlot, importSave, listSlots, loadSlot, migrateLegacySave, saveSlot, slotIdFor } from './save'
import { Desk, type DeskSlot } from './ui/Desk'
import { NewCampaign } from './ui/NewCampaign'
import { useToday } from './ui/today'
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

  const dispatch = (id: string, a: Action) => update((prev) => prev.map((s) => (s.id === id ? { ...s, state: reduce(s.state, a) } : s)))

  /** The › arrow: turn the page in every campaign whose page ends today, then move on a day. */
  const forward = () => {
    const next = addDays(viewDate, 1)
    const turned = slots.map((s) => ({ ...s, state: turnPast(s.state, viewDate) }))
    update(() => turned)
    setViewDate(next)
    const tab = pickTab(turned, next, selected)
    if (tab) select(tab)
  }

  const add = (state: DeskSlot['state'], replacing: string[] = []) => {
    const id = slotIdFor(state.campaignId, state.startDate)
    saveSlot(state)
    setSlots((prev) => [...prev.filter((s) => s.id !== id && !replacing.includes(s.id)), { id, state }].sort(byStart))
    select(id)
    setViewDate(startingDate([state], today))
    setScreen('desk')
  }

  const onImport = async (file: File | undefined) => {
    if (!file) return
    try {
      const s = await importSave(file, today)
      const existing = listSlots().filter((m) => m.slotId === slotIdFor(s.campaignId, s.startDate))
      if (existing.length && !confirm(`Replace your existing ${s.campaignId} run from ${s.startDate} with this file?`)) return
      existing.forEach((m) => deleteSlot(m.slotId))
      add(
        s,
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
            add(reduce(initialState(), { type: 'NEW_GAME', heroId, seed: newSeed(), campaignId, startDate }))
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
