import { useEffect, lazy, Suspense } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import LandingNav from './components/LandingNav'
import LandingHero from './sections/LandingHero'
import StatsBand from './components/StatsBand'
import Pillars from './sections/Pillars'
import PriceSpotlight from './sections/PriceSpotlight'
import Marquee from './sections/Marquee'
import Faq from './sections/Faq'
import LandingFooter from './sections/LandingFooter'
import CookieConsent from './components/CookieConsent'
import StickyPromo from './components/StickyPromo'
import CityLocal from './sections/CityLocal'
import type { City } from './lib/cities'

// Формата е тежка (валидация, reCAPTCHA, auto-save) и е под сгъвката —
// разделяме я в отделен chunk, за да олекне началният JS и hero-то да
// рисува по-рано. Preload-ва се на idle, за да е готова при скрол.
const ScrollWizard = lazy(() => import('./components/ScrollWizard'))

gsap.registerPlugin(ScrollTrigger)

type LenisLike = { scrollTo: (target: number | HTMLElement, opts?: { offset?: number }) => void }

/** `city` е зададен само на локалните страници (/varna, /sofia, ...) —
    на началната страница остава undefined и нищо не се променя. */
export default function App({ city }: { city?: City } = {}) {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true })
    ;(window as unknown as { __lenis?: LenisLike }).__lenis = lenis

    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      ;(window as unknown as { __lenis?: LenisLike }).__lenis = undefined
    }
  }, [])

  // Претегляме формата на idle — готова е при скрол, без да тежи на старта.
  useEffect(() => {
    const preload = () => { import('./components/ScrollWizard') }
    type IdleWin = Window & { requestIdleCallback?: (cb: () => void) => number }
    const w = window as IdleWin
    if (w.requestIdleCallback) w.requestIdleCallback(preload)
    else setTimeout(preload, 1500)
  }, [])

  return (
    <>
      <div id="top" />
      <LandingNav />
      <main id="main-content">
        <LandingHero city={city} />
        <StatsBand />
        {city && <CityLocal city={city} />}
        <Pillars />
        <PriceSpotlight />
        <Marquee />
        {!city && <Faq />}
        <section id="zapitvane">
          <Suspense fallback={<div className="min-h-[80vh]" aria-hidden="true" />}>
            <ScrollWizard />
          </Suspense>
        </section>
      </main>
      <LandingFooter />
      <StickyPromo />
      <CookieConsent />
    </>
  )
}
