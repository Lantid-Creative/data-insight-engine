import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  Upload, File, X, Send, Bot, User, Loader2, Sparkles, Paperclip,
  BarChart3, FileText, Wand2, Database, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

const ACCEPTED = ".csv,.xlsx,.xls,.json,.pdf,.docx,.txt,.png,.jpg,.jpeg";

const QUICK_ACTIONS = [
  { icon: BarChart3, label: "Analyze Data", prompt: "Analyze the key patterns and insights from my uploaded data", color: "text-emerald-500" },
  { icon: FileText, label: "Generate Report", prompt: "Generate a comprehensive report based on my files", color: "text-blue-500" },
  { icon: Wand2, label: "Clean Dataset", prompt: "Help me clean and prepare this dataset for analysis", color: "text-purple-500" },
  { icon: Database, label: "Data Summary", prompt: "Summarize the structure and content of my uploaded files", color: "text-amber-500" },
];

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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [chatInput]);

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

  if (projLoading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!project) return <div className="text-center py-20"><p>Project not found</p></div>;

  const hasMessages = messages.length > 0 || streaming;
  const userName = user?.email?.split("@")[0] || "there";

  return (
    <TooltipProvider>
      <div
        className="flex flex-col h-[calc(100vh-3.5rem)] relative"
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
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-10 h-10 text-primary" />
                <p className="text-lg font-semibold text-primary">Drop files to upload</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Uploaded files bar */}
        {files.length > 0 && (
          <div className="flex items-center gap-2 px-1 pb-3 overflow-x-auto flex-shrink-0 scrollbar-hide">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 flex-shrink-0"
              onClick={() => navigate("/dashboard/projects")}
            >
              <ArrowLeft className="w-3 h-3" />
              Projects
            </Button>
            <div className="h-4 w-px bg-border flex-shrink-0" />
            {files.map((f: any) => (
              <div key={f.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-xs group flex-shrink-0 border border-border/50">
                <File className="w-3 h-3 text-primary" />
                <span className="truncate max-w-[120px]">{f.file_name}</span>
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

        {/* Chat area */}
        <div className="flex-1 min-h-0 flex flex-col">
          {!hasMessages ? (
            /* ===== EMPTY STATE — Centered welcome ===== */
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center max-w-2xl w-full"
              >
                {/* Brand icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-5 shadow-glow">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>

                {/* Greeting */}
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-center mb-1">
                  Hey 👋 <span className="capitalize">{userName}</span>!
                </h2>
                <p className="text-muted-foreground text-center mb-8">
                  What would you like to analyze in <span className="font-medium text-foreground">{project.name}</span>?
                </p>

                {/* Input area */}
                <div className="w-full rounded-2xl border border-border bg-card shadow-card p-3 mb-6">
                  <textarea
                    ref={textareaRef}
                    placeholder="Ask me anything about your data…"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    rows={2}
                    className="w-full bg-transparent border-0 outline-none resize-none text-sm placeholder:text-muted-foreground px-1"
                  />
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost" size="sm"
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => document.getElementById("file-input")?.click()}
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            Attach
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Upload files to this project</TooltipContent>
                      </Tooltip>
                      {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                    </div>
                    <Button
                      onClick={() => sendMessage()}
                      disabled={!chatInput.trim() || streaming}
                      size="sm"
                      className="h-8 gap-1.5 bg-gradient-primary text-primary-foreground rounded-full px-4 hover:opacity-90"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </Button>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.prompt)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-soft transition-all group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <action.icon className={`w-5 h-5 ${action.color}`} />
                      </div>
                      <span className="text-xs font-medium text-foreground">{action.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            /* ===== CHAT MESSAGES ===== */
            <>
              <ScrollArea className="flex-1">
                <div className="max-w-3xl mx-auto space-y-5 py-4 px-2">
                  {messages.map((m: any) => (
                    <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                      {m.role === "assistant" && (
                        <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <Bot className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}>
                        {m.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm">{m.content}</p>
                        )}
                      </div>
                      {m.role === "user" && (
                        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Streaming */}
                  {streaming && streamingContent && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-3 bg-muted">
                        <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                          <ReactMarkdown>{streamingContent}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                  {streaming && !streamingContent && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-muted">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                          <span className="text-xs text-muted-foreground">Analyzing…</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              {/* Bottom input bar — always visible */}
              <div className="flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-sm px-4 py-3">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-end gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost" size="icon"
                          className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={() => document.getElementById("file-input")?.click()}
                        >
                          <Paperclip className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Attach files</TooltipContent>
                    </Tooltip>
                    <div className="flex-1 rounded-xl border border-border bg-background px-3 py-2">
                      <textarea
                        ref={textareaRef}
                        placeholder="Ask anything about your data…"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        rows={1}
                        className="w-full bg-transparent border-0 outline-none resize-none text-sm placeholder:text-muted-foreground"
                      />
                    </div>
                    <Button
                      onClick={() => sendMessage()}
                      disabled={!chatInput.trim() || streaming}
                      size="icon"
                      className="h-9 w-9 flex-shrink-0 bg-gradient-primary text-primary-foreground rounded-full hover:opacity-90"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
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
