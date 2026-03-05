import { Stethoscope, FileText, Shield, Zap, Microscope, Layers } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Stethoscope, title: "Clinical Data Extraction", description: "Extract structured data from EHRs, discharge summaries, and patient charts. Auto-detect ICD-10 codes, diagnoses, and medications.", featured: true },
  { icon: Microscope, title: "Clinical Trial Intelligence", description: "Process trial protocols, adverse event reports, and FDA submissions. Generate regulatory-ready analyses in minutes.", featured: true },
  { icon: FileText, title: "Multi-Format Health Reports", description: "Output to PDF, DOCX, XLSX, HL7 FHIR, JSON — from a single upload. Compliance-ready formatting built in." },
  { icon: Shield, title: "HIPAA-Ready Security", description: "End-to-end encryption, de-identification pipelines, and audit trails. Your patient data never leaves secure infrastructure." },
  { icon: Zap, title: "Real-Time Processing", description: "Results in seconds. Process thousands of lab reports, radiology findings, or claims forms in parallel." },
  { icon: Layers, title: "API-First Integration", description: "REST API with full docs. Plug DataAfro into your EHR, LIMS, or clinical workflow — no rip-and-replace." },
];

const Features = () => {
  return (
    <section className="py-28 bg-background relative" id="features">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">Features</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-4 tracking-tight text-foreground">
            Built for clinical precision.
          </h2>
          <p className="text-lg mt-4 max-w-2xl mx-auto text-muted-foreground">
            Everything health data teams need to turn unstructured medical records into actionable intelligence.
          </p>
        </motion.div>

        {/* Featured 2 cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-6">
          {features.filter(f => f.featured).map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group p-8 rounded-2xl border transition-all duration-300 hover:border-primary/30 bg-card border-border relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Secondary 4 cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.filter(f => !f.featured).map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
              className="group p-6 rounded-2xl border transition-all duration-300 hover:border-primary/30 bg-card border-border"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-bold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
