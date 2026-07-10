import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { countUp, reveal } from '../lib/motion'

export type Stat = { value: string; label: string }

const defaultStats: Stat[] = [
  { value: '614 000+', label: 'души обща аудитория' },
  { value: '20.6M', label: 'импресии на седмица' },
  { value: '31%', label: 'от всички 18–24 г. в България' },
  { value: '2013', label: 'годината, в която започнахме' },
]

/** Лента с броящи числа — доверието в цифри (данните от платформата Just Pablo) */
export default function StatsBand({ stats = defaultStats }: { stats?: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      reveal(el.querySelectorAll('.sb-item'), el, { y: 24, stagger: 0.1 })
      el.querySelectorAll('.sb-num').forEach((n, i) => countUp(n, { trigger: el, delay: 0.2 + i * 0.1, duration: 1.4 }))
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="bg-white border-y border-[#1A1A1A]/[0.06]">
      <div className="section-padding py-12 lg:py-16">
        <div className="container-max">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {stats.map(s => (
              <div key={s.label} className="sb-item">
                <div className="sb-num text-[clamp(30px,3.6vw,56px)] font-extralight text-[#DC2626] leading-none tracking-tight whitespace-nowrap">
                  {s.value}
                </div>
                <div className="text-xs lg:text-sm font-light text-[#1A1A1A]/60 mt-2 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
