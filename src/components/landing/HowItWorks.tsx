import { Upload, Cpu, Download } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Upload,
    num: "01",
    title: "Drop Your Data",
    description: "CSV, Excel, PDF, JSON, images — we handle everything. Just drag, drop, done.",
  },
  {
    icon: Cpu,
    num: "02",
    title: "AI Does the Heavy Lifting",
    description: "Pattern recognition, trend analysis, anomaly detection — all automated.",
  },
  {
    icon: Download,
    num: "03",
    title: "Export & Share",
    description: "Download polished reports in PDF, DOCX, XLSX, PPTX, or raw data formats.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-28 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">How It Works</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-4 tracking-tight text-foreground">
            Three steps. Zero friction.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="relative group"
            >
              <div className="text-6xl font-extrabold text-gradient opacity-20 absolute -top-4 -left-2">{step.num}</div>
              <div className="relative pt-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-glow group-hover:shadow-glow-strong transition-shadow">
                  <step.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
