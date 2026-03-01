import { motion } from "framer-motion";
import { FileSpreadsheet, FileText, FileJson, Image, FileCode, File } from "lucide-react";

const types = [
  { icon: FileSpreadsheet, label: "CSV", ext: ".csv" },
  { icon: FileSpreadsheet, label: "Excel", ext: ".xlsx" },
  { icon: FileJson, label: "JSON", ext: ".json" },
  { icon: FileText, label: "PDF", ext: ".pdf" },
  { icon: FileText, label: "Word", ext: ".docx" },
  { icon: FileText, label: "Text", ext: ".txt" },
  { icon: Image, label: "Images", ext: ".png/.jpg" },
  { icon: FileCode, label: "XML", ext: ".xml" },
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
          <h2 className="text-2xl md:text-3xl font-bold mt-3 tracking-tight text-foreground">Drop anything. We handle it.</h2>
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
              className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-glow transition-all duration-300 cursor-default min-w-[100px]"
            >
              <t.icon className="w-8 h-8 text-primary" />
              <span className="text-sm font-semibold text-foreground">{t.label}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{t.ext}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FileTypes;
