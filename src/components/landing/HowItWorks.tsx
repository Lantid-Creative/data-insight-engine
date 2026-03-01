import { Upload, Cpu, Download } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Data",
    description: "Drag and drop any file — CSV, Excel, PDF, images, or paste raw text directly.",
  },
  {
    icon: Cpu,
    title: "AI Analyzes & Processes",
    description: "Our AI engine extracts insights, identifies patterns, and generates recommendations.",
  },
  {
    icon: Download,
    title: "Download Reports",
    description: "Get up to 5 professionally formatted outputs in PDF, DOCX, XLSX, PPTX, and more.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps from raw data to professional reports.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px border-t-2 border-dashed border-border" />
              )}
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-accent flex items-center justify-center shadow-soft">
                <step.icon className="w-10 h-10 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Step {i + 1}</span>
              <h3 className="text-xl font-semibold mt-2 mb-3 font-heading">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
