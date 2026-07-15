import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { maskReveal, reveal } from '../lib/motion'
import { bgn } from '../lib/currency'
import { scrollToId } from '../lib/scroll'

const included = [
  'Пълен одит в 12 модула: сайт, SEO, реклами, социални мрежи и аналитика',
  'PDF доклад с конкретните проблеми, приоритети и бързи печалби за първите 30 дни',
  'Реалистична прогноза и готова основа за стратегията ви',
]

export default function PriceSpotlight() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      maskReveal(el.querySelector('.ps-h2'), el, { delay: 0.05 })
      reveal(el.querySelectorAll('.ps-item'), el, { y: 24, stagger: 0.1, delay: 0.2 })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="cena" className="bg-[#F5F5F5] py-20 lg:py-28">
      <div className="section-padding">
        <div className="container-max text-center max-w-3xl mx-auto">
          <img
            src="./images/mustache.png"
            alt=""
            width={324}
            height={95}
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            draggable={false}
            className="ps-item mx-auto w-14 h-auto mb-5 select-none"
          />
          <span className="eyebrow-center mb-5">Прозрачно ценообразуване</span>
          <h2 className="ps-h2 font-thin-display text-3xl lg:text-5xl text-[#1A1A1A] leading-tight mb-5">
            Premium Digital Analysis
          </h2>

          <p className="ps-item text-base lg:text-lg font-light text-[#1A1A1A]/70 max-w-xl mx-auto leading-relaxed mb-8">
            Всяко наше партньорство започва с този анализ. Влизаме дълбоко в бизнеса ви, а вие виждате как мислим и работим. Оттам решаваме заедно накъде да продължим, вече на база реални данни за вашия пазар и аудитория.
          </p>

          {/* Промоционална цена */}
          <div className="ps-item mb-3 flex items-center justify-center gap-3 flex-wrap">
            <span className="text-[clamp(24px,3vw,40px)] font-light text-[#1A1A1A]/40 line-through decoration-[#DC2626]/40">
              970 €
            </span>
            <span className="inline-block bg-[#DC2626] text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Промоция −50%
            </span>
          </div>

          <div className="ps-item mb-2">
            <span className="text-[clamp(56px,8vw,110px)] font-extralight text-[#DC2626] leading-none tracking-tight">485 €</span>
          </div>
          <div className="ps-item text-base font-light text-[#1A1A1A]/60 mb-4">{bgn(485)}</div>

          <div className="ps-item flex justify-center mb-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#DC2626]/10 text-[#DC2626] px-4 py-2 text-sm font-bold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
              </svg>
              Не изпускайте офертата · важи само този месец
            </span>
          </div>

          <div className="ps-item text-xs uppercase tracking-[0.18em] font-medium text-[#1A1A1A]/60 mb-10">
            еднократно · промоционална цена · първата стъпка към партньорство
          </div>

          <div className="ps-item flex flex-col gap-3 max-w-xl mx-auto text-left mb-10">
            {included.map(item => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#DC2626] flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                <span className="text-sm lg:text-base font-light text-[#1A1A1A]/80 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollToId('zapitvane')}
            className="ps-item inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-[#DC2626] text-white px-8 py-4 rounded-full text-sm uppercase tracking-[0.12em] font-medium hover:bg-[#B91C1C] hover:scale-[1.03] active:scale-95 transition-all duration-300"
          >
            Заяви анализ
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
