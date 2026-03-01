import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockReports = [
  { name: "Q4 Business Report", format: "PDF", date: "Feb 28, 2026", size: "2.4 MB" },
  { name: "Financial Analysis", format: "XLSX", date: "Feb 27, 2026", size: "1.1 MB" },
  { name: "Market Insights Summary", format: "DOCX", date: "Feb 26, 2026", size: "890 KB" },
  { name: "Data Export", format: "CSV", date: "Feb 25, 2026", size: "340 KB" },
  { name: "Executive Presentation", format: "PPTX", date: "Feb 24, 2026", size: "5.2 MB" },
];

const insights = [
  { icon: TrendingUp, label: "Revenue trend up 12% QoQ", color: "text-success" },
  { icon: BarChart3, label: "Customer retention at 94%", color: "text-primary" },
  { icon: AlertTriangle, label: "Cost anomaly detected in Q3", color: "text-warning" },
];

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Generated Reports</h1>
        <p className="text-muted-foreground mt-1">View insights and download your generated files.</p>
      </div>

      {/* Insights summary */}
      <Card className="shadow-soft">
        <CardHeader><CardTitle>Key Insights</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {insights.map((ins) => (
            <div key={ins.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <ins.icon className={`w-5 h-5 ${ins.color}`} />
              <span className="text-sm font-medium">{ins.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reports list */}
      <Card className="shadow-soft">
        <CardHeader><CardTitle>Downloads</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {mockReports.map((r) => (
            <div key={r.name} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-4">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.date} · {r.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">{r.format}</Badge>
                <Button variant="outline" size="sm">
                  <Download className="w-3 h-3 mr-1" /> Download
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
