import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Workflow, Plus, Play, Save, Trash2, GripVertical,
  Filter, Brain, FileText,
  ArrowRight, CheckCircle2, Settings, Zap, Loader2,
  FileInput, Eraser, Lock, FileOutput, Send,
  Copy, Clock, BarChart3, AlertCircle,
} from "lucide-react";
import { motion, Reorder } from "framer-motion";
import { toast } from "sonner";

interface PipelineStep {
  id: string;
  type: string;
  label: string;
  icon: typeof FileInput;
  config: Record<string, string>;
  status: "idle" | "running" | "complete" | "error";
  color: string;
  duration?: number;
  recordsProcessed?: number;
}

interface SavedPipeline {
  id: string;
  name: string;
  steps: number;
  lastRun: string;
  status: "success" | "failed" | "never";
}

const stepTemplates = [
  { type: "ingest", label: "Data Ingestion", icon: FileInput, desc: "Import clinical data from various sources", color: "bg-blue-500/10 text-blue-500" },
  { type: "clean", label: "Data Cleaning", icon: Eraser, desc: "Remove duplicates, fix formatting, validate", color: "bg-purple-500/10 text-purple-500" },
  { type: "deidentify", label: "De-identification", icon: Lock, desc: "Remove PHI using Safe Harbor method", color: "bg-red-500/10 text-red-500" },
  { type: "transform", label: "Transform", icon: Filter, desc: "Map to FHIR, HL7, or custom schemas", color: "bg-yellow-500/10 text-yellow-500" },
  { type: "analyze", label: "AI Analysis", icon: Brain, desc: "Run AI-powered clinical analytics", color: "bg-primary/10 text-primary" },
  { type: "report", label: "Generate Report", icon: FileOutput, desc: "Create formatted output reports", color: "bg-green-500/10 text-green-500" },
  { type: "export", label: "Export / Deliver", icon: Send, desc: "Send to destination or download", color: "bg-teal-500/10 text-teal-500" },
  { type: "qc", label: "Quality Check", icon: CheckCircle2, desc: "Validate output against standards", color: "bg-indigo-500/10 text-indigo-500" },
];

const stepConfigFields: Record<string, { label: string; options: string[] }[]> = {
  ingest: [
    { label: "Source Type", options: ["EHR Upload", "FHIR API", "HL7 Feed", "CSV Import", "DICOM"] },
    { label: "Encoding", options: ["UTF-8", "ASCII", "ISO-8859-1"] },
  ],
  clean: [
    { label: "Validation Rules", options: ["Standard", "Strict", "Lenient", "Custom"] },
    { label: "Duplicate Detection", options: ["Exact Match", "Fuzzy Match", "Disabled"] },
  ],
  deidentify: [
    { label: "Method", options: ["Safe Harbor", "Expert Determination", "Limited Dataset"] },
    { label: "Date Shift", options: ["Random ±90d", "Random ±365d", "Remove dates"] },
  ],
  transform: [
    { label: "Target Schema", options: ["FHIR R4", "HL7 v2.5", "OMOP CDM", "Custom JSON"] },
    { label: "Mapping Mode", options: ["Auto-map", "Manual mapping", "Template"] },
  ],
  analyze: [
    { label: "AI Model", options: ["Gemini Pro", "Gemini Flash", "GPT-5", "GPT-5 Mini"] },
    { label: "Analysis Type", options: ["Clinical Summary", "Risk Stratification", "Cohort Analysis", "Trend Detection"] },
  ],
  report: [
    { label: "Format", options: ["PDF", "DOCX", "HTML", "PPTX"] },
    { label: "Template", options: ["Clinical Summary", "Regulatory", "Research", "Custom"] },
  ],
  export: [
    { label: "Destination", options: ["Download", "Cloud Storage", "SFTP", "API Endpoint"] },
    { label: "Encryption", options: ["AES-256", "PGP", "None"] },
  ],
  qc: [
    { label: "Standard", options: ["CDISC", "ICH E6", "HIPAA", "Custom Rules"] },
    { label: "Threshold", options: ["95% pass rate", "99% pass rate", "100% required"] },
  ],
};

const savedPipelines: SavedPipeline[] = [
  { id: "p1", name: "EHR Intake → De-ID → FHIR Export", steps: 5, lastRun: "2h ago", status: "success" },
  { id: "p2", name: "Clinical Trial Data Cleaning", steps: 4, lastRun: "1d ago", status: "success" },
  { id: "p3", name: "Insurance Claims Processing", steps: 6, lastRun: "3d ago", status: "failed" },
];

