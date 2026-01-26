import { HeroSection } from '@/components/marketing/HeroSection';
import { FeatureSection, HowItWorksSection, CTASection } from '@/components/marketing/FeatureSection';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { Footer } from '@/components/marketing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <HeroSection />
        <FeatureSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
