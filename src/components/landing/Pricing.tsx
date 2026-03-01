import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic analysis",
    features: ["3 analyses per month", "2 file outputs", "CSV & JSON uploads", "Basic insights", "Community support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For professionals and teams",
    features: ["50 analyses per month", "5 file outputs per analysis", "All file formats", "Advanced reports", "Priority support", "API access"],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "Unlimited power for organizations",
    features: ["Unlimited analyses", "Unlimited outputs", "White-label reports", "Custom AI prompts", "Dedicated support", "SSO & SAML", "SLA guarantee"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const Pricing = () => {
  return (
    <section className="py-24 bg-background" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start free and scale as your data needs grow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`relative rounded-2xl p-8 border ${
                tier.highlighted
                  ? "border-primary bg-card shadow-elevated scale-[1.02]"
                  : "border-border bg-card shadow-soft"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-primary text-primary-foreground text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold font-heading">{tier.name}</h3>
              <div className="mt-4 mb-2">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground ml-2 text-sm">/{tier.period}</span>
              </div>
              <p className="text-muted-foreground text-sm mb-6">{tier.description}</p>
              <Button
                asChild
                className={`w-full mb-6 ${tier.highlighted ? "bg-gradient-primary text-primary-foreground hover:opacity-90" : ""}`}
                variant={tier.highlighted ? "default" : "outline"}
              >
                <Link to="/register">{tier.cta}</Link>
              </Button>
              <ul className="space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
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
