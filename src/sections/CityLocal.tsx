import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { maskReveal, reveal } from '../lib/motion'
import { cities, type City } from '../lib/cities'
import { scrollToId } from '../lib/scroll'

/** Локална секция за city страниците: уникален текст за пазара в града,
    конкретни услуги и FAQ (същите въпроси са и в FAQPage schema в <head>).
    Долу — връзки към останалите градове, за да има вътрешно свързване. */
export default function CityLocal({ city }: { city: City }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      reveal(el.querySelector('.cl-label'), el, { y: 16, duration: 0.6 })
      maskReveal(el.querySelector('.cl-h2'), el, { delay: 0.1 })
      reveal(el.querySelectorAll('.cl-p'), el, { y: 22, stagger: 0.1, delay: 0.2 })
      reveal(el.querySelectorAll('.cl-item'), el, { y: 20, stagger: 0.08, start: 'top 88%' })
    }, el)
    return () => ctx.revert()
  }, [])

  const others = cities.filter(c => c.slug !== city.slug)

  return (
    <section
      ref={ref}
      id="lokalno"
      className="bg-[#FAFAFA] py-20 lg:py-28 border-t border-[#1A1A1A]/[0.06]"
    >
      <div className="section-padding">
        <div className="container-max">
          <span className="cl-label eyebrow mb-5">{city.name}</span>
          <h2 className="cl-h2 font-thin-display text-3xl lg:text-5xl text-[#1A1A1A] leading-tight mb-6 max-w-2xl">
            {city.localTitle}
          </h2>

          <div className="max-w-2xl space-y-5 mb-12">
            {city.localText.map(p => (
              <p key={p.slice(0, 24)} className="cl-p text-base lg:text-lg font-light text-[#1A1A1A]/70 leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 mb-16">
            {city.bullets.map(b => (
              <li
                key={b}
                className="cl-item flex items-start gap-3 bg-white rounded-2xl p-5 border border-[#1A1A1A]/[0.07]"
              >
                <span className="mt-0.5 shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#DC2626]/10">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="3" aria-hidden="true">
                    <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-[15px] font-light text-[#1A1A1A]/75 leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>

          <h2 className="cl-item font-thin-display text-2xl lg:text-4xl text-[#1A1A1A] leading-tight mb-8">
            Често задавани въпроси — {city.name}
          </h2>
          <div className="max-w-3xl divide-y divide-[#1A1A1A]/[0.08] border-t border-[#1A1A1A]/[0.08]">
            {city.faq.map(f => (
              <details key={f.q} className="cl-item group py-5">
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

          <div className="mt-14 flex flex-col sm:flex-row sm:items-center gap-5">
            <button
              onClick={() => scrollToId('zapitvane')}
              className="cl-item inline-flex items-center justify-center gap-2 bg-[#DC2626] text-white px-8 py-4 rounded-full text-sm uppercase tracking-[0.12em] font-medium hover:bg-[#B91C1C] hover:scale-[1.03] active:scale-95 transition-all duration-300"
            >
              Заяви анализ {city.inName}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="cl-item text-sm font-light text-[#1A1A1A]/55">
              Работим и {others.map((c, i) => (
                <span key={c.slug}>
                  <a href={`./${c.slug}`} className="text-[#DC2626] hover:underline">{c.inName}</a>
                  {i < others.length - 2 ? ', ' : i === others.length - 2 ? ' и ' : ''}
                </span>
              ))}
              , както и в цялата страна.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
