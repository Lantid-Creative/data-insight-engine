import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  Upload, File, Loader2, Sparkles, Paperclip,
  BarChart3, FileText, Wand2, Database, ArrowUp, Copy, Check,
  RotateCcw, ThumbsUp, ThumbsDown, PanelRightOpen, PanelRightClose,
  FileSpreadsheet, FileImage, FileCode, FileArchive,
  Trash2, Clock, HardDrive, Layers, PieChart, Table2,
  MessageSquare, ChevronLeft, Zap, Brain, Eye, Command,
  Workflow, TrendingUp, Search, Mic, Plus, Hash,
  Download, RefreshCw, MoreHorizontal, Pencil, UserPlus, Activity,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { AnalyzeView } from "@/components/dashboard/AnalyzeView";
import { ProjectShareDialog } from "@/components/dashboard/ProjectShareDialog";
import { ActivityLog } from "@/components/dashboard/ActivityLog";
import {
  PieChart as RechartsPie, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  AreaChart, Area, LineChart, Line, CartesianGrid,
} from "recharts";

/* ─── Helpers ─── */
function getFileIcon(mime: string | null) {
  if (!mime) return File;
  if (mime.includes("spreadsheet") || mime.includes("csv") || mime.includes("excel")) return FileSpreadsheet;
  if (mime.includes("image")) return FileImage;
  if (mime.includes("json") || mime.includes("xml") || mime.includes("html")) return FileCode;
  if (mime.includes("zip") || mime.includes("archive") || mime.includes("rar")) return FileArchive;
  if (mime.includes("pdf")) return FileText;
  return File;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const WORKSPACE_MODES = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "analyze", label: "Analyze", icon: TrendingUp },
  { id: "report", label: "Report", icon: FileText },
] as const;

const BASE_QUICK_ACTIONS = [
  { icon: BarChart3, label: "Analyze Data", desc: "Find patterns & insights", prompt: "Analyze the key patterns and insights from my uploaded data", fileTypes: ["spreadsheet", "csv", "excel", "json"] },
  { icon: FileText, label: "Summarize Docs", desc: "Extract key takeaways", prompt: "Summarize the key points and takeaways from my documents", fileTypes: ["pdf", "word", "text"] },
  { icon: Wand2, label: "Clean Dataset", desc: "Prepare for analysis", prompt: "Help me clean and prepare this dataset for analysis", fileTypes: ["spreadsheet", "csv", "excel"] },
  { icon: PieChart, label: "Visualize", desc: "Charts & dashboards", prompt: "Create visualizations and charts from my data. Include a ```chart block with JSON data.", fileTypes: ["spreadsheet", "csv", "excel", "json"] },
  { icon: Database, label: "Overview", desc: "Quick data summary", prompt: "Summarize the structure and content of my uploaded files", fileTypes: [] },
  { icon: Table2, label: "Extract Tables", desc: "Structured extraction", prompt: "Extract all tables and structured data from my documents", fileTypes: ["pdf", "image"] },
];

function getSmartPrompts(files: any[]) {
  if (!files.length) return BASE_QUICK_ACTIONS;

  const mimeTypes = files.map((f: any) => f.mime_type || "").join(" ").toLowerCase();
  const hasSpreadsheets = /spreadsheet|csv|excel|xlsx/.test(mimeTypes);
  const hasPDFs = /pdf/.test(mimeTypes);
  const hasImages = /image/.test(mimeTypes);
  const hasJSON = /json/.test(mimeTypes);
  const hasAudio = /audio/.test(mimeTypes);
  const hasVideo = /video/.test(mimeTypes);

  const contextActions: typeof BASE_QUICK_ACTIONS = [];

  if (hasSpreadsheets || hasJSON) {
    contextActions.push(
      { icon: BarChart3, label: "Analyze Trends", desc: "Find patterns in your data", prompt: "Analyze trends and patterns in my spreadsheet data. Show key metrics and include a ```chart block with the most important visualization.", fileTypes: [] },
      { icon: PieChart, label: "Visualize Data", desc: "Auto-generate charts", prompt: "Create the most insightful visualizations from my data. Include ```chart blocks with chart data in JSON format.", fileTypes: [] },
    );
  }
  if (hasPDFs) {
    contextActions.push(
      { icon: FileText, label: "Summarize PDFs", desc: "Key points & insights", prompt: "Extract and summarize the most important information from my PDF documents", fileTypes: [] },
      { icon: Search, label: "Deep Analysis", desc: "Cross-reference documents", prompt: "Cross-reference my PDF documents and identify common themes, contradictions, or key relationships", fileTypes: [] },
    );
  }
  if (hasImages) {
    contextActions.push(
      { icon: Eye, label: "Describe Images", desc: "Visual content analysis", prompt: "Analyze and describe the content of my uploaded images in detail", fileTypes: [] },
    );
  }
  if (hasAudio || hasVideo) {
    contextActions.push(
      { icon: Mic, label: "Transcribe Media", desc: "Audio/video to text", prompt: "Help me understand and summarize the content of my media files", fileTypes: [] },
    );
  }

  // Fill remaining slots with generic actions
  const remaining = BASE_QUICK_ACTIONS.filter(a => !contextActions.some(c => c.label === a.label));
  const result = [...contextActions, ...remaining].slice(0, 6);
  return result;
}

