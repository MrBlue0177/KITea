import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { PopularModules } from "@/components/popular-modules"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <PopularModules />
      </main>
      <Footer />
    </div>
  )
}
