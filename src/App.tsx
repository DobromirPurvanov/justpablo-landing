import LandingNav from './components/LandingNav'
import LandingHero from './sections/LandingHero'
import StatsBand from './components/StatsBand'
import Marquee from './sections/Marquee'
import Pillars from './sections/Pillars'
import ResultsGrid from './sections/ResultsGrid'
import PriceSpotlight from './sections/PriceSpotlight'
import WizardSection from './sections/WizardSection'
import LandingFooter from './sections/LandingFooter'
import SmoothScroll from './components/SmoothScroll'
import CustomCursor from './components/CustomCursor'

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
          <ResultsGrid />
          <PriceSpotlight />
          <WizardSection />
        </main>
        <LandingFooter />
      </div>
      <CustomCursor />
    </SmoothScroll>
  )
}
