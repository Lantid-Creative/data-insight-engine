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
  Download, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, AreaChart, Area } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

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

const QUICK_ACTIONS = [
  { icon: BarChart3, label: "Analyze Data", desc: "Find patterns & insights", prompt: "Analyze the key patterns and insights from my uploaded data" },
  { icon: FileText, label: "Generate Report", desc: "Comprehensive PDF report", prompt: "Generate a comprehensive report based on my files" },
  { icon: Wand2, label: "Clean Dataset", desc: "Prepare for analysis", prompt: "Help me clean and prepare this dataset for analysis" },
  { icon: PieChart, label: "Visualize", desc: "Charts & dashboards", prompt: "Create visualizations and charts from my data" },
  { icon: Database, label: "Summarize", desc: "Quick data overview", prompt: "Summarize the structure and content of my uploaded files" },
  { icon: Table2, label: "Extract Tables", desc: "Structured extraction", prompt: "Extract all tables and structured data from my documents" },
];

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
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
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
                transition={{ duration: 0.6, repeat: Infinity, ease: "steps(2)" }}
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
function QuickActionCard({ action, index, onClick }: { action: typeof QUICK_ACTIONS[0]; index: number; onClick: () => void }) {
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

                      {/* Quick action CARDS (not chips) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-[560px]">
                        {QUICK_ACTIONS.map((action, i) => (
                          <QuickActionCard
                            key={action.label}
                            action={action}
                            index={i}
                            onClick={() => sendMessage(action.prompt)}
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
              <AnalyzeView files={files} messages={messages} projectName={project.name} />
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
      </div>
    </TooltipProvider>
  );
};

/* ─── Analyze View ─── */
const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.7)",
  "hsl(var(--primary) / 0.5)",
  "hsl(var(--primary) / 0.35)",
  "hsl(var(--primary) / 0.2)",
];

function AnalyzeView({ files, messages, projectName }: { files: any[]; messages: any[]; projectName: string }) {
  // File type breakdown
  const typeMap: Record<string, number> = {};
  files.forEach((f: any) => {
    const ext = f.file_name.split(".").pop()?.toUpperCase() || "OTHER";
    typeMap[ext] = (typeMap[ext] || 0) + 1;
  });
  const fileTypeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  // Message activity over last 7 days
  const activityData = Array.from({ length: 7 }, (_, i) => {
    const day = startOfDay(subDays(new Date(), 6 - i));
    const nextDay = startOfDay(subDays(new Date(), 5 - i));
    const count = messages.filter((m: any) => {
      const d = new Date(m.created_at);
      return i < 6 ? d >= day && d < nextDay : d >= day;
    }).length;
    return { day: format(day, "EEE"), count };
  });

  // File sizes for bar chart
  const fileSizeData = files.slice(0, 8).map((f: any) => ({
    name: f.file_name.length > 12 ? f.file_name.slice(0, 12) + "…" : f.file_name,
    size: +(f.file_size / 1024).toFixed(1),
  }));

  const totalSize = files.reduce((a: number, f: any) => a + (f.file_size || 0), 0);
  const userMsgs = messages.filter((m: any) => m.role === "user").length;
  const aiMsgs = messages.filter((m: any) => m.role === "assistant").length;

  const stats = [
    { label: "Total Files", value: files.length, icon: File },
    { label: "Total Size", value: totalSize < 1024 * 1024 ? `${(totalSize / 1024).toFixed(1)} KB` : `${(totalSize / (1024 * 1024)).toFixed(1)} MB`, icon: HardDrive },
    { label: "Your Messages", value: userMsgs, icon: MessageSquare },
    { label: "AI Responses", value: aiMsgs, icon: Sparkles },
  ];

  return (
    <div className="flex-1 overflow-y-auto relative z-10">
      <div className="max-w-[900px] mx-auto py-8 px-6 space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Analyze: {projectName}</h1>
          <p className="text-sm text-muted-foreground mt-1">Data visualizations and project insights</p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {stats.map((s) => (
            <Card key={s.label} className="shadow-soft">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-none">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* File Type Distribution */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="shadow-soft">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">File Type Distribution</h3>
                {fileTypeData.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie data={fileTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                          {fileTypeData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="rounded-lg border bg-card px-3 py-1.5 shadow-md text-xs">
                                <p className="font-medium text-card-foreground">{payload[0].name}</p>
                                <p className="text-muted-foreground">{payload[0].value} files</p>
                              </div>
                            );
                          }}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No files uploaded yet</div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Chat Activity */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="shadow-soft">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Chat Activity (7 days)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="analyzeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <RechartsTooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-lg border bg-card px-3 py-1.5 shadow-md text-xs">
                              <p className="font-medium text-card-foreground">{label}</p>
                              <p className="text-muted-foreground">{payload[0].value} messages</p>
                            </div>
                          );
                        }}
                      />
                      <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#analyzeGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* File Sizes */}
          {fileSizeData.length > 0 && (
            <motion.div className="md:col-span-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="shadow-soft">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4">File Sizes (KB)</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fileSizeData}>
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <RechartsTooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="rounded-lg border bg-card px-3 py-1.5 shadow-md text-xs">
                                <p className="font-medium text-card-foreground">{label}</p>
                                <p className="text-muted-foreground">{payload[0].value} KB</p>
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey="size" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Report View ─── */
function ReportView({ projectId }: { projectId: string }) {
  const [reportContent, setReportContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateReport = async () => {
    setGenerating(true);
    setReportContent("");
    setGenerated(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ projectId }),
      });

      if (resp.status === 429) {
        toast.error("Rate limit exceeded. Please try again in a moment.");
        setGenerating(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("AI credits exhausted. Please add credits to continue.");
        setGenerating(false);
        return;
      }
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
    } catch (e: any) {
      toast.error(e.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([reportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project-report.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  return (
    <div className="flex-1 overflow-y-auto relative z-10">
      <div className="max-w-[800px] mx-auto py-8 px-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Project Report</h1>
            <p className="text-sm text-muted-foreground mt-1">AI-generated summary of your project</p>
          </div>
          <div className="flex items-center gap-2">
            {generated && (
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                <Download className="w-3.5 h-3.5" />
                Download
              </Button>
            )}
            <Button
              size="sm"
              onClick={generateReport}
              disabled={generating}
              className="gap-2"
            >
              {generating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : generated ? (
                <RefreshCw className="w-3.5 h-3.5" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {generating ? "Generating…" : generated ? "Regenerate" : "Generate Report"}
            </Button>
          </div>
        </motion.div>

        {!reportContent && !generating ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6"
              style={{ boxShadow: "0 12px 40px hsl(var(--primary) / 0.2)" }}
            >
              <FileText className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No report yet</h2>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Click "Generate Report" to create a comprehensive AI-powered summary of your project, including data overview, key insights, and recommendations.
            </p>
            <Button onClick={generateReport} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Report
            </Button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                      transition={{ duration: 0.6, repeat: Infinity, ease: "steps(2)" }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
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
