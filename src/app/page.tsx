import { MatchingHero } from "@/components/features/MatchingHero";
import { HowItWorks } from "@/components/features/HowItWorks";
import { InsightsShowcase } from "@/components/features/InsightsShowcase";
import { Pricing } from "@/components/features/Pricing";
import { Footer } from "@/components/features/Footer";

export default function HomePage() {
  return (
    <>
      <MatchingHero />
      <HowItWorks />
      <InsightsShowcase />
      <Pricing />
      <Footer />
    </>
  );
}
