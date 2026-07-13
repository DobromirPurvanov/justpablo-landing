import { useEffect, useState, type MouseEvent } from 'react'
import { scrollToId } from '../lib/scroll'

/* ────────────────────────────────────────────────────────────
   Лепкава промо-лента — появява се щом подминеш hero-то и „следва"
   потребителя, за да напомня за промоцията. Води към офертата.
   Може да се затвори (пази се за сесията).
   ──────────────────────────────────────────────────────────── */

const KEY = 'jp_promo_bar_closed'

export default function StickyPromo() {
  const [visible, setVisible] = useState(false)
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY)) setClosed(true)
    } catch {
      /* private mode — просто показваме */
    }
    let ticking = false
    const update = () => {
      ticking = false
      // Появява се след като hero-то е подминато (за да не дублира значката там).
      setVisible(window.scrollY > window.innerHeight * 0.85)
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = (e: MouseEvent) => {
    e.stopPropagation()
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* noop */
    }
    setClosed(true)
  }

  if (closed) return null

  return (
    <div
      role="status"
      className={`fixed z-[80] left-1/2 bottom-5 flex items-center gap-1 rounded-full bg-[#1A1A1A] text-white shadow-[0_12px_34px_rgba(0,0,0,0.28)] pl-1.5 pr-1.5 py-1.5 -translate-x-1/2 transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      <button
        type="button"
        onClick={() => scrollToId('cena')}
        className="group inline-flex items-center gap-2.5 rounded-full pl-1 pr-2 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626]"
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#DC2626] shrink-0 motion-safe:animate-pulse">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
          </svg>
        </span>
        <span className="text-sm font-semibold whitespace-nowrap">
          Промоция <span className="text-[#FF6B6B] font-extrabold">−50%</span>
          <span className="hidden sm:inline text-white/55 font-medium"> · само този месец</span>
        </span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          className="text-white/70 group-hover:translate-x-0.5 transition-transform duration-200"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={close}
        aria-label="Затвори промоцията"
        className="flex items-center justify-center w-7 h-7 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
