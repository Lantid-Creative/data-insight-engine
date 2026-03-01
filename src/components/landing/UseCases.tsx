import { motion } from "framer-motion";
import { TrendingUp, GraduationCap, Building2, Stethoscope, Landmark, Rocket } from "lucide-react";

const cases = [
  {
    icon: TrendingUp,
    title: "Finance & Banking",
    description: "Risk reports, portfolio analysis, and compliance documents — generated in seconds from raw transaction data.",
    color: "hsl(24 95% 53%)",
  },
  {
    icon: GraduationCap,
    title: "Research & Academia",
    description: "Turn survey data into publication-ready summaries. Auto-generate lit reviews and statistical breakdowns.",
    color: "hsl(35 100% 55%)",
  },
  {
    icon: Building2,
    title: "Business Intelligence",
    description: "Sales trends, customer segmentation, KPI dashboards — all from a single CSV drop.",
    color: "hsl(24 95% 53%)",
  },
  {
    icon: Stethoscope,
    title: "Healthcare",
    description: "Patient data analysis, clinical trial summaries, and compliance reporting with privacy-first architecture.",
    color: "hsl(35 100% 55%)",
  },
  {
    icon: Landmark,
    title: "Government & NGOs",
    description: "Census data processing, impact assessments, and grant reporting — at scale, with zero manual formatting.",
    color: "hsl(24 95% 53%)",
  },
  {
    icon: Rocket,
    title: "Startups",
    description: "Pitch deck data, market sizing, investor reports — look like a Fortune 500 with a 3-person team.",
    color: "hsl(35 100% 55%)",
  },
];

const UseCases = () => {
  return (
    <section className="py-28 bg-hero relative overflow-hidden" id="use-cases">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, hsl(0 0% 100%) 1px, transparent 0)",
        backgroundSize: "40px 40px",
      }} />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">Use Cases</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-4 tracking-tight" style={{ color: "hsl(0 0% 96%)" }}>
            Built for every industry.
          </h2>
          <p className="text-lg mt-4 max-w-2xl mx-auto" style={{ color: "hsl(0 0% 50%)" }}>
            From startups to governments, DataAfro adapts to your domain.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cases.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="group relative p-8 rounded-2xl border overflow-hidden"
              style={{ background: "hsl(0 0% 5%)", borderColor: "hsl(0 0% 12%)" }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 50% 0%, ${c.color}10, transparent 70%)` }}
              />

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border"
                  style={{ borderColor: "hsl(0 0% 15%)", background: "hsl(0 0% 8%)" }}
                >
                  <c.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "hsl(0 0% 92%)" }}>{c.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(0 0% 50%)" }}>{c.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