/* ─── Ambient Mesh Background ─── */
function AmbientMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/[0.04] blur-[120px]" />
      <div className="absolute -bottom-[30%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/[0.03] blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-primary/[0.02] blur-[80px]" />
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}

/* ─── Animated Logo Mark ─── */
function LogoMark({ size = "lg" }: { size?: "sm" | "lg" }) {
  const dim = size === "lg" ? "w-20 h-20" : "w-9 h-9";
  const iconDim = size === "lg" ? "w-8 h-8" : "w-4 h-4";

  return (
    <div className="relative">
      {size === "lg" && (
        <>
          <motion.div
            className="absolute inset-0 rounded-[28px] bg-primary/20 blur-2xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -inset-2 rounded-[32px] border border-primary/10"
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}
      <motion.div
        className={`relative ${dim} rounded-[22px] bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center`}
        style={{ boxShadow: "0 8px 32px hsl(var(--primary) / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.15)" }}
        whileHover={size === "lg" ? { scale: 1.05, rotate: 2 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Sparkles className={`${iconDim} text-primary-foreground drop-shadow-sm`} />
        {/* Shine overlay */}
        <div className="absolute inset-0 rounded-[22px] bg-gradient-to-b from-white/10 to-transparent" />
      </motion.div>
      {size === "sm" && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[hsl(var(--success))] border-2 border-background" />
      )}
    </div>
  );
}

/* ─── Inline Chart Parser ─── */
function parseInlineCharts(content: string): { text: string; charts: Array<{ type: string; title: string; data: any[]; dataKeys: string[]; xKey: string }> } {
  const chartRegex = /```chart\n([\s\S]*?)```/g;
  const charts: Array<{ type: string; title: string; data: any[]; dataKeys: string[]; xKey: string }> = [];
  const text = content.replace(chartRegex, (_, jsonBlock) => {
    try {
      const parsed = JSON.parse(jsonBlock.trim());
      charts.push({
        type: parsed.type || "bar",
        title: parsed.title || "Chart",
        data: parsed.data || [],
        dataKeys: parsed.dataKeys || ["value"],
        xKey: parsed.xKey || "name",
      });
      return `\n[📊 Chart: ${parsed.title || "Visualization"}]\n`;
    } catch {
      return jsonBlock;
    }
  });
  return { text, charts };
}

/* ─── Mini Inline Chart ─── */
function InlineChatChart({ chart }: { chart: { type: string; title: string; data: any[]; dataKeys: string[]; xKey: string } }) {
  const { type, data, dataKeys, xKey, title } = chart;
  const mainKey = dataKeys[0] || "value";

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--primary) / 0.7)",
    "hsl(var(--primary) / 0.5)",
    "hsl(var(--primary) / 0.35)",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-4 rounded-xl border border-border/50 bg-muted/20 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
        <BarChart3 className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">{title}</span>
      </div>
      <div className="h-48 p-3">
        <ResponsiveContainer width="100%" height="100%">
          {type === "pie" ? (
            <RechartsPie>
              <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3} dataKey={mainKey}
                label={({ name, value }: any) => `${name} (${value})`}>
                {data.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <RechartsTooltip />
            </RechartsPie>
          ) : type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
              <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <RechartsTooltip />
              {dataKeys.map((key, i) => <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />)}
            </LineChart>
          ) : type === "area" ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
              <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <RechartsTooltip />
              {dataKeys.map((key, i) => <Area key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.2} />)}
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
              <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <RechartsTooltip />
              {dataKeys.map((key, i) => <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />)}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

