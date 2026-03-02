import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, Sparkles, TrendingUp, TrendingDown, Minus, Eye, Code2,
  Download, RefreshCw, BarChart3, PieChart, FileText, Table2,
  Lightbulb, Copy, Check, ChevronDown, ChevronUp, ArrowRight,
  ImageDown, FileSpreadsheet,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart as RechartsPie, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  AreaChart, Area, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, CartesianGrid, Treemap,
} from "recharts";

/* ─── Types ─── */
interface Insight {
  title: string;
  value: string;
  change: "up" | "down" | "neutral";
  description: string;
}

interface ChartData {
  id: string;
  title: string;
  description: string;
  type: "bar" | "line" | "pie" | "area" | "scatter" | "radar" | "treemap";
  data: any[];
  dataKeys: string[];
  xKey: string;
  code: string;
}

interface TableData {
  id: string;
  title: string;
  description: string;
  headers: string[];
  rows: string[][];
  code: string;
}

interface Recommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface AnalysisResult {
  insights: Insight[];
  charts: ChartData[];
  tables: TableData[];
  recommendations: Recommendation[];
  rawContent?: string;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.7)",
  "hsl(var(--primary) / 0.5)",
  "hsl(var(--primary) / 0.35)",
  "hsl(var(--primary) / 0.2)",
  "hsl(var(--accent-foreground) / 0.6)",
  "hsl(var(--muted-foreground) / 0.4)",
];

const PRIORITY_STYLES = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-[hsl(var(--primary)/0.1)] text-primary border-primary/20",
  low: "bg-muted text-muted-foreground border-border",
};

/* ─── Chart Renderer ─── */
function DynamicChart({ chart }: { chart: ChartData }) {
  const { type, data, dataKeys, xKey } = chart;
  const mainKey = dataKeys?.[0] || "value";

  const tooltipContent = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-card px-3 py-2 shadow-md text-xs">
        <p className="font-medium text-card-foreground mb-1">{label || payload[0]?.name}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-muted-foreground">{p.dataKey}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</p>
        ))}
      </div>
    );
  };

  switch (type) {
    case "pie":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPie>
            <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey={mainKey} label={({ name, value }) => `${name} (${value})`}>
              {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip content={tooltipContent} />
          </RechartsPie>
        </ResponsiveContainer>
      );
    case "bar":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <RechartsTooltip content={tooltipContent} />
            {dataKeys.map((key, i) => <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />)}
          </BarChart>
        </ResponsiveContainer>
      );
    case "line":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <RechartsTooltip content={tooltipContent} />
            {dataKeys.map((key, i) => <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />)}
          </LineChart>
        </ResponsiveContainer>
      );
    case "area":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              {dataKeys.map((key, i) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <RechartsTooltip content={tooltipContent} />
            {dataKeys.map((key, i) => <Area key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} fill={`url(#grad-${key})`} />)}
          </AreaChart>
        </ResponsiveContainer>
      );
    case "scatter":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis dataKey={mainKey} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <RechartsTooltip content={tooltipContent} />
            <Scatter data={data} fill={CHART_COLORS[0]} />
          </ScatterChart>
        </ResponsiveContainer>
      );
    case "radar":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border) / 0.5)" />
            <PolarAngleAxis dataKey={xKey} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <PolarRadiusAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
            <Radar dataKey={mainKey} stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      );
    default:
      return (
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
          Unsupported chart type: {type}
        </div>
      );
  }
}

/* ─── Code Viewer ─── */
function CodeViewer({ code, title }: { code: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-3 rounded-xl border border-border bg-muted/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/50">
          <div className="flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
          </div>
          <button onClick={handleCopy} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="p-4 text-xs font-mono text-foreground overflow-x-auto max-h-[300px] overflow-y-auto leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </motion.div>
  );
}

