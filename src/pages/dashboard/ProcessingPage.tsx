import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const goals = [
  "Business Report", "Data Summary", "Financial Analysis",
  "Market Insights", "Academic Review", "Risk Assessment", "Custom Prompt",
];

const formats = [
  "PDF Report", "Word Document", "Excel Spreadsheet", "PowerPoint Slides",
  "JSON Output", "CSV", "Markdown", "Executive Summary PDF",
];

type Step = "goals" | "formats" | "processing" | "done" | "error";

const ProcessingPage = () => {
  const [step, setStep] = useState<Step>("goals");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project");
  const { user } = useAuth();

  const toggle = (list: string[], item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const startProcessing = async () => {
    if (!projectId) {
      toast.error("No project selected. Please start from a project page.");
      return;
    }
    if (!user) {
      toast.error("Please sign in first.");
      return;
    }

    setStep("processing");
    setProgress(10);

    // Animate progress while waiting for the real edge function
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 8, 85));
    }, 600);

    try {
      const prompt = `Analyze the project data with the following goals: ${selectedGoals.join(", ")}. Generate outputs suitable for these formats: ${selectedFormats.join(", ")}.`;

      const { data, error } = await supabase.functions.invoke("analyze-project", {
        body: { projectId, prompt },
      });

      clearInterval(progressInterval);

      if (error) throw new Error(error.message || "Analysis failed");
      if (data?.error) throw new Error(data.error);

      setProgress(100);
      
      // Store analysis results in session for the reports page
      sessionStorage.setItem(`analysis_${projectId}`, JSON.stringify({
        ...data,
        goals: selectedGoals,
        formats: selectedFormats,
        generatedAt: new Date().toISOString(),
      }));

      setTimeout(() => setStep("done"), 500);
      toast.success("Analysis complete!");
    } catch (err: any) {
      clearInterval(progressInterval);
      setErrorMsg(err.message || "An unexpected error occurred");
      setStep("error");
      toast.error("Analysis failed: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">AI Analysis</h1>
        <p className="text-muted-foreground mt-1">Configure your analysis and output preferences.</p>
        {!projectId && (
          <p className="text-sm text-destructive mt-2">⚠ No project selected. Go to a project first and click "Analyze".</p>
        )}
      </div>

      {step === "goals" && (
        <Card className="shadow-soft">
          <CardHeader><CardTitle>Step 1: Choose Output Goals</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {goals.map((g) => (
              <label key={g} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                <Checkbox checked={selectedGoals.includes(g)} onCheckedChange={() => toggle(selectedGoals, g, setSelectedGoals)} />
                <span className="text-sm font-medium">{g}</span>
              </label>
            ))}
            <Button
              disabled={selectedGoals.length === 0}
              onClick={() => setStep("formats")}
              className="w-full mt-4 bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              Next: Select Formats
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "formats" && (
        <Card className="shadow-soft">
          <CardHeader><CardTitle>Step 2: Select Output Formats (up to 5)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {formats.map((f) => (
              <label key={f} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                <Checkbox
                  checked={selectedFormats.includes(f)}
                  onCheckedChange={() => toggle(selectedFormats, f, setSelectedFormats)}
                  disabled={!selectedFormats.includes(f) && selectedFormats.length >= 5}
                />
                <span className="text-sm font-medium">{f}</span>
              </label>
            ))}
            <Button
              disabled={selectedFormats.length === 0 || !projectId}
              onClick={startProcessing}
              className="w-full mt-4 bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Generate Reports
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "processing" && (
        <Card className="shadow-soft">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
            <h3 className="text-xl font-semibold font-heading mb-2">AI is analyzing your data...</h3>
            <p className="text-muted-foreground mb-6">Extracting insights and generating reports</p>
            <Progress value={progress} className="w-full max-w-sm h-2" />
            <p className="text-sm text-muted-foreground mt-3">{Math.round(progress)}% complete</p>
          </CardContent>
        </Card>
      )}

      {step === "error" && (
        <Card className="shadow-soft border-destructive/30">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <AlertCircle className="w-16 h-16 text-destructive mb-6" />
            <h3 className="text-xl font-semibold font-heading mb-2">Analysis Failed</h3>
            <p className="text-muted-foreground mb-6">{errorMsg}</p>
            <Button onClick={() => { setStep("goals"); setProgress(0); }} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "done" && (
        <Card className="shadow-soft">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <CheckCircle2 className="w-16 h-16 text-success mb-6" />
            <h3 className="text-xl font-semibold font-heading mb-2">Analysis Complete!</h3>
            <p className="text-muted-foreground mb-6">Your reports are ready for download.</p>
            <Button onClick={() => navigate(`/dashboard/projects/${projectId}`)} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              View Results
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProcessingPage;
