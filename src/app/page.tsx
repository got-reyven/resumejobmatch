import { Header } from "@/components/features/Header";
import { MatchingHero } from "@/components/features/MatchingHero";
import { HowItWorks } from "@/components/features/HowItWorks";
import { Pricing } from "@/components/features/Pricing";
import { Footer } from "@/components/features/Footer";

export default function HomePage() {
  return (
    <>
      <div className="hero-mesh">
        <Header />
        <MatchingHero />
      </div>
      <HowItWorks />
      <Pricing />
      <Footer />
    </>
  );
}
