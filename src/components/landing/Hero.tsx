import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const rotatingWords = ["Extracted.", "Structured.", "Decoded.", "Actionable."];

const Hero = () => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30 dark:opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/70" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/6 blur-[180px] animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/4 blur-[150px] animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="container relative z-10 mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl flex-1"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary font-mono uppercase tracking-wider">Private Beta · Invite Only</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] mb-8 text-foreground">
              Health Data.
              <br />
              <span className="relative inline-block h-[1.1em] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-gradient inline-block"
                  >
                    {rotatingWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <p className="text-lg md:text-xl max-w-xl mb-12 leading-relaxed text-muted-foreground">
              AI-powered intelligence for clinical data teams. Extract structured insights from EHRs, lab reports, clinical trials, and medical records — in seconds, not weeks.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground px-8 h-14 text-base font-bold shadow-glow-strong hover:opacity-90 transition-all rounded-xl group">
                <Link to="/register">
                  Request Early Access
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 text-base font-medium rounded-xl border-border text-muted-foreground hover:bg-muted hover:text-foreground gap-2">
                <a href="#how-it-works">
                  <Play className="w-4 h-4 fill-current" />
                  See how it works
                </a>
              </Button>
            </div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-12 flex items-center gap-6 text-[11px] font-mono uppercase tracking-wider text-muted-foreground/40"
            >
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> HIPAA Ready</span>
              <span className="w-px h-3 bg-border" />
              <span>🔒 SOC 2</span>
              <span className="w-px h-3 bg-border" />
              <span>⚡ 99.9% Uptime</span>
              <span className="w-px h-3 bg-border" />
              <span>🌍 GDPR Ready</span>
            </motion.div>
          </motion.div>

          {/* Right side — health demo card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block flex-1 max-w-md w-full"
          >
            <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-glow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-primary/40" />
                <div className="w-3 h-3 rounded-full bg-primary/60" />
                <span className="ml-auto text-[10px] font-mono text-muted-foreground/50">dataafro.app</span>
              </div>
              <div className="border border-dashed border-border rounded-xl p-8 text-center mb-4 hover:border-primary/30 transition-colors">
                <div className="text-3xl mb-2">🏥</div>
                <p className="text-xs text-muted-foreground font-mono">Drop your clinical data here</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">EHR · Lab Reports · DICOM · HL7</p>
              </div>
              <div className="space-y-2">
                <div className="h-2 rounded-full bg-primary/20 w-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1.2, duration: 2, ease: "easeInOut" }}
                    className="h-full bg-gradient-primary rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground/50">
                  <span>Extracting patient data...</span>
                  <span>clinical_trial.pdf</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trusted by logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="mt-20 flex flex-col items-center gap-5"
        >
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30">Trusted by teams at</p>
          <div className="flex items-center gap-8 md:gap-12 flex-wrap justify-center">
            {["Mayo Clinic", "Roche", "Medtronic", "IQVIA", "Tempus AI"].map((name) => (
              <span
                key={name}
                className="text-sm md:text-base font-semibold tracking-wide text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors duration-300 select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border-2 border-border flex items-start justify-center p-1"
        >
          <div className="w-1 h-2 rounded-full bg-primary/60" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
