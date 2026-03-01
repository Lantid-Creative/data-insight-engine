import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Upload, File, X, Send, Bot, User, Loader2, Sparkles, Files, MessageSquare, PanelLeftClose, PanelLeft } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const ACCEPTED = ".csv,.xlsx,.xls,.json,.pdf,.docx,.txt,.png,.jpg,.jpeg";

const SUGGESTED_PROMPTS = [
  "Summarize the key insights from my data",
  "What trends can you identify?",
  "Generate a report based on my files",
  "Help me clean and prepare this dataset",
];

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [showFiles, setShowFiles] = useState(!isMobile);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: project, isLoading: projLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", projectId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ["project-files", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", projectId!)
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
        .from("chat_messages")
        .select("*")
        .eq("project_id", projectId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

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
    e.preventDefault();
    setDragOver(false);
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

  if (projLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!project) return <div className="text-center py-20"><p>Project not found</p></div>;

  const hasMessages = messages.length > 0 || streaming;

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/dashboard/projects")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold font-heading truncate">{project.name}</h1>
          {project.description && <p className="text-xs text-muted-foreground truncate">{project.description}</p>}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Files className="w-3 h-3" /> {files.length}</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {messages.length}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowFiles(!showFiles)}>
          {showFiles ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Main area: Files panel + Chat */}
      <div className="flex-1 flex min-h-0 mt-3 gap-3">
        {/* Files Panel */}
        <AnimatePresence>
          {showFiles && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isMobile ? "100%" : 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 flex flex-col min-h-0 overflow-hidden"
            >
              {/* Drop zone */}
              <Card
                className={`border-2 border-dashed transition-colors cursor-pointer flex-shrink-0 ${
                  dragOver ? "border-primary bg-accent" : "border-border hover:border-primary/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("project-file-input")?.click()}
              >
                <CardContent className="flex flex-col items-center justify-center py-6 px-3">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary mb-1" />
                  ) : (
                    <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                  )}
                  <p className="text-xs font-medium">{uploading ? "Uploading…" : "Drop files here"}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">CSV, Excel, JSON, PDF, etc.</p>
                  <input id="project-file-input" type="file" multiple accept={ACCEPTED} onChange={(e) => e.target.files && handleFiles(e.target.files)} className="hidden" />
                </CardContent>
              </Card>

              {/* File list */}
              <ScrollArea className="flex-1 mt-2">
                <div className="space-y-1">
                  {files.map((f: any) => (
                    <div key={f.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/70 transition-colors group">
                      <div className="flex items-center gap-2 min-w-0">
                        <File className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{f.file_name}</p>
                          <p className="text-[10px] text-muted-foreground">{(f.file_size / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteFile.mutate(f)}>
                        <X className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {files.length === 0 && !filesLoading && (
                    <p className="text-center text-xs text-muted-foreground py-6">No files yet</p>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat */}
        <div className={`flex-1 flex flex-col min-h-0 min-w-0 ${showFiles && isMobile ? "hidden" : ""}`}>
          <ScrollArea className="flex-1">
            <div className="space-y-4 pb-4 pr-2">
              {/* Empty state with suggested prompts */}
              {!hasMessages && (
                <div className="flex flex-col items-center justify-center py-8 sm:py-16">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Chat with DataAfro AI</h3>
                  <p className="text-muted-foreground text-sm mt-1 max-w-sm text-center mb-6">
                    Ask anything about your data — analysis, reports, cleaning, insights.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2 w-full max-w-lg">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        className="text-left h-auto py-3 px-4 justify-start text-xs hover:border-primary/40 hover:bg-primary/5 transition-colors"
                        onClick={() => sendMessage(prompt)}
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-2 text-primary flex-shrink-0" />
                        <span className="line-clamp-1">{prompt}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((m: any) => (
                <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
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
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming */}
              {streaming && streamingContent && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-muted">
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                      <ReactMarkdown>{streamingContent}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
              {streaming && !streamingContent && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-muted flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="flex gap-2 pt-3 border-t border-border flex-shrink-0">
            <Input
              ref={inputRef}
              placeholder="Ask anything about your data…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={streaming}
              className="text-sm"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!chatInput.trim() || streaming}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
