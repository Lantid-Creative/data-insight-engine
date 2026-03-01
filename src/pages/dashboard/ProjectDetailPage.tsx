import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  Upload, File, X, Send, Bot, Loader2, Sparkles, Paperclip,
  BarChart3, FileText, Wand2, Database, ArrowUp, Copy, Check, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

const ACCEPTED = ".csv,.xlsx,.xls,.json,.pdf,.docx,.txt,.png,.jpg,.jpeg";

const QUICK_ACTIONS = [
  { icon: BarChart3, label: "Analyze Data", prompt: "Analyze the key patterns and insights from my uploaded data", gradient: "from-emerald-500/10 to-emerald-500/5", iconColor: "text-emerald-500", border: "border-emerald-500/20 hover:border-emerald-500/40" },
  { icon: FileText, label: "Generate Report", prompt: "Generate a comprehensive report based on my files", gradient: "from-blue-500/10 to-blue-500/5", iconColor: "text-blue-500", border: "border-blue-500/20 hover:border-blue-500/40" },
  { icon: Wand2, label: "Clean Dataset", prompt: "Help me clean and prepare this dataset for analysis", gradient: "from-purple-500/10 to-purple-500/5", iconColor: "text-purple-500", border: "border-purple-500/20 hover:border-purple-500/40" },
  { icon: Database, label: "Data Summary", prompt: "Summarize the structure and content of my uploaded files", gradient: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-500", border: "border-amber-500/20 hover:border-amber-500/40" },
];

/* ─── Message Bubble ─── */
function MessageBubble({ message, onCopy }: { message: any; onCopy: (text: string) => void }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`group relative ${isUser ? "flex justify-end" : ""}`}
    >
      <div className={`${isUser ? "max-w-[75%]" : "max-w-full"}`}>
        {/* Assistant label */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">DataAfro AI</span>
          </div>
        )}

        {/* Content */}
        <div className={`${
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3"
            : "pl-8"
        }`}>
          {!isUser ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-[0.9rem] leading-relaxed [&>p]:mb-3 [&>ul]:mb-3 [&>ol]:mb-3 [&>h1]:text-lg [&>h2]:text-base [&>h3]:text-sm [&>h1]:font-semibold [&>h2]:font-semibold [&>h3]:font-semibold [&>pre]:bg-muted [&>pre]:rounded-xl [&>pre]:border [&>pre]:border-border [&>pre]:p-4 [&>blockquote]:border-l-primary/40 [&>blockquote]:bg-muted/50 [&>blockquote]:rounded-r-lg [&>blockquote]:py-1 [&>blockquote]:px-4">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm leading-relaxed">{message.content}</p>
          )}
        </div>

        {/* Actions for assistant messages */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-2 pl-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onCopy(message.content)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Streaming Indicator ─── */
function StreamingMessage({ content }: { content: string }) {
  if (content) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">DataAfro AI</span>
        </div>
        <div className="pl-8">
          <div className="prose prose-sm dark:prose-invert max-w-none text-[0.9rem] leading-relaxed [&>p]:mb-3">
            <ReactMarkdown>{content}</ReactMarkdown>
            <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 -mb-0.5" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center shadow-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">Thinking…</span>
      </div>
      <div className="pl-8">
        <div className="flex gap-3">
          <div className="h-3 w-48 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="flex gap-3 mt-2">
          <div className="h-3 w-72 rounded-full bg-muted animate-pulse" style={{ animationDelay: "150ms" }} />
        </div>
        <div className="flex gap-3 mt-2">
          <div className="h-3 w-36 rounded-full bg-muted animate-pulse" style={{ animationDelay: "300ms" }} />
        </div>
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [chatInput]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    if (!user || !projectId) return;
    setUploading(true);
    const arr = Array.from(fileList);
    for (const file of arr) {
      const filePath = `${user.id}/${projectId}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("project-files").upload(filePath, file);
      if (uploadErr) { toast.error(`Failed to upload ${file.name}`); continue; }
      await supabase.from("project_files").insert({
        project_id: projectId, user_id: user.id, file_name: file.name,
        file_path: filePath, file_size: file.size, mime_type: file.type,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
    toast.success(`${arr.length} file(s) uploaded`);
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
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center animate-pulse">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-sm text-muted-foreground">Loading project…</span>
      </div>
    </div>
  );
  if (!project) return <div className="text-center py-20"><p>Project not found</p></div>;

  const hasMessages = messages.length > 0 || streaming;
  const userName = user?.email?.split("@")[0] || "there";

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
              className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-xl flex items-center justify-center backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                  <Upload className="w-7 h-7 text-primary-foreground" />
                </div>
                <p className="text-base font-semibold text-primary">Drop files to upload</p>
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
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center max-w-2xl w-full"
              >
                {/* Animated brand icon */}
                <motion.div
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-glow"
                >
                  <Sparkles className="w-7 h-7 text-primary-foreground" />
                </motion.div>

                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-center mb-2">
                  What can I help you with?
                </h2>
                <p className="text-muted-foreground text-center mb-8 text-sm">
                  Ask anything about <span className="font-medium text-foreground">{project.name}</span> — analyze data, generate reports, or get insights
                </p>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-3 w-full mb-8">
                  {QUICK_ACTIONS.map((action, i) => (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      onClick={() => sendMessage(action.prompt)}
                      className={`flex items-center gap-3 p-4 rounded-xl border bg-gradient-to-br ${action.gradient} ${action.border} transition-all hover:shadow-soft text-left group`}
                    >
                      <action.icon className={`w-5 h-5 ${action.iconColor} flex-shrink-0`} />
                      <span className="text-sm font-medium text-foreground">{action.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Attached files */}
                {files.length > 0 && (
                  <div className="flex items-center flex-wrap gap-2 mb-4 w-full">
                    <span className="text-xs text-muted-foreground mr-1">Files:</span>
                    {files.map((f: any) => (
                      <div key={f.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 text-xs group border border-border/50">
                        <File className="w-3 h-3 text-primary" />
                        <span className="truncate max-w-[100px]">{f.file_name}</span>
                        <button
                          onClick={() => deleteFile.mutate(f)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="w-full">
                  <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden transition-shadow focus-within:shadow-elevated focus-within:border-primary/30">
                    <textarea
                      ref={textareaRef}
                      placeholder="Ask me anything about your data…"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      rows={3}
                      className="w-full bg-transparent border-0 outline-none resize-none text-sm placeholder:text-muted-foreground p-4 pb-2"
                    />
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              onClick={() => document.getElementById("file-input")?.click()}
                            >
                              <Paperclip className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Attach files</TooltipContent>
                        </Tooltip>
                        {uploading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                      </div>
                      <Button
                        onClick={() => sendMessage()}
                        disabled={!chatInput.trim() || streaming}
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-gradient-primary text-primary-foreground hover:opacity-90 disabled:opacity-30"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    DataAfro AI can make mistakes. Verify important insights.
                  </p>
                </div>
              </motion.div>
            </div>
          ) : (
            /* ===== CHAT MESSAGES ===== */
            <>
              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
                {/* Attached files bar */}
                {files.length > 0 && (
                  <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
                    <div className="max-w-3xl mx-auto flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
                      <span className="text-xs text-muted-foreground flex-shrink-0">Files:</span>
                      {files.map((f: any) => (
                        <div key={f.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 text-xs group flex-shrink-0 border border-border/50">
                          <File className="w-3 h-3 text-primary" />
                          <span className="truncate max-w-[100px]">{f.file_name}</span>
                          <button
                            onClick={() => deleteFile.mutate(f)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
                            onClick={() => document.getElementById("file-input")?.click()}
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Add more files</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )}

                <div className="max-w-3xl mx-auto space-y-6 py-6 px-4">
                  {messages.map((m: any) => (
                    <MessageBubble key={m.id} message={m} onCopy={handleCopy} />
                  ))}

                  {streaming && <StreamingMessage content={streamingContent} />}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Bottom input bar */}
              <div className="flex-shrink-0 border-t border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="max-w-3xl mx-auto px-4 py-3">
                  <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden transition-shadow focus-within:shadow-card focus-within:border-primary/30">
                    <div className="flex items-end gap-2 p-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0 mb-0.5"
                            onClick={() => document.getElementById("file-input")?.click()}
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Attach files</TooltipContent>
                      </Tooltip>
                      <textarea
                        ref={textareaRef}
                        placeholder="Ask a follow up…"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        rows={1}
                        className="flex-1 bg-transparent border-0 outline-none resize-none text-sm placeholder:text-muted-foreground py-2 min-h-[36px]"
                      />
                      {uploading && <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0 mb-2" />}
                      <Button
                        onClick={() => sendMessage()}
                        disabled={!chatInput.trim() || streaming}
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-gradient-primary text-primary-foreground hover:opacity-90 disabled:opacity-30 flex-shrink-0 mb-0.5"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                    DataAfro AI can make mistakes. Verify important insights.
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
          accept={ACCEPTED}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>
    </TooltipProvider>
  );
};

export default ProjectDetailPage;
