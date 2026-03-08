import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, Sparkles, TrendingUp, TrendingDown, Minus, Eye, Code2,
  Download, BarChart3, PieChart, FileText, Table2,
  Lightbulb, Copy, Check, ArrowUp,
  ImageDown, FileSpreadsheet, Brain,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart as RechartsPie, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  AreaChart, Area, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, CartesianGrid,
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

interface PromptHistoryItem {
  prompt: string;
  timestamp: string;
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

const SUGGESTED_PROMPTS = [
  "Show me the key patterns and trends in my data",
  "Create a breakdown of file types and sizes",
  "Identify anomalies and outliers",
  "Compare metrics across categories",
  "What are the top insights from my data?",
];

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
   MAIN ANALYZE VIEW — CHAT-DRIVEN
   ═══════════════════════════════════════════ */
export function AnalyzeView({ files, messages, projectName, projectId }: {
  files: any[];
  messages: any[];
  projectName: string;
  projectId: string;
}) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [inputFocused, setInputFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [prompt]);

  const runAnalysis = useCallback(async (userPrompt: string) => {
    if (!userPrompt.trim()) return;
    setLoading(true);
    setAnalysis(null);
    setPromptHistory(prev => [...prev, { prompt: userPrompt, timestamp: new Date().toISOString() }]);
    setPrompt("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ projectId, prompt: userPrompt }),
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
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    } catch (e: any) {
      toast.error(e.message || "Failed to run analysis");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const handleSubmit = () => {
    if (prompt.trim() && !loading) {
      runAnalysis(prompt);
    }
  };

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
    <div className="flex flex-col h-full relative z-10">
      {/* ─── Scrollable Results Area ─── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[960px] mx-auto py-6 px-6 space-y-6">
          {/* Empty state */}
          {!analysis && !loading && promptHistory.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-6">
                <motion.div
                  className="absolute inset-0 rounded-[28px] bg-primary/15 blur-2xl"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <div
                  className="relative w-20 h-20 rounded-[22px] bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center"
                  style={{ boxShadow: "0 8px 32px hsl(var(--primary) / 0.25)" }}
                >
                  <BarChart3 className="w-8 h-8 text-primary-foreground" />
                  <div className="absolute inset-0 rounded-[22px] bg-gradient-to-b from-white/10 to-transparent" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">What would you like to analyze?</h2>
              <p className="text-sm text-muted-foreground max-w-md mb-8">
                Describe what you want to explore and the AI will generate charts, insights, and data tables automatically.
              </p>

              {/* Suggested prompts */}
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTED_PROMPTS.map((sp, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => { setPrompt(sp); textareaRef.current?.focus(); }}
                    className="px-3.5 py-2 rounded-xl border border-border/50 bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/[0.03] transition-all"
                  >
                    {sp}
                  </motion.button>
                ))}
              </div>

              <p className="text-[10px] text-muted-foreground/40 mt-8">
                {files.length} files and {messages.length} messages available for analysis
              </p>
            </motion.div>
          )}

          {/* Prompt history */}
          {promptHistory.length > 0 && (
            <div className="space-y-4">
              {promptHistory.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <div
                    className="max-w-[75%] rounded-2xl rounded-br-md px-5 py-3.5"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.85))",
                      boxShadow: "0 4px 24px hsl(var(--primary) / 0.2)",
                    }}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-primary-foreground">{item.prompt}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: "0 4px 12px hsl(var(--primary) / 0.2)" }}
              >
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="rounded-2xl rounded-tl-md border border-border/50 bg-card px-5 py-4" style={{ boxShadow: "0 1px 3px hsl(0 0% 0% / 0.04)" }}>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((j) => (
                      <motion.div
                        key={j}
                        className="w-2 h-2 rounded-full bg-primary/50"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: j * 0.15, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">Generating charts, insights & analysis…</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Results ─── */}
          {analysis && !loading && (
            <div ref={resultsRef} className="space-y-8">
              {/* AI response header */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: "0 4px 12px hsl(var(--primary) / 0.2)" }}
                >
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">DataAfro</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest border border-primary/10">Analysis</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50">Generated just now</span>
                </div>
                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50 transition-all">
                        <Download className="w-3.5 h-3.5" /> Export
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={downloadFullReport} className="gap-2 text-xs">
                        <FileText className="w-3.5 h-3.5" /> Full Analysis (JSON)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>

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

              {/* Follow-up suggestion */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="pt-2">
                <p className="text-xs text-muted-foreground/60 text-center mb-3">
                  <Brain className="w-3 h-3 inline mr-1" />
                  Want to dig deeper? Ask a follow-up question below.
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Chat Input (always visible) ─── */}
      <div className="flex-shrink-0 border-t border-border/30 bg-background/60 backdrop-blur-xl relative z-10">
        <div className="max-w-[740px] mx-auto px-4 py-3">
          <div
            className={`relative rounded-2xl border transition-all duration-300 ${
              inputFocused
                ? "border-primary/30 bg-card"
                : "border-border/50 bg-card/60 hover:border-border"
            }`}
            style={{
              boxShadow: inputFocused
                ? "0 0 0 3px hsl(var(--primary) / 0.06), 0 8px 32px hsl(var(--primary) / 0.08)"
                : "0 1px 3px hsl(0 0% 0% / 0.04)",
            }}
          >
            <textarea
              ref={textareaRef}
              placeholder={analysis ? "Ask a follow-up or refine the analysis…" : "Describe what you want to analyze…"}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              rows={1}
              className="w-full bg-transparent border-0 outline-none resize-none text-foreground placeholder:text-muted-foreground/40 px-5 pt-4 pb-1 min-h-[44px] max-h-[160px] text-[15px]"
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground/40 font-medium">
                  <BarChart3 className="w-3 h-3 inline mr-1" />
                  Analyze mode
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!prompt.trim() && !loading && (
                  <span className="text-[10px] text-muted-foreground/30 font-mono hidden sm:inline">⏎ Enter to analyze</span>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || loading}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                    ${prompt.trim() && !loading
                      ? "bg-primary text-primary-foreground hover:scale-105 active:scale-95"
                      : "bg-muted text-muted-foreground/30 cursor-not-allowed"
                    }`}
                  style={prompt.trim() && !loading ? {
                    boxShadow: "0 4px 16px hsl(var(--primary) / 0.25)",
                  } : undefined}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" strokeWidth={2.5} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
