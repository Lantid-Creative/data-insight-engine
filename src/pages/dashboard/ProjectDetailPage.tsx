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
  RotateCcw, ThumbsUp, ThumbsDown,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

const ACCEPTED = "*"; // Accept all file types

const QUICK_ACTIONS = [
  { icon: BarChart3, label: "Analyze Data", desc: "Find patterns & insights", prompt: "Analyze the key patterns and insights from my uploaded data" },
  { icon: FileText, label: "Generate Report", desc: "Create formatted reports", prompt: "Generate a comprehensive report based on my files" },
  { icon: Wand2, label: "Clean Dataset", desc: "Fix & prepare data", prompt: "Help me clean and prepare this dataset for analysis" },
  { icon: Database, label: "Summarize", desc: "Overview of your data", prompt: "Summarize the structure and content of my uploaded files" },
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      {isUser ? (
        /* User message — right-aligned, warm bg */
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-3xl rounded-br-lg bg-muted px-5 py-3">
            <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        </div>
      ) : (
        /* Assistant message — full width, no bubble */
        <div className="space-y-2">
          {/* Avatar row */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">DataAfro</span>
          </div>

          {/* Content */}
          <div className="pl-[38px]">
            <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-[1.7] 
              [&>p]:mb-4 [&>p:last-child]:mb-0
              [&>ul]:mb-4 [&>ol]:mb-4 [&>li]:mb-1
              [&>h1]:text-xl [&>h2]:text-lg [&>h3]:text-base
              [&>h1]:font-semibold [&>h2]:font-semibold [&>h3]:font-semibold
              [&>h1]:mt-6 [&>h2]:mt-5 [&>h3]:mt-4
              [&>pre]:bg-[hsl(var(--muted))] [&>pre]:rounded-xl [&>pre]:border [&>pre]:border-border [&>pre]:p-4 [&>pre]:text-sm [&>pre]:overflow-x-auto
              [&>blockquote]:border-l-2 [&>blockquote]:border-primary/30 [&>blockquote]:pl-4 [&>blockquote]:text-muted-foreground [&>blockquote]:italic
              [&_code]:bg-[hsl(var(--muted))] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-sm [&_code]:font-mono
              [&>pre_code]:bg-transparent [&>pre_code]:p-0">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>

            {/* Hover actions */}
            <div className="flex items-center gap-0.5 mt-3 -ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Copy"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              {isLast && onRetry && (
                <button
                  onClick={onRetry}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Retry"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Good response"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Bad response"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-primary-foreground animate-pulse" />
        </div>
        <span className="text-sm font-semibold text-foreground">DataAfro</span>
        {!content && (
          <div className="flex items-center gap-1 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>

      <div className="pl-[38px]">
        {content ? (
          <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-[1.7] [&>p]:mb-4 [&>p:last-child]:mb-0">
            <ReactMarkdown>{content}</ReactMarkdown>
            <span className="inline-block w-[2px] h-5 bg-foreground/70 animate-pulse ml-0.5 align-text-bottom" />
          </div>
        ) : (
          <p className="text-[15px] text-muted-foreground">Thinking…</p>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─── */
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
      toast.success("File deleted");
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

  if (projLoading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    </div>
  );
  if (!project) return <div className="text-center py-20"><p className="text-muted-foreground">Project not found</p></div>;

  const hasMessages = messages.length > 0 || streaming;

  /* ─── Input Bar (shared between both states) ─── */
  const InputBar = ({ className = "" }: { className?: string }) => (
    <div className={className}>
      <div className={`rounded-[20px] border bg-card transition-all duration-200 ${
        inputFocused ? "border-primary/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.15)]" : "border-border shadow-soft"
      }`}>
        <textarea
          ref={textareaRef}
          placeholder="Message DataAfro…"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          rows={1}
          className="w-full bg-transparent border-0 outline-none resize-none text-[15px] placeholder:text-muted-foreground px-5 pt-4 pb-1 min-h-[44px] max-h-[200px]"
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <Paperclip className="w-[18px] h-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Attach files</TooltipContent>
            </Tooltip>
            {uploading && <Loader2 className="w-4 h-4 animate-spin text-primary ml-1" />}
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!chatInput.trim() || streaming}
            className="w-8 h-8 rounded-xl bg-foreground text-background flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-20 disabled:cursor-not-allowed"
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
        className="flex flex-col h-[calc(100vh-3.5rem)] relative overflow-hidden"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        <AnimatePresence>
          {dragOver && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-primary/5 border-2 border-dashed border-primary/40 rounded-2xl flex items-center justify-center backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                  <Upload className="w-6 h-6 text-primary-foreground" />
                </div>
                <p className="text-base font-semibold text-foreground">Drop files here</p>
                <p className="text-xs text-muted-foreground">CSV, PDF, Excel, JSON, and more</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat area */}
        <div className="flex-1 min-h-0 flex flex-col">
          {!hasMessages ? (
            /* ===== EMPTY STATE ===== */
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center max-w-[680px] w-full"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center mb-8">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>

                <h1 className="text-3xl sm:text-4xl font-semibold font-heading text-center mb-3 tracking-tight">
                  How can I help you today?
                </h1>
                <p className="text-muted-foreground text-center mb-10 text-base max-w-md">
                  Upload your data and ask anything — analysis, reports, cleaning, or insights.
                </p>

                {/* Attached files */}
                {files.length > 0 && (
                  <div className="flex items-center flex-wrap gap-2 mb-6 w-full justify-center">
                    {files.map((f: any) => (
                      <div key={f.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm group border border-border/50 hover:border-border transition-colors">
                        <File className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="truncate max-w-[120px] text-foreground">{f.file_name}</span>
                        <button
                          onClick={() => deleteFile.mutate(f)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input */}
                <InputBar className="w-full mb-6" />

                {/* Quick actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
                  {QUICK_ACTIONS.map((action, i) => (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.04 }}
                      onClick={() => sendMessage(action.prompt)}
                      className="flex flex-col items-start gap-1.5 p-3.5 rounded-2xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all text-left group"
                    >
                      <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-foreground">{action.label}</span>
                      <span className="text-xs text-muted-foreground leading-snug">{action.desc}</span>
                    </motion.button>
                  ))}
                </div>

                <p className="text-[11px] text-muted-foreground text-center mt-6">
                  DataAfro can make mistakes. Verify important information.
                </p>
              </motion.div>
            </div>
          ) : (
            /* ===== CHAT MESSAGES ===== */
            <>
              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
                {/* Sticky files */}
                {files.length > 0 && (
                  <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/40">
                    <div className="max-w-[680px] mx-auto flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
                      {files.map((f: any) => (
                        <div key={f.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs group flex-shrink-0 border border-border/50">
                          <File className="w-3 h-3 text-muted-foreground" />
                          <span className="truncate max-w-[100px]">{f.file_name}</span>
                          <button
                            onClick={() => deleteFile.mutate(f)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
                        onClick={() => document.getElementById("file-input")?.click()}
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="max-w-[680px] mx-auto space-y-8 py-8 px-4">
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
              <div className="flex-shrink-0 bg-gradient-to-t from-background via-background to-background/0 pt-2">
                <div className="max-w-[680px] mx-auto px-4 pb-4">
                  <InputBar />
                  <p className="text-[11px] text-muted-foreground text-center mt-2">
                    DataAfro can make mistakes. Verify important information.
                  </p>
                </div>
              </div>
            </>
          )}
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

export default ProjectDetailPage;
