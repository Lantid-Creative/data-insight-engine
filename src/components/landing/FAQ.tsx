import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "What health data formats does DataAfro support?", a: "We support HL7 v2/v3, FHIR (R4), CDA, DICOM metadata, PDF lab reports, EHR exports, insurance claims (837/835), ICD-10/CPT coded documents, plus all standard formats like CSV, Excel, JSON, and Word." },
  { q: "Is DataAfro HIPAA compliant?", a: "Yes. We provide HIPAA-ready infrastructure with end-to-end encryption, automated de-identification pipelines, audit trails, and access controls. Enterprise plans include a signed Business Associate Agreement (BAA)." },
  { q: "How does clinical data extraction work?", a: "Our AI pipeline uses medical NLP to detect clinical entities — diagnoses, medications, lab values, ICD codes, procedures — from unstructured documents. It structures them into standardized formats like FHIR resources or coded datasets." },
  { q: "Can I integrate DataAfro into our EHR or LIMS?", a: "Yes! Our REST API lets you automate data extraction, push structured results to your systems, and trigger analyses programmatically. We support integration with Epic, Cerner, and custom LIMS platforms." },
  { q: "Who is DataAfro built for?", a: "Digital health startups processing patient intake forms, CROs managing clinical trial data, pharma companies handling regulatory submissions, hospital systems extracting insights from medical records, and health insurers processing claims." },
  { q: "How is patient data protected?", a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We offer automated PHI de-identification, role-based access controls, and your data is never used to train our models. SOC 2 Type II compliant infrastructure." },
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
