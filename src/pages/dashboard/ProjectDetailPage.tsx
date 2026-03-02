import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  Upload, File, Loader2, Sparkles, Paperclip,
  BarChart3, FileText, Wand2, Database, ArrowUp, Copy, Check,
  RotateCcw, ThumbsUp, ThumbsDown, PanelRightOpen, PanelRightClose,
  FileSpreadsheet, FileImage, FileCode, FileArchive,
  Trash2, Clock, HardDrive, Layers, PieChart, Table2,
  MessageSquare, ChevronLeft, Zap, Brain, Eye, Command,
  Workflow, TrendingUp, Search, Mic,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

/* ─── File icon helper ─── */
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
  { icon: BarChart3, label: "Analyze", prompt: "Analyze the key patterns and insights from my uploaded data", gradient: "from-[hsl(217,91%,60%)] to-[hsl(217,91%,45%)]" },
  { icon: FileText, label: "Report", prompt: "Generate a comprehensive report based on my files", gradient: "from-[hsl(152,69%,40%)] to-[hsl(152,69%,30%)]" },
  { icon: Wand2, label: "Clean", prompt: "Help me clean and prepare this dataset for analysis", gradient: "from-[hsl(270,76%,55%)] to-[hsl(270,76%,40%)]" },
  { icon: Database, label: "Summarize", prompt: "Summarize the structure and content of my uploaded files", gradient: "from-[hsl(38,92%,50%)] to-[hsl(38,92%,38%)]" },
  { icon: PieChart, label: "Visualize", prompt: "Create visualizations and charts from my data", gradient: "from-[hsl(350,80%,55%)] to-[hsl(350,80%,42%)]" },
  { icon: Table2, label: "Extract", prompt: "Extract all tables and structured data from my documents", gradient: "from-[hsl(190,85%,45%)] to-[hsl(190,85%,33%)]" },
];

