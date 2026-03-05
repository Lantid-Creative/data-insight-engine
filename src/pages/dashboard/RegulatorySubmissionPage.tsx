import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText, Download, CheckCircle2, Clock, AlertTriangle,
  Globe, Loader2, Sparkles, FileCheck, BookOpen,
  ScrollText, Stethoscope, TestTubes, Shield, ChevronRight,
  Eye, Printer, Copy, BarChart3, ListChecks,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { exportToDocx, exportToPdf } from "@/lib/document-export";

interface SubmissionDocument {
  id: string;
  name: string;
  type: string;
  status: "ready" | "generating" | "review" | "approved";
  pages: number;
  lastUpdated: string;
  sections?: { name: string; status: "complete" | "draft" | "missing" }[];
}

const templates = [
  { id: "csr", name: "Clinical Study Report (CSR)", agency: "FDA / EMA", icon: BookOpen, sections: 16, desc: "ICH E3 compliant full study report" },
  { id: "safety", name: "Safety Narrative", agency: "FDA", icon: Shield, sections: 8, desc: "Individual case safety reports" },
  { id: "protocol", name: "Study Protocol", agency: "FDA / EMA", icon: ScrollText, sections: 12, desc: "ICH E6(R2) compliant protocol" },
  { id: "ib", name: "Investigator's Brochure", agency: "FDA / EMA", icon: Stethoscope, sections: 10, desc: "Comprehensive IB document" },
  { id: "dsur", name: "DSUR (Annual Safety)", agency: "ICH", icon: TestTubes, sections: 14, desc: "Development Safety Update Report" },
  { id: "pbrer", name: "PBRER", agency: "EMA", icon: FileCheck, sections: 11, desc: "Periodic Benefit-Risk Evaluation" },
];

const csrSections = [
  "Title Page", "Synopsis", "Table of Contents", "List of Abbreviations",
  "Ethics", "Investigators & Study Admin Sites", "Introduction",
  "Study Objectives", "Investigational Plan", "Study Patients",
  "Efficacy Evaluation", "Safety Evaluation", "Discussion & Conclusions",
  "Tables & Figures", "Reference List", "Appendices",
];

const sampleDocuments: SubmissionDocument[] = [
  {
    id: "1", name: "CSR — Phase III CARDIO-TRIAL", type: "Clinical Study Report", status: "approved", pages: 245, lastUpdated: "2024-01-15",
    sections: csrSections.map((s, i) => ({ name: s, status: i < 14 ? "complete" as const : "draft" as const })),
  },
  {
    id: "2", name: "Safety Narrative — AE-2024-0042", type: "Safety Narrative", status: "review", pages: 18, lastUpdated: "2024-01-12",
    sections: ["Patient Info", "Adverse Event", "Medical History", "Concomitant Meds", "Narrative", "Assessment", "Follow-up", "Conclusion"].map((s, i) => ({
      name: s, status: i < 6 ? "complete" as const : "draft" as const,
    })),
  },
  {
    id: "3", name: "Protocol Amendment v3.2", type: "Study Protocol", status: "ready", pages: 86, lastUpdated: "2024-01-10",
    sections: ["Title Page", "Synopsis", "Background", "Objectives", "Study Design", "Population", "Treatments", "Assessments", "Statistics", "Ethics", "References", "Amendments"].map((s, i) => ({
      name: s, status: i < 10 ? "complete" as const : "missing" as const,
    })),
  },
];

const complianceChecks = [
  { label: "ICH E3 Structure Compliance", passed: true },
  { label: "Section Completeness", passed: true },
  { label: "Cross-reference Integrity", passed: true },
  { label: "Statistical Tables Format", passed: false },
  { label: "Patient Data Anonymization", passed: true },
  { label: "Regulatory Agency Formatting", passed: true },
  { label: "Electronic Signature Ready", passed: false },
];

const RegulatorySubmissionPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genSection, setGenSection] = useState("");
  const [studyName, setStudyName] = useState("");
  const [studyDescription, setStudyDescription] = useState("");
  const [targetAgency, setTargetAgency] = useState("fda");
  const [viewDoc, setViewDoc] = useState<SubmissionDocument | null>(null);

  const handleGenerate = () => {
    if (!selectedTemplate) return toast.error("Select a template first");
    if (!studyName.trim()) return toast.error("Enter a study name");
    setGenerating(true);
    setGenProgress(0);

    const template = templates.find((t) => t.id === selectedTemplate);
    const sectionNames = selectedTemplate === "csr" ? csrSections : Array.from({ length: template?.sections || 8 }, (_, i) => `Section ${i + 1}`);
    let idx = 0;

    const interval = setInterval(() => {
      setGenProgress((prev) => {
        const next = prev + (100 / sectionNames.length);
        if (idx < sectionNames.length) {
          setGenSection(sectionNames[idx]);
          idx++;
        }
        if (next >= 100) {
          clearInterval(interval);
          setGenerating(false);
          setGenSection("");
          toast.success("Document generated successfully!");
          return 100;
        }
        return next;
      });
    }, 600);
  };

  const statusBadge = (status: SubmissionDocument["status"]) => {
    const map = {
      ready: { label: "Ready", variant: "secondary" as const, icon: CheckCircle2 },
      generating: { label: "Generating", variant: "secondary" as const, icon: Loader2 },
      review: { label: "In Review", variant: "outline" as const, icon: Clock },
      approved: { label: "Approved", variant: "default" as const, icon: CheckCircle2 },
    };
    const m = map[status];
    return (
      <Badge variant={m.variant} className="text-[10px] gap-1">
        <m.icon className={`w-3 h-3 ${status === "generating" ? "animate-spin" : ""}`} />
        {m.label}
      </Badge>
    );
  };

  const exportDocumentDocx = (doc: SubmissionDocument) => {
    const md = buildRegulatoryMarkdown(doc);
    exportToDocx(md, `${doc.name.replace(/\s+/g, "_")}`);
    toast.success("DOCX exported successfully");
  };

  const exportDocumentPdf = (doc: SubmissionDocument) => {
    const md = buildRegulatoryMarkdown(doc);
    exportToPdf(md, `${doc.name.replace(/\s+/g, "_")}`);
    toast.success("PDF exported successfully");
  };

  const sectionStatusIcon = (status: string) => {
    if (status === "complete") return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
    if (status === "draft") return <Clock className="w-3.5 h-3.5 text-yellow-500" />;
    return <AlertTriangle className="w-3.5 h-3.5 text-destructive" />;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Regulatory Submission Generator</h1>
            <p className="text-xs text-muted-foreground">One-click FDA/EMA submission-ready documents</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs gap-1">
          <Globe className="w-3 h-3" /> ICH Compliant
        </Badge>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate" className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Generate New
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5">
            <FileText className="w-3.5 h-3.5" /> My Documents ({sampleDocuments.length})
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-1.5">
            <ListChecks className="w-3.5 h-3.5" /> Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Choose Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.map((t) => (
                <motion.div key={t.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Card
                    className={`cursor-pointer transition-all ${selectedTemplate === t.id ? "border-primary bg-primary/5 shadow-glow" : "hover:border-primary/20"}`}
                    onClick={() => setSelectedTemplate(t.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedTemplate === t.id ? "bg-primary/10" : "bg-muted"}`}>
                          <t.icon className={`w-4 h-4 ${selectedTemplate === t.id ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[9px]">{t.agency}</Badge>
                            <span className="text-[9px] text-muted-foreground">{t.sections} sections</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {selectedTemplate && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Study Details</CardTitle>
                  <CardDescription className="text-xs">Provide study information for document generation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Study Name</label>
                      <Input placeholder="e.g., CARDIO-TRIAL Phase III" value={studyName} onChange={(e) => setStudyName(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Target Agency</label>
                      <Select value={targetAgency} onValueChange={setTargetAgency}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fda">FDA (United States)</SelectItem>
                          <SelectItem value="ema">EMA (European Union)</SelectItem>
                          <SelectItem value="pmda">PMDA (Japan)</SelectItem>
                          <SelectItem value="hc">Health Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Study Description</label>
                    <Textarea placeholder="Brief description of the study objectives and methodology..." value={studyDescription} onChange={(e) => setStudyDescription(e.target.value)} className="mt-1" rows={3} />
                  </div>
                  {generating ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm text-foreground">Generating: <span className="font-medium">{genSection}</span></span>
                        <span className="text-xs text-muted-foreground ml-auto">{Math.round(genProgress)}%</span>
                      </div>
                      <Progress value={genProgress} className="h-2" />
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleGenerate} className="gap-2">
                        <Sparkles className="w-4 h-4" /> Generate Document
                      </Button>
                      {genProgress === 100 && (
                        <Button variant="outline" className="gap-2">
                          <Download className="w-4 h-4" /> Download
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {sampleDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{doc.type}</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground">{doc.pages} pages</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground">{doc.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusBadge(doc.status)}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewDoc(doc)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success("Document downloaded")}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ListChecks className="w-4 h-4" /> Compliance Checklist
                </CardTitle>
                <CardDescription className="text-xs">Automated regulatory compliance verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {complianceChecks.map((check) => (
                  <div key={check.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {check.passed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                      <span className="text-xs text-foreground">{check.label}</span>
                    </div>
                    <Badge variant={check.passed ? "default" : "secondary"} className="text-[10px]">
                      {check.passed ? "Passed" : "Action Required"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Compliance Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-5xl font-bold text-foreground">
                    {Math.round((complianceChecks.filter((c) => c.passed).length / complianceChecks.length) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Overall Compliance</p>
                </div>
                <Progress value={(complianceChecks.filter((c) => c.passed).length / complianceChecks.length) * 100} className="h-3" />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-green-500">{complianceChecks.filter((c) => c.passed).length}</p>
                    <p className="text-[10px] text-muted-foreground">Checks Passed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-yellow-500">{complianceChecks.filter((c) => !c.passed).length}</p>
                    <p className="text-[10px] text-muted-foreground">Action Required</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Document Viewer Dialog */}
      <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" /> {viewDoc?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 mb-4">
            {viewDoc && statusBadge(viewDoc.status)}
            <span className="text-xs text-muted-foreground">{viewDoc?.pages} pages</span>
            <div className="ml-auto flex gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => toast.success("Copied to clipboard")}>
                <Copy className="w-3 h-3" /> Copy
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => toast.success("Sent to printer")}>
                <Printer className="w-3 h-3" /> Print
              </Button>
            </div>
          </div>
          <ScrollArea className="max-h-[55vh]">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Document Sections</h4>
              {viewDoc?.sections?.map((section, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground w-6">{i + 1}.</span>
                    {sectionStatusIcon(section.status)}
                    <span className="text-xs font-medium text-foreground">{section.name}</span>
                  </div>
                  <Badge variant="outline" className={`text-[9px] capitalize ${
                    section.status === "complete" ? "text-green-500" :
                    section.status === "draft" ? "text-yellow-500" : "text-destructive"
                  }`}>
                    {section.status}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegulatorySubmissionPage;
