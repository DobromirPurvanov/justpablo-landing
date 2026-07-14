import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LogoFace from '../components/LogoFace'
import PromoCountdown from '../components/PromoCountdown'
import { scrollToId } from '../lib/scroll'

gsap.registerPlugin(ScrollTrigger)

export default function LandingHero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 })
      tl.from('.hero-line', { yPercent: 112, duration: 1.1, stagger: 0.12, ease: 'power3.out' })
        .from('.hero-sub', { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.7')
        // CTA бутоните анимираме само по y (без opacity), за да не остават
        // невидими, ако анимацията се прекъсне при re-render (StrictMode/HMR).
        .from('.hero-cta', { y: 20, duration: 0.7, stagger: 0.1, ease: 'power3.out', clearProps: 'transform' }, '-=0.6')
        .from('.face-inner', { opacity: 0, scale: 0.94, duration: 1.1, ease: 'power3.out' }, '-=0.9')

      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const st = { trigger: el, start: 'top top', end: 'bottom top', scrub: 1 }
        gsap.to(titleRef.current, { y: -80, ease: 'none', scrollTrigger: st })
        gsap.to('.face-inner', { y: 50, ease: 'none', scrollTrigger: st })
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative bg-white pt-28 lg:pt-36 pb-16 lg:pb-24 overflow-hidden min-h-[92vh] supports-[height:100svh]:min-h-[92svh] flex items-center">
      <div className="absolute top-[15%] right-[-8%] w-[320px] h-[320px] lg:w-[520px] lg:h-[520px] rounded-full bg-[#DC2626]/[0.04] blur-3xl pointer-events-none" />

      {/* Интерактивното лого — очите следват мишката */}
      <div className="hidden md:block absolute right-[1%] lg:right-[3%] top-[58%] -translate-y-1/2 w-[clamp(220px,26vw,440px)] z-[5]">
        <div className="face-inner">
          <LogoFace />
        </div>
      </div>

      <div className="section-padding w-full relative z-10">
        <div className="container-max">
          {/* Скарсити значка — ограничен брой места този месец (води към формата) */}
          <button
            onClick={() => scrollToId('zapitvane')}
            aria-label="Ограничен брой места този месец — заяви запитване"
            className="hero-badge group inline-flex items-center gap-3 bg-[#1A1A1A] text-white rounded-full pl-1.5 pr-2 py-1.5 mb-8 lg:mb-10 shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626]"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#DC2626] shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
              </svg>
            </span>
            <span className="flex flex-col items-start leading-tight pr-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">Този месец</span>
              <span className="text-sm lg:text-[15px] font-bold text-white whitespace-nowrap inline-flex items-center gap-2">
                Ограничен брой места
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-[#DC2626] text-white text-sm font-extrabold leading-none">5</span>
              </span>
            </span>
            <span className="flex items-center justify-center w-8 h-8 rounded-full border border-white/15 text-white/70 shrink-0 group-hover:border-white/40 group-hover:translate-x-0.5 transition-all duration-300">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          <h1 ref={titleRef} className="font-thin-display text-[clamp(36px,6.5vw,96px)] text-[#1A1A1A] leading-[1.02] lg:max-w-[66%]">
            <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]"><span className="hero-line block">Дигитален</span></span>{' '}
            <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]"><span className="hero-line block">маркетинг и</span></span>{' '}
            <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]"><span className="hero-line block text-[#DC2626]">бизнес развитие</span></span>
          </h1>

          <p className="hero-sub mt-8 text-base lg:text-lg font-light text-[#1A1A1A]/60 max-w-md leading-relaxed">
            Ние сме агенцията, изградена върху най-голямата инфлуенсър платформа в България. Работим с данни в реално време и native подход, а резултатите се броят.
          </p>

          <PromoCountdown className="mt-8" />

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4 mt-10">
            <button
              onClick={() => scrollToId('zapitvane')}
              className="hero-cta inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-[#DC2626] text-white px-8 py-4 rounded-full text-sm uppercase tracking-[0.12em] font-medium hover:bg-[#B91C1C] hover:scale-[1.03] active:scale-95 transition-all duration-300"
            >
              Заяви запитване
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => scrollToId('cena')}
              className="hero-cta inline-flex items-center justify-center gap-2 w-full sm:w-auto border-2 border-[#DC2626] text-[#DC2626] px-8 py-4 rounded-full text-sm uppercase tracking-[0.12em] font-medium hover:bg-[#DC2626] hover:text-white hover:scale-[1.03] active:scale-95 transition-all duration-300"
            >
              Виж офертата
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Мобилно: Pablo се оглежда сам и мига — центриран и по-голям
              (desktop версията е вдясно, абсолютно позиционирана) */}
          <div className="md:hidden mt-12 flex justify-center">
            <div className="face-inner w-[min(78vw,320px)]">
              <LogoFace />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
