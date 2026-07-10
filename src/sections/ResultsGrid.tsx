import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { countUp, maskReveal, reveal } from '../lib/motion'

const clientResults = [
  { domain: 'alphamotors.bg', text: 'Устойчива SEO стратегия за лидер в авточастите — органичният трафик нагоре с над 400%.', result: '+420%' },
  { domain: 'astrafolio.com', text: 'От стартиращ проект до разпознаваем инвестиционен бранд за под 2 години.', result: '+315%' },
  { domain: 'arcanumgroup.bg', text: 'Комплексна стратегия, която утрои онлайн присъствието в нишата.', result: 'x3' },
  { domain: 'dinkovi.com', text: 'Семейната строителна фирма стана дигитален лидер в региона.', result: '+580%' },
  { domain: 'cc78.bg', text: 'Доминиращи позиции в e-commerce нишата — дума по дума.', result: '100%' },
]

export default function ResultsGrid() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      maskReveal(el.querySelector('.rg-h2'), el, { delay: 0.05 })
      reveal(el.querySelectorAll('.rg-card'), el, { y: 30, stagger: 0.08, delay: 0.2 })
      el.querySelectorAll('.rg-num').forEach((n, i) => countUp(n, { trigger: el, delay: 0.35 + i * 0.08 }))
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="rezultati" className="bg-[#F5F5F5] py-16 lg:py-24">
      <div className="section-padding">
        <div className="container-max">
          <span className="text-[10px] uppercase tracking-[0.2em] font-light text-[#DC2626] block mb-4">Резултати</span>
          <h2 className="rg-h2 font-thin-display text-3xl lg:text-5xl text-[#1A1A1A] leading-tight mb-12 max-w-2xl">
            Числата зад думите
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
            {clientResults.map(c => (
              <div key={c.domain} className="rg-card border-t border-[#1A1A1A]/10 pt-5">
                <div className="rg-num text-[clamp(34px,4.5vw,60px)] font-extralight text-[#DC2626] leading-none mb-3">
                  {c.result}
                </div>
                <div className="text-xs font-semibold text-[#1A1A1A] mb-2">{c.domain}</div>
                <p className="text-xs font-light text-[#1A1A1A]/60 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
