import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Shield, ShieldCheck, ShieldAlert, Clock, Monitor, Globe,
  Trash2, Plus, Activity, AlertTriangle, LogIn, LogOut, Key,
  Lock, Unlock, RefreshCw,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const EVENT_ICONS: Record<string, typeof Shield> = {
  login: LogIn,
  logout: LogOut,
  password_change: Key,
  settings_update: Shield,
  api_key_created: Key,
  api_key_revoked: Key,
  session_revoked: Monitor,
  ip_allowlist_update: Globe,
};

const EVENT_COLORS: Record<string, string> = {
  login: "text-emerald-500",
  logout: "text-muted-foreground",
  password_change: "text-amber-500",
  settings_update: "text-primary",
  api_key_created: "text-blue-500",
  api_key_revoked: "text-destructive",
  session_revoked: "text-destructive",
  ip_allowlist_update: "text-violet-500",
};

const SecuritySettingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newIp, setNewIp] = useState("");

  // Fetch security settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["security-settings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_settings")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch audit logs
  const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["audit-logs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch trusted devices
  const { data: devices = [] } = useQuery({
    queryKey: ["trusted-devices", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trusted_devices")
        .select("*")
        .eq("user_id", user!.id)
        .order("last_active_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Upsert settings
  const upsertSettings = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      if (settings) {
        const { error } = await supabase
          .from("security_settings")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("security_settings")
          .insert({ user_id: user!.id, ...updates });
        if (error) throw error;
      }
      // Log the event
      await supabase.from("audit_logs").insert({
        user_id: user!.id,
        event_type: "settings_update",
        metadata: { changed: Object.keys(updates) },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-settings"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      toast.success("Security settings updated");
    },
    onError: () => toast.error("Failed to update settings"),
  });

  // Remove device
  const removeDevice = useMutation({
    mutationFn: async (deviceId: string) => {
      const { error } = await supabase.from("trusted_devices").delete().eq("id", deviceId);
      if (error) throw error;
      await supabase.from("audit_logs").insert({
        user_id: user!.id,
        event_type: "session_revoked",
        metadata: { device_id: deviceId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trusted-devices"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      toast.success("Device removed");
    },
  });

  const currentIpList: string[] = settings?.ip_allowlist ?? [];

  const addIp = () => {
    const ip = newIp.trim();
    if (!ip) return;
    // Basic IP/CIDR validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipRegex.test(ip)) {
      toast.error("Invalid IP address format");
      return;
    }
    if (currentIpList.includes(ip)) {
      toast.error("IP already in allowlist");
      return;
    }
    upsertSettings.mutate({ ip_allowlist: [...currentIpList, ip] });
    setNewIp("");
  };

  const removeIp = (ip: string) => {
    upsertSettings.mutate({ ip_allowlist: currentIpList.filter((i) => i !== ip) });
  };

  const twoFactorEnabled = settings?.two_factor_enabled ?? false;
  const loginAlerts = settings?.login_alerts_enabled ?? true;
  const sessionTimeout = settings?.session_timeout_minutes ?? 480;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Security Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage enterprise security controls, session policies, and audit trails.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="ip">IP Allowlist</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Security Controls
              </CardTitle>
              <CardDescription>Configure authentication and alert preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add an extra layer of security with TOTP-based 2FA.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                    {twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={(v) => upsertSettings.mutate({ two_factor_enabled: v })}
                  />
                </div>
              </div>

              {/* Login Alerts */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <Label className="text-sm font-medium">Login Alerts</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get notified when your account is accessed from a new device.
                  </p>
                </div>
                <Switch
                  checked={loginAlerts}
                  onCheckedChange={(v) => upsertSettings.mutate({ login_alerts_enabled: v })}
                />
              </div>

              {/* Session Timeout */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Session Timeout</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Auto-lock after inactivity (in minutes).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={15}
                    max={1440}
                    value={sessionTimeout}
                    onChange={(e) => upsertSettings.mutate({ session_timeout_minutes: parseInt(e.target.value) || 480 })}
                    className="w-24 h-8 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
              </div>

              {/* Security Score */}
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Security Score</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary rounded-full transition-all"
                      style={{
                        width: `${
                          (twoFactorEnabled ? 40 : 0) +
                          (loginAlerts ? 20 : 0) +
                          (currentIpList.length > 0 ? 25 : 0) +
                          15
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {(twoFactorEnabled ? 40 : 0) +
                      (loginAlerts ? 20 : 0) +
                      (currentIpList.length > 0 ? 25 : 0) +
                      15}
                    %
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {!twoFactorEnabled && "Enable 2FA to improve your score. "}
                  {currentIpList.length === 0 && "Add IP allowlist entries for maximum protection."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SESSIONS */}
        <TabsContent value="sessions" className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                Active Sessions & Devices
              </CardTitle>
              <CardDescription>
                Manage devices that have accessed your account. Revoke suspicious sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {devices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Monitor className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tracked devices yet.</p>
                  <p className="text-xs mt-1">Devices will appear as you log in from different browsers.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {devices.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2">
                            {d.device_name}
                            {d.is_current && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">Current</Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {[d.browser, d.os, d.ip_address].filter(Boolean).join(" · ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last active {formatDistanceToNow(new Date(d.last_active_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      {!d.is_current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeDevice.mutate(d.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* IP ALLOWLIST */}
        <TabsContent value="ip" className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                IP Allowlist
              </CardTitle>
              <CardDescription>
                Restrict account access to specific IP addresses or CIDR ranges.
                Leave empty to allow all IPs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. 192.168.1.0/24"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addIp()}
                  className="flex-1"
                />
                <Button onClick={addIp} disabled={!newIp.trim()} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>

              {currentIpList.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Unlock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No IP restrictions configured.</p>
                  <p className="text-xs">All IP addresses are currently allowed.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentIpList.map((ip) => (
                    <div key={ip} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        <code className="text-sm font-mono">{ip}</code>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-destructive hover:text-destructive"
                        onClick={() => removeIp(ip)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIT LOG */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Audit Trail
              </CardTitle>
              <CardDescription>
                A complete log of security-relevant events on your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No security events recorded yet.</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-1">
                    {auditLogs.map((log) => {
                      const Icon = EVENT_ICONS[log.event_type] || Shield;
                      const color = EVENT_COLORS[log.event_type] || "text-muted-foreground";
                      return (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium capitalize">
                              {log.event_type.replace(/_/g, " ")}
                            </p>
                            {log.ip_address && (
                              <p className="text-xs text-muted-foreground">IP: {log.ip_address}</p>
                            )}
                            {log.metadata && Object.keys(log.metadata as object).length > 0 && (
                              <p className="text-xs text-muted-foreground truncate">
                                {JSON.stringify(log.metadata)}
                              </p>
                            )}
                          </div>
                          <time className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(log.created_at), "MMM d, HH:mm")}
                          </time>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettingsPage;
