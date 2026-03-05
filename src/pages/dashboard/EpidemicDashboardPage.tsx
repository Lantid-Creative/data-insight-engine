import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe, Activity, TrendingUp, TrendingDown, AlertTriangle, MapPin,
  Calendar, RefreshCcw, Download, Bug, Thermometer, Users,
  BarChart3, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const trendData = [
  { date: "Jan", cases: 1200, deaths: 34, recovered: 980 },
  { date: "Feb", cases: 1800, deaths: 52, recovered: 1400 },
  { date: "Mar", cases: 3200, deaths: 78, recovered: 2600 },
  { date: "Apr", cases: 5100, deaths: 120, recovered: 4200 },
  { date: "May", cases: 4300, deaths: 95, recovered: 3800 },
  { date: "Jun", cases: 3100, deaths: 68, recovered: 2900 },
  { date: "Jul", cases: 2400, deaths: 45, recovered: 2200 },
  { date: "Aug", cases: 1900, deaths: 32, recovered: 1750 },
];

const regionData = [
  { name: "North America", cases: 12400, change: -12, status: "declining" },
  { name: "Europe", cases: 8900, change: -8, status: "declining" },
  { name: "Sub-Saharan Africa", cases: 15200, change: 24, status: "rising" },
  { name: "South Asia", cases: 9800, change: 5, status: "stable" },
  { name: "East Asia", cases: 3400, change: -18, status: "declining" },
  { name: "Latin America", cases: 7600, change: 11, status: "rising" },
];

const diseaseBreakdown = [
  { name: "Respiratory", value: 42, color: "hsl(24, 95%, 53%)" },
  { name: "Vector-borne", value: 23, color: "hsl(200, 80%, 50%)" },
  { name: "Waterborne", value: 18, color: "hsl(152, 69%, 40%)" },
  { name: "Zoonotic", value: 12, color: "hsl(38, 92%, 50%)" },
  { name: "Other", value: 5, color: "hsl(0, 0%, 50%)" },
];

const alerts = [
  { severity: "critical", title: "Unusual Respiratory Illness Cluster — West Africa", time: "2h ago", region: "Sub-Saharan Africa" },
  { severity: "high", title: "Cholera Outbreak Expansion — Bangladesh", time: "6h ago", region: "South Asia" },
  { severity: "medium", title: "Dengue Case Surge — Brazil", time: "12h ago", region: "Latin America" },
  { severity: "low", title: "Seasonal Flu Peak Approaching — Northern Europe", time: "1d ago", region: "Europe" },
];

const EpidemicDashboardPage = () => {
  const [timeRange, setTimeRange] = useState("6m");
  const [selectedDisease, setSelectedDisease] = useState("all");

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
            <p className="text-xs text-muted-foreground">Real-time disease surveillance & outbreak tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedDisease} onValueChange={setSelectedDisease}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Diseases</SelectItem>
              <SelectItem value="respiratory">Respiratory</SelectItem>
              <SelectItem value="vector">Vector-borne</SelectItem>
              <SelectItem value="waterborne">Waterborne</SelectItem>
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
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <RefreshCcw className="w-3 h-3" /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Cases", value: "57,400", change: "+3.2%", trend: "up", icon: Bug, color: "text-destructive" },
          { label: "Under Surveillance", value: "142", change: "+12", trend: "up", icon: Activity, color: "text-primary" },
          { label: "Resolved Outbreaks", value: "28", change: "+4 this month", trend: "up", icon: Thermometer, color: "text-green-500" },
          { label: "Affected Regions", value: "34", change: "-2", trend: "down", icon: MapPin, color: "text-yellow-500" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                <Badge variant="outline" className="text-[10px]">{kpi.change}</Badge>
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
            <CardDescription className="text-xs">Monthly cases, deaths, and recoveries</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis className="text-xs" tick={{ fontSize: 11 }} />
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
                <Pie data={diseaseBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {diseaseBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {diseaseBreakdown.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
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
        {/* Active Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-3 rounded-lg border ${severityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium">{alert.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[9px] h-4">{alert.severity.toUpperCase()}</Badge>
                      <span className="text-[10px] opacity-70">{alert.time}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Regional Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Regional Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {regionData.map((region) => (
              <div key={region.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {statusIcon(region.status)}
                  <span className="text-xs font-medium text-foreground">{region.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-foreground">{region.cases.toLocaleString()}</span>
                  <span className={`text-[10px] font-medium ${region.change > 0 ? "text-destructive" : "text-green-500"}`}>
                    {region.change > 0 ? "+" : ""}{region.change}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EpidemicDashboardPage;