/* ─── Message Component ─── */
function ChatMessage({ message, onCopy, onRetry, isLast }: {
  message: any; onCopy: (t: string) => void; onRetry?: () => void; isLast?: boolean;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { text: parsedText, charts } = isUser ? { text: message.content, charts: [] } : parseInlineCharts(message.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      {isUser ? (
        <div className="flex justify-end">
          <div className="max-w-[75%]">
            <div
              className="rounded-2xl rounded-br-md px-5 py-3.5"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.85))",
                boxShadow: "0 4px 24px hsl(var(--primary) / 0.2), inset 0 1px 0 hsl(0 0% 100% / 0.1)",
              }}
            >
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-primary-foreground">{message.content}</p>
            </div>
            <p className="text-[10px] text-muted-foreground/40 text-right mt-1.5 mr-1 font-mono">
              {timeAgo(message.created_at)}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <LogoMark size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground tracking-tight">DataAfro</span>
                <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest border border-primary/10">AI</span>
              </div>
              <span className="text-[10px] text-muted-foreground/50 font-mono">{timeAgo(message.created_at)}</span>
            </div>
          </div>

          <div className="ml-12">
            <div
              className="rounded-2xl rounded-tl-md px-5 py-4 border border-border/50 bg-card"
              style={{ boxShadow: "0 1px 3px hsl(0 0% 0% / 0.04), 0 8px 24px hsl(0 0% 0% / 0.04)" }}
            >
              <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-[1.85]
                [&>p]:mb-3 [&>p:last-child]:mb-0
                [&>ul]:mb-3 [&>ol]:mb-3 [&>li]:mb-1
                [&>h1]:text-lg [&>h2]:text-base [&>h3]:text-sm
                [&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-semibold
                [&>h1]:mt-5 [&>h2]:mt-4 [&>h3]:mt-3
                [&>pre]:bg-muted [&>pre]:rounded-xl [&>pre]:border [&>pre]:border-border [&>pre]:p-4 [&>pre]:text-sm [&>pre]:overflow-x-auto
                [&>blockquote]:border-l-2 [&>blockquote]:border-primary/40 [&>blockquote]:pl-4 [&>blockquote]:text-muted-foreground [&>blockquote]:italic
                [&_code]:bg-primary/5 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-sm [&_code]:font-mono [&_code]:border [&_code]:border-primary/10
                [&>pre_code]:bg-transparent [&>pre_code]:p-0 [&>pre_code]:border-0 [&>pre_code]:text-foreground">
                <ReactMarkdown>{parsedText}</ReactMarkdown>
              </div>

              {/* Inline Charts */}
              {charts.length > 0 && (
                <div className="mt-2 space-y-3">
                  {charts.map((chart, i) => (
                    <InlineChatChart key={i} chart={chart} />
                  ))}
                </div>
              )}
            </div>

            {/* Hover action bar */}
            <div className="flex items-center gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              {[
                { icon: copied ? Check : Copy, onClick: handleCopy, label: copied ? "Copied!" : "Copy", active: copied },
                ...(isLast && onRetry ? [{ icon: RotateCcw, onClick: onRetry, label: "Retry", active: false }] : []),
                { icon: ThumbsUp, onClick: () => {}, label: "Helpful", active: false },
                { icon: ThumbsDown, onClick: () => {}, label: "Not helpful", active: false },
              ].map((action, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={action.onClick}
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        action.active
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground/50 hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <action.icon className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">{action.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Thinking Indicator ─── */
function ThinkingIndicator({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <LogoMark size="sm" />
          <motion.div
            className="absolute -inset-1 rounded-2xl border border-primary/30"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground tracking-tight">DataAfro</span>
          {!content && (
            <motion.div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/15"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-semibold text-primary tracking-wide">THINKING</span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="ml-12">
        {content ? (
          <div
            className="rounded-2xl rounded-tl-md border border-border/50 bg-card px-5 py-4"
            style={{ boxShadow: "0 1px 3px hsl(0 0% 0% / 0.04), 0 8px 24px hsl(0 0% 0% / 0.04)" }}
          >
            <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-[1.85] [&>p]:mb-3 [&>p:last-child]:mb-0">
              <ReactMarkdown>{content}</ReactMarkdown>
              <motion.span
                className="inline-block w-0.5 h-5 bg-primary ml-0.5 align-text-bottom rounded-full"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
              />
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl rounded-tl-md border border-border/50 bg-card px-5 py-4"
            style={{ boxShadow: "0 1px 3px hsl(0 0% 0% / 0.04)" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary/50"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Analyzing your data…</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── File Card ─── */
function FileCard({ file, onDelete }: { file: any; onDelete: () => void }) {
  const Icon = getFileIcon(file.mime_type);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, scale: 0.95 }}
      className="group relative flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted/60 transition-all duration-200 cursor-default"
    >
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
        <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-foreground truncate">{file.file_name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-muted-foreground/70 font-mono">{formatFileSize(file.file_size)}</span>
          <span className="text-muted-foreground/20">·</span>
          <span className="text-[10px] text-muted-foreground/70">{timeAgo(file.created_at)}</span>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

/* ─── Quick Action Card ─── */
function QuickActionCard({ action, index, onClick }: { action: typeof BASE_QUICK_ACTIONS[0]; index: number; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="group relative flex flex-col items-start gap-3 p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all duration-300 text-left overflow-hidden"
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-primary/[0.03] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div
        className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
        style={{ boxShadow: "0 4px 12px hsl(var(--primary) / 0.2)" }}
      >
        <action.icon className="w-5 h-5 text-primary-foreground" />
      </div>
      <div className="relative">
        <p className="text-sm font-bold text-foreground">{action.label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{action.desc}</p>
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [activeMode, setActiveMode] = useState<string>("chat");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [inputFocused, setInputFocused] = useState(false);

  // Rename/delete dialog state
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState("");
  const [renameDesc, setRenameDesc] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { data: project, isLoading: projLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", projectId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const { data: files = [] } = useQuery({
    queryKey: ["project-files", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_files").select("*").eq("project_id", projectId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages").select("*").eq("project_id", projectId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [chatInput]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    if (!user || !projectId) return;
    setUploading(true);
    const arr = Array.from(fileList);
    let uploaded = 0;
    for (const file of arr) {
      const filePath = `${user.id}/${projectId}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("project-files").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadErr) { toast.error(`Failed to upload ${file.name}: ${uploadErr.message}`); continue; }
      await supabase.from("project_files").insert({
        project_id: projectId, user_id: user.id, file_name: file.name,
        file_path: filePath, file_size: file.size, mime_type: file.type || "application/octet-stream",
      });
      uploaded++;
      if (arr.length > 1) toast.info(`Uploaded ${uploaded}/${arr.length}: ${file.name}`);
    }
    queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
    toast.success(`${uploaded} file(s) uploaded successfully`);
    setUploading(false);
  }, [user, projectId, queryClient]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const deleteFile = useMutation({
    mutationFn: async (file: any) => {
      await supabase.storage.from("project-files").remove([file.file_path]);
      const { error } = await supabase.from("project_files").delete().eq("id", file.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
      toast.success("File removed");
    },
  });

  const renameProject = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const { error } = await supabase.from("projects").update({ name, description }).eq("id", projectId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated");
      setRenameOpen(false);
    },
    onError: () => toast.error("Failed to update project"),
  });

  const deleteProject = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").delete().eq("id", projectId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
      navigate("/dashboard/projects");
    },
    onError: () => toast.error("Failed to delete project"),
  });


  const sendMessage = async (content?: string) => {
    const msg = (content || chatInput).trim();
    if (!msg || streaming) return;
    setChatInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setStreaming(true);
    setStreamingContent("");

    queryClient.setQueryData(["chat-messages", projectId], (old: any[] = []) => [
      ...old,
      { id: `temp-${Date.now()}`, role: "user", content: msg, created_at: new Date().toISOString() },
    ]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/project-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ projectId, message: msg }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "AI service error" }));
        throw new Error(err.error || "Failed to get response");
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) { full += delta; setStreamingContent(full); }
          } catch { /* partial */ }
        }
      }
      queryClient.invalidateQueries({ queryKey: ["chat-messages", projectId] });
    } catch (e: any) {
      toast.error(e.message || "Failed to send message");
    } finally {
      setStreaming(false);
      setStreamingContent("");
    }
  };

  /* ─── Loading ─── */
  if (projLoading) return (
    <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] bg-background relative">
      <AmbientMesh />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 relative z-10">
        <LogoMark size="lg" />
        <motion.span
          className="text-sm text-muted-foreground font-medium tracking-wide"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Initializing workspace…
        </motion.span>
      </motion.div>
    </div>
  );

  if (!project) return <div className="text-center py-20"><p className="text-muted-foreground">Project not found</p></div>;

  const hasMessages = messages.length > 0 || streaming;
  const totalSize = files.reduce((acc: number, f: any) => acc + (f.file_size || 0), 0);

  return (
    <TooltipProvider>
      <div
        className="flex flex-col h-[calc(100vh-3.5rem)] relative overflow-hidden bg-background"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* ═══ TOP BAR ═══ */}
        <div className="h-13 flex items-center justify-between px-4 border-b border-border/40 bg-background/80 backdrop-blur-xl flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => navigate("/dashboard/projects")} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">All projects</TooltipContent>
            </Tooltip>
            <div className="w-px h-5 bg-border/50" />
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
                style={{ boxShadow: "0 2px 8px hsl(var(--primary) / 0.2)" }}
              >
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold text-foreground truncate max-w-[200px]">{project.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => { setRenameName(project.name); setRenameDesc(project.description || ""); setRenameOpen(true); }}>
                    <Pencil className="w-3.5 h-3.5 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteOpen(true)}>
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mode switcher */}
          <div className="flex items-center gap-0.5 p-1 rounded-xl bg-muted/40 border border-border/40">
            {WORKSPACE_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  activeMode === mode.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeMode === mode.id && (
                  <motion.div
                    layoutId="mode-indicator"
                    className="absolute inset-0 bg-card rounded-lg border border-border/60"
                    style={{ boxShadow: "0 1px 4px hsl(0 0% 0% / 0.06)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <mode.icon className="w-3.5 h-3.5" />
                  {mode.label}
                </span>
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShareOpen(true)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Share project</TooltipContent>
            </Tooltip>
            {files.length > 0 && (
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-muted/30 border border-border/30">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))]" />
                  <span className="text-[10px] font-mono text-muted-foreground">{files.length} files</span>
                </div>
                <div className="w-px h-3 bg-border/50" />
                <span className="text-[10px] font-mono text-muted-foreground">{formatFileSize(totalSize)}</span>
              </div>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setPanelOpen(!panelOpen)}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    panelOpen
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {panelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">{panelOpen ? "Close panel" : "Open panel"}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* ═══ DRAG OVERLAY ═══ */}
        <AnimatePresence>
          {dragOver && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-background/90 backdrop-blur-2xl" />
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative z-10 flex flex-col items-center gap-6 p-20 rounded-[2.5rem] border-2 border-dashed border-primary/30"
              >
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div
                    className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
                    style={{ boxShadow: "0 16px 48px hsl(var(--primary) / 0.3)" }}
                  >
                    <Upload className="w-10 h-10 text-primary-foreground" />
                  </div>
                </motion.div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">Drop your files here</p>
                  <p className="text-sm text-muted-foreground mt-2">Any file type · Any size · Multiple files</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ BODY ═══ */}
        <div className="flex flex-1 min-h-0">
          {/* ─── Main Content ─── */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            <AmbientMesh />

            {activeMode === "chat" && (
              <>
                {!hasMessages ? (
                  /* ===== EMPTY STATE ===== */
                  <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col items-center max-w-[720px] w-full"
                    >
                      <div className="mb-8">
                        <LogoMark size="lg" />
                      </div>

                      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-3 tracking-tight text-foreground leading-[1.15]">
                        What should we build
                        <br />
                        <span className="text-gradient">from your data?</span>
                      </h1>
                      <p className="text-muted-foreground text-center mb-10 text-[15px] max-w-md leading-relaxed">
                        Upload documents, ask questions, and let AI transform raw data into actionable insights.
                      </p>

                      {/* File pills */}
                      {files.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center flex-wrap gap-2 mb-8 justify-center"
                        >
                          {files.slice(0, 5).map((f: any) => {
                            const FIcon = getFileIcon(f.mime_type);
                            return (
                              <div
                                key={f.id}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/60 text-xs font-medium text-foreground shadow-sm"
                              >
                                <FIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="truncate max-w-[120px]">{f.file_name}</span>
                              </div>
                            );
                          })}
                          {files.length > 5 && (
                            <span className="px-2.5 py-1.5 rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                              +{files.length - 5}
                            </span>
                          )}
                        </motion.div>
                      )}

                      {/* Command Input */}
                      <div className="w-full mb-10">
                        <CommandInput
                          textareaRef={textareaRef}
                          chatInput={chatInput}
                          setChatInput={setChatInput}
                          inputFocused={inputFocused}
                          setInputFocused={setInputFocused}
                          sendMessage={sendMessage}
                          streaming={streaming}
                          uploading={uploading}
                          large
                        />
                      </div>

                      {/* Smart action CARDS based on file types */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-[560px]">
                        {getSmartPrompts(files).map((action, i) => (
                          <QuickActionCard
                            key={action.label}
                            action={action}
                            index={i}
                            onClick={() => { setChatInput(action.prompt); textareaRef.current?.focus(); }}
                          />
                        ))}
                      </div>

                      <p className="text-[10px] text-muted-foreground/30 text-center mt-10 font-mono tracking-wider uppercase">
                        DataAfro may produce inaccurate results · Always verify critical data
                      </p>
                    </motion.div>
                  </div>
                ) : (
                  /* ===== CHAT MESSAGES ===== */
                  <>
                    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative z-10">
                      <div className="max-w-[740px] mx-auto space-y-8 py-6 px-4">
                        {messages.map((m: any, i: number) => (
                          <ChatMessage
                            key={m.id}
                            message={m}
                            onCopy={handleCopy}
                            onRetry={m.role === "assistant" ? () => {
                              const lastUserMsg = [...messages].reverse().find((msg: any) => msg.role === "user");
                              if (lastUserMsg) sendMessage(lastUserMsg.content);
                            } : undefined}
                            isLast={i === messages.length - 1}
                          />
                        ))}
                        {streaming && <ThinkingIndicator content={streamingContent} />}
                        <div ref={chatEndRef} />
                      </div>
                    </div>

                    {/* Bottom input */}
                    <div className="flex-shrink-0 border-t border-border/30 bg-background/60 backdrop-blur-xl relative z-10">
                      <div className="max-w-[740px] mx-auto px-4 py-3">
                        <CommandInput
                          textareaRef={textareaRef}
                          chatInput={chatInput}
                          setChatInput={setChatInput}
                          inputFocused={inputFocused}
                          setInputFocused={setInputFocused}
                          sendMessage={sendMessage}
                          streaming={streaming}
                          uploading={uploading}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {activeMode === "analyze" && (
              <AnalyzeView files={files} messages={messages} projectName={project.name} projectId={projectId!} />
            )}

            {activeMode === "report" && (
              <ReportView projectId={projectId!} />
            )}
          </div>

          {/* ═══ SIDE PANEL ═══ */}
          <AnimatePresence mode="wait">
            {panelOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="hidden md:flex flex-shrink-0 border-l border-border/30 overflow-hidden"
                style={{ background: "hsl(var(--muted) / 0.15)" }}
              >
                <div className="w-[300px] h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {/* Project card */}
                    <div
                      className="rounded-2xl border border-border/50 bg-card p-4"
                      style={{ boxShadow: "0 1px 3px hsl(0 0% 0% / 0.03)" }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
                          style={{ boxShadow: "0 4px 12px hsl(var(--primary) / 0.15)" }}
                        >
                          <Sparkles className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground text-sm truncate">{project.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{timeAgo(project.updated_at)}</p>
                        </div>
                      </div>
                      {project.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                      )}
                      <div className="flex items-center gap-4 pt-3 border-t border-border/40">
                        {[
                          { icon: File, value: files.length, label: "files" },
                          { icon: HardDrive, value: formatFileSize(totalSize), label: "" },
                          { icon: MessageSquare, value: messages.length, label: "msgs" },
                        ].map((s, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <s.icon className="w-3 h-3 text-muted-foreground/50" />
                            <span className="text-[11px] font-semibold text-foreground">{s.value}</span>
                            {s.label && <span className="text-[10px] text-muted-foreground/70">{s.label}</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Upload */}
                    <button
                      onClick={() => document.getElementById("file-input")?.click()}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/[0.03] text-sm font-semibold text-muted-foreground hover:text-primary transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      Upload Files
                    </button>

                    {/* Files */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Files</span>
                        {files.length > 0 && (
                          <span className="text-[10px] font-mono text-muted-foreground/50 bg-muted/60 px-2 py-0.5 rounded-full">
                            {files.length}
                          </span>
                        )}
                      </div>

                      {files.length === 0 ? (
                        <div className="flex flex-col items-center py-10 text-center">
                          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                            <FileText className="w-6 h-6 text-muted-foreground/20" />
                          </div>
                          <p className="text-xs text-muted-foreground/60">No files yet</p>
                          <p className="text-[10px] text-muted-foreground/40 mt-0.5">Drag files or click upload</p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <AnimatePresence>
                            {files.map((f: any) => (
                              <FileCard key={f.id} file={f} onDelete={() => deleteFile.mutate(f)} />
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Activity Log */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Activity</span>
                      </div>
                      <ActivityLog projectId={projectId!} />
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* Hidden file input */}
        <input
          id="file-input"
          type="file"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        {/* Rename Dialog */}
        <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Project Name</label>
                <Input value={renameName} onChange={(e) => setRenameName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description (optional)</label>
                <Textarea value={renameDesc} onChange={(e) => setRenameDesc(e.target.value)} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRenameOpen(false)}>Cancel</Button>
              <Button
                disabled={!renameName.trim() || renameProject.isPending}
                onClick={() => renameProject.mutate({ name: renameName, description: renameDesc })}
              >
                {renameProject.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{project.name}"</span>? This will permanently remove the project and all its files and chat history.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" disabled={deleteProject.isPending} onClick={() => deleteProject.mutate()}>
                {deleteProject.isPending ? "Deleting…" : "Delete Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Share Dialog */}
        <ProjectShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          projectId={projectId!}
          projectName={project.name}
        />
      </div>
    </TooltipProvider>
  );
};

/* ─── Report View (Chat-Driven) ─── */
const REPORT_SUGGESTIONS = [
  "Generate an executive summary of my data",
  "Create a detailed technical report with methodology",
  "Write a quick overview with key takeaways",
  "Build a comprehensive deep-dive analysis report",
  "Summarize findings for leadership in 2 pages",
];

function ReportView({ projectId }: { projectId: string }) {
  const [reportContent, setReportContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [promptHistory, setPromptHistory] = useState<Array<{ prompt: string; timestamp: string }>>([]);
  const [inputFocused, setInputFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [prompt]);

  const generateReport = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;
    setGenerating(true);
    setReportContent("");
    setGenerated(false);
    setPromptHistory(prev => [...prev, { prompt: userPrompt, timestamp: new Date().toISOString() }]);
    setPrompt("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          projectId,
          config: {
            sections: ["executive_summary", "data_overview", "key_insights", "statistical_analysis", "recommendations", "conclusion"],
            tone: "professional",
            focusAreas: [],
            customInstructions: userPrompt,
            reportTitle: "",
            includeCharts: true,
            language: "English",
          },
        }),
      });

      if (resp.status === 429) { toast.error("Rate limit exceeded. Please try again in a moment."); setGenerating(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted. Please add credits to continue."); setGenerating(false); return; }
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Failed to generate report" }));
        throw new Error(err.error || "Failed to generate report");
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) { full += delta; setReportContent(full); }
          } catch { /* partial */ }
        }
      }
      setGenerated(true);
      toast.success("Report generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = () => {
    if (prompt.trim() && !generating) {
      generateReport(prompt);
    }
  };

  const handleExport = async (format: "md" | "pdf" | "docx" | "pptx") => {
    setExporting(format);
    try {
      if (format === "md") {
        const blob = new Blob([reportContent], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "project-report.md"; a.click();
        URL.revokeObjectURL(url);
      } else if (format === "pdf") {
        const { exportToPdf } = await import("@/lib/document-export");
        await exportToPdf(reportContent, "project-report");
      } else if (format === "docx") {
        const { exportToDocx } = await import("@/lib/document-export");
        await exportToDocx(reportContent, "project-report");
      } else if (format === "pptx") {
        const { exportToPptx } = await import("@/lib/document-export");
        await exportToPptx(reportContent, "project-report");
      }
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (e: any) {
      toast.error(`Export failed: ${e.message}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-col h-full relative z-10">
      {/* ─── Scrollable Content ─── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[800px] mx-auto py-6 px-6 space-y-6">
          {/* Empty state */}
          {!reportContent && !generating && promptHistory.length === 0 && (
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
                  <FileText className="w-8 h-8 text-primary-foreground" />
                  <div className="absolute inset-0 rounded-[22px] bg-gradient-to-b from-white/10 to-transparent" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">What report do you need?</h2>
              <p className="text-sm text-muted-foreground max-w-md mb-8">
                Describe the report you want and the AI will generate it from your data and conversations. You can refine it with follow-ups.
              </p>

              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {REPORT_SUGGESTIONS.map((sp, i) => (
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

          {/* Report content / streaming */}
          {(reportContent || generating) && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              {/* AI header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: "0 4px 12px hsl(var(--primary) / 0.2)" }}
                >
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">DataAfro</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest border border-primary/10">Report</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50">{generating ? "Generating…" : "Generated just now"}</span>
                </div>
                {generated && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50 transition-all" disabled={!!exporting}>
                        {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        {exporting ? "Exporting…" : "Export"}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2"><FileText className="w-4 h-4 text-red-500" /> PDF</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("docx")} className="gap-2"><FileText className="w-4 h-4 text-blue-500" /> Word (.docx)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("pptx")} className="gap-2"><FileText className="w-4 h-4 text-orange-500" /> PowerPoint (.pptx)</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleExport("md")} className="gap-2"><FileText className="w-4 h-4 text-muted-foreground" /> Markdown (.md)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <Card className="shadow-soft">
                <CardContent className="p-6 sm:p-8">
                  <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-[1.85]
                    [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mt-6 [&>h1]:mb-3
                    [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mt-5 [&>h2]:mb-2
                    [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mt-4 [&>h3]:mb-2
                    [&>p]:mb-3 [&>ul]:mb-3 [&>ol]:mb-3 [&>li]:mb-1
                    [&>blockquote]:border-l-2 [&>blockquote]:border-primary/40 [&>blockquote]:pl-4 [&>blockquote]:text-muted-foreground
                    [&_code]:bg-primary/5 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-sm [&_code]:font-mono [&_code]:border [&_code]:border-primary/10
                    [&>table]:w-full [&>table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-muted [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold
                    [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm">
                    <ReactMarkdown>{reportContent}</ReactMarkdown>
                    {generating && (
                      <motion.span
                        className="inline-block w-0.5 h-5 bg-primary ml-0.5 align-text-bottom rounded-full"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {generated && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="pt-4">
                  <p className="text-xs text-muted-foreground/60 text-center">
                    <Brain className="w-3 h-3 inline mr-1" />
                    Want changes? Describe what to add, remove, or adjust below.
                  </p>
                </motion.div>
              )}
            </motion.div>
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
              placeholder={reportContent ? "Describe changes or generate a new report…" : "Describe the report you need…"}
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
                  <FileText className="w-3 h-3 inline mr-1" />
                  Report mode
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!prompt.trim() && !generating && (
                  <span className="text-[10px] text-muted-foreground/30 font-mono hidden sm:inline">⏎ Enter to generate</span>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || generating}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                    ${prompt.trim() && !generating
                      ? "bg-primary text-primary-foreground hover:scale-105 active:scale-95"
                      : "bg-muted text-muted-foreground/30 cursor-not-allowed"
                    }`}
                  style={prompt.trim() && !generating ? {
                    boxShadow: "0 4px 16px hsl(var(--primary) / 0.25)",
                  } : undefined}
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" strokeWidth={2.5} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Command Input ─── */
function CommandInput({
  textareaRef, chatInput, setChatInput, inputFocused, setInputFocused,
  sendMessage, streaming, uploading, large = false,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  chatInput: string;
  setChatInput: (v: string) => void;
  inputFocused: boolean;
  setInputFocused: (v: boolean) => void;
  sendMessage: (content?: string) => void;
  streaming: boolean;
  uploading: boolean;
  large?: boolean;
}) {
  return (
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
        placeholder="Ask anything about your data…"
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
        rows={1}
        className={`w-full bg-transparent border-0 outline-none resize-none text-foreground placeholder:text-muted-foreground/40 px-5 pt-4 pb-1 min-h-[44px] max-h-[200px] ${large ? "text-base" : "text-[15px]"}`}
      />
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-2 rounded-xl text-muted-foreground/40 hover:text-primary hover:bg-primary/5 transition-all duration-200"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <Paperclip className="w-[18px] h-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Attach files</TooltipContent>
          </Tooltip>
          {uploading && (
            <div className="flex items-center gap-2 ml-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span className="text-[11px] text-muted-foreground font-medium">Uploading…</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!chatInput.trim() && !streaming && (
            <span className="text-[10px] text-muted-foreground/30 font-mono hidden sm:inline">⏎ Enter to send</span>
          )}
          <button
            onClick={() => sendMessage()}
            disabled={!chatInput.trim() || streaming}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
              ${chatInput.trim() && !streaming
                ? "bg-primary text-primary-foreground hover:scale-105 active:scale-95"
                : "bg-muted text-muted-foreground/30 cursor-not-allowed"
              }`}
            style={chatInput.trim() && !streaming ? {
              boxShadow: "0 4px 16px hsl(var(--primary) / 0.25)",
            } : undefined}
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailPage;