/* ─── Animated Gradient Orb ─── */
function GradientOrb() {
  return (
    <div className="relative w-28 h-28">
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-primary/60 to-primary/30 blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-3 rounded-full bg-gradient-to-tr from-primary to-primary/80 shadow-lg"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-10 h-10 text-primary-foreground drop-shadow-lg" />
        </motion.div>
      </div>
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      {isUser ? (
        <div className="flex justify-end">
          <div className="max-w-[80%]">
            <div className="rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-5 py-3.5 shadow-lg shadow-primary/10">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
            <p className="text-[10px] text-muted-foreground/40 text-right mt-1.5 mr-1 font-mono">
              {timeAgo(message.created_at)}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Agent header */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20">
                <Sparkles className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[hsl(var(--success))] border-2 border-background" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground tracking-tight">DataAfro</span>
                <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest">AI</span>
              </div>
              <span className="text-[10px] text-muted-foreground/50 font-mono">{timeAgo(message.created_at)}</span>
            </div>
          </div>

          {/* Message body */}
          <div className="ml-12">
            <div className="rounded-2xl rounded-tl-sm bg-card border border-border/60 px-5 py-4 shadow-sm">
              <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-[1.85]
                [&>p]:mb-3 [&>p:last-child]:mb-0
                [&>ul]:mb-3 [&>ol]:mb-3 [&>li]:mb-1
                [&>h1]:text-lg [&>h2]:text-base [&>h3]:text-sm
                [&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-semibold
                [&>h1]:mt-5 [&>h2]:mt-4 [&>h3]:mt-3
                [&>pre]:bg-[hsl(var(--muted))] [&>pre]:rounded-xl [&>pre]:border [&>pre]:border-border [&>pre]:p-4 [&>pre]:text-sm [&>pre]:overflow-x-auto
                [&>blockquote]:border-l-2 [&>blockquote]:border-primary/40 [&>blockquote]:pl-4 [&>blockquote]:text-muted-foreground [&>blockquote]:italic
                [&_code]:bg-primary/5 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-sm [&_code]:font-mono [&_code]:border [&_code]:border-primary/10
                [&>pre_code]:bg-transparent [&>pre_code]:p-0 [&>pre_code]:border-0 [&>pre_code]:text-foreground">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>

            {/* Floating action bar */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
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
                          : "text-muted-foreground/60 hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <action.icon className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">{action.label}</TooltipContent>
                </Tooltip>
              ))}
            </motion.div>
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20">
            <Sparkles className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-primary/40"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground tracking-tight">DataAfro</span>
          {!content && (
            <motion.div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20"
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
          <div className="rounded-2xl rounded-tl-sm bg-card border border-border/60 px-5 py-4 shadow-sm">
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
          <div className="rounded-2xl rounded-tl-sm bg-card border border-border/60 px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary/60"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
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
      className="group relative flex items-center gap-3 rounded-xl p-3 hover:bg-muted/50 transition-all duration-200 cursor-default"
    >
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors duration-200">
        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{file.file_name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-muted-foreground font-mono">{formatFileSize(file.file_size)}</span>
          <span className="text-muted-foreground/20">·</span>
          <span className="text-[10px] text-muted-foreground">{timeAgo(file.created_at)}</span>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
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
    <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] bg-background">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5">
        <GradientOrb />
        <motion.span
          className="text-sm text-muted-foreground font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
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
        <div className="h-12 flex items-center justify-between px-4 border-b border-border/50 bg-background/80 backdrop-blur-lg flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => navigate("/dashboard/projects")} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">All projects</TooltipContent>
            </Tooltip>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold text-foreground truncate max-w-[200px]">{project.name}</span>
            </div>
          </div>

          {/* Mode switcher */}
          <div className="flex items-center gap-0.5 p-1 rounded-xl bg-muted/50 border border-border/50">
            {WORKSPACE_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeMode === mode.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <mode.icon className="w-3.5 h-3.5" />
                {mode.label}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {files.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))]" />
                  <span className="text-[10px] font-mono text-muted-foreground">{files.length} files</span>
                </div>
                <div className="w-px h-3 bg-border" />
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
              <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" />
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative z-10 flex flex-col items-center gap-6 p-16 rounded-[2rem] border-2 border-dashed border-primary/40 bg-primary/[0.03]"
              >
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/30">
                    <Upload className="w-10 h-10 text-primary-foreground" />
                  </div>
                </motion.div>
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">Drop your files</p>
                  <p className="text-sm text-muted-foreground mt-1.5">Any file type · Any size · Multiple files</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ BODY ═══ */}
        <div className="flex flex-1 min-h-0">
          {/* ─── Main Chat ─── */}
          <div className="flex-1 flex flex-col min-w-0">
            {!hasMessages ? (
              /* ===== EMPTY STATE ===== */
              <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
                {/* Ambient background glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-3xl" />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center max-w-[680px] w-full relative z-10"
                >
                  <div className="mb-8">
                    <GradientOrb />
                  </div>

                  <h1 className="text-3xl sm:text-[2.5rem] font-extrabold text-center mb-3 tracking-tight text-foreground leading-[1.1]">
                    What should we build
                    <br />
                    <span className="text-gradient">from your data?</span>
                  </h1>
                  <p className="text-muted-foreground text-center mb-10 text-base max-w-md leading-relaxed">
                    Upload documents, ask questions, and let AI transform raw data into insights.
                  </p>

                  {/* File pills */}
                  {files.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center flex-wrap gap-2 mb-8 justify-center"
                    >
                      {files.slice(0, 5).map((f: any) => {
                        const FIcon = getFileIcon(f.mime_type);
                        return (
                          <div
                            key={f.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium text-foreground shadow-sm"
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

                  {/* Input */}
                  <InputBar textareaRef={textareaRef} chatInput={chatInput} setChatInput={setChatInput} inputFocused={inputFocused} setInputFocused={setInputFocused} sendMessage={sendMessage} streaming={streaming} uploading={uploading} large className="w-full mb-10" />

                  {/* Quick action chips */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {QUICK_ACTIONS.map((action, i) => (
                      <motion.button
                        key={action.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => sendMessage(action.prompt)}
                        className="group flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300"
                      >
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center`}>
                          <action.icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[13px] font-semibold text-foreground">{action.label}</span>
                        <ChevronLeft className="w-3 h-3 text-muted-foreground/40 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                      </motion.button>
                    ))}
                  </div>

                  <p className="text-[10px] text-muted-foreground/40 text-center mt-10 font-mono tracking-wider uppercase">
                    DataAfro may produce inaccurate results · Always verify critical data
                  </p>
                </motion.div>
              </div>
            ) : (
              /* ===== CHAT MESSAGES ===== */
              <>
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
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
                <div className="flex-shrink-0 border-t border-border/30">
                  <div className="max-w-[740px] mx-auto px-4 py-3">
                    <InputBar textareaRef={textareaRef} chatInput={chatInput} setChatInput={setChatInput} inputFocused={inputFocused} setInputFocused={setInputFocused} sendMessage={sendMessage} streaming={streaming} uploading={uploading} />
                  </div>
                </div>
              </>
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
                className="hidden md:flex flex-shrink-0 border-l border-border/50 bg-muted/20 overflow-hidden"
              >
                <div className="w-[300px] h-full flex flex-col">
                  {/* Panel content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Project card */}
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm shadow-primary/15">
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
                      {/* Stats row */}
                      <div className="flex items-center gap-4 pt-3 border-t border-border/50">
                        {[
                          { icon: File, value: files.length, label: "files" },
                          { icon: HardDrive, value: formatFileSize(totalSize), label: "" },
                          { icon: MessageSquare, value: messages.length, label: "msgs" },
                        ].map((s, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <s.icon className="w-3 h-3 text-muted-foreground/60" />
                            <span className="text-[11px] font-semibold text-foreground">{s.value}</span>
                            {s.label && <span className="text-[10px] text-muted-foreground">{s.label}</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Upload */}
                    <button
                      onClick={() => document.getElementById("file-input")?.click()}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 text-sm font-semibold text-muted-foreground hover:text-primary transition-all duration-200"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Files
                    </button>

                    {/* Files */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Files</span>
                        {files.length > 0 && (
                          <span className="text-[10px] font-mono text-muted-foreground/70 bg-muted px-2 py-0.5 rounded-full">
                            {files.length}
                          </span>
                        )}
                      </div>

                      {files.length === 0 ? (
                        <div className="flex flex-col items-center py-8 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                            <FileText className="w-6 h-6 text-muted-foreground/30" />
                          </div>
                          <p className="text-xs text-muted-foreground">No files yet</p>
                          <p className="text-[10px] text-muted-foreground/50 mt-0.5">Drag files or click upload</p>
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

/* ─── Input Bar (extracted) ─── */
function InputBar({
  textareaRef, chatInput, setChatInput, inputFocused, setInputFocused,
  sendMessage, streaming, uploading, large = false, className = "",
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
  className?: string;
}) {
  return (
    <div className={className}>
      <div className={`relative rounded-2xl border transition-all duration-300 ${
        inputFocused
          ? "border-primary/40 bg-card shadow-[0_0_0_3px_hsl(var(--primary)/0.06),0_4px_20px_hsl(var(--primary)/0.08)]"
          : "border-border bg-card/80 shadow-sm hover:shadow-md hover:border-border/80"
      }`}>
        <textarea
          ref={textareaRef}
          placeholder="Ask anything about your data…"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          rows={1}
          className={`w-full bg-transparent border-0 outline-none resize-none text-foreground placeholder:text-muted-foreground/50 px-5 pt-4 pb-1 min-h-[44px] max-h-[200px] ${large ? "text-base" : "text-[15px]"}`}
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-2 rounded-xl text-muted-foreground/50 hover:text-primary hover:bg-primary/5 transition-all duration-200"
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
          <button
            onClick={() => sendMessage()}
            disabled={!chatInput.trim() || streaming}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
              ${chatInput.trim() && !streaming
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95"
                : "bg-muted text-muted-foreground/30 cursor-not-allowed"
              }`}
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailPage;
