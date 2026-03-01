import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const goals = [
  "Business Report", "Data Summary", "Financial Analysis",
  "Market Insights", "Academic Review", "Risk Assessment", "Custom Prompt",
];

const formats = [
  "PDF Report", "Word Document", "Excel Spreadsheet", "PowerPoint Slides",
  "JSON Output", "CSV", "Markdown", "Executive Summary PDF",
];

type Step = "goals" | "formats" | "processing" | "done";

const ProcessingPage = () => {
  const [step, setStep] = useState<Step>("goals");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const toggle = (list: string[], item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const startProcessing = () => {
    setStep("processing");
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setStep("done"), 600);
      }
      setProgress(Math.min(p, 100));
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">AI Analysis</h1>
        <p className="text-muted-foreground mt-1">Configure your analysis and output preferences.</p>
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
              disabled={selectedFormats.length === 0}
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

      {step === "done" && (
        <Card className="shadow-soft">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <CheckCircle2 className="w-16 h-16 text-success mb-6" />
            <h3 className="text-xl font-semibold font-heading mb-2">Analysis Complete!</h3>
            <p className="text-muted-foreground mb-6">Your reports are ready for download.</p>
            <Button onClick={() => navigate("/dashboard/reports")} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              View Reports
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProcessingPage;
