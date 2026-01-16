import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Industries from "@/components/landing/Industries";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import PricingPreview from "@/components/landing/PricingPreview";
import CompetitorComparison from "@/components/landing/CompetitorComparison";
import Languages from "@/components/landing/Languages";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <Industries />
      <HowItWorks />
      <Testimonials />
      <PricingPreview />
      <CompetitorComparison />
      <Languages />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;
