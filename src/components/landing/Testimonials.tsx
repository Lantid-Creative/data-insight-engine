import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Amara Okafor", role: "Data Analyst, FinStack", avatar: "AO", quote: "DataAfro turned 3 hours of manual reporting into 5 seconds. My entire team switched within a week." },
  { name: "Kwame Mensah", role: "CEO, GrowthLabs", avatar: "KM", quote: "The AI insights are genuinely useful — not just fluff. It caught trends in our sales data we completely missed." },
  { name: "Fatima Al-Hassan", role: "Research Lead, NovaTech", avatar: "FA", quote: "I upload messy CSVs and get back beautifully formatted reports. It feels like magic every single time." },
  { name: "Daniel Otieno", role: "Freelance Consultant", avatar: "DO", quote: "My clients think I have a whole analytics team. It's just me and DataAfro. Don't tell them." },
  { name: "Chioma Nwankwo", role: "Product Manager, Buildify", avatar: "CN", quote: "We integrated via the API and now auto-generate weekly performance reports. Absolute game changer." },
  { name: "Yusuf Ibrahim", role: "Finance Director, Apex Group", avatar: "YI", quote: "Bank-level security was non-negotiable for us. DataAfro delivered that plus incredible speed." },
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
            Loved by data people<br />
            <span className="text-gradient">everywhere.</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Join thousands of analysts, founders, and researchers who trust DataAfro.
          </p>
        </motion.div>

        {/* Masonry-style layout: 2 cols with offset */}
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
