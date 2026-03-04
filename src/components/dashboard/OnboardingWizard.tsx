import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FolderOpen, Upload, ArrowRight, ArrowLeft, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const STEPS = [
  { id: "welcome", icon: Sparkles, title: "Welcome to DataAfro", subtitle: "Your AI-powered data intelligence platform" },
  { id: "create", icon: FolderOpen, title: "Create Your First Project", subtitle: "Organize your data into projects for focused analysis" },
  { id: "ready", icon: Rocket, title: "You're All Set!", subtitle: "Start uploading files and chatting with AI" },
];

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const createProject = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .insert({ user_id: user!.id, name, description })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-projects"] });
      setCreatedProjectId(data.id);
      toast.success("Project created!");
      setStep(2);
    },
    onError: () => toast.error("Failed to create project"),
  });

  const handleFinish = () => {
    onComplete();
    if (createdProjectId) {
      navigate(`/dashboard/projects/${createdProjectId}`);
    }
  };

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/[0.05] blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/[0.04] blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative w-full max-w-lg mx-4">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === step ? "w-10 bg-primary" : i < step ? "w-6 bg-primary/40" : "w-6 bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            {/* Icon */}
            <div className="relative mx-auto mb-6 w-fit">
              <motion.div
                className="absolute inset-0 rounded-[28px] bg-primary/20 blur-2xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div
                className="relative w-20 h-20 rounded-[22px] bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center"
                style={{ boxShadow: "0 8px 32px hsl(var(--primary) / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.15)" }}
              >
                <Icon className="w-9 h-9 text-primary-foreground" />
                <div className="absolute inset-0 rounded-[22px] bg-gradient-to-b from-white/10 to-transparent" />
              </div>
            </div>

            <h2 className="text-2xl font-bold font-heading mb-2">{current.title}</h2>
            <p className="text-muted-foreground mb-8">{current.subtitle}</p>

            {/* Step content */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3 text-left">
                  {[
                    { icon: FolderOpen, label: "Create Projects", desc: "Organize by topic" },
                    { icon: Upload, label: "Upload Anything", desc: "Any file type or size" },
                    { icon: Sparkles, label: "Chat with AI", desc: "Get instant insights" },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-xl border border-border/50 bg-card">
                      <item.icon className="w-5 h-5 text-primary mb-2" />
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => setStep(1)}
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90 h-12 px-8 text-base"
                >
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 text-left max-w-sm mx-auto">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Project Name</label>
                  <Input
                    placeholder="e.g. Q1 Revenue Analysis"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <Textarea
                    placeholder="What data will you analyze?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep(0)} className="h-11">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90 h-11"
                    disabled={!name.trim() || createProject.isPending}
                    onClick={() => createProject.mutate()}
                  >
                    {createProject.isPending ? "Creating…" : "Create Project"}
                    {!createProject.isPending && <ArrowRight className="ml-2 w-4 h-4" />}
                  </Button>
                </div>
                <button
                  onClick={() => { onComplete(); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto block pt-2"
                >
                  Skip for now
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Your project <span className="font-semibold text-foreground">"{name}"</span> is ready.
                  Upload files and start chatting with your AI analyst.
                </p>
                <Button
                  onClick={handleFinish}
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90 h-12 px-8 text-base"
                >
                  Open Project <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
