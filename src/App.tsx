import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import LandingNav from './components/LandingNav'
import LandingHero from './sections/LandingHero'
import StatsBand from './components/StatsBand'
import Pillars from './sections/Pillars'
import PriceSpotlight from './sections/PriceSpotlight'
import Marquee from './sections/Marquee'
import ScrollWizard from './components/ScrollWizard'
import LandingFooter from './sections/LandingFooter'
import CookieConsent from './components/CookieConsent'

gsap.registerPlugin(ScrollTrigger)

type LenisLike = { scrollTo: (target: number | HTMLElement, opts?: { offset?: number }) => void }

export default function App() {
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

  return (
    <>
      <div id="top" />
      <LandingNav />
      <main>
        <LandingHero />
        <StatsBand />
        <Pillars />
        <PriceSpotlight />
        <Marquee />
        <section id="zapitvane">
          <ScrollWizard />
        </section>
      </main>
      <LandingFooter />
      <CookieConsent />
    </>
  )
}
