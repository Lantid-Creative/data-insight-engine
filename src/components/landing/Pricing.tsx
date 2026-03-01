import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "For trying things out",
    features: ["3 analyses / month", "2 output files", "CSV & JSON uploads", "Basic insights"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "mo",
    description: "For serious builders",
    features: ["50 analyses / month", "5 outputs per analysis", "All file formats", "Advanced AI reports", "Priority support", "API access"],
    cta: "Go Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams & orgs",
    features: ["Unlimited everything", "White-label exports", "Custom AI prompts", "Dedicated support", "SSO & SAML", "SLA guarantee"],
    cta: "Talk to Us",
    highlighted: false,
  },
];

const Pricing = () => {
  return (
    <section className="py-28 section-dark" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">Pricing</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-4 tracking-tight text-white">
            Pay only for what you use
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className={`relative rounded-2xl p-8 border ${
                tier.highlighted
                  ? "border-primary/40 bg-white/[0.06] shadow-glow-strong"
                  : "border-white/[0.08] bg-white/[0.03]"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold font-mono uppercase tracking-wider">
                  Popular
                </div>
              )}
              <h3 className="text-lg font-bold text-white">{tier.name}</h3>
              <p className="text-sm text-white/50 mt-1">{tier.description}</p>
              <div className="mt-6 mb-6">
                <span className="text-5xl font-extrabold text-white">{tier.price}</span>
                {tier.period && <span className="text-white/50 ml-1 text-sm">/{tier.period}</span>}
              </div>
              <Button
                asChild
                className={`w-full rounded-xl h-12 font-bold ${
                  tier.highlighted
                    ? "bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                    : "bg-white/10 text-white hover:bg-white/15 border-0"
                }`}
                variant={tier.highlighted ? "default" : "outline"}
              >
                <Link to="/register">{tier.cta}</Link>
              </Button>
              <ul className="mt-8 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
