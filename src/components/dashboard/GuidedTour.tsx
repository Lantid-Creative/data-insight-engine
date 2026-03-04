import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowLeft, X, LayoutDashboard, FolderOpen, Upload,
  MessageSquare, BarChart3, Shield, Users, Search, Bell, Settings,
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: typeof LayoutDashboard;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Your Dashboard",
    description: "Let's take a quick tour of everything DataAfro has to offer. This will only take a minute.",
    icon: LayoutDashboard,
    position: "center",
  },
  {
    id: "sidebar",
    title: "Navigation Sidebar",
    description: "Access your projects, teams, and dashboard from the sidebar. It collapses for more workspace.",
    icon: FolderOpen,
    targetSelector: "[data-sidebar='sidebar']",
    position: "right",
  },
  {
    id: "search",
    title: "Global Search (⌘K)",
    description: "Instantly find any project, file, or team across your workspace. Press ⌘K or Ctrl+K anytime.",
    icon: Search,
    targetSelector: "[data-tour='global-search']",
    position: "bottom",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Stay updated with real-time alerts for team invites, project shares, and activity on your data.",
    icon: Bell,
    targetSelector: "[data-tour='notification-bell']",
    position: "bottom",
  },
  {
    id: "projects",
    title: "Project Workspace",
    description: "Each project is a dedicated space for uploading files, chatting with AI, and generating reports.",
    icon: FolderOpen,
    position: "center",
  },
  {
    id: "upload",
    title: "Upload & Analyze",
    description: "Drag and drop any file — CSVs, PDFs, spreadsheets, images. Our AI extracts and analyzes the data for you.",
    icon: Upload,
    position: "center",
  },
  {
    id: "ai-chat",
    title: "AI-Powered Chat",
    description: "Ask questions about your data in plain language. Get instant insights, charts, and recommendations.",
    icon: MessageSquare,
    position: "center",
  },
  {
    id: "reports",
    title: "Automated Reports",
    description: "Generate polished reports in PDF, DOCX, or PPTX with a single click. Share with stakeholders instantly.",
    icon: BarChart3,
    position: "center",
  },
  {
    id: "teams",
    title: "Team Collaboration",
    description: "Invite teammates, assign roles, and share projects with fine-grained permissions.",
    icon: Users,
    position: "center",
  },
  {
    id: "security",
    title: "Enterprise Security",
    description: "2FA, IP allowlists, session management, and full audit trails keep your data safe.",
    icon: Shield,
    position: "center",
  },
  {
    id: "settings",
    title: "You're Ready!",
    description: "Customize your profile, notification preferences, and billing in Settings. Enjoy DataAfro!",
    icon: Settings,
    position: "center",
  },
];

interface GuidedTourProps {
  onComplete: () => void;
}

export function GuidedTour({ onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  const updateTargetRect = useCallback(() => {
    if (step.targetSelector) {
      const el = document.querySelector(step.targetSelector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        return;
      }
    }
    setTargetRect(null);
  }, [step.targetSelector]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener("resize", updateTargetRect);
    return () => window.removeEventListener("resize", updateTargetRect);
  }, [updateTargetRect]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onComplete();
      if (e.key === "ArrowRight" && !isLast) setCurrentStep((s) => s + 1);
      if (e.key === "ArrowLeft" && !isFirst) setCurrentStep((s) => s - 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFirst, isLast, onComplete]);

  const Icon = step.icon;

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect || step.position === "center") {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const gap = 16;
    switch (step.position) {
      case "bottom":
        return {
          top: targetRect.bottom + gap,
          left: Math.max(16, Math.min(targetRect.left + targetRect.width / 2 - 180, window.innerWidth - 376)),
        };
      case "right":
        return {
          top: Math.max(16, targetRect.top),
          left: targetRect.right + gap,
        };
      case "top":
        return {
          bottom: window.innerHeight - targetRect.top + gap,
          left: Math.max(16, targetRect.left + targetRect.width / 2 - 180),
        };
      case "left":
        return {
          top: Math.max(16, targetRect.top),
          right: window.innerWidth - targetRect.left + gap,
        };
      default:
        return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100]"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onComplete} />

      {/* Highlight cutout for targeted elements */}
      {targetRect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute border-2 border-primary rounded-lg pointer-events-none z-[101]"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: "0 0 0 9999px hsl(var(--background) / 0.8), 0 0 24px hsl(var(--primary) / 0.3)",
          }}
        />
      )}

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute z-[102] w-[360px] rounded-2xl border border-border bg-card shadow-lg overflow-hidden"
          style={getTooltipStyle()}
        >
          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <motion.div
              className="h-full bg-gradient-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <div className="p-5">
            {/* Close button */}
            <button
              onClick={onComplete}
              className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-primary" />
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold font-heading mb-1.5">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{step.description}</p>

            {/* Step counter & Navigation */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {currentStep + 1} of {TOUR_STEPS.length}
              </span>
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep((s) => s - 1)}
                    className="h-8 px-3"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    Back
                  </Button>
                )}
                {isLast ? (
                  <Button
                    size="sm"
                    onClick={onComplete}
                    className="h-8 px-4 bg-gradient-primary text-primary-foreground hover:opacity-90"
                  >
                    Get Started
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setCurrentStep((s) => s + 1)}
                    className="h-8 px-4 bg-gradient-primary text-primary-foreground hover:opacity-90"
                  >
                    Next
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1 pb-4">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? "w-6 bg-primary"
                    : i < currentStep
                    ? "w-3 bg-primary/40"
                    : "w-3 bg-muted"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
