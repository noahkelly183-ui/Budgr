import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Problem from '@/components/Problem'
import Simplicity from '@/components/Simplicity'
import FounderStory from '@/components/FounderStory'
import HowItWorks from '@/components/HowItWorks'
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
        <Hero />                {/* navy */}
        <Problem />             {/* white */}
        <Simplicity />          {/* navy */}
        <FounderStory />        {/* teal */}
        <HowItWorks />          {/* white */}
        <ProductPillars />      {/* navy */}
        <AccuracyPhilosophy />  {/* teal */}
        <Trust />               {/* white */}
        <FinalCTA />            {/* navy */}
        <Pricing />             {/* white */}
        <FAQ />                 {/* navy */}
      </main>
      <Footer />                {/* navy */}
    </>
  )
}
