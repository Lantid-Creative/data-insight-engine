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
    <section className="py-28 bg-background relative overflow-hidden" id="how-it-works">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">How It Works</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-4 tracking-tight text-foreground">
            Three steps. Zero friction.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Go from raw data to polished insights in under a minute.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[72px] left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className="relative group text-center"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow group-hover:shadow-glow-strong transition-shadow mx-auto">
                    <step.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                    <span className="text-[10px] font-mono font-bold text-primary">{step.num}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
