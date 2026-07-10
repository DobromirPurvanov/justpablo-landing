import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LogoFace from '../components/LogoFace'
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
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', clearProps: 'transform' }, '-=0.6')
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
      <div className="hidden md:block absolute right-[3%] lg:right-[5%] top-[56%] -translate-y-1/2 w-[clamp(280px,34vw,540px)] z-[5]">
        <div className="face-inner">
          <LogoFace />
        </div>
      </div>

      <div className="section-padding w-full relative z-10">
        <div className="container-max">
          <h1 ref={titleRef} className="font-thin-display text-[clamp(44px,7.5vw,110px)] text-[#1A1A1A] leading-[1.02]">
            <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]"><span className="hero-line block">Дигитален</span></span>
            <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]"><span className="hero-line block">маркетинг и</span></span>
            <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]"><span className="hero-line block text-[#DC2626]">бизнес развитие</span></span>
          </h1>

          <p className="hero-sub mt-8 text-base lg:text-lg font-light text-[#1A1A1A]/60 max-w-md leading-relaxed">
            Агенцията, изградена върху най-голямата инфлуенсър платформа в България. Данни в реално време, native подход и резултати, които се броят.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-10">
            <button
              onClick={() => scrollToId('zapitvane')}
              className="hero-cta inline-flex items-center gap-2 bg-[#DC2626] text-white px-8 py-4 rounded-full text-sm uppercase tracking-[0.12em] font-medium hover:bg-[#B91C1C] hover:scale-[1.03] active:scale-95 transition-all duration-300"
            >
              Заяви запитване
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => scrollToId('cena')}
              className="hero-cta inline-flex items-center gap-2 text-sm uppercase tracking-[0.12em] font-medium text-[#1A1A1A]/70 hover:text-[#DC2626] px-2 py-4 transition-colors duration-300"
            >
              Виж цената
            </button>
          </div>

          {/* Мобилно: Pablo се оглежда сам и мига (desktop версията е вдясно, абсолютно позиционирана) */}
          <div className="md:hidden mt-12 flex justify-end pr-1">
            <div className="face-inner w-[min(54vw,240px)]">
              <LogoFace />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
