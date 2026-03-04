import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Trash2, Mail, Eye, Upload, TrendingUp, FileText, Settings, Copy, Check, Link2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const PERMISSIONS = [
  { key: "can_view", label: "View", icon: Eye, desc: "View files & chat history" },
  { key: "can_upload", label: "Upload", icon: Upload, desc: "Upload files to project" },
  { key: "can_analyze", label: "Analyze", icon: TrendingUp, desc: "Run AI analysis" },
  { key: "can_report", label: "Report", icon: FileText, desc: "Generate reports" },
  { key: "can_manage", label: "Manage", icon: Settings, desc: "Edit project settings" },
] as const;

type PermKey = typeof PERMISSIONS[number]["key"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

export function ProjectShareDialog({ open, onOpenChange, projectId, projectName }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [perms, setPerms] = useState<Record<PermKey, boolean>>({
    can_view: true, can_upload: false, can_analyze: false, can_report: false, can_manage: false,
  });
  const [linkCopied, setLinkCopied] = useState(false);

  const { data: shares = [], isLoading } = useQuery({
    queryKey: ["project-shares", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_shares")
        .select("*")
        .eq("project_id", projectId);
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const addShare = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("project_shares").insert({
        project_id: projectId,
        shared_with_email: email,
        shared_by: user!.id,
        ...perms,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-shares", projectId] });
      setEmail("");
      setPerms({ can_view: true, can_upload: false, can_analyze: false, can_report: false, can_manage: false });
      toast.success("Invitation sent!");
    },
    onError: (e: any) => toast.error(e.message?.includes("duplicate") ? "Already shared with this email" : "Failed to share"),
  });

  const removeShare = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_shares").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-shares", projectId] });
      toast.success("Access removed");
    },
  });

  const updateSharePerm = useMutation({
    mutationFn: async ({ id, key, value }: { id: string; key: string; value: boolean }) => {
      const { error } = await supabase.from("project_shares").update({ [key]: value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-shares", projectId] }),
  });

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/dashboard/projects/${projectId}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Share "{projectName}"
          </DialogTitle>
        </DialogHeader>

        {/* Copy link */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
          <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate flex-1">
            {window.location.origin}/dashboard/projects/{projectId.slice(0, 8)}…
          </span>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={copyLink}>
            {linkCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {linkCopied ? "Copied" : "Copy"}
          </Button>
        </div>

        {/* Invite form */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => addShare.mutate()}
              disabled={!email.includes("@") || addShare.isPending}
              className="bg-gradient-primary text-primary-foreground"
            >
              {addShare.isPending ? "…" : "Invite"}
            </Button>
          </div>

          {/* Permission toggles */}
          <div className="flex flex-wrap gap-2">
            {PERMISSIONS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPerms((prev) => ({ ...prev, [p.key]: !prev[p.key] }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  perms[p.key]
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted/50 border-border text-muted-foreground hover:border-primary/20"
                }`}
              >
                <p.icon className="w-3 h-3" />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Existing shares */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            People with access ({shares.length + 1})
          </p>
          <ScrollArea className="max-h-[200px]">
            {/* Owner */}
            <div className="flex items-center gap-3 py-2 px-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                  {user?.email?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-[10px] text-muted-foreground">Owner</p>
              </div>
              <Badge variant="secondary" className="text-[10px]">Owner</Badge>
            </div>

            {shares.map((share: any) => (
              <div key={share.id} className="flex items-center gap-3 py-2 px-1 group">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-muted font-bold">
                    {share.shared_with_email.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{share.shared_with_email}</p>
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    {PERMISSIONS.filter((p) => share[p.key]).map((p) => (
                      <button
                        key={p.key}
                        onClick={() => updateSharePerm.mutate({ id: share.id, key: p.key, value: !share[p.key] })}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                    {PERMISSIONS.filter((p) => !share[p.key]).map((p) => (
                      <button
                        key={p.key}
                        onClick={() => updateSharePerm.mutate({ id: share.id, key: p.key, value: true })}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium hover:bg-muted/80 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        +{p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!share.accepted && (
                    <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-300">Pending</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
                    onClick={() => removeShare.mutate(share.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
