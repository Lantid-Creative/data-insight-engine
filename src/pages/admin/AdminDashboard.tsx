import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut, CheckCircle2, XCircle, Clock, Users, Shield, Building2,
  MapPin, FileText, LayoutDashboard, ClipboardList, MessageSquare,
  Settings, Search, ChevronRight, Home, BarChart3, UserCheck, UserX,
  Mail, Globe
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

type AdminPage = "overview" | "applications" | "users" | "consulting" | "settings";

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<AdminPage>("overview");
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Queries ──────────────────────────────────────────────
  const { data: applications = [], isLoading: appsLoading } = useQuery({
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

  const { data: consultingSubmissions = [], isLoading: consultingLoading } = useQuery({
    queryKey: ["admin-consulting"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consulting_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // ── Mutations ────────────────────────────────────────────
  const updateAppMutation = useMutation({
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

  // ── Computed ─────────────────────────────────────────────
  const pendingApps = applications.filter((a) => a.status === "pending");
  const approvedApps = applications.filter((a) => a.status === "approved");
  const rejectedApps = applications.filter((a) => a.status === "rejected");

  const filteredApplications = applications.filter((a) =>
    !searchQuery || 
    a.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.company_name && a.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredConsulting = consultingSubmissions.filter((c) =>
    !searchQuery || 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Sidebar ──────────────────────────────────────────────
  const sidebarItems: { id: AdminPage; label: string; icon: typeof Home; count?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "applications", label: "Applications", icon: ClipboardList, count: pendingApps.length },
    { id: "users", label: "Users", icon: Users, count: approvedApps.length },
    { id: "consulting", label: "Consulting Leads", icon: MessageSquare, count: consultingSubmissions.length },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // ── Sub-components ───────────────────────────────────────
  const ApplicationCard = ({ app }: { app: typeof applications[0] }) => (
    <Card className="border-border hover:border-primary/20 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-base">{app.full_name}</h3>
            <p className="text-sm text-muted-foreground font-mono">{app.email}</p>
          </div>
          <Badge variant={app.status === "pending" ? "secondary" : app.status === "approved" ? "default" : "destructive"} className="capitalize">
            {app.status}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{app.company_name || "—"}</span>
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{app.location || "—"}</span>
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{app.company_size || "—"}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{new Date(app.created_at).toLocaleDateString()}</span>
        </div>
        <div className="mb-3">
          <p className="text-xs font-medium mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Intended Use</p>
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-2.5">{app.intended_use || "Not provided"}</p>
        </div>
        {app.admin_notes && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Admin Notes</p>
            <p className="text-sm bg-muted/30 rounded-lg p-2 border border-border">{app.admin_notes}</p>
          </div>
        )}
        {app.status === "pending" && (
          selectedApp === app.id ? (
            <div className="space-y-2 pt-2 border-t border-border">
              <Textarea placeholder="Internal notes (optional)..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} className="rounded-lg bg-muted/50 border-border resize-none text-sm" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => updateAppMutation.mutate({ id: app.id, status: "approved", notes: adminNotes })} disabled={updateAppMutation.isPending} className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => updateAppMutation.mutate({ id: app.id, status: "rejected", notes: adminNotes })} disabled={updateAppMutation.isPending} className="flex-1 rounded-lg gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedApp(null)} className="rounded-lg">Cancel</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => { setSelectedApp(app.id); setAdminNotes(""); }} className="w-full rounded-lg mt-2">
              Review Application
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );

  // ── Pages ────────────────────────────────────────────────
  const OverviewPage = () => {
    const overviewStats = [
      { label: "Pending Review", value: pendingApps.length, icon: Clock, color: "text-primary", bg: "bg-primary/10" },
      { label: "Approved Users", value: approvedApps.length, icon: UserCheck, color: "text-green-500", bg: "bg-green-500/10" },
      { label: "Rejected", value: rejectedApps.length, icon: UserX, color: "text-destructive", bg: "bg-destructive/10" },
      { label: "Consulting Leads", value: consultingSubmissions.length, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
    ];

    return (
      <>
        <h2 className="text-2xl font-extrabold mb-1">Overview</h2>
        <p className="text-muted-foreground mb-6">Platform health at a glance</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {overviewStats.map((s) => (
            <Card key={s.label} className="border-border hover:border-primary/20 transition-colors cursor-pointer" onClick={() => s.label.includes("Consulting") ? setCurrentPage("consulting") : setCurrentPage("applications")}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
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

        {/* Recent pending */}
        <h3 className="text-lg font-bold mb-3">Recent Pending Applications</h3>
        {pendingApps.length === 0 ? (
          <Card className="border-dashed"><CardContent className="p-8 text-center text-muted-foreground">No pending applications 🎉</CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingApps.slice(0, 4).map((app) => <ApplicationCard key={app.id} app={app} />)}
          </div>
        )}
        {pendingApps.length > 4 && (
          <Button variant="outline" className="mt-4 gap-1" onClick={() => setCurrentPage("applications")}>
            View all {pendingApps.length} applications <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {/* Recent consulting */}
        {consultingSubmissions.length > 0 && (
          <>
            <h3 className="text-lg font-bold mb-3 mt-8">Recent Consulting Leads</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {consultingSubmissions.slice(0, 2).map((c) => (
                <Card key={c.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-sm">{c.full_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{c.email}</p>
                      </div>
                      {c.service_needed && <Badge variant="secondary" className="text-xs">{c.service_needed}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{c.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </>
    );
  };

  const ApplicationsPage = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold mb-1">Applications</h2>
          <p className="text-muted-foreground">Manage early access requests</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name, email, company..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 rounded-lg" />
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="gap-1"><Clock className="w-3.5 h-3.5" /> Pending ({pendingApps.length})</TabsTrigger>
          <TabsTrigger value="approved" className="gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Approved ({approvedApps.length})</TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1"><XCircle className="w-3.5 h-3.5" /> Rejected ({rejectedApps.length})</TabsTrigger>
          <TabsTrigger value="all" className="gap-1"><Users className="w-3.5 h-3.5" /> All ({applications.length})</TabsTrigger>
        </TabsList>

        {appsLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            {["pending", "approved", "rejected", "all"].map((tab) => {
              const filtered = tab === "all" ? filteredApplications : filteredApplications.filter((a) => a.status === tab);
              return (
                <TabsContent key={tab} value={tab}>
                  {filtered.length === 0 ? (
                    <Card className="border-dashed"><CardContent className="p-12 text-center text-muted-foreground">No {tab} applications</CardContent></Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">{filtered.map((app) => <ApplicationCard key={app.id} app={app} />)}</div>
                  )}
                </TabsContent>
              );
            })}
          </>
        )}
      </Tabs>
    </>
  );

  const UsersPage = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold mb-1">Approved Users</h2>
          <p className="text-muted-foreground">Users with platform access</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 rounded-lg" />
        </div>
      </div>

      {approvedApps.length === 0 ? (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-muted-foreground">No approved users yet</CardContent></Card>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3 hidden md:table-cell">Company</th>
                <th className="p-3 hidden lg:table-cell">Location</th>
                <th className="p-3 hidden lg:table-cell">Approved</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {approvedApps.filter((a) => !searchQuery || a.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium text-sm">{u.full_name}</td>
                  <td className="p-3 text-sm text-muted-foreground font-mono">{u.email}</td>
                  <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">{u.company_name || "—"}</td>
                  <td className="p-3 text-sm text-muted-foreground hidden lg:table-cell">{u.location || "—"}</td>
                  <td className="p-3 text-sm text-muted-foreground hidden lg:table-cell">{u.reviewed_at ? new Date(u.reviewed_at).toLocaleDateString() : "—"}</td>
                  <td className="p-3">
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive gap-1 text-xs" onClick={() => {
                      if (confirm(`Revoke access for ${u.full_name}?`)) {
                        updateAppMutation.mutate({ id: u.id, status: "rejected", notes: "Access revoked by admin" });
                      }
                    }}>
                      <XCircle className="w-3 h-3" /> Revoke
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const ConsultingPage = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold mb-1">Consulting Leads</h2>
          <p className="text-muted-foreground">Inbound consulting requests from the website</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 rounded-lg" />
        </div>
      </div>

      {consultingLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filteredConsulting.length === 0 ? (
        <Card className="border-dashed"><CardContent className="p-12 text-center text-muted-foreground">No consulting submissions yet</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {filteredConsulting.map((c) => (
            <Card key={c.id} className="border-border hover:border-primary/20 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold">{c.full_name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>
                      {c.organization && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {c.organization}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.service_needed && <Badge variant="secondary">{c.service_needed}</Badge>}
                    <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.message}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="gap-1 text-xs" asChild>
                    <a href={`mailto:${c.email}?subject=Re: DataAfro Consulting Request`}>
                      <Mail className="w-3 h-3" /> Reply via Email
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );

  const SettingsPage = () => (
    <>
      <h2 className="text-2xl font-extrabold mb-1">Platform Settings</h2>
      <p className="text-muted-foreground mb-6">Configuration and admin preferences</p>

      <div className="grid gap-6 max-w-2xl">
        <Card className="border-border">
          <CardContent className="p-5">
            <h3 className="font-bold mb-1 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Admin Account</h3>
            <p className="text-sm text-muted-foreground mb-3">Currently signed in as admin</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Email</span>
                <span className="font-mono">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Role</span>
                <Badge variant="default">Admin</Badge>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono text-xs">{user?.id?.slice(0, 8)}...</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5">
            <h3 className="font-bold mb-1 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> Platform Stats</h3>
            <p className="text-sm text-muted-foreground mb-3">Quick summary of platform activity</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Total Applications</span>
                <span className="font-bold">{applications.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Approval Rate</span>
                <span className="font-bold">{applications.length > 0 ? Math.round((approvedApps.length / applications.length) * 100) : 0}%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Consulting Leads</span>
                <span className="font-bold">{consultingSubmissions.length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Avg Review Time</span>
                <span className="font-bold">~24h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5">
            <h3 className="font-bold mb-1 flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Quick Links</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button size="sm" variant="outline" asChild className="rounded-lg"><Link to="/">View Landing Page</Link></Button>
              <Button size="sm" variant="outline" asChild className="rounded-lg"><Link to="/dashboard">User Dashboard</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const pages: Record<AdminPage, JSX.Element> = {
    overview: <OverviewPage />,
    applications: <ApplicationsPage />,
    users: <UsersPage />,
    consulting: <ConsultingPage />,
    settings: <SettingsPage />,
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card fixed inset-y-0 left-0 z-40">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-sm font-black text-primary-foreground">DA</span>
            </div>
            <span className="text-lg font-extrabold">Data<span className="text-gradient">Afro</span></span>
          </Link>
          <Badge variant="outline" className="gap-1 mt-2 w-full justify-center">
            <Shield className="w-3 h-3" /> Admin Panel
          </Badge>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setCurrentPage(item.id); setSearchQuery(""); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.count !== undefined && item.count > 0 && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  currentPage === item.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{user?.email?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.user_metadata?.full_name || "Admin"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
            <ThemeToggle />
          </div>
          <Button variant="ghost" size="sm" onClick={() => void signOut()} className="w-full gap-2 justify-start text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-card h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
            <span className="text-xs font-black text-primary-foreground">DA</span>
          </div>
          <Badge variant="outline" className="gap-1 text-xs"><Shield className="w-3 h-3" /> Admin</Badge>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={() => void signOut()}><LogOut className="w-4 h-4" /></Button>
        </div>
      </header>

      {/* Mobile nav tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card flex">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setCurrentPage(item.id); setSearchQuery(""); }}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
              currentPage === item.id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label.split(" ")[0]}
            {item.count !== undefined && item.count > 0 && (
              <span className="absolute -mt-1 ml-4 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center">{item.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 p-6 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8">
        <motion.div key={currentPage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {pages[currentPage]}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
