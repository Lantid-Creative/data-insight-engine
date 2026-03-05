import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  ShieldCheck, Upload, FileText, Eye, EyeOff, AlertTriangle,
  CheckCircle2, XCircle, Download, RotateCcw, Scan, Lock,
  User, Phone, MapPin, CreditCard, Calendar, Hash,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface PHIEntity {
  id: string;
  type: string;
  original: string;
  redacted: string;
  confidence: number;
  line: number;
  icon: typeof User;
}

const sampleEntities: PHIEntity[] = [
  { id: "1", type: "Patient Name", original: "John Michael Smith", redacted: "[REDACTED_NAME]", confidence: 99, line: 3, icon: User },
  { id: "2", type: "SSN", original: "123-45-6789", redacted: "[REDACTED_SSN]", confidence: 99, line: 7, icon: Hash },
  { id: "3", type: "Phone Number", original: "(555) 123-4567", redacted: "[REDACTED_PHONE]", confidence: 97, line: 12, icon: Phone },
  { id: "4", type: "Address", original: "1234 Oak Street, Springfield, IL", redacted: "[REDACTED_ADDRESS]", confidence: 95, line: 15, icon: MapPin },
  { id: "5", type: "MRN", original: "MRN-20240156", redacted: "[REDACTED_MRN]", confidence: 98, line: 18, icon: CreditCard },
  { id: "6", type: "Date of Birth", original: "03/15/1985", redacted: "[REDACTED_DOB]", confidence: 96, line: 22, icon: Calendar },
];

const complianceChecks = [
  { label: "HIPAA Safe Harbor (18 identifiers)", status: "pass" as const, details: "All 18 identifier categories scanned" },
  { label: "GDPR Article 9 (Special categories)", status: "pass" as const, details: "Health data properly classified" },
  { label: "De-identification verification", status: "pass" as const, details: "No residual PHI detected" },
  { label: "Audit trail generated", status: "pass" as const, details: "Full provenance chain recorded" },
  { label: "Data retention policy", status: "warning" as const, details: "Review retention period settings" },
];

