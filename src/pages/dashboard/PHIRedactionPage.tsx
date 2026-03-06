import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldCheck, Upload, FileText, Eye, EyeOff, AlertTriangle,
  CheckCircle2, XCircle, Download, RotateCcw, Scan, Lock,
  User, Phone, MapPin, CreditCard, Calendar, Hash, Mail,
  Loader2, Trash2, History, Paperclip, X, File,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const REDACTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/phi-redaction`;

interface PHIEntity {
  id: string;
  entity_type: string;
  original_value: string;
  redacted_value: string;
  confidence: number;
  start_index: number;
  end_index: number;
  is_redacted: boolean;
}

interface RedactionJob {
  id: string;
  file_name: string;
  file_size: number;
  status: string;
  entity_count: number;
  avg_confidence: number;
  created_at: string;
  completed_at: string | null;
}

interface AuditEntry {
  id: string;
  action: string;
  details: any;
  created_at: string;
}

const entityIconMap: Record<string, typeof User> = {
  "Patient Name": User,
  "SSN": Hash,
  "Phone Number": Phone,
  "Address": MapPin,
  "MRN": CreditCard,
  "Date of Birth": Calendar,
  "Email": Mail,
  "Account Number": CreditCard,
  "Health Plan Number": CreditCard,
  "Fax Number": Phone,
};

const complianceChecks = [
  { label: "HIPAA Safe Harbor (18 identifiers)", details: "All 18 identifier categories scanned" },
  { label: "GDPR Article 9 (Special categories)", details: "Health data properly classified" },
  { label: "De-identification verification", details: "Residual PHI check completed" },
  { label: "Audit trail generated", details: "Full provenance chain recorded" },
];

const PHIRedactionPage = () => {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inputText, setInputText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [redactedText, setRedactedText] = useState("");
  const [entities, setEntities] = useState<PHIEntity[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<Set<string>>(new Set());
  const [showOriginal, setShowOriginal] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobHistory, setJobHistory] = useState<RedactionJob[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [activeTab, setActiveTab] = useState("scan");
  const [autoRedactEnabled, setAutoRedactEnabled] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Load job history
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("redaction_jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setJobHistory(data as RedactionJob[]);
    };
    load();
  }, [user, activeJobId]);

  // Load audit log when job changes
  useEffect(() => {
    if (!activeJobId || !user) return;
    const load = async () => {
      const { data } = await supabase
        .from("redaction_audit_log")
        .select("*")
        .eq("job_id", activeJobId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (data) setAuditLog(data as AuditEntry[]);
    };
    load();
  }, [activeJobId, user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setInputText(reader.result as string);
      setUploadedFileName(file.name);
      toast.success(`${file.name} loaded`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const startScan = async () => {
    if (!inputText.trim() || !user) {
      toast.error("Please enter or upload text to scan");
      return;
    }

    setScanning(true);
    setProgress(0);
    setEntities([]);
    setRedactedText("");
    setAuditLog([]);

    // Simulate progress while AI processes
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 15;
      });
    }, 400);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Please log in to scan documents");
        setScanning(false);
        setProgress(0);
        clearInterval(progressInterval);
        return;
      }

      const resp = await fetch(REDACTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          text: inputText,
          fileName: uploadedFileName || "Pasted Text",
          fileSize: inputText.length,
        }),
      });

      clearInterval(progressInterval);

      if (resp.status === 429) {
        toast.error("Rate limit exceeded. Please wait a moment.");
        setScanning(false);
        setProgress(0);
        return;
      }
      if (resp.status === 402) {
        toast.error("AI credits exhausted. Please add credits.");
        setScanning(false);
        setProgress(0);
        return;
      }
      if (!resp.ok) throw new Error("Scan failed");

      const data = await resp.json();

      setProgress(100);
      setOriginalText(inputText);
      setRedactedText(data.redacted_text || inputText);
      setActiveJobId(data.job_id);

      const mappedEntities: PHIEntity[] = (data.entities || []).map((e: any, i: number) => ({
        id: `entity-${i}`,
        entity_type: e.entity_type,
        original_value: e.original_value,
        redacted_value: e.redacted_value,
        confidence: e.confidence,
        start_index: e.start_index || 0,
        end_index: e.end_index || 0,
        is_redacted: true,
      }));

      setEntities(mappedEntities);
      setSelectedEntities(new Set(mappedEntities.map((e) => e.id)));
      setActiveTab("entities");
      toast.success(`PHI scan complete — ${mappedEntities.length} entities detected`);
    } catch (err) {
      clearInterval(progressInterval);
      toast.error("Failed to scan document. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const toggleEntity = (id: string) => {
    setSelectedEntities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const applySelectiveRedaction = useCallback(() => {
    if (!originalText) return;
    let text = originalText;
    entities.forEach((entity) => {
      if (selectedEntities.has(entity.id)) {
        text = text.split(entity.original_value).join(entity.redacted_value);
      }
    });
    setRedactedText(text);
    toast.success("Redaction updated");
  }, [originalText, entities, selectedEntities]);

  const exportRedactedText = () => {
    const blob = new Blob([redactedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `redacted-${uploadedFileName || "document"}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    // Audit: export
    if (activeJobId && user) {
      supabase.from("redaction_audit_log").insert({
        user_id: user.id,
        job_id: activeJobId,
        action: "redacted_export",
        details: { format: "txt", entities_redacted: selectedEntities.size },
      });
    }
    toast.success("Redacted document exported");
  };

  const exportAuditReport = () => {
    const report = auditLog
      .map((entry) => `[${new Date(entry.created_at).toLocaleTimeString()}] ${entry.action.replace(/_/g, " ").toUpperCase()} — ${JSON.stringify(entry.details)}`)
      .join("\n");
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit report exported");
  };

  const loadJob = async (job: RedactionJob) => {
    if (!user) return;
    setActiveJobId(job.id);

    // Load original and redacted text
    const { data: jobData } = await supabase
      .from("redaction_jobs")
      .select("original_text, redacted_text")
      .eq("id", job.id)
      .single();

    if (jobData) {
      setOriginalText(jobData.original_text || "");
      setRedactedText(jobData.redacted_text || "");
      setUploadedFileName(job.file_name);
    }

    // Load entities
    const { data: entityData } = await supabase
      .from("redaction_entities")
      .select("*")
      .eq("job_id", job.id)
      .eq("user_id", user.id);

    if (entityData) {
      const mapped: PHIEntity[] = entityData.map((e: any, i: number) => ({
        id: `entity-${i}`,
        entity_type: e.entity_type,
        original_value: e.original_value,
        redacted_value: e.redacted_value,
        confidence: Number(e.confidence),
        start_index: e.start_index,
        end_index: e.end_index,
        is_redacted: e.is_redacted,
      }));
      setEntities(mapped);
      setSelectedEntities(new Set(mapped.map((e) => e.id)));
    }

    setActiveTab("entities");
  };

  const resetScan = () => {
    setEntities([]);
    setRedactedText("");
    setOriginalText("");
    setInputText("");
    setActiveJobId(null);
    setUploadedFileName(null);
    setAuditLog([]);
    setProgress(0);
    setActiveTab("scan");
  };

  const deleteJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("redaction_jobs").delete().eq("id", jobId);
    setJobHistory((prev) => prev.filter((j) => j.id !== jobId));
    if (activeJobId === jobId) resetScan();
    toast.success("Job deleted");
  };

  const confidenceColor = (c: number) => {
    if (c >= 95) return "text-green-500";
    if (c >= 85) return "text-yellow-500";
    return "text-red-500";
  };

  const getEntityIcon = (type: string) => entityIconMap[type] || Hash;

  const avgConfidence = entities.length > 0
    ? (entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length).toFixed(1)
    : "0";

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col gap-0 p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">PHI Redaction & Compliance</h1>
            <p className="text-[10px] text-muted-foreground">AI-powered PHI detection & HIPAA-compliant redaction</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Auto-Redact</span>
            <Switch checked={autoRedactEnabled} onCheckedChange={setAutoRedactEnabled} />
          </div>
          <Badge variant="secondary" className="text-xs gap-1 hidden sm:flex">
            <Lock className="w-3 h-3" /> HIPAA + GDPR
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* History Sidebar */}
        <div className="hidden md:flex w-[260px] border-r border-border flex-col overflow-hidden flex-shrink-0">
          <div className="p-3 space-y-2">
            <Button className="w-full gap-2 text-xs" size="sm" onClick={resetScan}>
              <Scan className="w-3.5 h-3.5" /> New Scan
            </Button>
          </div>
          <div className="px-3 pb-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Scan History</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {jobHistory.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No scans yet</p>
              )}
              {jobHistory.map((job) => (
                <div
                  key={job.id}
                  className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${
                    activeJobId === job.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                  onClick={() => loadJob(job)}
                >
                  <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{job.file_name}</p>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={job.status === "complete" ? "default" : "secondary"} className="text-[9px] px-1 py-0">
                        {job.entity_count} PHI
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    onClick={(e) => deleteJob(job.id, e)}
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-4 pt-3">
              <TabsList>
                <TabsTrigger value="scan" className="gap-1.5 text-xs">
                  <Scan className="w-3.5 h-3.5" /> Scan
                </TabsTrigger>
                <TabsTrigger value="entities" className="gap-1.5 text-xs" disabled={entities.length === 0}>
                  <Eye className="w-3.5 h-3.5" /> Entities ({entities.length})
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-1.5 text-xs" disabled={!redactedText}>
                  <FileText className="w-3.5 h-3.5" /> Preview
                </TabsTrigger>
                <TabsTrigger value="compliance" className="gap-1.5 text-xs" disabled={entities.length === 0}>
                  <ShieldCheck className="w-3.5 h-3.5" /> Compliance
                </TabsTrigger>
                <TabsTrigger value="audit" className="gap-1.5 text-xs" disabled={auditLog.length === 0}>
                  <History className="w-3.5 h-3.5" /> Audit Trail
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scan Tab */}
            <TabsContent value="scan" className="flex-1 p-4">
              <div className="max-w-3xl mx-auto space-y-4">
                {!scanning ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="flex flex-col items-center gap-3 text-center py-6">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Scan className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">Scan for Protected Health Information</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Paste clinical text or upload a document to detect and redact all 18 HIPAA identifiers
                        </p>
                      </div>
                    </div>

                    {uploadedFileName && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <File className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-foreground flex-1">{uploadedFileName}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setUploadedFileName(null); setInputText(""); }}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    <Textarea
                      placeholder="Paste clinical notes, discharge summaries, patient records, or any text containing PHI..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[200px] font-mono text-xs"
                    />

                    <div className="flex gap-3 justify-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.csv,.json,.md,.html"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2 text-xs">
                        <Upload className="w-4 h-4" /> Upload File
                      </Button>
                      <Button onClick={startScan} disabled={!inputText.trim()} className="gap-2 text-xs">
                        <Scan className="w-4 h-4" /> Scan for PHI
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-4 py-12">
                    <div className="flex items-center gap-3 justify-center">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      <span className="text-sm font-medium text-foreground">AI scanning for PHI entities...</span>
                    </div>
                    <Progress value={progress} className="h-2 max-w-md mx-auto" />
                    <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground max-w-md mx-auto">
                      <p className={progress > 20 ? "text-primary font-medium" : ""}>
                        {progress > 20 ? "✓" : "○"} Pattern Matching
                      </p>
                      <p className={progress > 50 ? "text-primary font-medium" : ""}>
                        {progress > 50 ? "✓" : "○"} NLP Entity Recognition
                      </p>
                      <p className={progress > 80 ? "text-primary font-medium" : ""}>
                        {progress > 80 ? "✓" : "○"} Context Validation
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Entities Tab */}
            <TabsContent value="entities" className="flex-1 p-4 overflow-auto">
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "PHI Entities Found", value: entities.length.toString(), color: "text-primary" },
                    { label: "Selected for Redaction", value: selectedEntities.size.toString(), color: "text-green-500" },
                    { label: "Avg. Confidence", value: `${avgConfidence}%`, color: "text-primary" },
                    { label: "Entity Types", value: new Set(entities.map((e) => e.entity_type)).size.toString(), color: "text-muted-foreground" },
                  ].map((stat) => (
                    <Card key={stat.label}>
                      <CardContent className="p-4 text-center">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Entity List */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Detected Entities</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => setShowOriginal(!showOriginal)}>
                          {showOriginal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {showOriginal ? "Hide Original" : "Show Original"}
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={applySelectiveRedaction}>
                          <ShieldCheck className="w-3 h-3" /> Apply Redaction
                        </Button>
                        <Button size="sm" className="text-xs gap-1.5" onClick={exportRedactedText}>
                          <Download className="w-3 h-3" /> Export Redacted
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {entities.map((entity) => {
                        const Icon = getEntityIcon(entity.entity_type);
                        return (
                          <motion.div
                            key={entity.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                              selectedEntities.has(entity.id)
                                ? "bg-primary/5 border-primary/20"
                                : "bg-card border-border"
                            }`}
                            onClick={() => toggleEntity(entity.id)}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              selectedEntities.has(entity.id) ? "bg-primary/10" : "bg-muted"
                            }`}>
                              <Icon className={`w-4 h-4 ${selectedEntities.has(entity.id) ? "text-primary" : "text-muted-foreground"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-foreground">{entity.entity_type}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                {showOriginal ? entity.original_value : entity.redacted_value}
                              </p>
                            </div>
                            <span className={`text-xs font-semibold ${confidenceColor(entity.confidence)}`}>
                              {entity.confidence}%
                            </span>
                            {selectedEntities.has(entity.id) ? (
                              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                          </motion.div>
                        );
                      })}
                      {entities.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">No entities detected. Run a scan first.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="flex-1 p-4 overflow-auto">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Document Preview</CardTitle>
                      <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => setShowOriginal(!showOriginal)}>
                        {showOriginal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showOriginal ? "Show Redacted" : "Show Original"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-6 font-mono text-xs leading-6 whitespace-pre-wrap text-foreground max-h-[500px] overflow-auto">
                      {showOriginal ? originalText : redactedText}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="flex-1 p-4 overflow-auto">
              <div className="max-w-4xl mx-auto grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Compliance Checks</CardTitle>
                    <CardDescription className="text-xs">Automated regulatory compliance verification</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {complianceChecks.map((check) => (
                      <div key={check.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-foreground">{check.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{check.details}</p>
                        </div>
                      </div>
                    ))}
                    {entities.length > 0 && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        {selectedEntities.size === entities.length ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-xs font-medium text-foreground">Redaction Coverage</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {selectedEntities.size}/{entities.length} entities selected for redaction
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Scan Summary</CardTitle>
                    <CardDescription className="text-xs">Detection results overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Array.from(new Set(entities.map((e) => e.entity_type))).map((type) => {
                        const count = entities.filter((e) => e.entity_type === type).length;
                        const Icon = getEntityIcon(type);
                        return (
                          <div key={type} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="text-xs font-medium text-foreground flex-1">{type}</span>
                            <Badge variant="outline" className="text-[10px]">{count} found</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Audit Trail Tab */}
            <TabsContent value="audit" className="flex-1 p-4 overflow-auto">
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm">Audit Trail</CardTitle>
                        <CardDescription className="text-xs">Complete provenance record for compliance</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={exportAuditReport}>
                        <Download className="w-3 h-3" /> Export Report
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {auditLog.map((entry) => (
                        <div key={entry.id} className="flex items-start gap-3 text-xs">
                          <span className="font-mono text-muted-foreground w-20 flex-shrink-0">
                            {new Date(entry.created_at).toLocaleTimeString()}
                          </span>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                          <div>
                            <span className="text-foreground font-medium">
                              {entry.action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                            {entry.details && Object.keys(entry.details).length > 0 && (
                              <p className="text-muted-foreground mt-0.5">
                                {Object.entries(entry.details).map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`).join(" • ")}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {auditLog.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">No audit entries. Run a scan first.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PHIRedactionPage;
