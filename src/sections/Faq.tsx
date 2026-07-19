import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { maskReveal, reveal } from '../lib/motion'
import { scrollToId } from '../lib/scroll'
import { homeFaq } from '../lib/faq'

/** Често задавани въпроси за началната страница. Съдържанието идва от
    src/lib/faq.ts — същите въпроси са и в FAQPage JSON-LD в index.html,
    така че видимият текст и schema-та не се разминават. */
export default function Faq() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      reveal(el.querySelector('.fq-label'), el, { y: 16, duration: 0.6 })
      maskReveal(el.querySelector('.fq-h2'), el, { delay: 0.1 })
      reveal(el.querySelectorAll('.fq-item'), el, { y: 20, stagger: 0.08, start: 'top 88%' })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={ref}
      id="vaprosi"
      className="bg-[#FAFAFA] py-20 lg:py-28 border-t border-[#1A1A1A]/[0.06]"
    >
      <div className="section-padding">
        <div className="container-max">
          <span className="fq-label eyebrow mb-5">Въпроси и отговори</span>
          <h2 className="fq-h2 font-thin-display text-3xl lg:text-5xl text-[#1A1A1A] leading-tight mb-10 max-w-2xl">
            Често задавани въпроси
          </h2>

          <div className="max-w-3xl divide-y divide-[#1A1A1A]/[0.08] border-t border-[#1A1A1A]/[0.08]">
            {homeFaq.map(f => (
              <details key={f.q} className="fq-item group py-5">
                <summary className="flex items-start justify-between gap-6 cursor-pointer list-none text-[17px] lg:text-lg font-semibold text-[#1A1A1A]">
                  {f.q}
                  <span className="mt-1 shrink-0 text-[#DC2626] transition-transform duration-300 group-open:rotate-45">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-base font-light text-[#1A1A1A]/65 leading-relaxed max-w-2xl">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-14">
            <button
              onClick={() => scrollToId('zapitvane')}
              className="fq-item inline-flex items-center justify-center gap-2 bg-[#DC2626] text-white px-8 py-4 rounded-full text-sm uppercase tracking-[0.12em] font-medium hover:bg-[#B91C1C] hover:scale-[1.03] active:scale-95 transition-all duration-300"
            >
              Заяви дигитален анализ
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
