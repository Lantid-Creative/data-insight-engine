import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2, Minimize2, Pin, PinOff, Share2, Download, Copy, Check,
  BarChart3, FileText, Code, FormInput, LayoutDashboard, Calculator, ListChecks,
  X, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ARTIFACT_ICONS: Record<string, any> = {
  visualization: BarChart3,
  document: FileText,
  code: Code,
  form: FormInput,
  dashboard: LayoutDashboard,
  calculator: Calculator,
  tracker: ListChecks,
};

interface ArtifactData {
  id?: string;
  title: string;
  description: string;
  artifact_type: string;
  content: {
    html: string;
    summary: string;
  };
  is_pinned?: boolean;
  shared?: boolean;
  project_id?: string;
}

export function ArtifactRenderer({
  artifact,
  projectId,
  onPinToggle,
  onShareToggle,
}: {
  artifact: ArtifactData;
  projectId: string;
  onPinToggle?: () => void;
  onShareToggle?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const Icon = ARTIFACT_ICONS[artifact.artifact_type] || FileText;

  const handleCopyHTML = () => {
    navigator.clipboard.writeText(artifact.content.html);
    setCopied(true);
    toast.success("HTML copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([artifact.content.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artifact.title.toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Artifact downloaded");
  };

  const handleOpenExternal = () => {
    const blob = new Blob([artifact.content.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handlePin = async () => {
    if (!artifact.id) return;
    const newPinned = !artifact.is_pinned;
    const { error } = await supabase
      .from("artifacts")
      .update({ is_pinned: newPinned })
      .eq("id", artifact.id);
    if (error) {
      toast.error("Failed to update pin status");
    } else {
      toast.success(newPinned ? "Artifact pinned" : "Artifact unpinned");
      onPinToggle?.();
    }
  };

  const handleShare = async () => {
    if (!artifact.id) return;
    const newShared = !artifact.shared;
    const { error } = await supabase
      .from("artifacts")
      .update({ shared: newShared })
      .eq("id", artifact.id);
    if (error) {
      toast.error("Failed to update share status");
    } else {
      toast.success(newShared ? "Artifact shared with collaborators" : "Artifact sharing disabled");
      onShareToggle?.();
    }
  };

  // Sandbox the HTML inside an iframe
  const iframeSrcDoc = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  </style>
</head>
<body>${artifact.content.html}</body>
</html>`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="my-4 rounded-2xl border border-primary/20 bg-card overflow-hidden"
        style={{ boxShadow: "0 4px 24px hsl(var(--primary) / 0.08), 0 1px 3px hsl(0 0% 0% / 0.06)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
              style={{ boxShadow: "0 2px 8px hsl(var(--primary) / 0.2)" }}
            >
              <Icon className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{artifact.title}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest border border-primary/10">
                  {artifact.artifact_type}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{artifact.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {artifact.id && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={handlePin} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                      {artifact.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">{artifact.is_pinned ? "Unpin" : "Pin to project"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={handleShare} className={`p-1.5 rounded-lg transition-all ${artifact.shared ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">{artifact.shared ? "Shared" : "Share"}</TooltipContent>
                </Tooltip>
              </>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleCopyHTML} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                  {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Copy HTML</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleDownload} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Download</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleOpenExternal} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Open in new tab</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                  {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">{expanded ? "Collapse" : "Expand"}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Content - Sandboxed iframe */}
        <div className={`transition-all duration-300 ${expanded ? "h-[600px]" : "h-[400px]"}`}>
          <iframe
            ref={iframeRef}
            srcDoc={iframeSrcDoc}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-forms"
            title={artifact.title}
          />
        </div>
      </motion.div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-sm font-bold text-foreground">{artifact.title}</span>
                  <p className="text-[10px] text-muted-foreground">{artifact.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Download
                </Button>
                <Button variant="outline" size="sm" onClick={() => setExpanded(false)} className="gap-1.5">
                  <X className="w-3.5 h-3.5" /> Close
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <iframe
                srcDoc={iframeSrcDoc}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-forms"
                title={artifact.title}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* Mini artifact card for the sidebar pinned list */
export function ArtifactCard({ artifact, onClick }: { artifact: ArtifactData; onClick: () => void }) {
  const Icon = ARTIFACT_ICONS[artifact.artifact_type] || FileText;
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-all text-left group"
      whileHover={{ x: 2 }}
    >
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-foreground truncate">{artifact.title}</p>
        <p className="text-[10px] text-muted-foreground/70 truncate">{artifact.artifact_type}</p>
      </div>
    </motion.button>
  );
}
