import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Dr. Amara Okafor", role: "Chief Medical Officer, MedVault Health", avatar: "AO", quote: "DataAfro cut our clinical data extraction time from 3 weeks to 3 hours. Our research team can now focus on discovery, not data entry." },
  { name: "Kwame Mensah", role: "VP Data Science, TrialSync CRO", avatar: "KM", quote: "We process 10,000+ adverse event reports monthly. DataAfro's AI catches signals our manual review missed — it's transformed our safety monitoring." },
  { name: "Dr. Fatima Al-Hassan", role: "Director of Informatics, Regional Health System", avatar: "FA", quote: "The EHR extraction is incredible. We upload discharge summaries and get structured, coded data back. HIPAA compliance was a non-negotiable — DataAfro delivered." },
  { name: "Daniel Otieno", role: "CEO, AfriMed Digital Health", avatar: "DO", quote: "As a telehealth startup, we needed to extract patient intake data at scale. DataAfro gave us enterprise-grade capability on a startup budget." },
  { name: "Dr. Chioma Nwankwo", role: "Clinical Research Lead, BioGenesis Pharma", avatar: "CN", quote: "We integrated the API into our clinical trial pipeline. FDA submission prep that took a month now takes a week. Absolute game changer." },
  { name: "Yusuf Ibrahim", role: "Head of Claims Analytics, AfriCare Insurance", avatar: "YI", quote: "Processing thousands of insurance claims with ICD/CPT coding used to require a team of 8. Now it's automated with 99% accuracy." },
];

const Testimonials = () => {
  return (
    <section className="py-28 bg-background relative overflow-hidden" id="testimonials">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[150px] rounded-full" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">Testimonials</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-4 tracking-tight text-foreground">
            Trusted by health data<br />
            <span className="text-gradient">teams worldwide.</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            From CROs to hospital systems, digital health startups to pharma enterprises.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`relative p-6 rounded-2xl border border-border bg-card shadow-soft group hover:shadow-elevated hover:border-primary/20 transition-all duration-300 ${
                i === 1 ? "lg:mt-8" : i === 2 ? "lg:mt-4" : ""
              }`}
            >
              <Quote className="w-8 h-8 text-primary/10 absolute top-4 right-4" />
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">{t.avatar}</div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
