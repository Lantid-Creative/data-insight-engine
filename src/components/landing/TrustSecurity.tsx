import { Shield, Lock, Eye, Server, FileCheck, UserCheck, Database, Globe } from "lucide-react";
import { motion } from "framer-motion";

const certifications = [
  { label: "HIPAA", desc: "Compliant" },
  { label: "SOC 2", desc: "Type II" },
  { label: "GDPR", desc: "Ready" },
  { label: "ISO 27001", desc: "Aligned" },
];

const pillars = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    desc: "AES-256 encryption at rest. TLS 1.3 in transit. Your data is protected at every layer — from upload to export.",
  },
  {
    icon: Eye,
    title: "Built-In De-Identification",
    desc: "AI-powered PHI redaction detects and masks all 18 HIPAA Safe Harbor identifiers before your data is ever processed.",
  },
  {
    icon: UserCheck,
    title: "Granular Access Controls",
    desc: "Role-based permissions, API key management, IP allowlisting, session timeouts, and MFA ensure only authorized eyes see your data.",
  },
  {
    icon: Database,
    title: "Zero Data Training",
    desc: "Your data is never used to train our models. Ever. We follow strict data minimization and purpose limitation principles.",
  },
  {
    icon: FileCheck,
    title: "Complete Audit Trail",
    desc: "Every action — upload, view, share, export — is logged with timestamps, user IDs, and IP addresses for full regulatory accountability.",
  },
  {
    icon: Globe,
    title: "Data Residency Control",
    desc: "Choose where your data lives. Our infrastructure supports regional deployment to meet local data sovereignty requirements.",
  },
];

const TrustSecurity = () => {
  return (
    <section className="py-28 bg-muted/30 relative overflow-hidden" id="security">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">
            Trust & Security
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-4 tracking-tight text-foreground">
            Your data is sacred. We treat it that way.
          </h2>
          <p className="text-lg mt-4 max-w-2xl mx-auto text-muted-foreground">
            Health data demands the highest bar for security and privacy. DataAfro is engineered from the ground up to exceed it.
          </p>
        </motion.div>

        {/* Compliance badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {certifications.map((cert) => (
            <div
              key={cert.label}
              className="flex items-center gap-3 px-6 py-3 rounded-full border border-primary/20 bg-primary/5"
            >
              <Shield className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="text-sm font-bold text-foreground">{cert.label}</div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {cert.desc}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Security pillars grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
              className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <pillar.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-bold mb-2 text-foreground">{pillar.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{pillar.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom assurance banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-3xl mx-auto text-center p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5"
        >
          <Server className="w-8 h-8 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">
            Enterprise-Grade Infrastructure
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Hosted on SOC 2 Type II certified infrastructure with automated daily backups, DDoS protection, 
            real-time intrusion detection, and a 99.9% uptime SLA. Your operations never stop — and neither does our vigilance.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSecurity;
