import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Upload, File, X, Send, Bot, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const ACCEPTED = ".csv,.xlsx,.xls,.json,.pdf,.docx,.txt,.png,.jpg,.jpeg";

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("chat");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Project data
  const { data: project, isLoading: projLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", projectId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  // Files
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

  // Chat messages
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

  // File upload
  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    if (!user || !projectId) return;
    setUploading(true);
    const arr = Array.from(fileList);

    for (const file of arr) {
      const filePath = `${user.id}/${projectId}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("project-files").upload(filePath, file);
      if (uploadErr) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }
      const { error: dbErr } = await supabase.from("project_files").insert({
        project_id: projectId,
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
      });
      if (dbErr) toast.error(`Failed to save ${file.name} metadata`);
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

  // Chat with AI (streaming)
  const sendMessage = async () => {
    if (!chatInput.trim() || streaming) return;
    const msg = chatInput.trim();
    setChatInput("");
    setStreaming(true);
    setStreamingContent("");

    // Optimistic user message
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
            if (delta) {
              full += delta;
              setStreamingContent(full);
            }
          } catch { /* partial */ }
        }
      }

      // Refresh messages from DB
      queryClient.invalidateQueries({ queryKey: ["chat-messages", projectId] });
    } catch (e: any) {
      toast.error(e.message || "Failed to send message");
    } finally {
      setStreaming(false);
      setStreamingContent("");
    }
  };

  if (projLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!project) return <div className="text-center py-20"><p>Project not found</p></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/projects")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold font-heading truncate">{project.name}</h1>
          {project.description && <p className="text-sm text-muted-foreground truncate">{project.description}</p>}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col min-h-0 mt-4">
        <TabsList className="w-fit flex-shrink-0">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="files">Files ({files.length})</TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 pb-4">
              {messages.length === 0 && !streaming && (
                <div className="text-center py-12">
                  <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">Start a conversation</h3>
                  <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                    Ask DataAfro AI to analyze your data, generate reports, find insights, or anything else.
                  </p>
                </div>
              )}
              {messages.map((m: any) => (
                <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}>
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{m.content}</p>
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {streaming && streamingContent && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{streamingContent}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
              {streaming && !streamingContent && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-muted">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="flex gap-2 pt-4 border-t border-border flex-shrink-0">
            <Input
              ref={inputRef}
              placeholder="Ask DataAfro AI anything about your project…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={streaming}
            />
            <Button
              onClick={sendMessage}
              disabled={!chatInput.trim() || streaming}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="flex-1 flex flex-col min-h-0 mt-4 space-y-4">
          {/* Drop Zone */}
          <Card
            className={`border-2 border-dashed transition-colors cursor-pointer flex-shrink-0 ${
              dragOver ? "border-primary bg-accent" : "border-border hover:border-primary/50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("project-file-input")?.click()}
          >
            <CardContent className="flex flex-col items-center justify-center py-10">
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              )}
              <p className="font-medium">{uploading ? "Uploading…" : "Drag & drop files here"}</p>
              <p className="text-xs text-muted-foreground mt-1">CSV, Excel, JSON, PDF, DOCX, TXT, Images</p>
              <input id="project-file-input" type="file" multiple accept={ACCEPTED} onChange={(e) => e.target.files && handleFiles(e.target.files)} className="hidden" />
            </CardContent>
          </Card>

          {/* File List */}
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {files.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3 min-w-0">
                    <File className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{f.file_name}</p>
                      <p className="text-xs text-muted-foreground">{(f.file_size / 1024).toFixed(1)} KB · {new Date(f.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteFile.mutate(f)}>
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {files.length === 0 && !filesLoading && (
                <p className="text-center text-muted-foreground py-8">No files uploaded yet. Drop files above to get started.</p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailPage;
