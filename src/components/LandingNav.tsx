import { useEffect, useState } from 'react'
import { scrollToId, scrollToTop } from '../lib/scroll'

/** Минимален хром: лого вляво, Запитване вдясно. Прозрачен горе (за чистото
    hero), но получава фрост-стъкло фон при скрол — иначе логото се слива със
    съдържанието, което минава под навигацията. */
export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/85 backdrop-blur-md shadow-[0_1px_0_rgba(26,26,26,0.07)]' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-5 lg:px-8 py-3">
        <a
          href="#top"
          onClick={e => { e.preventDefault(); scrollToTop() }}
          className="flex items-center gap-3"
          aria-label="Just Pablo Digital — начало"
        >
          <img src="./images/logo-mark.png" alt="" width={329} height={329} className="w-10 h-10 lg:w-11 lg:h-11 object-contain" />
          <span className="flex flex-col leading-none">
            <span className="text-lg font-semibold tracking-tight text-[#1A1A1A]">Just Pablo</span>{' '}
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#DC2626] mt-1">Digital</span>
          </span>
        </a>

        <button
          onClick={() => scrollToId('zapitvane')}
          className="inline-flex items-center gap-2 bg-[#DC2626] text-white text-sm font-semibold px-6 py-3.5 rounded-full shadow-lg shadow-[#DC2626]/25 hover:bg-[#B91C1C] hover:scale-[1.03] active:scale-95 transition-all duration-300 whitespace-nowrap"
        >
          Запитване
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  )
}
