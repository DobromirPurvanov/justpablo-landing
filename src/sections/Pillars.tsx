import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { maskReveal, reveal, wordsReveal } from '../lib/motion'

const pillars = [
  {
    number: '01',
    title: 'Платформата',
    text: 'Мрежа от профилирани страници с отчетлив хумор — най-много последователи и най-диверсифицираните органично изградени аудитории сред инфлуенсър платформите в България, изграждани от 2013 г. насам.',
  },
  {
    number: '02',
    title: 'Native подходът',
    text: 'Брандът влиза естествено в хумористичния поток и ежедневните теми. Сваляме „напрежението" от класическата реклама — затова успеваемостта ни винаги е над гарантираното базисно ниво.',
  },
  {
    number: '03',
    title: 'Данни в реално време',
    text: 'Платформата ни събира и анализира потребителското поведение в реално време. Следим метриките по демографии и адаптираме посланията в движение — знаем кое работи, докато работи.',
  },
]

export default function Pillars() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      reveal(el.querySelector('.pl-label'), el, { y: 16, duration: 0.6 })
      maskReveal(el.querySelector('.pl-h2'), el, { delay: 0.1 })
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        el.querySelectorAll('.w-reveal').forEach(p => wordsReveal(p))
      })
      reveal(el.querySelectorAll('.pl-row'), el, { y: 26, stagger: 0.12, delay: 0.2 })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="bg-white py-20 lg:py-28 border-t border-[#1A1A1A]/[0.06]">
      <div className="section-padding">
        <div className="container-max">
          <span className="pl-label text-[10px] uppercase tracking-[0.2em] font-light text-[#DC2626] block mb-4">Защо Just Pablo</span>
          <h2 className="pl-h2 font-thin-display text-3xl lg:text-5xl text-[#1A1A1A] leading-tight mb-6 max-w-2xl">
            Какво ни прави различни
          </h2>
          <p className="w-reveal text-base lg:text-lg font-light text-[#1A1A1A]/70 leading-relaxed max-w-2xl mb-12">
            Не започваме от нулата с всяка кампания — стъпваме върху платформа с изградено доверие, реални аудитории и данни, които никоя медия шопинг листа не може да даде.
          </p>
          <div className="flex flex-col">
            {pillars.map(p => (
              <div key={p.number} className="pl-row grid grid-cols-[auto_1fr] gap-6 lg:gap-10 py-7 lg:py-9 border-t border-[#1A1A1A]/[0.08]">
                <span className="text-3xl lg:text-4xl font-extralight text-[#DC2626]/30 leading-none">{p.number}</span>
                <div>
                  <h3 className="text-lg lg:text-xl font-semibold text-[#1A1A1A] mb-2">{p.title}</h3>
                  <p className="text-base font-light text-[#1A1A1A]/70 leading-relaxed max-w-3xl">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
