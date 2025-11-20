import React, { useState } from 'react';
import { Navigation } from './modern/Navigation';
import { HeroSection } from './modern/HeroSection';
import { FeatureCards } from './modern/FeatureCards';
import { StorySection } from './modern/StorySection';
import { ProductPreview } from './modern/ProductPreview';
import { SecuritySection } from './modern/SecuritySection';
import { PricingSection } from './modern/PricingSection';
import { FinalCTA } from './modern/FinalCTA';
import { Footer } from './modern/Footer';
import { AuthModal } from './modern/AuthModal';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleGetStarted = () => {
    onGetStarted();
  };

  const handleAuthModalOpen = () => {
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navigation onGetStarted={handleAuthModalOpen} />

      <HeroSection onGetStarted={handleGetStarted} />

      <div id="features">
        <FeatureCards />
      </div>

      <StorySection />

      <div id="product">
        <ProductPreview />
      </div>

      <div id="security">
        <SecuritySection />
      </div>

      <div id="pricing">
        <PricingSection />
      </div>

      <FinalCTA onGetStarted={handleAuthModalOpen} />

      <Footer />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};