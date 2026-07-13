import { scrollToId, scrollToTop } from '../lib/scroll'

/** Минимален хром: лого вляво, Запитване вдясно. Нищо друго. */
export default function LandingNav() {
  return (
    <>
      <a
        href="#top"
        onClick={e => { e.preventDefault(); scrollToTop() }}
        className="fixed top-5 left-5 lg:left-8 z-50 flex items-center gap-3"
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
        className="fixed top-5 right-5 lg:right-8 z-50 inline-flex items-center gap-2 bg-[#DC2626] text-white text-[11px] uppercase tracking-[0.14em] font-medium px-5 py-3 rounded-full shadow-lg shadow-[#DC2626]/25 hover:bg-[#B91C1C] hover:scale-[1.03] active:scale-95 transition-all duration-300"
      >
        Запитване
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  )
}