const PipelineBuilderPage = () => {
  const [pipelineName, setPipelineName] = useState("Clinical Data Pipeline");
  const [steps, setSteps] = useState<PipelineStep[]>([
    { id: "1", type: "ingest", label: "Ingest EHR Records", icon: FileInput, config: { "Source Type": "EHR Upload", Encoding: "UTF-8" }, status: "idle", color: "bg-blue-500/10 text-blue-500" },
    { id: "2", type: "clean", label: "Clean & Validate", icon: Eraser, config: { "Validation Rules": "Standard", "Duplicate Detection": "Fuzzy Match" }, status: "idle", color: "bg-purple-500/10 text-purple-500" },
    { id: "3", type: "deidentify", label: "PHI De-identification", icon: Lock, config: { Method: "Safe Harbor", "Date Shift": "Random ±90d" }, status: "idle", color: "bg-red-500/10 text-red-500" },
    { id: "4", type: "analyze", label: "Clinical Analysis", icon: Brain, config: { "AI Model": "Gemini Pro", "Analysis Type": "Clinical Summary" }, status: "idle", color: "bg-primary/10 text-primary" },
    { id: "5", type: "report", label: "Generate Summary", icon: FileOutput, config: { Format: "PDF", Template: "Clinical Summary" }, status: "idle", color: "bg-green-500/10 text-green-500" },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [runProgress, setRunProgress] = useState(0);

  const addStep = (template: typeof stepTemplates[0]) => {
    const defaults: Record<string, string> = {};
    stepConfigFields[template.type]?.forEach((f) => { defaults[f.label] = f.options[0]; });
    const newStep: PipelineStep = {
      id: crypto.randomUUID(),
      type: template.type,
      label: template.label,
      icon: template.icon,
      config: defaults,
      status: "idle",
      color: template.color,
    };
    setSteps((prev) => [...prev, newStep]);
    toast.success(`Added "${template.label}" step`);
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    if (selectedStep === id) setSelectedStep(null);
  };

  const runPipeline = async () => {
    if (steps.length === 0) return toast.error("Add at least one step");
    setIsRunning(true);
    setTotalRecords(0);
    setRunProgress(0);

    for (let i = 0; i < steps.length; i++) {
      setSteps((prev) => prev.map((s, j) => j === i ? { ...s, status: "running" } : s));
      setRunProgress(Math.round(((i) / steps.length) * 100));
      const duration = 1200 + Math.random() * 1200;
      await new Promise((r) => setTimeout(r, duration));
      const records = Math.floor(Math.random() * 500) + 100;
      setTotalRecords((prev) => prev + records);
      setSteps((prev) => prev.map((s, j) => j === i ? { ...s, status: "complete", duration: Math.round(duration), recordsProcessed: records } : s));
    }
    setRunProgress(100);
    setIsRunning(false);
    toast.success("Pipeline completed successfully!");
  };

  const resetPipeline = () => {
    setSteps((prev) => prev.map((s) => ({ ...s, status: "idle", duration: undefined, recordsProcessed: undefined })));
    setTotalRecords(0);
    setRunProgress(0);
  };

  const duplicatePipeline = () => {
    toast.success("Pipeline duplicated");
  };

  const currentStep = steps.find((s) => s.id === selectedStep);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Workflow className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Clinical Pipeline Builder</h1>
            <p className="text-xs text-muted-foreground">No-code drag-and-drop data processing workflows</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={duplicatePipeline}>
            <Copy className="w-3 h-3" /> Duplicate
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => toast.success("Pipeline saved")}>
            <Save className="w-3 h-3" /> Save
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={resetPipeline} disabled={isRunning}>
            <Zap className="w-3 h-3" /> Reset
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={runPipeline} disabled={isRunning || steps.length === 0}>
            {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            {isRunning ? "Running..." : "Run Pipeline"}
          </Button>
        </div>
      </div>

      {/* Run Progress */}
      {(isRunning || runProgress === 100) && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                <span className="text-sm font-medium text-foreground">{isRunning ? "Processing..." : "Pipeline Complete"}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{totalRecords.toLocaleString()} records processed</span>
                <span>{runProgress}%</span>
              </div>
            </div>
            <Progress value={runProgress} className="h-2" />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="builder">
        <TabsList>
          <TabsTrigger value="builder" className="gap-1.5 text-xs">
            <Workflow className="w-3.5 h-3.5" /> Builder
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5" /> Saved Pipelines ({savedPipelines.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-4">
          <div className="flex gap-4 min-h-[55vh]">
            {/* Step Library */}
            <Card className="w-64 flex-shrink-0 hidden lg:block">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Step Library</CardTitle>
                <CardDescription className="text-xs">Click to add steps</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(55vh-100px)]">
                  <div className="space-y-2">
                    {stepTemplates.map((template) => (
                      <motion.button
                        key={template.type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left p-3 rounded-lg border border-border hover:border-primary/30 transition-colors ${template.color}`}
                        onClick={() => addStep(template)}
                        disabled={isRunning}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <template.icon className="w-4 h-4" />
                          <span className="text-xs font-semibold">{template.label}</span>
                        </div>
                        <p className="text-[10px] opacity-70">{template.desc}</p>
                      </motion.button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Pipeline Canvas */}
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Input value={pipelineName} onChange={(e) => setPipelineName(e.target.value)} className="text-sm font-semibold h-8 max-w-xs" />
                  <Badge variant="secondary" className="text-[10px]">{steps.length} steps</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {steps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Workflow className="w-12 h-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No steps yet</p>
                    <p className="text-xs text-muted-foreground/60">Add steps from the library to build your pipeline</p>
                  </div>
                ) : (
                  <Reorder.Group axis="y" values={steps} onReorder={setSteps} className="space-y-3">
                    {steps.map((step, index) => (
                      <Reorder.Item key={step.id} value={step}>
                        <motion.div
                          layout
                          className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                            selectedStep === step.id ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/20"
                          }`}
                          onClick={() => setSelectedStep(step.id === selectedStep ? null : step.id)}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 cursor-grab" />
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${step.color}`}>
                            {step.status === "running" ? <Loader2 className="w-4 h-4 animate-spin" /> :
                             step.status === "complete" ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                             step.status === "error" ? <AlertCircle className="w-4 h-4 text-destructive" /> :
                             <step.icon className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{step.label}</span>
                              <Badge variant="outline" className="text-[9px]">Step {index + 1}</Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {Object.entries(step.config).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                            </p>
                            {step.duration && (
                              <p className="text-[10px] text-green-500 mt-0.5">
                                ✓ {(step.duration / 1000).toFixed(1)}s · {step.recordsProcessed?.toLocaleString()} records
                              </p>
                            )}
                          </div>
                          {index < steps.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />}
                          <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={(e) => { e.stopPropagation(); removeStep(step.id); }} disabled={isRunning}>
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        </motion.div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                )}
                <div className="lg:hidden mt-4">
                  <Button variant="outline" className="w-full gap-2" onClick={() => addStep(stepTemplates[0])} disabled={isRunning}>
                    <Plus className="w-4 h-4" /> Add Step
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Step Config Panel */}
            {currentStep && (
              <Card className="w-72 flex-shrink-0 hidden xl:block">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Step Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Step Name</label>
                    <Input
                      value={currentStep.label}
                      onChange={(e) => setSteps((prev) => prev.map((s) => s.id === currentStep.id ? { ...s, label: e.target.value } : s))}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  {stepConfigFields[currentStep.type]?.map((field) => (
                    <div key={field.label}>
                      <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                      <Select
                        value={currentStep.config[field.label] || field.options[0]}
                        onValueChange={(val) =>
                          setSteps((prev) => prev.map((s) => s.id === currentStep.id ? { ...s, config: { ...s.config, [field.label]: val } } : s))
                        }
                      >
                        <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {field.options.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <Badge variant="outline" className="mt-1 capitalize text-xs block w-fit">{currentStep.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {savedPipelines.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Workflow className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{p.steps} steps</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground">Last run: {p.lastRun}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={p.status === "success" ? "default" : p.status === "failed" ? "destructive" : "secondary"} className="text-[10px]">
                        {p.status === "success" ? "✓ Success" : p.status === "failed" ? "✗ Failed" : "Never Run"}
                      </Badge>
                      <Button variant="outline" size="sm" className="text-xs gap-1">
                        <Play className="w-3 h-3" /> Load
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PipelineBuilderPage;
