import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot, Send, Stethoscope, Pill, FileText, AlertTriangle,
  Sparkles, Copy, ThumbsUp, ThumbsDown, Loader2, Heart, Brain,
  Activity, Syringe, ClipboardList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "general" | "icd-lookup" | "drug-interaction" | "summary";
}

const quickPrompts = [
  { label: "Summarize Patient History", icon: FileText, prompt: "Summarize the patient history from the uploaded records, including key diagnoses, medications, and recent lab results." },
  { label: "Check Drug Interactions", icon: Pill, prompt: "Check for potential drug interactions between the medications in the current patient's medication list." },
  { label: "Suggest ICD-10 Codes", icon: ClipboardList, prompt: "Based on the clinical notes, suggest the most appropriate ICD-10 diagnostic codes with descriptions." },
  { label: "Flag Adverse Events", icon: AlertTriangle, prompt: "Review the patient data and flag any potential adverse events or safety signals that need attention." },
  { label: "CPT Code Lookup", icon: Syringe, prompt: "Recommend appropriate CPT procedure codes based on the documented clinical procedures and services." },
  { label: "Clinical Decision Support", icon: Brain, prompt: "Based on the patient's vitals, lab results, and history, provide clinical decision support recommendations." },
];

const ClinicalCoPilotPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your **AI Clinical Co-Pilot**. I can help you with:\n\n• **Patient history summaries** from uploaded records\n• **Drug interaction checks** across medication lists\n• **ICD-10/CPT code suggestions** from clinical notes\n• **Adverse event detection** and safety signal flagging\n• **Clinical decision support** based on patient data\n\nHow can I assist you today?",
      timestamp: new Date(),
      type: "general",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("project-chat", {
        body: {
          message: content.trim(),
          systemPrompt: `You are an expert AI Clinical Co-Pilot for healthcare professionals. You help with:
- Summarizing patient histories and medical records
- Checking drug interactions and contraindications
- Suggesting appropriate ICD-10 and CPT codes
- Flagging potential adverse events and safety signals
- Providing evidence-based clinical decision support

Always be precise, cite medical references when possible, and include appropriate disclaimers that your suggestions should be verified by qualified medical professionals. Format your responses with clear headings, bullet points, and highlight critical findings.`,
          projectId: "clinical-copilot",
        },
      });

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data?.reply || "I apologize, but I was unable to process that request. Please try again.",
        timestamp: new Date(),
        type: "general",
      };
      setMessages((prev) => [...prev, assistantMsg]);
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

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col gap-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AI Clinical Co-Pilot</h1>
            <p className="text-xs text-muted-foreground">Intelligent clinical assistance powered by AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-xs">
            <Activity className="w-3 h-3 text-green-500" />
            Online
          </Badge>
          <Badge variant="secondary" className="text-xs">HIPAA Compliant</Badge>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}>
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <Bot className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">Clinical Co-Pilot</span>
                          </div>
                        )}
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
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
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Analyzing clinical data...</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
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
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="w-72 flex-shrink-0 hidden lg:flex flex-col gap-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickPrompts.map((qp) => (
                <Button
                  key={qp.label}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-2.5 px-3"
                  onClick={() => sendMessage(qp.prompt)}
                  disabled={isLoading}
                >
                  <qp.icon className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-primary" />
                  {qp.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-destructive" />
                Specialties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {["Cardiology", "Oncology", "Neurology", "Pediatrics", "Radiology", "Pathology"].map((s) => (
                  <Badge key={s} variant="secondary" className="text-[10px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                    {s}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClinicalCoPilotPage;
