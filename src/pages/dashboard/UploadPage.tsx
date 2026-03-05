import { useState, useCallback, useRef } from "react";
import { Upload as UploadIcon, File, X, ArrowRight, FileText, FileSpreadsheet, FileImage, FileCode, FileArchive, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["pdf"].includes(ext)) return FileText;
  if (["csv", "xls", "xlsx", "tsv"].includes(ext)) return FileSpreadsheet;
  if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext)) return FileImage;
  if (["json", "xml", "html", "js", "ts", "py"].includes(ext)) return FileCode;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return FileArchive;
  return File;
}

function getFileColor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["pdf"].includes(ext)) return "text-destructive bg-destructive/10";
  if (["csv", "xls", "xlsx"].includes(ext)) return "text-[hsl(var(--success))] bg-[hsl(var(--success))]/10";
  if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext)) return "text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10";
  if (["json", "xml", "html"].includes(ext)) return "text-primary bg-primary/10";
  return "text-muted-foreground bg-muted";
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: "uploading" | "complete" | "error";
}

const UploadPage = () => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [rawText, setRawText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (newFiles: File[]) => {
    const withProgress = newFiles.map((file) => ({
      file,
      progress: 0,
      status: "uploading" as const,
    }));
    setFiles((prev) => [...prev, ...withProgress]);

    withProgress.forEach((fp, idx) => {
      const startIdx = files.length + idx;
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f, i) => (i === startIdx ? { ...f, progress: 100, status: "complete" } : f))
          );
        } else {
          setFiles((prev) =>
            prev.map((f, i) => (i === startIdx ? { ...f, progress: Math.min(progress, 95) } : f))
          );
        }
      }, 200 + Math.random() * 300);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    simulateUpload(Array.from(e.dataTransfer.files));
  }, [files.length]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) simulateUpload(Array.from(e.target.files));
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const canProceed = files.length > 0 || rawText.trim().length > 0;
  const allComplete = files.every((f) => f.status === "complete");
  const uploading = files.some((f) => f.status === "uploading");

  const healthPresets = [
    { label: "EHR / Patient Records", formats: "HL7, CDA, PDF, FHIR JSON", emoji: "🏥" },
    { label: "Lab Reports", formats: "PDF, CSV, HL7", emoji: "🔬" },
    { label: "Clinical Trial Data", formats: "PDF, XML, CSV, SAS", emoji: "💊" },
    { label: "Insurance Claims", formats: "837/835, CSV, PDF", emoji: "📋" },
    { label: "DICOM / Imaging", formats: ".dcm, metadata XML", emoji: "🩻" },
    { label: "General Data", formats: "CSV, Excel, JSON, PDF", emoji: "📄" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Upload Health Data</h1>
        <p className="text-muted-foreground mt-1">Upload clinical files or paste raw data to start extraction and analysis.</p>
      </div>

      {/* Health Data Presets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {healthPresets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/[0.03] transition-all text-left group"
          >
            <span className="text-xl">{preset.emoji}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{preset.label}</p>
              <p className="text-[10px] text-muted-foreground font-mono truncate">{preset.formats}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-all cursor-pointer ${
          dragOver
            ? "border-primary bg-primary/5 shadow-glow scale-[1.01]"
            : "border-border hover:border-primary/50 hover:shadow-soft"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-16">
          <motion.div
            animate={dragOver ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"
          >
            <UploadIcon className="w-8 h-8 text-primary" />
          </motion.div>
          <p className="font-semibold text-lg">Drag & drop files here</p>
          <p className="text-sm text-muted-foreground mt-1">
            EHR exports, lab reports, clinical trial PDFs, DICOM, HL7, FHIR, and more
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
            Browse Files
          </Button>
          <input ref={inputRef} type="file" multiple onChange={handleFileInput} className="hidden" />
        </CardContent>
      </Card>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Files ({files.filter((f) => f.status === "complete").length}/{files.length} ready)
                  </CardTitle>
                  {uploading && (
                    <span className="text-xs text-muted-foreground animate-pulse">Uploading…</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <AnimatePresence>
                  {files.map((fp, i) => {
                    const Icon = getFileIcon(fp.file.name);
                    const colorClass = getFileColor(fp.file.name);
                    return (
                      <motion.div
                        key={`${fp.file.name}-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative overflow-hidden rounded-lg border border-border/50 bg-card"
                      >
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{fp.file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(fp.file.size / 1024).toFixed(1)} KB
                                {fp.file.type && ` · ${fp.file.type.split("/")[1]?.toUpperCase() || fp.file.type}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {fp.status === "complete" && (
                              <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" />
                            )}
                            {fp.status === "error" && (
                              <AlertCircle className="w-4 h-4 text-destructive" />
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {fp.status === "uploading" && (
                          <div className="px-3 pb-2">
                            <Progress value={fp.progress} className="h-1" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Raw text */}
      <Card className="shadow-soft">
        <CardHeader><CardTitle className="text-base">Or Paste Raw Data</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste clinical data here (HL7 messages, FHIR JSON, CSV, plain text...)"
            className="min-h-[120px]"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
        </CardContent>
      </Card>

      <Button
        disabled={!canProceed || uploading}
        onClick={() => navigate("/dashboard/process")}
        className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 h-12 text-base"
      >
        {uploading ? "Waiting for uploads…" : "Continue to Analysis"}
        {!uploading && <ArrowRight className="ml-2 w-4 h-4" />}
      </Button>
    </div>
  );
};

export default UploadPage;
