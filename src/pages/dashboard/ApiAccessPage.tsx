import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Copy, Check, Plus, Trash2, Key, Shield, Clock, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "df_sk_";
  for (let i = 0; i < 32; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ApiAccessPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("Default");
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createKey = useMutation({
    mutationFn: async () => {
      const rawKey = generateApiKey();
      const hash = await hashKey(rawKey);
      const prefix = rawKey.slice(0, 10) + "…";
      const { error } = await supabase.from("api_keys").insert({
        user_id: user!.id,
        name: keyName,
        key_prefix: prefix,
        key_hash: hash,
      });
      if (error) throw error;
      return rawKey;
    },
    onSuccess: (rawKey) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      setNewKeyValue(rawKey);
      toast.success("API key created!");
    },
    onError: () => toast.error("Failed to create key"),
  });

  const toggleKey = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("api_keys").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["api-keys"] }),
  });

  const deleteKey = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("api_keys").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key deleted");
    },
  });

  const copyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">API Access</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage API keys for external integrations.</p>
        </div>
        <Button
          className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          onClick={() => { setKeyName("Default"); setNewKeyValue(null); setCreateOpen(true); }}
        >
          <Plus className="w-4 h-4 mr-2" /> Create Key
        </Button>
      </div>

      {/* Security notice */}
      <Card className="border-amber-300/50 bg-amber-50/5">
        <CardContent className="py-3 px-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Keep your API keys secure</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              Do not share keys publicly. Keys are only shown once at creation. Rotate regularly.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Keys list */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" /> Your API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-14 rounded-lg bg-muted/50 animate-pulse" />)}
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No API keys yet</p>
              <p className="text-xs text-muted-foreground/60">Create one to integrate with external apps.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {keys.map((k: any) => (
                  <motion.div
                    key={k.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 group"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${k.is_active ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{k.name}</p>
                        {!k.is_active && <Badge variant="outline" className="text-[9px]">Disabled</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <code className="text-xs text-muted-foreground font-mono">{k.key_prefix}</code>
                        <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Last used: {timeAgo(k.last_used_at)}
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={k.is_active}
                      onCheckedChange={(v) => toggleKey.mutate({ id: k.id, active: v })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteKey.mutate(k.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Endpoints reference */}
      <Card className="shadow-soft">
        <CardHeader><CardTitle>Edge Function Endpoints</CardTitle></CardHeader>
        <CardContent className="space-y-2 font-mono text-sm">
          <p><span className="text-emerald-500 font-bold">POST</span> /functions/v1/analyze-project</p>
          <p><span className="text-emerald-500 font-bold">POST</span> /functions/v1/generate-report</p>
          <p><span className="text-emerald-500 font-bold">POST</span> /functions/v1/clinical-copilot</p>
          <p><span className="text-emerald-500 font-bold">POST</span> /functions/v1/phi-redaction</p>
          <p><span className="text-emerald-500 font-bold">POST</span> /functions/v1/epidemic-intel</p>
          <p className="text-xs text-muted-foreground mt-3">Base URL: <code>{import.meta.env.VITE_SUPABASE_URL}</code></p>
          <p className="text-xs text-muted-foreground">Include your API key in the <code>Authorization: Bearer &lt;key&gt;</code> header.</p>
        </CardContent>
      </Card>

      {/* Create key dialog */}
      <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) setNewKeyValue(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          {newKeyValue ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/10 border border-emerald-500/30">
                <p className="text-xs font-semibold text-emerald-600 mb-2">🔑 Copy your key now — it won't be shown again!</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 rounded-lg bg-muted text-xs font-mono break-all">{newKeyValue}</code>
                  <Button variant="outline" size="sm" onClick={() => copyKey(newKeyValue)}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button className="w-full" onClick={() => { setCreateOpen(false); setNewKeyValue(null); }}>
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Key Name</label>
                <Input value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="e.g. Production, Staging" />
              </div>
              <Button
                className="w-full bg-gradient-primary text-primary-foreground"
                disabled={!keyName.trim() || createKey.isPending}
                onClick={() => createKey.mutate()}
              >
                {createKey.isPending ? "Generating…" : "Generate Key"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiAccessPage;
