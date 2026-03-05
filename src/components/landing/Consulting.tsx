import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Stethoscope, Brain, GraduationCap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Stethoscope,
    title: "Clinical Data Strategy",
    description: "We help health organizations design data extraction pipelines, build clinical dashboards, and create decision-support frameworks tailored to their workflows.",
  },
  {
    icon: Brain,
    title: "Health AI Implementation",
    description: "From custom NLP models for clinical notes to AI-powered claims processing — we deploy intelligent systems purpose-built for healthcare.",
  },
  {
    icon: GraduationCap,
    title: "Training & Compliance",
    description: "Hands-on workshops for your team on health data best practices, HIPAA compliance, and DataAfro platform mastery.",
  },
  {
    icon: FileText,
    title: "Regulatory & Research Support",
    description: "Bespoke clinical trial analysis, FDA submission prep, real-world evidence studies, and professionally formatted regulatory deliverables.",
  },
];

const audiences = [
  "Hospitals & Health Systems",
  "Clinical Research Organizations",
  "Pharmaceutical Companies",
  "Digital Health Startups",
  "Health Insurance Providers",
  "Public Health & NGOs",
];

const Consulting = () => {
  return (
    <section className="py-28 bg-background relative overflow-hidden" id="consulting">
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-primary/5 blur-[150px] rounded-full" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">Consulting & Services</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-4 tracking-tight text-foreground">
            Need a health data<br />
            <span className="text-gradient">partner?</span>
          </h2>
          <p className="text-lg mt-4 max-w-2xl mx-auto text-muted-foreground">
            Our team of health data scientists and clinical informatics experts works directly with your organization to unlock the full power of your clinical data.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl border border-border bg-card shadow-soft hover:shadow-elevated hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-10"
        >
          <h3 className="text-xl font-bold text-foreground mb-6">Who we work with</h3>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {audiences.map((a, i) => (
              <motion.span
                key={a}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-foreground hover:border-primary/30 transition-colors"
              >
                {a}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mt-12"
        >
          <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground px-8 h-14 text-base font-bold shadow-glow hover:opacity-90 transition-all rounded-xl">
            <Link to="/consulting">
              Book a Discovery Call <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">Free initial consultation • HIPAA-compliant engagement</p>
        </motion.div>
      </div>
    </section>
  );
};

export default Consulting;
