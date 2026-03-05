import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import FileTypes from "@/components/landing/FileTypes";
import IntelligenceSuite from "@/components/landing/IntelligenceSuite";
import UseCases from "@/components/landing/UseCases";
import Consulting from "@/components/landing/Consulting";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <FileTypes />
      <UseCases />
      <Testimonials />
      <Pricing />
      <Consulting />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
