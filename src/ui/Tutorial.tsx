import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { initTutorial, markSeen, readTutorial, recordTutorialDay, skipTutorial, subscribeTutorial, tutorialActive } from './tutorialPrefs'

interface Tip {
  id: string
  /** CSS selector for the thing to click or look at. The first visible match is used. */
  target: string
  title: string
  text: string
  /** Show once ever; otherwise the tip comes back on each tutorial day. */
  once?: boolean
  /** Keep pointing at each new match after a click (only "Got it" hides it for the day). */
  follow?: boolean
}

/**
 * In priority order: the first tip whose target is on screen and that hasn't
 * been seen is the one shown, so the pointer follows the player down the page.
 */
const TIPS: Tip[] = [
  {
    id: 'welcome',
    target: '.datebar',
    title: 'One page a day',
    text: 'Each real day unlocks one new calendar page. New campaigns start a few days back, so you have some warm-up pages to play first. ‹ and › step between days.',
    once: true,
  },
  {
    id: 'roll',
    follow: true,
    target: '.day .roll-panel',
    title: 'Your roll',
    text: 'Here is what you rolled and what was added. You can use an ability or item to change it, then press the button to accept the result.',
  },
  {
    id: 'option',
    follow: true,
    target: '.day .step:not(.done) .option-btn:not(:disabled)',
    title: 'Click to play',
    text: 'Work down the page from the top. Click an option to do it. “d20 + a trait” means you’ll roll a die and add your hero’s bonus.',
  },
  {
    id: 'search',
    target: '.day .scene .hidden-icon:not(:disabled)',
    title: 'Something glints',
    text: 'Some pictures hide things worth finding. Click the glint to pick it up.',
    once: true,
  },
  {
    id: 'fight',
    follow: true,
    target: '.day .step.combat > button.primary:not(:disabled)',
    title: 'Time to fight',
    text: 'Each press rolls one round of the fight. Check the foes’ numbers above: the target to hit, and how much damage defeats them.',
  },
  {
    id: 'rest',
    target: '.day .step button.rest-btn:not(:disabled)',
    title: 'Take a Rest',
    text: 'Resting recovers your hero before the next adventure. It’s also the time to change your gear.',
    once: true,
  },
  {
    id: 'next',
    target: '[data-tour="next-page"]',
    title: 'Page complete',
    text: 'You’ve done everything on this page. Turn to the next one here (or with › at the top).',
  },
  {
    id: 'done-today',
    target: '[data-tour="page-locked"]',
    title: 'See you tomorrow',
    text: 'That’s today’s page. The next one unlocks tomorrow; your progress is saved on this device.',
    once: true,
  },
  {
    id: 'sheet',
    target: '.sheet',
    title: 'Your hero',
    text: 'Health, gear, abilities and money live here. Check it after a fight or a shop.',
    once: true,
  },
]

const keyFor = (tip: Tip, today: string) => (tip.once ? tip.id : `${tip.id}@${today}`)

function visible(el: Element): boolean {
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0
}

function findTarget(selector: string): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>(selector)) if (visible(el)) return el
  return null
}

interface Placed {
  tip: Tip
  el: HTMLElement
}

/**
 * Pop-up tips pointing at what to click next, for the player's first few
 * days. "Got it" hides one tip; "Skip tutorial" turns them all off (they can
 * be turned back on in Settings).
 */
interface Pos {
  left: number
  top: number
  above: boolean
  arrow: number
}

/** Place the tip box under the target (or above it when there's no room), inside the viewport's width. */
function place(target: DOMRect, box: { width: number; height: number }): Pos {
  const gap = 12
  const margin = 16
  // Above only when the target is on screen and there's no room under it; a target further down keeps its tip with it.
  const above = target.bottom <= window.innerHeight && target.bottom + gap + box.height > window.innerHeight && target.top - gap - box.height > 0
  const center = target.left + target.width / 2
  const left = Math.min(Math.max(center - box.width / 2, margin), Math.max(margin, window.innerWidth - box.width - margin))
  return {
    left: Math.round(left + window.scrollX),
    top: Math.round((above ? target.top - gap - box.height : target.bottom + gap) + window.scrollY),
    above,
    arrow: Math.round(Math.min(Math.max(center - left, 18), box.width - 18)),
  }
}

const samePos = (a: Pos | null, b: Pos | null) => a === b || (!!a && !!b && a.left === b.left && a.top === b.top && a.above === b.above && a.arrow === b.arrow)

/**
 * Pop-up tips pointing at what to click next, for the player's first few
 * days. "Got it" hides one tip; "Skip tutorial" turns them all off (they can
 * be turned back on in Settings).
 */
export function Tutorial({ today, veteran }: { today: string; veteran: boolean }) {
  const prefs = useSyncExternalStore(subscribeTutorial, readTutorial, readTutorial)
  const active = tutorialActive(prefs, today)
  const [placed, setPlaced] = useState<Placed | null>(null)
  const [pos, setPos] = useState<Pos | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => initTutorial(veteran), [veteran])
  useEffect(() => {
    if (active) recordTutorialDay(today)
  }, [active, today])

  // Track the current tip's target every frame: the page changes under us
  // (rolls, fights, page turns) and the pointer should follow. State only
  // changes when the tip or its position does.
  useEffect(() => {
    if (!active) {
      setPlaced(null)
      return
    }
    let raf = 0
    const loop = () => {
      let next: Placed | null = null
      for (const tip of TIPS) {
        if (prefs.seen.includes(keyFor(tip, today))) continue
        const el = findTarget(tip.target)
        if (el) {
          next = { tip, el }
          break
        }
      }
      setPlaced((cur) => (cur?.tip === next?.tip && cur?.el === next?.el ? cur : next))
      const box = boxRef.current?.getBoundingClientRect()
      const p = next && box ? place(next.el.getBoundingClientRect(), box) : null
      setPos((cur) => (samePos(cur, p) ? cur : p))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active, prefs, today])

  // Ring the target and count a click on it as having followed the tip.
  // No auto-scrolling: a new page should open at its top, and the tip waits
  // beside its target until the player reads down to it.
  useEffect(() => {
    if (!placed) return
    const { el, tip } = placed
    el.classList.add('tour-target')
    const followed = () => markSeen(keyFor(tip, today))
    if (!tip.follow) el.addEventListener('click', followed)
    return () => {
      el.classList.remove('tour-target')
      el.removeEventListener('click', followed)
    }
  }, [placed, today])

  if (!placed) return null
  const { tip } = placed
  return createPortal(
    <div
      ref={boxRef}
      className={`tour-tip ${pos?.above ? 'above' : 'below'}`}
      role="dialog"
      aria-label={`Tip: ${tip.title}`}
      style={pos ? { left: pos.left, top: pos.top, ['--arrow' as string]: `${pos.arrow}px` } : { visibility: 'hidden', left: 0, top: 0 }}
    >
      <b className="tour-title">{tip.title}</b>
      <p>{tip.text}</p>
      <div className="tour-actions">
        <button className="linkish" onClick={skipTutorial}>
          Skip tutorial
        </button>
        <button className="primary" onClick={() => markSeen(keyFor(tip, today))}>
          Got it
        </button>
      </div>
    </div>,
    document.body,
  )
}
