import { Button } from "@/components/ui/button";
import { Check, Zap, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "For digital health teams exploring",
    credits: "10 daily credits",
    creditsDetail: "30 credits / month max",
    features: [
      "10 credits per day",
      "30 monthly credit cap",
      "All health file formats",
      "Basic clinical data extraction",
      "CSV & JSON export",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Clinical",
    price: "$49",
    period: "mo",
    description: "For CROs & digital health startups",
    credits: "300 credits / month",
    creditsDetail: "10 daily credits + monthly pool",
    tiers: [
      { credits: 300, price: 49 },
      { credits: 800, price: 99 },
      { credits: 2000, price: 199 },
    ],
    features: [
      "300–2,000 monthly credits",
      "10 daily bonus credits",
      "All health data formats (HL7, FHIR, DICOM)",
      "Advanced AI clinical reports",
      "ICD/CPT auto-coding",
      "API access",
      "HIPAA compliance tools",
      "Priority support",
    ],
    cta: "Go Clinical",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For hospitals, pharma & health systems",
    credits: "Unlimited credits",
    creditsDetail: "Org-wide credit management",
    features: [
      "Unlimited processing volume",
      "Dedicated infrastructure",
      "Custom de-identification pipelines",
      "White-label clinical reports",
      "EHR/LIMS integration support",
      "SSO & SAML",
      "BAA (Business Associate Agreement)",
      "Dedicated CSM & SLA guarantee",
    ],
    cta: "Talk to Sales",
    highlighted: false,
  },
];

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <section className="py-28 bg-background" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">Pricing</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-4 tracking-tight text-foreground">
            Plans built for health data scale
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm">
            Every extraction costs credits based on document complexity. Simple lab reports cost less than multi-page clinical trials. Scale as you grow.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center items-center gap-3 mb-14">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${billingCycle === "monthly" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${billingCycle === "annual" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Annual <span className="text-primary text-xs ml-1">Save 20%</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {tiers.map((tier, i) => {
            const displayPrice = tier.name === "Enterprise"
              ? "Custom"
              : tier.name === "Starter"
                ? "$0"
                : billingCycle === "annual"
                  ? `$${Math.round(parseInt(tier.price.replace("$", "")) * 0.8)}`
                  : tier.price;

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className={`relative rounded-2xl p-8 border ${
                  tier.highlighted
                    ? "border-primary/40 bg-primary/[0.04] shadow-glow-strong"
                    : "border-border bg-card"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold font-mono uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                <div className="mt-6 mb-2">
                  <span className="text-5xl font-extrabold text-foreground">{displayPrice}</span>
                  {tier.period && <span className="text-muted-foreground ml-1 text-sm">/{tier.period}</span>}
                </div>
                <div className="flex items-center gap-1.5 mb-6">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-mono text-primary font-bold">{tier.credits}</span>
                </div>

                {tier.tiers && (
                  <div className="mb-6 rounded-lg bg-muted/50 border border-border p-3">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                      <Info className="w-3 h-3" /> Credit tiers
                    </p>
                    <div className="space-y-1.5">
                      {tier.tiers.map((t) => (
                        <div key={t.credits} className="flex justify-between text-xs">
                          <span className="text-foreground/70">{t.credits} credits</span>
                          <span className="text-muted-foreground font-mono">
                            ${billingCycle === "annual" ? Math.round(t.price * 0.8) : t.price}/mo
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  asChild
                  className={`w-full rounded-xl h-12 font-bold ${
                    tier.highlighted
                      ? "bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                      : "bg-muted text-foreground hover:bg-muted/80 border-0"
                  }`}
                  variant={tier.highlighted ? "default" : "outline"}
                >
                  <Link to={tier.name === "Enterprise" ? "/consulting" : "/register"}>{tier.cta}</Link>
                </Button>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground/60 text-xs font-mono">
            All plans include HIPAA-ready infrastructure. Enterprise plans include a signed BAA. Credits roll over for active subscribers.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
