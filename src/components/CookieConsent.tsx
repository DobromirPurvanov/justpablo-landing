import { useEffect, useState } from 'react'
import { consentValue, saveConsent, loadTrackers, initConsent } from '../lib/consent'

/* ────────────────────────────────────────────────────────────
   Cookie consent банер — показва се веднъж, изборът се пази в
   localStorage. „Приемам" зарежда GA/Meta Pixel; „Само необходимите"
   не зарежда нищо. Реалното гейтване е в src/lib/consent.ts.
   ──────────────────────────────────────────────────────────── */

export default function CookieConsent() {
  const [show, setShow] = useState(() => {
    try { return consentValue() === null } catch { return false }
  })

  // Ако вече има съгласие „all" — пускаме трекерите при зареждане на страницата.
  useEffect(() => { initConsent() }, [])

  const decide = (value: 'all' | 'necessary') => {
    saveConsent(value)
    if (value === 'all') loadTrackers()
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      role="dialog"
      aria-label="Съгласие за бисквитки"
      aria-live="polite"
      className="fixed z-[90] bottom-4 left-4 right-4 sm:right-auto sm:left-6 sm:bottom-6 sm:max-w-sm bg-white border border-[#1A1A1A]/10 rounded-2xl shadow-[0_16px_44px_rgba(0,0,0,0.18)] p-5"
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="shrink-0 w-9 h-9 rounded-full bg-[#DC2626]/10 flex items-center justify-center" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.8">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Z" strokeLinejoin="round" />
            <circle cx="9" cy="10" r="1" fill="#DC2626" stroke="none" />
            <circle cx="14.5" cy="13.5" r="1" fill="#DC2626" stroke="none" />
            <circle cx="10" cy="15" r="1" fill="#DC2626" stroke="none" />
          </svg>
        </span>
        <p className="text-sm font-light text-[#1A1A1A]/80 leading-relaxed">
          Използваме бисквитки, за да работи сайтът коректно и да го подобряваме. Вижте{' '}
          <a href="./biskvitki.html" className="text-[#DC2626] underline underline-offset-2 hover:no-underline">политиката за бисквитки</a>.
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => decide('necessary')}
          className="flex-1 h-11 px-3 rounded-full border-2 border-[#E5E5E5] text-[13px] font-medium text-[#1A1A1A]/70 hover:border-[#1A1A1A]/30 hover:text-[#1A1A1A] active:scale-[0.98] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626]"
        >
          Само необходимите
        </button>
        <button
          type="button"
          onClick={() => decide('all')}
          className="flex-1 h-11 rounded-full bg-[#DC2626] text-white text-sm font-semibold hover:bg-[#B91C1C] active:scale-[0.98] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626]"
        >
          Приемам
        </button>
      </div>
    </div>
  )
}
