import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { reveal } from '../lib/motion'

const rowOne = ['Комуникационна стратегия', 'SEO оптимизация', 'GEO (видимост в AI търсачки)', 'Google Ads', 'Meta Ads', 'Инфлуенсър маркетинг', 'Брандинг', 'Криейтив и UGC']
const rowTwo = ['TikTok и Reels', 'Performance Max', 'CRO (оптимизация на конверсии)', 'Email автоматизации', 'AI съдържание', 'Маркетинг автоматизация', 'Ремаркетинг', 'Business Intelligence']

function MarqueeRow({ items, direction, outline }: { items: string[]; direction: 'left' | 'right'; outline?: boolean }) {
  const content = (hidden: boolean) => (
    <div className="flex items-center shrink-0" aria-hidden={hidden || undefined}>
      {items.map(item => (
        <span key={item} className="flex items-center shrink-0">
          <span className={`whitespace-nowrap text-[clamp(28px,5vw,60px)] font-extralight leading-[1.18] tracking-tight ${outline ? 'text-outline-red' : 'text-[#1A1A1A]'}`}>
            {item}
          </span>
          <img
            src="./images/mustache-red.png"
            alt=""
            width={324}
            height={95}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="mx-6 lg:mx-10 w-9 lg:w-12 h-auto shrink-0 select-none"
          />
        </span>
      ))}
    </div>
  )
  return (
    <div className="marquee-fade overflow-hidden w-full">
      <div className={`flex w-max ${direction === 'left' ? 'marquee-track-left' : 'marquee-track-right'}`}>
        {content(false)}
        {content(true)}
      </div>
    </div>
  )
}

export default function Marquee() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => { reveal(el, el, { y: 30 }) }, el)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={ref} className="marquee-group bg-white py-16 lg:py-24 overflow-hidden">
      <div className="section-padding mb-10">
        <div className="container-max">
          <h2 className="eyebrow">Пълна гама дигитални услуги</h2>
        </div>
      </div>
      <div className="flex flex-col gap-6 lg:gap-8">
        <MarqueeRow items={rowOne} direction="left" />
        <MarqueeRow items={rowTwo} direction="right" outline />
      </div>
    </section>
  )
}
