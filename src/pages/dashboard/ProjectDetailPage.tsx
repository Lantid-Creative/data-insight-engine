import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  Upload, File, X, Loader2, Sparkles, Paperclip,
  BarChart3, FileText, Wand2, Database, ArrowUp, Copy, Check,
  RotateCcw, ThumbsUp, ThumbsDown, PanelRightOpen, PanelRightClose,
  FileSpreadsheet, FileImage, FileCode, FileArchive, Download,
  Trash2, Eye, Clock, HardDrive, Layers, Zap, Table2, PieChart,
  Settings2, ChevronRight, MessageSquare,
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

const QUICK_ACTIONS = [
  { icon: BarChart3, label: "Analyze Data", desc: "Discover patterns, trends & outliers", prompt: "Analyze the key patterns and insights from my uploaded data", color: "from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40" },
  { icon: FileText, label: "Generate Report", desc: "Create a formatted summary report", prompt: "Generate a comprehensive report based on my files", color: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40" },
  { icon: Wand2, label: "Clean & Prepare", desc: "Fix, validate & prepare datasets", prompt: "Help me clean and prepare this dataset for analysis", color: "from-violet-500/10 to-violet-600/5 border-violet-500/20 hover:border-violet-500/40" },
  { icon: Database, label: "Deep Summarize", desc: "Structure & content overview", prompt: "Summarize the structure and content of my uploaded files", color: "from-amber-500/10 to-amber-600/5 border-amber-500/20 hover:border-amber-500/40" },
  { icon: PieChart, label: "Visualize", desc: "Charts, graphs & dashboards", prompt: "Create visualizations and charts from my data", color: "from-rose-500/10 to-rose-600/5 border-rose-500/20 hover:border-rose-500/40" },
  { icon: Table2, label: "Extract Tables", desc: "Pull structured data from docs", prompt: "Extract all tables and structured data from my documents", color: "from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 hover:border-cyan-500/40" },
];

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group"
    >
      {isUser ? (
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary/10 border border-primary/20 px-5 py-3.5 backdrop-blur-sm">
            <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/20">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight">DataAfro</span>
            <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">AI</span>
          </div>

          <div className="pl-[42px]">
            <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-[1.8]
              [&>p]:mb-4 [&>p:last-child]:mb-0
              [&>ul]:mb-4 [&>ol]:mb-4 [&>li]:mb-1.5
              [&>h1]:text-xl [&>h2]:text-lg [&>h3]:text-base
              [&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-semibold
              [&>h1]:mt-6 [&>h2]:mt-5 [&>h3]:mt-4
              [&>pre]:bg-[hsl(var(--muted))] [&>pre]:rounded-xl [&>pre]:border [&>pre]:border-border [&>pre]:p-4 [&>pre]:text-sm [&>pre]:overflow-x-auto
              [&>blockquote]:border-l-2 [&>blockquote]:border-primary/40 [&>blockquote]:pl-4 [&>blockquote]:text-muted-foreground [&>blockquote]:italic
              [&_code]:bg-primary/5 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-sm [&_code]:font-mono [&_code]:border [&_code]:border-primary/10
              [&>pre_code]:bg-transparent [&>pre_code]:p-0 [&>pre_code]:border-0 [&>pre_code]:text-foreground">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-0.5 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
              {[
                { icon: copied ? Check : Copy, onClick: handleCopy, label: copied ? "Copied!" : "Copy", active: copied },
                ...(isLast && onRetry ? [{ icon: RotateCcw, onClick: onRetry, label: "Retry", active: false }] : []),
                { icon: ThumbsUp, onClick: () => {}, label: "Good", active: false },
                { icon: ThumbsDown, onClick: () => {}, label: "Bad", active: false },
              ].map((action, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={action.onClick}
                      className={`p-1.5 rounded-lg transition-all duration-150 ${
                        action.active
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2.5"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/20">
          <Sparkles className="w-4 h-4 text-primary-foreground animate-pulse" />
        </div>
        <span className="text-sm font-bold text-foreground tracking-tight">DataAfro</span>
        {!content && (
          <div className="flex items-center gap-[3px] ml-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="pl-[42px]">
        {content ? (
          <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-[1.8] [&>p]:mb-4 [&>p:last-child]:mb-0">
            <ReactMarkdown>{content}</ReactMarkdown>
            <motion.span
              className="inline-block w-[2px] h-5 bg-primary ml-0.5 align-text-bottom rounded-full"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-primary/30 to-transparent" />
            <p className="text-sm text-muted-foreground font-medium">Analyzing your data…</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── File Card for Side Panel ─── */
function FileCard({ file, onDelete }: { file: any; onDelete: () => void }) {
  const Icon = getFileIcon(file.mime_type);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative rounded-xl border border-border bg-card p-3.5 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
          <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{file.file_name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-muted-foreground font-mono">{formatFileSize(file.file_size)}</span>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-[11px] text-muted-foreground">{timeAgo(file.created_at)}</span>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
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
    <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-primary/30"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <span className="text-sm text-muted-foreground font-medium">Loading workspace…</span>
      </motion.div>
    </div>
  );

  if (!project) return <div className="text-center py-20"><p className="text-muted-foreground">Project not found</p></div>;

  const hasMessages = messages.length > 0 || streaming;
  const totalSize = files.reduce((acc: number, f: any) => acc + (f.file_size || 0), 0);

  /* ─── Input Bar ─── */
  const InputBar = ({ className = "", large = false }: { className?: string; large?: boolean }) => (
    <div className={className}>
      <div className={`relative rounded-2xl border bg-card/80 backdrop-blur-sm transition-all duration-300 ${
        inputFocused
          ? "border-primary/50 shadow-[0_0_0_3px_hsl(var(--primary)/0.08),0_2px_12px_hsl(var(--primary)/0.1)]"
          : "border-border shadow-sm hover:border-border/80 hover:shadow-md"
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
          className={`w-full bg-transparent border-0 outline-none resize-none text-foreground placeholder:text-muted-foreground/60 px-5 pt-4 pb-1 min-h-[44px] max-h-[200px] ${large ? "text-base" : "text-[15px]"}`}
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-150"
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <Paperclip className="w-[18px] h-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">Attach files</TooltipContent>
            </Tooltip>
            {uploading && (
              <div className="flex items-center gap-2 ml-1">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Uploading…</span>
              </div>
            )}
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!chatInput.trim() || streaming}
            className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center transition-all duration-200 hover:shadow-md hover:shadow-primary/20 hover:scale-105 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div
        className="flex h-[calc(100vh-3.5rem)] relative overflow-hidden"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* ═══ DRAG OVERLAY ═══ */}
        <AnimatePresence>
          {dragOver && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="relative z-10 flex flex-col items-center gap-4 p-12 rounded-3xl border-2 border-dashed border-primary/50 bg-primary/5"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/25"
                >
                  <Upload className="w-8 h-8 text-primary-foreground" />
                </motion.div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">Drop files here</p>
                  <p className="text-sm text-muted-foreground mt-1">Any file type · Any size</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ MAIN CHAT AREA ═══ */}
        <div className="flex-1 flex flex-col min-w-0">
          {!hasMessages ? (
            /* ===== EMPTY STATE ===== */
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex flex-col items-center max-w-[720px] w-full"
              >
                {/* Animated logo */}
                <div className="relative mb-10">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/20"
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-7 h-7 text-primary-foreground" />
                  </motion.div>
                  <motion.div
                    className="absolute -inset-3 rounded-3xl border border-primary/20"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-2 tracking-tight text-foreground">
                  What should we build from your data?
                </h1>
                <p className="text-muted-foreground text-center mb-10 text-base max-w-lg leading-relaxed">
                  Upload documents, ask questions, and watch DataAfro transform your raw data into insights, reports, and visualizations.
                </p>

                {/* File pills */}
                {files.length > 0 && (
                  <div className="flex items-center flex-wrap gap-2 mb-8 justify-center">
                    {files.slice(0, 6).map((f: any) => {
                      const FIcon = getFileIcon(f.mime_type);
                      return (
                        <motion.div
                          key={f.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/80 text-sm group border border-border/50 hover:border-primary/30 transition-all cursor-default"
                        >
                          <FIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="truncate max-w-[140px] text-foreground text-xs font-medium">{f.file_name}</span>
                        </motion.div>
                      );
                    })}
                    {files.length > 6 && (
                      <span className="text-xs text-muted-foreground font-medium">+{files.length - 6} more</span>
                    )}
                  </div>
                )}

                {/* Input */}
                <InputBar className="w-full mb-8" large />

                {/* Quick actions grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                  {QUICK_ACTIONS.map((action, i) => (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                      onClick={() => sendMessage(action.prompt)}
                      className={`group relative flex flex-col items-start gap-2 p-4 rounded-2xl border bg-gradient-to-br transition-all duration-300 text-left overflow-hidden ${action.color}`}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br from-white/5 to-transparent -translate-y-1/2 translate-x-1/2" />
                      <action.icon className="w-5 h-5 text-foreground/70 group-hover:text-foreground transition-colors relative z-10" />
                      <div className="relative z-10">
                        <span className="text-sm font-semibold text-foreground block">{action.label}</span>
                        <span className="text-[11px] text-muted-foreground leading-snug">{action.desc}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <p className="text-[11px] text-muted-foreground/50 text-center mt-8 font-mono">
                  DataAfro may produce inaccurate results · Always verify critical data
                </p>
              </motion.div>
            </div>
          ) : (
            /* ===== CHAT MESSAGES ===== */
            <>
              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
                <div className="max-w-[720px] mx-auto space-y-8 py-8 px-4">
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
              <div className="flex-shrink-0 border-t border-border/50 bg-gradient-to-t from-background via-background/95 to-transparent">
                <div className="max-w-[720px] mx-auto px-4 py-3">
                  <InputBar />
                  <p className="text-[10px] text-muted-foreground/40 text-center mt-2 font-mono">
                    DataAfro may produce inaccurate results · Always verify critical data
                  </p>
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
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex-shrink-0 border-l border-border bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              <div className="w-[320px] h-full flex flex-col">
                {/* Panel header */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-border/50 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">Workspace</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setPanelOpen(false)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                      >
                        <PanelRightClose className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">Close panel</TooltipContent>
                  </Tooltip>
                </div>

                {/* Panel content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Project Info */}
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Project</h3>
                    <div className="rounded-xl border border-border bg-background p-3.5">
                      <p className="font-bold text-foreground text-sm truncate">{project.name}</p>
                      {project.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <File className="w-3 h-3" />
                          <span>{files.length} files</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <HardDrive className="w-3 h-3" />
                          <span>{formatFileSize(totalSize)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <MessageSquare className="w-3 h-3" />
                          <span>{messages.length} msgs</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upload Button */}
                  <button
                    onClick={() => document.getElementById("file-input")?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Files
                  </button>

                  {/* Files List */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Files</h3>
                      {files.length > 0 && (
                        <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {files.length}
                        </span>
                      )}
                    </div>

                    {files.length === 0 ? (
                      <div className="flex flex-col items-center py-8 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                          <FileText className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">No files yet</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Upload or drag files to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <AnimatePresence>
                          {files.map((f: any) => (
                            <FileCard key={f.id} file={f} onDelete={() => deleteFile.mutate(f)} />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  {files.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Overview</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Total Files", value: files.length.toString(), icon: Layers },
                          { label: "Storage", value: formatFileSize(totalSize), icon: HardDrive },
                          { label: "Messages", value: messages.length.toString(), icon: MessageSquare },
                          { label: "Last Active", value: timeAgo(project.updated_at), icon: Clock },
                        ].map((stat) => (
                          <div key={stat.label} className="rounded-lg border border-border/50 bg-background p-2.5">
                            <div className="flex items-center gap-1.5 mb-1">
                              <stat.icon className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                            </div>
                            <p className="text-sm font-bold text-foreground">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Panel toggle (when closed) */}
        {!panelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-3 right-3 z-20"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setPanelOpen(true)}
                  className="p-2 rounded-xl bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground hover:shadow-md transition-all"
                >
                  <PanelRightOpen className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">Open workspace panel</TooltipContent>
            </Tooltip>
          </motion.div>
        )}

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

export default ProjectDetailPage;
