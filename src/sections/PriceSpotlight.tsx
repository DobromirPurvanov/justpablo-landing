import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ArrowDown, Check, Crown, Shield, Sparkles, Zap } from 'lucide-react'
import { maskReveal, reveal } from '../lib/motion'
import { bgn } from '../lib/currency'
import { scrollToId } from '../lib/scroll'
import { SinglePricingCard } from '../components/ui/single-pricing-card'

const features = [
  'Пълен одит в 12 модула: сайт, SEO, реклами, социални мрежи и аналитика',
  'PDF доклад с конкретните проблеми, приоритети и бързи печалби за първите 30 дни',
  'Реалистична прогноза и готова основа за стратегията ви',
].map(text => ({ text }))

const benefits = [
  { icon: Check, text: 'Еднократно плащане, без абонамент' },
  { icon: Zap, text: 'Промоцията важи само този месец' },
  { icon: Shield, text: 'Без обвързване с последващ договор' },
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
    <section ref={ref} id="cena" className="bg-white/55 py-20 lg:py-28">
      <div className="section-padding">
        <div className="container-max">
          {/* Заглавна част — остава в езика на сайта (тънък дисплей шрифт + eyebrow) */}
          <div className="text-center max-w-3xl mx-auto">
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
            <p className="ps-item text-base lg:text-lg font-light text-[#1A1A1A]/70 max-w-xl mx-auto leading-relaxed">
              Всяко наше партньорство започва с този анализ. Влизаме дълбоко в бизнеса ви, а вие виждате как мислим и работим. Оттам решаваме заедно накъде да продължим, вече на база реални данни за вашия пазар и аудитория.
            </p>
          </div>

          <SinglePricingCard
            maxWidth="max-w-4xl"
            cardClassName="bg-white/90 backdrop-blur-sm shadow-[0_16px_50px_rgba(0,0,0,0.06)]"
            badge={{ icon: Crown, text: 'Стартовият пакет' }}
            title="Дигитален одит в 12 модула"
            subtitle="Еднократен ангажимент, който показва къде точно изтичат парите и вниманието."
            price={{
              current: '485 €',
              original: '970 €',
              discount: 'Промоция −50%',
              discountBadgeClassName: 'border-primary/30 text-primary bg-primary/5',
              note: bgn(485),
            }}
            benefits={benefits}
            features={features}
            featuresIcon={Check}
            featuresTitle="Какво включва"
            featuresBadge={{ icon: Sparkles, text: '12 модула' }}
            primaryButton={{
              text: 'Заяви анализ',
              icon: ArrowDown,
              onClick: () => scrollToId('zapitvane'),
              // Изравняване с останалите бутони на сайта: хапче, главни букви,
              // същият hover и същото червено при задържане.
              className:
                'rounded-full uppercase tracking-[0.12em] bg-[#DC2626] hover:bg-[#B91C1C] hover:scale-[1.02] active:scale-95 transition-all duration-300',
            }}
            /* Реални клиентски отзиви още няма — блокът се крие сам, докато
               масивът е празен. Като дойдат, се подават тук и се появява. */
            testimonials={[]}
          />

          <p className="ps-item text-center text-xs uppercase tracking-[0.18em] font-medium text-[#1A1A1A]/70">
            еднократно · промоционална цена · първата стъпка към партньорство
          </p>
        </div>
      </div>
    </section>
  )
}
