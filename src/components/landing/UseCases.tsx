import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { USE_CASES_DATA } from "@/lib/use-cases-data";

const UseCases = () => {
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
            Built for every industry.
          </h2>
          <p className="text-lg mt-4 max-w-2xl mx-auto text-muted-foreground">
            From startups to governments, DataAfro adapts to your domain.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {USE_CASES_DATA.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/use-cases/${c.slug}`}
                className="group relative p-8 rounded-2xl border overflow-hidden bg-card border-border block h-full hover:border-primary/30 transition-all duration-300"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-primary/5 to-transparent" />

                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-border bg-muted/50">
                    <c.icon className="w-7 h-7 text-primary" />
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