const PHIRedactionPage = () => {
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);
  const [selectedEntities, setSelectedEntities] = useState<Set<string>>(new Set(sampleEntities.map((e) => e.id)));
  const [autoRedactEnabled, setAutoRedactEnabled] = useState(true);

  const startScan = () => {
    setScanning(true);
    setProgress(0);
    setScanComplete(false);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          setScanComplete(true);
          toast.success("PHI scan complete — 6 entities detected");
          return 100;
        }
        return prev + 4;
      });
    }, 80);
  };

  const toggleEntity = (id: string) => {
    setSelectedEntities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confidenceColor = (c: number) => {
    if (c >= 95) return "text-green-500";
    if (c >= 85) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">PHI Redaction & Compliance</h1>
            <p className="text-xs text-muted-foreground">Auto-detect and redact Protected Health Information</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Auto-Redact</span>
            <Switch checked={autoRedactEnabled} onCheckedChange={setAutoRedactEnabled} />
          </div>
          <Badge variant="secondary" className="text-xs gap-1">
            <Lock className="w-3 h-3" /> HIPAA + GDPR
          </Badge>
        </div>
      </div>

      {/* Upload & Scan */}
      {!scanComplete && (
        <Card>
          <CardContent className="p-8">
            {!scanning ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Scan className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Scan Documents for PHI</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload clinical documents or select from your projects to automatically detect and redact PHI
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={startScan} className="gap-2">
                    <Upload className="w-4 h-4" /> Upload & Scan
                  </Button>
                  <Button variant="outline" onClick={startScan} className="gap-2">
                    <FileText className="w-4 h-4" /> Scan Existing Files
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Scan className="w-5 h-5 text-primary animate-pulse" />
                  <span className="text-sm font-medium text-foreground">Scanning for PHI...</span>
                  <span className="text-xs text-muted-foreground ml-auto">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
                  <div>
                    <p className={progress > 30 ? "text-primary font-medium" : ""}>
                      {progress > 30 ? "✓" : "○"} Pattern Matching
                    </p>
                  </div>
                  <div>
                    <p className={progress > 60 ? "text-primary font-medium" : ""}>
                      {progress > 60 ? "✓" : "○"} NLP Entity Recognition
                    </p>
                  </div>
                  <div>
                    <p className={progress > 90 ? "text-primary font-medium" : ""}>
                      {progress > 90 ? "✓" : "○"} Context Validation
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {scanComplete && (
        <Tabs defaultValue="entities" className="space-y-4">
          <TabsList>
            <TabsTrigger value="entities" className="gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Detected PHI ({sampleEntities.length})
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Document Preview
            </TabsTrigger>
            <TabsTrigger value="compliance" className="gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Compliance Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entities">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Stats */}
              <div className="lg:col-span-3 grid grid-cols-4 gap-3">
                {[
                  { label: "PHI Entities Found", value: "6", color: "text-primary" },
                  { label: "Auto-Redacted", value: selectedEntities.size.toString(), color: "text-green-500" },
                  { label: "Avg. Confidence", value: "97.3%", color: "text-primary" },
                  { label: "Document Pages", value: "12", color: "text-muted-foreground" },
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
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Detected Entities</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => setShowOriginal(!showOriginal)}>
                          {showOriginal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {showOriginal ? "Hide Original" : "Show Original"}
                        </Button>
                        <Button size="sm" className="text-xs gap-1.5">
                          <Download className="w-3 h-3" /> Export Redacted
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {sampleEntities.map((entity) => (
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
                            <entity.icon className={`w-4 h-4 ${selectedEntities.has(entity.id) ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-foreground">{entity.type}</span>
                              <Badge variant="outline" className="text-[10px]">Line {entity.line}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                              {showOriginal ? entity.original : entity.redacted}
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
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardContent className="p-6">
                <div className="bg-muted rounded-lg p-6 font-mono text-xs leading-6 whitespace-pre-wrap text-foreground">
{`PATIENT DISCHARGE SUMMARY
================================
Patient: ${showOriginal ? "John Michael Smith" : "[REDACTED_NAME]"}
DOB: ${showOriginal ? "03/15/1985" : "[REDACTED_DOB]"}
MRN: ${showOriginal ? "MRN-20240156" : "[REDACTED_MRN]"}
SSN: ${showOriginal ? "123-45-6789" : "[REDACTED_SSN]"}

ADMISSION DATE: 01/15/2024
DISCHARGE DATE: 01/22/2024

ATTENDING PHYSICIAN: Dr. Sarah Johnson
DEPARTMENT: Cardiology

CHIEF COMPLAINT: Chest pain, shortness of breath

DIAGNOSIS: 
- Acute myocardial infarction (ICD-10: I21.9)
- Hypertension (ICD-10: I10)
- Type 2 Diabetes Mellitus (ICD-10: E11.9)

CONTACT: ${showOriginal ? "(555) 123-4567" : "[REDACTED_PHONE]"}
ADDRESS: ${showOriginal ? "1234 Oak Street, Springfield, IL" : "[REDACTED_ADDRESS]"}

MEDICATIONS ON DISCHARGE:
1. Aspirin 81mg daily
2. Metoprolol 50mg twice daily
3. Lisinopril 10mg daily
4. Metformin 500mg twice daily
5. Atorvastatin 40mg daily`}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Compliance Checks</CardTitle>
                  <CardDescription>Automated regulatory compliance verification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {complianceChecks.map((check) => (
                    <div key={check.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      {check.status === "pass" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-medium text-foreground">{check.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{check.details}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Audit Trail</CardTitle>
                  <CardDescription>Complete provenance record</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { time: "10:32:14", event: "Document uploaded for scanning" },
                      { time: "10:32:16", event: "PHI detection initiated (3 passes)" },
                      { time: "10:32:28", event: "6 PHI entities detected" },
                      { time: "10:32:29", event: "Auto-redaction applied" },
                      { time: "10:32:30", event: "Compliance report generated" },
                      { time: "10:32:31", event: "Audit trail sealed with hash" },
                    ].map((entry, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <span className="font-mono text-muted-foreground w-16">{entry.time}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-foreground">{entry.event}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4 text-xs gap-1.5">
                    <Download className="w-3 h-3" /> Export Audit Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {scanComplete && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="gap-2" onClick={() => { setScanComplete(false); setProgress(0); }}>
            <RotateCcw className="w-4 h-4" /> New Scan
          </Button>
          <Button className="gap-2" onClick={() => toast.success("Redacted document exported successfully")}>
            <Download className="w-4 h-4" /> Export All
          </Button>
        </div>
      )}
    </div>
  );
};

export default PHIRedactionPage;