/* ─── Chart Card with code + download ─── */
function ChartCard({ chart, index }: { chart: ChartData; index: number }) {
  const [showCode, setShowCode] = useState(false);

  const downloadAsPNG = async () => {
    try {
      const chartEl = document.getElementById(`chart-${chart.id}`);
      if (!chartEl) return;
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(chartEl, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = `${chart.title.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Chart downloaded as PNG");
    } catch {
      toast.error("Failed to download chart");
    }
  };

  const downloadAsCSV = () => {
    if (!chart.data?.length) return;
    const headers = Object.keys(chart.data[0]);
    const csv = [headers.join(","), ...chart.data.map(row => headers.map(h => JSON.stringify(row[h] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.download = `${chart.title.replace(/\s+/g, "-").toLowerCase()}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("Data downloaded as CSV");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.08 }}
    >
      <Card className="shadow-soft overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{chart.title}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{chart.description}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowCode(!showCode)}
                className={`p-1.5 rounded-lg text-xs transition-all ${showCode ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                title="View code"
              >
                <Code2 className="w-3.5 h-3.5" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all" title="Download">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={downloadAsPNG} className="gap-2 text-xs">
                    <ImageDown className="w-3.5 h-3.5" /> Download as PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadAsCSV} className="gap-2 text-xs">
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Download data (CSV)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div id={`chart-${chart.id}`} className="h-56 px-3 pb-3">
            <DynamicChart chart={chart} />
          </div>

          <AnimatePresence>
            {showCode && chart.code && (
              <div className="px-5 pb-5">
                <CodeViewer code={chart.code} title="React / Recharts" />
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Table Card ─── */
function TableCard({ table, index }: { table: TableData; index: number }) {
  const [showCode, setShowCode] = useState(false);

  const downloadAsCSV = () => {
    const csv = [table.headers.join(","), ...table.rows.map(r => r.map(c => JSON.stringify(c)).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.download = `${table.title.replace(/\s+/g, "-").toLowerCase()}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("Table data downloaded as CSV");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.08 }}
    >
      <Card className="shadow-soft overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{table.title}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{table.description}</p>
            </div>
            <div className="flex items-center gap-1">
              {table.code && (
                <button
                  onClick={() => setShowCode(!showCode)}
                  className={`p-1.5 rounded-lg text-xs transition-all ${showCode ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={downloadAsCSV} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all" title="Download CSV">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="px-5 pb-5 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  {table.headers.map((h, i) => (
                    <th key={i} className="text-left px-3 py-2 bg-muted/60 text-muted-foreground font-semibold border-b border-border first:rounded-tl-lg last:rounded-tr-lg">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-muted/30 transition-colors">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 border-b border-border/50 text-foreground">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AnimatePresence>
            {showCode && table.code && (
              <div className="px-5 pb-5">
                <CodeViewer code={table.code} title="React Component" />
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN ANALYZE VIEW
   ═══════════════════════════════════════════ */
export function AnalyzeView({ files, messages, projectName, projectId }: {
  files: any[];
  messages: any[];
  projectName: string;
  projectId: string;
}) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);

  const runAnalysis = useCallback(async (prompt?: string) => {
    setLoading(true);
    setAnalysis(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ projectId, prompt }),
      });

      if (resp.status === 429) { toast.error("Rate limit exceeded. Try again shortly."); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted. Add credits to continue."); return; }
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Analysis failed" }));
        throw new Error(err.error);
      }

      const data = await resp.json();
      setAnalysis(data);
      toast.success("Analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Failed to run analysis");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const downloadFullReport = async () => {
    if (!analysis) return;
    try {
      const report = JSON.stringify(analysis, null, 2);
      const blob = new Blob([report], { type: "application/json" });
      const link = document.createElement("a");
      link.download = `${projectName}-analysis.json`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Full analysis downloaded");
    } catch { toast.error("Download failed"); }
  };

  return (
    <div className="flex-1 overflow-y-auto relative z-10">
      <div className="max-w-[960px] mx-auto py-8 px-6 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analyze: {projectName}</h1>
            <p className="text-sm text-muted-foreground mt-1">AI-powered data visualizations, code, and insights</p>
          </div>
          <div className="flex items-center gap-2">
            {analysis && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-3.5 h-3.5" /> Export All
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={downloadFullReport} className="gap-2 text-xs">
                    <FileText className="w-3.5 h-3.5" /> Full Analysis (JSON)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              size="sm"
              onClick={() => runAnalysis(customPrompt || undefined)}
              disabled={loading}
              className="gap-2"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : analysis ? <RefreshCw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              {loading ? "Analyzing…" : analysis ? "Re-analyze" : "Run Analysis"}
            </Button>
          </div>
        </motion.div>

        {/* Custom prompt toggle */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPrompt ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Custom analysis prompt (optional)
          </button>
          <AnimatePresence>
            {showPrompt && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Focus on file size distribution and recommend optimization strategies…"
                  rows={2}
                  className="mt-3 text-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {!analysis && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6" style={{ boxShadow: "0 12px 40px hsl(var(--primary) / 0.2)" }}>
              <BarChart3 className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Ready to analyze</h2>
            <p className="text-sm text-muted-foreground max-w-md mb-2">
              {files.length} files and {messages.length} messages ready for AI analysis.
            </p>
            <p className="text-xs text-muted-foreground/60 max-w-sm mb-6">
              AI will generate dynamic charts, data tables, KPI insights, and actionable recommendations — all with the code to reproduce them.
            </p>
            <Button onClick={() => runAnalysis()} className="gap-2">
              <Sparkles className="w-4 h-4" /> Run Analysis
            </Button>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6"
              style={{ boxShadow: "0 8px 32px hsl(var(--primary) / 0.3)" }}
            >
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </motion.div>
            <h2 className="text-lg font-bold text-foreground mb-1">Analyzing your data…</h2>
            <motion.p
              className="text-sm text-muted-foreground"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Generating visualizations, insights & code
            </motion.p>
          </motion.div>
        )}

        {/* Results */}
        {analysis && !loading && (
          <div className="space-y-8">
            {/* KPI Insights */}
            {analysis.insights?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Key Insights
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {analysis.insights.map((insight, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.04 }}>
                      <Card className="shadow-soft h-full">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{insight.title}</p>
                            {insight.change === "up" && <TrendingUp className="w-3.5 h-3.5 text-primary" />}
                            {insight.change === "down" && <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                            {insight.change === "neutral" && <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
                          </div>
                          <p className="text-lg font-bold text-foreground leading-none mb-1">{insight.value}</p>
                          <p className="text-[10px] text-muted-foreground leading-snug">{insight.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Charts */}
            {analysis.charts?.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <PieChart className="w-3.5 h-3.5" /> Visualizations
                </h2>
                <div className="grid md:grid-cols-2 gap-5">
                  {analysis.charts.map((chart, i) => (
                    <ChartCard key={chart.id} chart={chart} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Tables */}
            {analysis.tables?.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Table2 className="w-3.5 h-3.5" /> Data Tables
                </h2>
                <div className="space-y-5">
                  {analysis.tables.map((table, i) => (
                    <TableCard key={table.id} table={table} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5" /> Recommendations
                </h2>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.06 }}>
                      <Card className="shadow-soft">
                        <CardContent className="p-4 flex items-start gap-3">
                          <span className={`flex-shrink-0 mt-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${PRIORITY_STYLES[rec.priority]}`}>
                            {rec.priority}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{rec.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{rec.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
