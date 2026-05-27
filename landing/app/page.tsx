import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import FounderStory from '@/components/FounderStory'
import BetaFeedback from '@/components/BetaFeedback'
import ProductPillars from '@/components/ProductPillars'
import AccuracyPhilosophy from '@/components/AccuracyPhilosophy'
import Trust from '@/components/Trust'
import FinalCTA from '@/components/FinalCTA'
import Pricing from '@/components/Pricing'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />              {/* navy */}
        <HowItWorks />        {/* white */}
        <FounderStory />      {/* teal #0D7377 */}
        <BetaFeedback />      {/* #F8FAFC */}
        <ProductPillars />    {/* navy */}
        <AccuracyPhilosophy />{/* teal #0D7377 */}
        <Trust />             {/* white */}
        <FinalCTA />          {/* navy */}
        <Pricing />           {/* white */}
        <FAQ />               {/* #F8FAFC */}
      </main>
      <Footer />              {/* navy */}
    </>
  )
}
