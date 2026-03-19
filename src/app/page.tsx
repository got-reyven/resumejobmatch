import { MatchingHero } from "@/components/features/MatchingHero";
import { HowItWorks } from "@/components/features/HowItWorks";
import { PainPoints } from "@/components/features/PainPoints";
import { InsightsShowcase } from "@/components/features/InsightsShowcase";
import { Pricing } from "@/components/features/Pricing";
import { FAQ } from "@/components/features/FAQ";
import { Footer } from "@/components/features/Footer";

export default function HomePage() {
  return (
    <>
      <MatchingHero />
      <HowItWorks />
      <PainPoints />
      <InsightsShowcase />
      <Pricing />
      <FAQ />
      <Footer />
    </>
  );
}
