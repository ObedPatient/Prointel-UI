import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import MetricsSection from "@/components/landing/MetricsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import IntegrationMapSection from "@/components/landing/IntegrationMapSection";
import CtaSection from "@/components/landing/CtaSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-inter text-[#1a2744]">
      <LandingNav />
      <HeroSection />
      <MetricsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <IntegrationMapSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
