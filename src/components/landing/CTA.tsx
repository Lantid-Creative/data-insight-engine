import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section className="py-28 section-dark relative overflow-hidden">
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-primary/8 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-primary/5 blur-[120px] rounded-full" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-8"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 text-white">
            Ready to forge<br />
            <span className="text-gradient">your data?</span>
          </h2>

          <p className="text-lg mb-10 max-w-xl mx-auto text-white/50">
            Join thousands of analysts, founders, and researchers who've already made the switch. Start free — no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground px-10 h-14 text-base font-bold shadow-glow-strong hover:opacity-90 transition-all rounded-xl">
              <Link to="/register">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 text-base font-medium rounded-xl text-white/70 border-white/15 hover:bg-white/5 hover:text-white">
              <Link to="/dashboard">
                View Demo
              </Link>
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-mono uppercase tracking-wider text-white/30"
          >
            <span>🔒 SOC 2 Compliant</span>
            <span className="hidden sm:inline">•</span>
            <span>⚡ 99.9% Uptime</span>
            <span className="hidden sm:inline">•</span>
            <span>🌍 GDPR Ready</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
