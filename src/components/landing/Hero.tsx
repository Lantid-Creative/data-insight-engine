import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-hero">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(0,0%,2%)] via-transparent to-[hsl(0,0%,2%,0.6)]" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-primary/8 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-[150px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="container relative z-10 mx-auto px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary font-mono uppercase tracking-wider">Now in Beta</span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[0.95] mb-8" style={{ color: "hsl(0 0% 98%)" }}>
            Your Data.
            <br />
            <span className="text-gradient">Forged Bold.</span>
          </h1>

          <p className="text-lg md:text-xl max-w-xl mb-12 leading-relaxed" style={{ color: "hsl(0 0% 60%)" }}>
            Drop any file. Get AI-powered analysis, insights, and professionally formatted reports — in seconds, not hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground px-8 h-14 text-base font-bold shadow-glow-strong hover:opacity-90 transition-all rounded-xl">
              <Link to="/register">
                Start for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 text-base font-medium rounded-xl border-primary/20 hover:bg-primary/5" style={{ color: "hsl(0 0% 80%)", borderColor: "hsl(0 0% 20%)" }}>
              <Link to="/dashboard">
                See it in action
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-20 grid grid-cols-3 gap-6 max-w-lg"
        >
          {[
            { value: "10K+", label: "Files Processed" },
            { value: "8+", label: "Export Formats" },
            { value: "<5s", label: "Avg. Analysis Time" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-black text-gradient">{stat.value}</div>
              <div className="text-xs font-mono uppercase tracking-wider mt-1" style={{ color: "hsl(0 0% 45%)" }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
