import { BarChart3, FileText, Shield, Zap, Globe, Layers } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Zap, title: "Instant Processing", description: "Results in seconds. Our pipeline is optimized for speed without sacrificing depth." },
  { icon: FileText, title: "8+ Output Formats", description: "PDF, DOCX, XLSX, PPTX, JSON, CSV, Markdown — one upload, every format." },
  { icon: BarChart3, title: "Smart Visualizations", description: "Auto-generated charts, metrics, and trends from your raw data." },
  { icon: Shield, title: "Bank-Level Security", description: "End-to-end encryption. Your data never leaves our secure infrastructure." },
  { icon: Globe, title: "API-First", description: "Full REST API with docs. Integrate DataAfro into your existing workflows." },
  { icon: Layers, title: "Batch Mode", description: "Process hundreds of files in parallel. Perfect for enterprise workloads." },
];

const Features = () => {
  return (
    <section className="py-28 section-dark relative" id="features">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-20">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">Features</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-4 tracking-tight text-white">
            Built different. Built bold.
          </h2>
          <p className="text-lg mt-4 max-w-2xl mx-auto text-white/50">
            Everything you need to turn chaos into clarity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group p-6 rounded-2xl border transition-all duration-300 hover:border-primary/30 bg-white/[0.03] border-white/[0.08]"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white/90">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
