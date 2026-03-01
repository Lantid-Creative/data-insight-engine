import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-hero">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(222,47%,6%,0.7)] to-[hsl(222,47%,6%)]" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="container relative z-10 mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Data Intelligence</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary-foreground leading-[1.1] mb-6">
            Transform Raw Data Into{" "}
            <span className="text-gradient">Actionable Insights</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Upload any data — CSV, PDF, Excel, or raw text — and let DataForge AI
            analyze, summarize, and generate professionally formatted reports in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground px-8 h-13 text-base font-semibold shadow-glow hover:opacity-90 transition-opacity">
              <Link to="/register">
                Start Free <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary/30 text-primary-foreground bg-transparent hover:bg-primary/10 h-13 text-base">
              <Link to="/dashboard">
                View Demo
              </Link>
            </Button>
          </div>

          <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
            <span>✓ No credit card required</span>
            <span>✓ 3 free analyses/month</span>
            <span>✓ Export in 8+ formats</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
