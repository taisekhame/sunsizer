import { LandingNavbar } from "@/components/landing/navbar";
import { MobileNavbar } from "@/components/landing/mobile-navbar";
import { Hero } from "@/components/landing/hero";
import { Features, HowItWorks, FAQ, FinalCTA, Footer } from "@/components/landing/sections";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <LandingNavbar />
      <MobileNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
