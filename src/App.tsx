import LandingNav from './components/LandingNav'
import LandingHero from './sections/LandingHero'
import StatsBand from './components/StatsBand'
import Marquee from './sections/Marquee'
import Pillars from './sections/Pillars'
import PriceSpotlight from './sections/PriceSpotlight'
import WizardSection from './sections/WizardSection'
import LandingFooter from './sections/LandingFooter'
import SmoothScroll from './components/SmoothScroll'
import CustomCursor from './components/CustomCursor'
import MascotPeeker from './components/MascotPeeker'

export default function App() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-white">
        <LandingNav />
        <main>
          <LandingHero />
          <StatsBand />
          <Marquee />
          <Pillars />
          <PriceSpotlight />
          <WizardSection />
        </main>
        <LandingFooter />
      </div>
      <CustomCursor />

      <MascotPeeker triggerId="pillars" imageSrc="./images/mascot-pillars.png" side="left" bottomClassName="bottom-[20%]" />
      <MascotPeeker triggerId="cena" imageSrc="./images/mascot-peeking.png" side="right" bottomClassName="bottom-[15%]" />
    </SmoothScroll>
  )
}
