import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, Moon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const NOTIFICATION_TYPES = [
  {
    key: "team_invite",
    label: "Team Invitations",
    description: "When you're invited to join a team",
    icon: "👥",
  },
  {
    key: "project_share",
    label: "Project Shares",
    description: "When a project is shared with you",
    icon: "📁",
  },
  {
    key: "activity",
    label: "Activity Alerts",
    description: "File uploads, analyses, and reports on your projects",
    icon: "📊",
  },
  {
    key: "billing",
    label: "Billing & Payments",
    description: "Subscription changes, invoices, and payment issues",
    icon: "💳",
  },
  {
    key: "security",
    label: "Security Alerts",
    description: "Login attempts, API key usage, and security events",
    icon: "🔒",
  },
  {
    key: "system",
    label: "System Announcements",
    description: "Product updates, maintenance, and announcements",
    icon: "📢",
  },
];

interface Preferences {
  [key: string]: any;
}

const DEFAULT_PREFS: Preferences = {
  team_invite_inapp: true, team_invite_email: true, team_invite_toast: true,
  project_share_inapp: true, project_share_email: true, project_share_toast: true,
  activity_inapp: true, activity_email: false, activity_toast: true,
  billing_inapp: true, billing_email: true, billing_toast: true,
  security_inapp: true, security_email: true, security_toast: true,
  system_inapp: true, system_email: false, system_toast: true,
  quiet_hours_enabled: false, quiet_hours_start: "22:00", quiet_hours_end: "08:00",
};

export default function NotificationPreferencesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);

  const { data: savedPrefs, isLoading } = useQuery({
    queryKey: ["notification-preferences", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (savedPrefs) {
      setPrefs(savedPrefs);
    }
  }, [savedPrefs]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { id, created_at, updated_at, ...rest } = prefs;
      const payload = { ...rest, user_id: user!.id };

      if (savedPrefs) {
        const { error } = await supabase
          .from("notification_preferences")
          .update(payload)
          .eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notification_preferences")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Notification preferences saved");
    },
    onError: () => toast.error("Failed to save preferences"),
  });

  const toggle = (key: string) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const setField = (key: string, value: any) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Notification Preferences</h1>
        <p className="text-muted-foreground mt-1">
          Choose how and when you'd like to be notified.
        </p>
      </div>

      {/* Channel legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5" /> In-app
        </div>
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" /> Email
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" /> Toast popup
        </div>
      </div>

      {/* Notification types */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Notification Types</CardTitle>
          <CardDescription>Toggle channels per notification type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border">
          {NOTIFICATION_TYPES.map((type) => (
            <div key={type.key} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{type.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <Bell className="w-3 h-3 text-muted-foreground" />
                    <Switch
                      checked={!!prefs[`${type.key}_inapp`]}
                      onCheckedChange={() => toggle(`${type.key}_inapp`)}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    <Switch
                      checked={!!prefs[`${type.key}_email`]}
                      onCheckedChange={() => toggle(`${type.key}_email`)}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-muted-foreground" />
                    <Switch
                      checked={!!prefs[`${type.key}_toast`]}
                      onCheckedChange={() => toggle(`${type.key}_toast`)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quiet hours */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Moon className="w-4 h-4" /> Quiet Hours
          </CardTitle>
          <CardDescription>
            Mute toast popups during specific hours. In-app and email notifications still deliver silently.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Enable quiet hours</Label>
            <Switch
              checked={!!prefs.quiet_hours_enabled}
              onCheckedChange={() => toggle("quiet_hours_enabled")}
            />
          </div>
          {prefs.quiet_hours_enabled && (
            <div className="flex items-center gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Start</Label>
                <Input
                  type="time"
                  value={prefs.quiet_hours_start || "22:00"}
                  onChange={(e) => setField("quiet_hours_start", e.target.value)}
                  className="w-32"
                />
              </div>
              <span className="text-muted-foreground mt-5">→</span>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">End</Label>
                <Input
                  type="time"
                  value={prefs.quiet_hours_end || "08:00"}
                  onChange={(e) => setField("quiet_hours_end", e.target.value)}
                  className="w-32"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="bg-gradient-primary text-primary-foreground hover:opacity-90"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </div>
  );
}
