import { motion } from "framer-motion";
import { FileSpreadsheet, FileText, FileJson, Image, FileCode, File, HeartPulse, Pill } from "lucide-react";

const types = [
  { icon: FileText, label: "PDF Reports", ext: ".pdf", health: true },
  { icon: HeartPulse, label: "EHR / HL7", ext: ".hl7/.cda", health: true },
  { icon: FileCode, label: "FHIR", ext: ".json/.xml", health: true },
  { icon: Image, label: "DICOM", ext: ".dcm", health: true },
  { icon: Pill, label: "Rx / Claims", ext: ".837/.835", health: true },
  { icon: FileSpreadsheet, label: "CSV / Excel", ext: ".csv/.xlsx" },
  { icon: FileJson, label: "JSON", ext: ".json" },
  { icon: FileText, label: "Word / Text", ext: ".docx/.txt" },
  { icon: File, label: "Parquet", ext: ".parquet" },
];

const FileTypes = () => {
  return (
    <section className="py-20 bg-background border-y border-border overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">Supported Formats</span>
          <h2 className="text-2xl md:text-3xl font-bold mt-3 tracking-tight text-foreground">Every health data format. Handled.</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">From legacy HL7 pipes to modern FHIR bundles — plus every standard data format your team already uses.</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {types.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.08, y: -4, transition: { duration: 0.15 } }}
              className={`flex flex-col items-center gap-2 p-5 rounded-2xl border bg-card hover:border-primary/30 hover:shadow-glow transition-all duration-300 cursor-default min-w-[100px] ${
                t.health ? "border-primary/20 bg-primary/[0.03]" : "border-border"
              }`}
            >
              <t.icon className="w-8 h-8 text-primary" />
              <span className="text-sm font-semibold text-foreground">{t.label}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{t.ext}</span>
              {t.health && <span className="text-[9px] font-mono text-primary/60 uppercase">Health</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FileTypes;
