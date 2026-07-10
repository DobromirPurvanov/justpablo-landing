import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { maskReveal, reveal } from '../lib/motion'
import { bgn } from '../lib/currency'
import { scrollToId } from '../lib/scroll'

const included = [
  '12 модула — пълен одит на сайт, SEO, реклами, социални мрежи и данни',
  'PDF доклад с конкретни проблеми, приоритети и quick wins за 30 дни',
  'Реалистична прогноза и готова основа за стратегията',
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
    <section ref={ref} id="cena" className="bg-[#F5F5F5] py-16 lg:py-24">
      <div className="section-padding">
        <div className="container-max text-center max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.2em] font-light text-[#DC2626] block mb-4">Прозрачно ценообразуване</span>
          <h2 className="ps-h2 font-thin-display text-3xl lg:text-5xl text-[#1A1A1A] leading-tight mb-8">
            Premium Digital Analysis
          </h2>

          <div className="ps-item mb-2">
            <span className="text-[clamp(56px,8vw,110px)] font-extralight text-[#DC2626] leading-none tracking-tight">485 €</span>
          </div>
          <div className="ps-item text-base font-light text-[#1A1A1A]/50 mb-2">{bgn(485)}</div>
          <div className="ps-item text-xs uppercase tracking-[0.18em] font-medium text-[#1A1A1A]/50 mb-10">
            еднократно · единствената ни публична цена · задължителен първи етап
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
            className="ps-item inline-flex items-center gap-2 bg-[#DC2626] text-white px-8 py-4 rounded-full text-sm uppercase tracking-[0.12em] font-medium hover:bg-[#B91C1C] hover:scale-[1.03] transition-all duration-300"
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
