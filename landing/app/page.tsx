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
        <Simplicity />          {/* #F7F8FA */}
        <FounderStory />        {/* #F8FAFC */}
        <HowItWorks />          {/* #F7F8FA */}
        <ProductPillars />      {/* navy */}
        <AccuracyPhilosophy />  {/* white */}
        <Trust />               {/* #F8FAFC */}
        <FinalCTA />            {/* navy */}
        <Pricing />             {/* white */}
        <FAQ />                 {/* #F8FAFC */}
      </main>
      <Footer />                {/* navy */}
    </>
  )
}
