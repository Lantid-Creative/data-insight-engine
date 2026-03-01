import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "What file types does DataAfro support?", a: "We support CSV, Excel (.xlsx), JSON, PDF, Word (.docx), TXT, images (PNG, JPG), XML, Parquet, and more. If it contains data, we can likely process it." },
  { q: "How does the AI analysis work?", a: "Our AI pipeline automatically detects data structure, identifies patterns, runs statistical analysis, and generates human-readable insights — all in seconds. No prompts needed." },
  { q: "Is my data secure?", a: "Absolutely. We use end-to-end encryption, SOC 2 compliant infrastructure, and your data is never stored longer than needed. We never train on your data." },
  { q: "Can I integrate DataAfro into my own tools?", a: "Yes! Our REST API lets you automate uploads, trigger analyses, and pull results programmatically. Full API documentation is available on the Pro plan and above." },
  { q: "What's the difference between Free and Pro?", a: "Free gives you 3 analyses per month with 2 output files. Pro unlocks 50 analyses, 5 outputs per analysis, all file formats, advanced AI reports, and priority support." },
  { q: "Do I need to know coding or data science?", a: "Not at all. DataAfro is designed for everyone — just upload your file and let the AI do the rest. No technical skills required." },
];

const FAQ = () => {
  return (
    <section className="py-28 bg-background" id="faq">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">FAQ</span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-4 tracking-tight text-foreground">
            Got questions?
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-border rounded-xl px-6 data-[state=open]:border-primary/20 data-[state=open]:shadow-glow transition-all"
              >
                <AccordionTrigger className="text-left font-semibold text-sm py-5 hover:no-underline hover:text-primary transition-colors text-foreground">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
