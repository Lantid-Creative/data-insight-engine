import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText, Download, CheckCircle2, Clock, AlertTriangle,
  Building2, Globe, Loader2, Sparkles, FileCheck, BookOpen,
  ScrollText, Stethoscope, TestTubes, Shield, ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface SubmissionDocument {
  id: string;
  name: string;
  type: string;
  status: "ready" | "generating" | "review" | "approved";
  pages: number;
  lastUpdated: string;
}

const templates = [
  { id: "csr", name: "Clinical Study Report (CSR)", agency: "FDA / EMA", icon: BookOpen, sections: 16, desc: "ICH E3 compliant full study report" },
  { id: "safety", name: "Safety Narrative", agency: "FDA", icon: Shield, sections: 8, desc: "Individual case safety reports" },
  { id: "protocol", name: "Study Protocol", agency: "FDA / EMA", icon: ScrollText, sections: 12, desc: "ICH E6(R2) compliant protocol" },
  { id: "ib", name: "Investigator's Brochure", agency: "FDA / EMA", icon: Stethoscope, sections: 10, desc: "Comprehensive IB document" },
  { id: "dsur", name: "DSUR (Annual Safety)", agency: "ICH", icon: TestTubes, sections: 14, desc: "Development Safety Update Report" },
  { id: "pbrer", name: "PBRER", agency: "EMA", icon: FileCheck, sections: 11, desc: "Periodic Benefit-Risk Evaluation" },
];

const sampleDocuments: SubmissionDocument[] = [
  { id: "1", name: "CSR — Phase III CARDIO-TRIAL", type: "Clinical Study Report", status: "approved", pages: 245, lastUpdated: "2024-01-15" },
  { id: "2", name: "Safety Narrative — AE-2024-0042", type: "Safety Narrative", status: "review", pages: 18, lastUpdated: "2024-01-12" },
  { id: "3", name: "Protocol Amendment v3.2", type: "Study Protocol", status: "ready", pages: 86, lastUpdated: "2024-01-10" },
];

const RegulatorySubmissionPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [studyName, setStudyName] = useState("");
  const [studyDescription, setStudyDescription] = useState("");
  const [targetAgency, setTargetAgency] = useState("fda");

  const handleGenerate = () => {
    if (!selectedTemplate) return toast.error("Select a template first");
    setGenerating(true);
    setGenProgress(0);
    const interval = setInterval(() => {
      setGenProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setGenerating(false);
          toast.success("Document generated successfully!");
          return 100;
        }
        return prev + 2;
      });
    }, 100);
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

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          {/* Template Selection */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Choose Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.map((t) => (
                <motion.div
                  key={t.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      selectedTemplate === t.id
                        ? "border-primary bg-primary/5 shadow-glow"
                        : "hover:border-primary/20"
                    }`}
                    onClick={() => setSelectedTemplate(t.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          selectedTemplate === t.id ? "bg-primary/10" : "bg-muted"
                        }`}>
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

          {/* Study Details */}
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
                      <Input
                        placeholder="e.g., CARDIO-TRIAL Phase III"
                        value={studyName}
                        onChange={(e) => setStudyName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Target Agency</label>
                      <Select value={targetAgency} onValueChange={setTargetAgency}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
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
                    <Textarea
                      placeholder="Brief description of the study objectives and methodology..."
                      value={studyDescription}
                      onChange={(e) => setStudyDescription(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  {generating ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm text-foreground">Generating document...</span>
                        <span className="text-xs text-muted-foreground ml-auto">{genProgress}%</span>
                      </div>
                      <Progress value={genProgress} className="h-2" />
                    </div>
                  ) : (
                    <Button onClick={handleGenerate} className="gap-2">
                      <Sparkles className="w-4 h-4" /> Generate Document
                    </Button>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="w-4 h-4" />
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

export default RegulatorySubmissionPage;
