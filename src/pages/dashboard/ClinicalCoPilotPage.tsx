import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Bot, Send, Stethoscope, Pill, FileText, AlertTriangle,
  Sparkles, Copy, ThumbsUp, ThumbsDown, Loader2, Heart, Brain,
  Activity, Syringe, ClipboardList, Plus, Trash2, MessageSquare,
  Download, Search, PanelLeftClose, PanelLeft, Paperclip, X, File,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  specialty: string | null;
  created_at: string;
  updated_at: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clinical-copilot`;

const specialties = [
  { value: "general", label: "General Medicine", icon: Stethoscope },
  { value: "cardiology", label: "Cardiology", icon: Heart },
  { value: "neurology", label: "Neurology", icon: Brain },
  { value: "oncology", label: "Oncology", icon: Activity },
  { value: "pediatrics", label: "Pediatrics", icon: Syringe },
  { value: "pharmacology", label: "Pharmacology", icon: Pill },
];

const quickPrompts = [
  { label: "Summarize Patient History", icon: FileText, prompt: "Summarize the patient history from the uploaded records, including key diagnoses, medications, and recent lab results." },
  { label: "Check Drug Interactions", icon: Pill, prompt: "Check for potential drug interactions between the medications in the current patient's medication list." },
  { label: "Suggest ICD-10 Codes", icon: ClipboardList, prompt: "Based on the clinical notes, suggest the most appropriate ICD-10 diagnostic codes with descriptions." },
  { label: "Flag Adverse Events", icon: AlertTriangle, prompt: "Review the patient data and flag any potential adverse events or safety signals that need attention." },
  { label: "CPT Code Lookup", icon: Syringe, prompt: "Recommend appropriate CPT procedure codes based on the documented clinical procedures and services." },
  { label: "Clinical Decision Support", icon: Brain, prompt: "Based on the patient's vitals, lab results, and history, provide clinical decision support recommendations." },
];

const WELCOME_MSG: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hello! I'm your **AI Clinical Co-Pilot**. I can help you with:\n\n- **Patient history summaries** from uploaded records\n- **Drug interaction checks** across medication lists\n- **ICD-10/CPT code suggestions** from clinical notes\n- **Adverse event detection** and safety signal flagging\n- **Clinical decision support** based on patient data\n\nHow can I assist you today?",
  timestamp: new Date(),
};

interface PinnedFile {
  name: string;
  size: number;
  type: string;
  content: string; // base64 or text content
}

const ClinicalCoPilotPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState("general");
  const [pinnedFiles, setPinnedFiles] = useState<PinnedFile[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("copilot_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (data) setConversations(data as Conversation[]);
    };
    load();
  }, [user]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConvoId || !user) {
      setMessages([WELCOME_MSG]);
      return;
    }
    const load = async () => {
      const { data } = await supabase
        .from("copilot_messages")
        .select("*")
        .eq("conversation_id", activeConvoId)
        .order("created_at", { ascending: true });
      if (data && data.length > 0) {
        setMessages(
          data.map((m: any) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: new Date(m.created_at),
          }))
        );
      } else {
        setMessages([WELCOME_MSG]);
      }
    };
    load();
  }, [activeConvoId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createConversation = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("copilot_conversations")
      .insert({ user_id: user.id, title: "New Conversation", specialty: activeSpecialty })
      .select()
      .single();
    if (error) { toast.error("Failed to create conversation"); return; }
    const convo = data as Conversation;
    setConversations((prev) => [convo, ...prev]);
    setActiveConvoId(convo.id);
    setMessages([WELCOME_MSG]);
  };

  const deleteConversation = async (id: string) => {
    await supabase.from("copilot_conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvoId === id) {
      setActiveConvoId(null);
      setMessages([WELCOME_MSG]);
    }
    toast.success("Conversation deleted");
  };

  const persistMessage = async (convoId: string, role: string, content: string) => {
    if (!user) return;
    await supabase.from("copilot_messages").insert({
      conversation_id: convoId,
      user_id: user.id,
      role,
      content,
    });
  };

  const updateConvoTitle = async (convoId: string, firstMsg: string) => {
    const title = firstMsg.slice(0, 60) + (firstMsg.length > 60 ? "..." : "");
    await supabase.from("copilot_conversations").update({ title, updated_at: new Date().toISOString() }).eq("id", convoId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convoId ? { ...c, title, updated_at: new Date().toISOString() } : c))
    );
  };

  const exportConversation = () => {
    const text = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => `[${m.role.toUpperCase()}]\n${m.content}\n`)
      .join("\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `copilot-conversation-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Conversation exported");
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !user) return;

    // Auto-create conversation if none active
    let convoId = activeConvoId;
    if (!convoId) {
      const { data, error } = await supabase
        .from("copilot_conversations")
        .insert({ user_id: user.id, title: content.slice(0, 60), specialty: activeSpecialty })
        .select()
        .single();
      if (error || !data) { toast.error("Failed to create conversation"); return; }
      const convo = data as Conversation;
      setConversations((prev) => [convo, ...prev]);
      setActiveConvoId(convo.id);
      convoId = convo.id;
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Persist user message
    await persistMessage(convoId, "user", content.trim());

    // Update title if first real message
    const realMsgs = updatedMessages.filter((m) => m.id !== "welcome" && m.role === "user");
    if (realMsgs.length === 1) {
      await updateConvoTitle(convoId, content.trim());
    }

    // Build API messages with pinned file context
    const apiMessages = updatedMessages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

    // If there are pinned files, prepend their content as context to the last user message
    if (pinnedFiles.length > 0) {
      const fileContext = pinnedFiles
        .map((f) => `--- Attached File: ${f.name} ---\n${f.content}\n--- End of ${f.name} ---`)
        .join("\n\n");
      const lastUserIdx = apiMessages.length - 1;
      apiMessages[lastUserIdx] = {
        ...apiMessages[lastUserIdx],
        content: `[Attached Files Context]\n${fileContext}\n\n[User Query]\n${apiMessages[lastUserIdx].content}`,
      };
      // Clear pinned files after sending
      setPinnedFiles([]);
    }

    let assistantContent = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (resp.status === 429) { toast.error("Rate limit exceeded. Please wait a moment."); setIsLoading(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted. Please add credits."); setIsLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Failed to get response");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      const assistantId = crypto.randomUUID();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last.id === assistantId) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { id: assistantId, role: "assistant" as const, content: assistantContent, timestamp: new Date() }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || !raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) =>
                prev.map((m, i) => i === prev.length - 1 && m.role === "assistant" ? { ...m, content: assistantContent } : m)
              );
            }
          } catch { /* ignore */ }
        }
      }

      if (!assistantContent.trim()) {
        assistantContent = "I apologize, but I couldn't generate a response. Please try again.";
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: assistantContent, timestamp: new Date() }]);
      }

      // Persist assistant message
      await persistMessage(convoId, "assistant", assistantContent);

    } catch {
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const handleFilePin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "text/plain", "text/csv", "application/json",
      "application/pdf", "text/markdown", "text/html",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    Array.from(files).forEach((file) => {
      if (pinnedFiles.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setPinnedFiles((prev) => [
          ...prev,
          { name: file.name, size: file.size, type: file.type, content },
        ]);
        toast.success(`${file.name} pinned`);
      };
      // Read text files as text, others as base64
      if (file.type.startsWith("text/") || file.type === "application/json") {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
    e.target.value = "";
  };

  const removePinnedFile = (index: number) => {
    setPinnedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col gap-0 p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </Button>
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">AI Clinical Co-Pilot</h1>
            <p className="text-[10px] text-muted-foreground">AI-powered clinical intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-xs hidden sm:flex">
            <Activity className="w-3 h-3 text-green-500" />
            Online
          </Badge>
          <Badge variant="secondary" className="text-xs hidden sm:flex">HIPAA Compliant</Badge>
          {activeConvoId && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={exportConversation}>
              <Download className="w-3 h-3" /> Export
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Conversation Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-border flex flex-col overflow-hidden flex-shrink-0"
            >
              <div className="p-3 space-y-2">
                <Button className="w-full gap-2 text-xs" size="sm" onClick={createConversation}>
                  <Plus className="w-3.5 h-3.5" /> New Conversation
                </Button>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
              </div>

              {/* Specialty Filter */}
              <div className="px-3 pb-2">
                <div className="flex flex-wrap gap-1">
                  {specialties.map((s) => (
                    <Badge
                      key={s.value}
                      variant={activeSpecialty === s.value ? "default" : "outline"}
                      className="text-[9px] cursor-pointer transition-colors"
                      onClick={() => setActiveSpecialty(s.value)}
                    >
                      {s.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {filteredConversations.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No conversations yet</p>
                  )}
                  {filteredConversations.map((convo) => (
                    <div
                      key={convo.id}
                      className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${
                        activeConvoId === convo.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50 border border-transparent"
                      }`}
                      onClick={() => setActiveConvoId(convo.id)}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{convo.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(convo.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={(e) => { e.stopPropagation(); deleteConversation(convo.id); }}
                      >
                        <Trash2 className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-4">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}>
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Bot className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">Clinical Co-Pilot</span>
                          {activeSpecialty !== "general" && (
                            <Badge variant="outline" className="text-[9px] ml-1">
                              {specialties.find((s) => s.value === activeSpecialty)?.label}
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.role === "assistant" && msg.id !== "welcome" && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/30">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(msg.content)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Analyzing clinical data...</span>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Prompts - show only when conversation is new */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <div className="max-w-3xl mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {quickPrompts.map((qp) => (
                    <Button
                      key={qp.label}
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-auto py-2.5 px-3"
                      onClick={() => setInput(qp.prompt)}
                      disabled={isLoading}
                    >
                      <qp.icon className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-primary" />
                      <span className="truncate">{qp.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="max-w-3xl mx-auto">
              {/* Pinned Files Chips */}
              {pinnedFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {pinnedFiles.map((f, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 text-xs py-1 px-2">
                      <File className="w-3 h-3" />
                      <span className="max-w-[120px] truncate">{f.name}</span>
                      <span className="text-muted-foreground">({formatFileSize(f.size)})</span>
                      <button onClick={() => removePinnedFile(i)} className="ml-0.5 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".txt,.csv,.json,.pdf,.md,.html,.docx"
                  className="hidden"
                  onChange={handleFilePin}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-[44px] w-[44px] flex-shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach files for context"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Textarea
                  placeholder="Ask about patient records, drug interactions, ICD codes..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                />
                <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} size="icon" className="h-[44px] w-[44px] flex-shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                ⚕️ AI suggestions are for informational purposes only. Always verify with qualified medical professionals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalCoPilotPage;
