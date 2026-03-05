import {
  Stethoscope, ShieldCheck, Globe, Workflow, FileText, FolderLock,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Stethoscope,
    title: "AI Clinical Co-Pilot",
    description: "Real-time AI chat that summarizes patient histories, flags drug interactions, and suggests ICD/CPT codes from uploaded records.",
    tag: "AI-Powered",
  },
  {
    icon: ShieldCheck,
    title: "Auto PHI Redaction",
    description: "Automatically detect and redact Protected Health Information across documents with HIPAA/GDPR compliance reports and full audit trails.",
    tag: "Compliance",
  },
  {
    icon: Globe,
    title: "Epidemic Intelligence",
    description: "Real-time disease surveillance dashboards with outbreak tracking, geographic spread visualization, and automated alert systems.",
    tag: "Surveillance",
  },
  {
    icon: Workflow,
    title: "Clinical Pipeline Builder",
    description: "No-code drag-and-drop workflows to chain Ingest → Clean → De-identify → Analyze → Report clinical data processing steps.",
    tag: "No-Code",
  },
  {
    icon: FileText,
    title: "Regulatory Submissions",
    description: "One-click generation of FDA/EMA submission-ready documents — Clinical Study Reports, safety narratives, and study protocols.",
    tag: "FDA/EMA",
  },
  {
    icon: FolderLock,
    title: "Secure Data Rooms",
    description: "Multi-org virtual data rooms for hospitals, pharma, and CROs to collaborate on shared datasets with granular permissions.",
    tag: "Enterprise",
  },
];

const IntelligenceSuite = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden" id="intelligence">
      {/* Background */}
      <div className="absolute inset-0 section-dark" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium mb-6"
            style={{ borderColor: "hsl(var(--section-dark-border))", color: "hsl(var(--primary))" }}
          >
            ✦ Intelligence Suite
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight" style={{ color: "hsl(var(--section-dark-fg))" }}>
            Beyond Processing.{" "}
            <span className="text-gradient">Clinical Intelligence.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg" style={{ color: "hsl(var(--section-dark-muted))" }}>
            Six powerful tools that transform DataAfro from a data platform into an indispensable clinical intelligence engine for health organizations.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative rounded-2xl p-6 border transition-all duration-300 hover:border-primary/30"
              style={{
                background: "hsl(var(--section-dark-card))",
                borderColor: "hsl(var(--section-dark-border))",
              }}
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: "var(--shadow-glow)" }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      background: "hsl(var(--primary) / 0.1)",
                      color: "hsl(var(--primary))",
                    }}
                  >
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "hsl(var(--section-dark-fg))" }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--section-dark-muted))" }}>
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <Button
            size="lg"
            className="gap-2 bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-strong transition-shadow"
            onClick={() => navigate("/register")}
          >
            Get Early Access <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default IntelligenceSuite;
