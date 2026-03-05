import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { USE_CASES_DATA } from "@/lib/use-cases-data";

// Reorder to prioritize healthcare
const priorityOrder = ["healthcare", "research-academia", "finance-banking", "business-intelligence", "legal-compliance", "government-ngos"];

const UseCases = () => {
  const sortedCases = [...USE_CASES_DATA].sort((a, b) => {
    const aIdx = priorityOrder.indexOf(a.slug);
    const bIdx = priorityOrder.indexOf(b.slug);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  return (
    <section className="py-28 bg-background relative overflow-hidden" id="use-cases">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
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
          <h2 className="text-3xl md:text-5xl font-extrabold mt-4 tracking-tight text-foreground">
            Built for healthcare. Ready for every industry.
          </h2>
          <p className="text-lg mt-4 max-w-2xl mx-auto text-muted-foreground">
            Purpose-built for clinical data workflows, with the versatility to serve any data-intensive vertical.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {sortedCases.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/use-cases/${c.slug}`}
                className={`group relative p-8 rounded-2xl border overflow-hidden bg-card block h-full hover:border-primary/30 transition-all duration-300 ${
                  c.slug === "healthcare" ? "border-primary/30 bg-primary/[0.03] ring-1 ring-primary/10" : "border-border"
                }`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-primary/5 to-transparent" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-border bg-muted/50">
                      <c.icon className="w-7 h-7 text-primary" />
                    </div>
                    {c.slug === "healthcare" && (
                      <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Featured</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary/70 mb-2 block">{c.category}</span>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{c.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground mb-4">{c.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2.5 transition-all">
                    Learn more <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
