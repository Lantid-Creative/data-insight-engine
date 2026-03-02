import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { USE_CASES_DATA } from "@/lib/use-cases-data";

const UseCaseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const useCase = USE_CASES_DATA.find((uc) => uc.slug === slug);
  const currentIndex = USE_CASES_DATA.findIndex((uc) => uc.slug === slug);
  const prevCase = currentIndex > 0 ? USE_CASES_DATA[currentIndex - 1] : null;
  const nextCase = currentIndex < USE_CASES_DATA.length - 1 ? USE_CASES_DATA[currentIndex + 1] : null;

  if (!useCase) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold mb-4">Use Case Not Found</h1>
            <Button asChild><Link to="/#use-cases">Back to Use Cases</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = useCase.icon;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="pt-32 pb-16 section-dark relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, hsl(0 0% 100%) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }} />
          <div className="container mx-auto px-6 relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Link to="/#use-cases" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8">
                <ArrowLeft className="w-4 h-4" /> All Use Cases
              </Link>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 bg-white/[0.04]">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">{useCase.category}</span>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{useCase.title}</h1>
                </div>
              </div>
              <p className="text-lg md:text-xl text-white/50 max-w-3xl">{useCase.heroDescription}</p>
            </motion.div>
          </div>
        </section>

        {/* Sections */}
        {useCase.sections.map((section, i) => (
          <section key={i} className={`py-20 ${i % 2 === 0 ? "bg-background" : "bg-muted/30"}`}>
            <div className="container mx-auto px-6 max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">{section.title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg mb-6">{section.description}</p>
                {section.bullets && (
                  <ul className="space-y-3">
                    {section.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-start gap-3 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="py-20 section-dark">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Ready to transform your {useCase.title.toLowerCase()} workflow?</h2>
            <p className="text-white/50 mb-8 max-w-xl mx-auto">Join the private beta and see how DataAfro handles your data challenges.</p>
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 font-bold rounded-xl shadow-glow">
              <Link to="/register">Request Early Access <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </section>

        {/* Prev/Next Navigation */}
        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-6 flex justify-between items-center max-w-4xl">
            {prevCase ? (
              <Link to={`/use-cases/${prevCase.slug}`} className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>{prevCase.title}</span>
              </Link>
            ) : <div />}
            {nextCase ? (
              <Link to={`/use-cases/${nextCase.slug}`} className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <span>{nextCase.title}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : <div />}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default UseCaseDetailPage;
