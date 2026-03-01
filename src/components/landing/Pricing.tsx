import { Button } from "@/components/ui/button";
import { Check, Zap, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try it out, no card needed",
    credits: "10 daily credits",
    creditsDetail: "30 credits / month max",
    features: [
      "10 credits per day",
      "30 monthly credit cap",
      "All file formats",
      "Basic AI extraction",
      "CSV & JSON export",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$23",
    period: "mo",
    description: "For professionals & teams",
    credits: "150 credits / month",
    creditsDetail: "5 daily credits + monthly pool",
    tiers: [
      { credits: 150, price: 23 },
      { credits: 400, price: 50 },
      { credits: 1000, price: 100 },
    ],
    features: [
      "150–1,000 monthly credits",
      "5 daily bonus credits",
      "All file formats",
      "Advanced AI reports",
      "API access",
      "Priority support",
      "Credit rollover (1 month)",
    ],
    cta: "Go Pro",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$50",
    period: "mo",
    description: "For orgs that need control",
    credits: "200 credits / month",
    creditsDetail: "Team-wide credit management",
    tiers: [
      { credits: 200, price: 50 },
      { credits: 500, price: 100 },
      { credits: 1500, price: 250 },
    ],
    features: [
      "200–1,500 monthly credits",
      "Per-user credit limits",
      "White-label exports",
      "Custom AI prompts",
      "SSO & SAML",
      "Dedicated support",
      "SLA guarantee",
    ],
    cta: "Talk to Us",
    highlighted: false,
  },
];

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <section className="py-28 section-dark" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">Pricing</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-4 tracking-tight text-white">
            Credits that flex with you
          </h2>
          <p className="text-white/50 mt-4 max-w-xl mx-auto text-sm">
            Every action costs credits based on complexity. Simple tasks may cost less than one credit. Buy more only when you need them.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center items-center gap-3 mb-14">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${billingCycle === "monthly" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${billingCycle === "annual" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}
          >
            Annual <span className="text-primary text-xs ml-1">Save 20%</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {tiers.map((tier, i) => {
            const displayPrice = tier.name === "Free"
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
                    ? "border-primary/40 bg-white/[0.06] shadow-glow-strong"
                    : "border-white/[0.08] bg-white/[0.03]"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold font-mono uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                <p className="text-sm text-white/50 mt-1">{tier.description}</p>
                <div className="mt-6 mb-2">
                  <span className="text-5xl font-extrabold text-white">{displayPrice}</span>
                  {tier.period && <span className="text-white/50 ml-1 text-sm">/{tier.period}</span>}
                </div>
                <div className="flex items-center gap-1.5 mb-6">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-mono text-primary font-bold">{tier.credits}</span>
                </div>

                {/* Credit tiers for paid plans */}
                {tier.tiers && (
                  <div className="mb-6 rounded-lg bg-white/[0.04] border border-white/[0.06] p-3">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1">
                      <Info className="w-3 h-3" /> Credit tiers
                    </p>
                    <div className="space-y-1.5">
                      {tier.tiers.map((t) => (
                        <div key={t.credits} className="flex justify-between text-xs">
                          <span className="text-white/70">{t.credits} credits</span>
                          <span className="text-white/50 font-mono">
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
                      : "bg-white/10 text-white hover:bg-white/15 border-0"
                  }`}
                  variant={tier.highlighted ? "default" : "outline"}
                >
                  <Link to={tier.name === "Business" ? "/consulting" : "/register"}>{tier.cta}</Link>
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
            );
          })}
        </div>

        {/* Credit top-up note */}
        <div className="text-center mt-12">
          <p className="text-white/40 text-xs font-mono">
            Need more? Pro & Business users can buy top-ups in 50-credit packs. Credits roll over for active subscribers.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
