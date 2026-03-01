import { BarChart3, FileText, Shield, Zap, Globe, Layers } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Processing",
    description: "Get results in seconds, not hours. Our optimized pipeline handles complex data instantly.",
  },
  {
    icon: FileText,
    title: "Multi-Format Output",
    description: "Generate PDF, DOCX, XLSX, PPTX, JSON, CSV, and Markdown reports from a single upload.",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "AI-powered charts, key metrics, and trend analysis generated automatically.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant infrastructure with end-to-end encryption for all your data.",
  },
  {
    icon: Globe,
    title: "API Access",
    description: "RESTful API with comprehensive documentation for seamless integration.",
  },
  {
    icon: Layers,
    title: "Batch Processing",
    description: "Upload multiple datasets and process them in parallel for maximum efficiency.",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Everything You Need to Forge Insights
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete toolkit for transforming any data into actionable intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-6 rounded-xl bg-background border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold font-heading mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
