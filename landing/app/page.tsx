import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import ProductPillars from '@/components/ProductPillars'
import Trust from '@/components/Trust'
import Pricing from '@/components/Pricing'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />           {/* navy */}
        <HowItWorks />     {/* white */}
        <ProductPillars /> {/* navy */}
        <Trust />          {/* #F8FAFC */}
        <Pricing />        {/* white */}
        <FAQ />            {/* #F8FAFC */}
      </main>
      <Footer />           {/* navy */}
    </>
  )
}
