import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Globe, Activity, TrendingUp, AlertTriangle, MapPin,
  RefreshCcw, Download, Bug, Thermometer,
  BarChart3, ArrowUpRight, ArrowDownRight, Minus,
  Loader2, Search, Sparkles, FileText, Clock, X, CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const PIE_COLORS = [
  "hsl(24, 95%, 53%)",
  "hsl(200, 80%, 50%)",
  "hsl(152, 69%, 40%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 60%, 55%)",
];

interface EpidemicData {
  summary: string;
  totalCases: number;
  activeOutbreaks: number;
  resolvedOutbreaks: number;
  affectedRegions: number;
  trendData: { date: string; cases: number; deaths: number; recovered: number }[];
  regionData: { name: string; cases: number; change: number; status: string }[];
  diseaseBreakdown: { name: string; value: number }[];
  alerts: {
    severity: string; title: string; description: string;
    region: string; diseaseCategory: string; caseCount: number; changePercent: number;
  }[];
}

interface SavedReport {
  id: string;
  title: string;
  summary: string;
  created_at: string;
  time_range: string;
  disease_filter: string;
  total_cases: number;
  alert_count: number;
  trend_data: any;
  regions: any;
  disease_data: any;
}

const EpidemicDashboardPage = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("6m");
  const [diseaseFilter, setDiseaseFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EpidemicData | null>(null);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [deepQuery, setDeepQuery] = useState("");
  const [deepAnalysis, setDeepAnalysis] = useState("");
  const [deepLoading, setDeepLoading] = useState(false);
  const [deepOpen, setDeepOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  const loadReports = async () => {
    const { data: reps } = await supabase
      .from("epidemic_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (reps) setReports(reps as unknown as SavedReport[]);
  };

  const runAnalysis = async () => {
    if (!user) return toast.error("Please log in first");
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/epidemic-intel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ action: "analyze", timeRange, diseaseFilter }),
        }
      );
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error || "Analysis failed");

      setData(result.data);

      // Save report
      await supabase.from("epidemic_reports").insert({
        user_id: user.id,
        title: `Surveillance Report — ${new Date().toLocaleDateString()}`,
        summary: result.data.summary,
        report_type: "surveillance",
        regions: result.data.regionData,
        disease_data: result.data.diseaseBreakdown,
        trend_data: result.data.trendData,
        alert_count: result.data.alerts?.length || 0,
        total_cases: result.data.totalCases,
        time_range: timeRange,
        disease_filter: diseaseFilter,
      });

      // Save alerts
      if (result.data.alerts?.length) {
        const alertInserts = result.data.alerts.map((a: any) => ({
          user_id: user.id,
          severity: a.severity,
          title: a.title,
          description: a.description,
          region: a.region,
          disease_category: a.diseaseCategory,
          case_count: a.caseCount,
          change_percent: a.changePercent,
        }));
        await supabase.from("epidemic_alerts").insert(alertInserts);
      }

      loadReports();
      toast.success("Analysis complete — report saved");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runDeepAnalysis = async () => {
    if (!deepQuery.trim()) return;
    setDeepLoading(true);
    setDeepOpen(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/epidemic-intel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ action: "deep-analysis", customQuery: deepQuery, timeRange, diseaseFilter }),
        }
      );
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error);
      setDeepAnalysis(result.analysis);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeepLoading(false);
    }
  };

  const loadReport = (report: SavedReport) => {
    setData({
      summary: report.summary || "",
      totalCases: report.total_cases || 0,
      activeOutbreaks: report.alert_count || 0,
      resolvedOutbreaks: 0,
      affectedRegions: (report.regions as any[])?.length || 0,
      trendData: (report.trend_data as any[]) || [],
      regionData: (report.regions as any[]) || [],
      diseaseBreakdown: (report.disease_data as any[]) || [],
      alerts: [],
    });
    toast.success("Loaded saved report");
  };

  const statusIcon = (status: string) => {
    if (status === "rising") return <ArrowUpRight className="w-3.5 h-3.5 text-destructive" />;
    if (status === "declining") return <ArrowDownRight className="w-3.5 h-3.5 text-green-500" />;
    return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  const severityColor = (s: string) => {
    if (s === "critical") return "bg-red-500/10 text-red-500 border-red-500/20";
    if (s === "high") return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    if (s === "medium") return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Epidemic Intelligence</h1>
            <p className="text-xs text-muted-foreground">AI-powered disease surveillance & outbreak tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Diseases</SelectItem>
              <SelectItem value="respiratory">Respiratory</SelectItem>
              <SelectItem value="vector">Vector-borne</SelectItem>
              <SelectItem value="waterborne">Waterborne</SelectItem>
              <SelectItem value="zoonotic">Zoonotic</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={runAnalysis} disabled={loading}>
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
            {loading ? "Analyzing..." : "Run Analysis"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-1.5 text-xs">
            <BarChart3 className="w-3.5 h-3.5" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="deep" className="gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5" /> Deep Analysis
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5" /> History ({reports.length})
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          {!data ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <Globe className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">Run AI Surveillance Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  Click "Run Analysis" to generate a real-time epidemic intelligence report powered by AI.
                </p>
                <Button onClick={runAnalysis} disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate Intelligence Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary */}
              {data.summary && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <p className="text-sm text-foreground">{data.summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Total Cases", value: data.totalCases?.toLocaleString() || "0", icon: Bug, color: "text-destructive" },
                  { label: "Active Outbreaks", value: String(data.activeOutbreaks || 0), icon: Activity, color: "text-primary" },
                  { label: "Resolved", value: String(data.resolvedOutbreaks || 0), icon: Thermometer, color: "text-green-500" },
                  { label: "Affected Regions", value: String(data.affectedRegions || 0), icon: MapPin, color: "text-yellow-500" },
                ].map((kpi) => (
                  <Card key={kpi.label}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                      <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts */}
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Case Trend Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={data.trendData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                        <Area type="monotone" dataKey="cases" stroke="hsl(24, 95%, 53%)" fill="hsl(24, 95%, 53%)" fillOpacity={0.15} strokeWidth={2} />
                        <Area type="monotone" dataKey="recovered" stroke="hsl(152, 69%, 40%)" fill="hsl(152, 69%, 40%)" fillOpacity={0.1} strokeWidth={2} />
                        <Area type="monotone" dataKey="deaths" stroke="hsl(0, 84%, 60%)" fill="hsl(0, 84%, 60%)" fillOpacity={0.1} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Disease Classification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={data.diseaseBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                          {data.diseaseBreakdown.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1 mt-2">
                      {data.diseaseBreakdown.map((d, i) => (
                        <div key={d.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="text-muted-foreground">{d.name}</span>
                          </div>
                          <span className="font-medium text-foreground">{d.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts & Regions */}
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" /> Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {data.alerts?.length ? data.alerts.map((alert, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`p-3 rounded-lg border ${severityColor(alert.severity)}`}
                      >
                        <p className="text-xs font-medium">{alert.title}</p>
                        {alert.description && (
                          <p className="text-[10px] opacity-70 mt-1">{alert.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="outline" className="text-[9px] h-4">{alert.severity.toUpperCase()}</Badge>
                          <span className="text-[10px] opacity-70">{alert.region}</span>
                          {alert.caseCount > 0 && (
                            <span className="text-[10px] opacity-70">· {alert.caseCount.toLocaleString()} cases</span>
                          )}
                        </div>
                      </motion.div>
                    )) : (
                      <p className="text-xs text-muted-foreground text-center py-6">No alerts generated</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" /> Regional Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {data.regionData?.map((region) => (
                      <div key={region.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          {statusIcon(region.status)}
                          <span className="text-xs font-medium text-foreground">{region.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-foreground">{region.cases?.toLocaleString()}</span>
                          <span className={`text-[10px] font-medium ${region.change > 0 ? "text-destructive" : "text-green-500"}`}>
                            {region.change > 0 ? "+" : ""}{region.change}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Deep Analysis Tab */}
        <TabsContent value="deep" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AI Deep Analysis</CardTitle>
              <CardDescription className="text-xs">Ask specific questions about epidemic patterns, risk factors, or interventions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., What is the risk of respiratory illness outbreaks in Sub-Saharan Africa this quarter?"
                  value={deepQuery}
                  onChange={(e) => setDeepQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runDeepAnalysis()}
                />
                <Button onClick={runDeepAnalysis} disabled={deepLoading || !deepQuery.trim()} className="gap-2 flex-shrink-0">
                  {deepLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Analyze
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Respiratory outbreak risk assessment for West Africa",
                  "Cholera transmission dynamics in monsoon regions",
                  "Dengue surge correlation with climate patterns",
                  "Zoonotic spillover risk at human-animal interfaces",
                ].map((q) => (
                  <Button key={q} variant="outline" size="sm" className="text-[10px] h-7" onClick={() => setDeepQuery(q)}>
                    {q}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deep Analysis Dialog */}
          <Dialog open={deepOpen} onOpenChange={setDeepOpen}>
            <DialogContent className="max-w-3xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="text-sm">Deep Analysis Result</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                {deepLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                    <p className="text-sm text-muted-foreground">Running deep analysis...</p>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{deepAnalysis}</ReactMarkdown>
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              {reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="w-10 h-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">No reports yet. Run your first analysis above.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{report.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className="text-[10px] text-muted-foreground">
                              {report.total_cases?.toLocaleString() || 0} cases
                            </span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className="text-[10px] text-muted-foreground">
                              {report.alert_count || 0} alerts
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => loadReport(report)}>
                        <BarChart3 className="w-3 h-3" /> Load
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EpidemicDashboardPage;
