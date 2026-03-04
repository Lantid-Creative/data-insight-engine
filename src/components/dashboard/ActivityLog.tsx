import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, MessageSquare, FileText, TrendingUp, UserPlus, Trash2, Settings, Activity } from "lucide-react";

const ACTION_ICONS: Record<string, any> = {
  file_upload: Upload,
  chat_message: MessageSquare,
  report_generated: FileText,
  analysis_run: TrendingUp,
  project_shared: UserPlus,
  file_deleted: Trash2,
  settings_changed: Settings,
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface Props {
  projectId: string;
}

export function ActivityLog({ projectId }: Props) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activity-log", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Activity className="w-8 h-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground/60">Actions will appear here as you work.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[300px]">
      <div className="space-y-1">
        {activities.map((a: any) => {
          const Icon = ACTION_ICONS[a.action] || Activity;
          const details = a.details || {};
          return (
            <div key={a.id} className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{a.action.replace(/_/g, " ")}</span>
                  {details.name && <span className="text-muted-foreground"> — {details.name}</span>}
                </p>
                <p className="text-[10px] text-muted-foreground/60 font-mono">{timeAgo(a.created_at)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
