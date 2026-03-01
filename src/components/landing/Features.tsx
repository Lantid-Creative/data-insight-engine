import { BarChart3, FileText, Shield, Zap, Globe, Layers } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Zap, title: "Instant Processing", description: "Results in seconds. Our pipeline is optimized for speed without sacrificing depth.", featured: true },
  { icon: BarChart3, title: "Smart Visualizations", description: "Auto-generated charts, metrics, and trends from your raw data.", featured: true },
  { icon: FileText, title: "8+ Output Formats", description: "PDF, DOCX, XLSX, PPTX, JSON, CSV, Markdown — one upload, every format." },
  { icon: Shield, title: "Bank-Level Security", description: "End-to-end encryption. Your data never leaves our secure infrastructure." },
  { icon: Globe, title: "API-First", description: "Full REST API with docs. Integrate DataAfro into your existing workflows." },
  { icon: Layers, title: "Batch Mode", description: "Process hundreds of files in parallel. Perfect for enterprise workloads." },
];

const Features = () => {
  return (
    <section className="py-28 section-dark relative" id="features">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
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
          <h2 className="text-3xl md:text-5xl font-extrabold mt-4 tracking-tight text-white">
            Built different. Built bold.
          </h2>
          <p className="text-lg mt-4 max-w-2xl mx-auto text-white/50">
            Everything you need to turn chaos into clarity.
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
              className="group p-8 rounded-2xl border transition-all duration-300 hover:border-primary/30 bg-white/[0.04] border-white/[0.08] relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white/90">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{feature.description}</p>
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
              className="group p-6 rounded-2xl border transition-all duration-300 hover:border-primary/30 bg-white/[0.03] border-white/[0.08]"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-bold mb-2 text-white/90">{feature.title}</h3>
              <p className="text-xs leading-relaxed text-white/50">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
