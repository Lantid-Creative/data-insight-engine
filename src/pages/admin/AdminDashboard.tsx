import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogOut, CheckCircle2, XCircle, Clock, Users, Shield, Building2, MapPin, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from("user_applications")
        .update({
          status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: notes || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      toast({ title: "Application updated" });
      setSelectedApp(null);
      setAdminNotes("");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const pendingApps = applications.filter((a) => a.status === "pending");
  const approvedApps = applications.filter((a) => a.status === "approved");
  const rejectedApps = applications.filter((a) => a.status === "rejected");

  const stats = [
    { label: "Pending", value: pendingApps.length, icon: Clock, color: "text-primary" },
    { label: "Approved", value: approvedApps.length, icon: CheckCircle2, color: "text-green-500" },
    { label: "Rejected", value: rejectedApps.length, icon: XCircle, color: "text-destructive" },
    { label: "Total", value: applications.length, icon: Users, color: "text-foreground" },
  ];

  const ApplicationCard = ({ app }: { app: typeof applications[0] }) => (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-base">{app.full_name}</h3>
            <p className="text-sm text-muted-foreground font-mono">{app.email}</p>
          </div>
          <Badge variant={app.status === "pending" ? "secondary" : app.status === "approved" ? "default" : "destructive"} className="capitalize">
            {app.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="w-3.5 h-3.5" />
            <span>{app.company_name || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{app.location || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{app.company_size || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(app.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm font-medium mb-1">
            <FileText className="w-3.5 h-3.5" /> Intended Use
          </div>
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            {app.intended_use || "Not provided"}
          </p>
        </div>

        {app.admin_notes && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Admin Notes</p>
            <p className="text-sm bg-muted/30 rounded-lg p-2 border border-border">{app.admin_notes}</p>
          </div>
        )}

        {app.status === "pending" && (
          <>
            {selectedApp === app.id ? (
              <div className="space-y-3">
                <Textarea
                  placeholder="Internal notes (optional)..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  className="rounded-lg bg-muted/50 border-border resize-none text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateMutation.mutate({ id: app.id, status: "approved", notes: adminNotes })}
                    disabled={updateMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateMutation.mutate({ id: app.id, status: "rejected", notes: adminNotes })}
                    disabled={updateMutation.isPending}
                    className="flex-1 rounded-lg gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedApp(null)} className="rounded-lg">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => { setSelectedApp(app.id); setAdminNotes(""); }} className="w-full rounded-lg">
                Review Application
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-sm font-black text-primary-foreground">DA</span>
              </div>
              <span className="text-lg font-extrabold">Data<span className="text-gradient">Afro</span></span>
            </Link>
            <Badge variant="outline" className="gap-1 ml-2">
              <Shield className="w-3 h-3" /> Admin
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground mb-8">Review and manage early access applications</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <Card key={s.label} className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pending">
            <TabsList className="mb-6">
              <TabsTrigger value="pending" className="gap-1">
                <Clock className="w-3.5 h-3.5" /> Pending ({pendingApps.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved ({approvedApps.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-1">
                <XCircle className="w-3.5 h-3.5" /> Rejected ({rejectedApps.length})
              </TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <TabsContent value="pending">
                  {pendingApps.length === 0 ? (
                    <Card className="border-dashed"><CardContent className="p-12 text-center text-muted-foreground">No pending applications</CardContent></Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">{pendingApps.map((app) => <ApplicationCard key={app.id} app={app} />)}</div>
                  )}
                </TabsContent>
                <TabsContent value="approved">
                  {approvedApps.length === 0 ? (
                    <Card className="border-dashed"><CardContent className="p-12 text-center text-muted-foreground">No approved applications yet</CardContent></Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">{approvedApps.map((app) => <ApplicationCard key={app.id} app={app} />)}</div>
                  )}
                </TabsContent>
                <TabsContent value="rejected">
                  {rejectedApps.length === 0 ? (
                    <Card className="border-dashed"><CardContent className="p-12 text-center text-muted-foreground">No rejected applications</CardContent></Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">{rejectedApps.map((app) => <ApplicationCard key={app.id} app={app} />)}</div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
