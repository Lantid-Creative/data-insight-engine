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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { STRIPE_PLANS, getPlanFromProductId, getPlanFromPriceId } from "@/lib/stripe-plans";
import {
  LogOut, CheckCircle2, XCircle, Clock, Users, Shield, Building2,
  MapPin, FileText, LayoutDashboard, ClipboardList, MessageSquare,
  Settings, Search, ChevronRight, Home, BarChart3, UserCheck, UserX,
  Mail, Globe, CreditCard, TrendingUp, DollarSign, Tag, Percent,
  Trash2, ArrowUpDown, RefreshCw, Activity, ChevronDown, UserPlus, Send,
  FolderOpen, Eye, AlertTriangle, Database, HardDrive
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

type AdminPage = "overview" | "applications" | "users" | "subscriptions" | "analytics" | "promotions" | "consulting" | "moderation" | "activity" | "settings";

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
      const { data, error } = await supabase.from("user_applications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: consultingSubmissions = [] } = useQuery({
    queryKey: ["admin-consulting"],
    queryFn: async () => {
      const { data, error } = await supabase.from("consulting_submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  // ── Mutations ────────────────────────────────────────────
  const updateAppMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase.from("user_applications").update({
        status, reviewed_by: user?.id, reviewed_at: new Date().toISOString(), admin_notes: notes || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      toast({ title: "Application updated" });
      setSelectedApp(null);
      setAdminNotes("");
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      // Remove existing roles
      await supabase.from("user_roles").delete().eq("user_id", userId);
      // Insert new role
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as "admin" | "user" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast({ title: "Role updated" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // ── Computed ─────────────────────────────────────────────
  const pendingApps = applications.filter((a) => a.status === "pending");
  const approvedApps = applications.filter((a) => a.status === "approved");
  const rejectedApps = applications.filter((a) => a.status === "rejected");

  const filteredApplications = applications.filter((a) =>
    !searchQuery || a.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase()) || (a.company_name && a.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredConsulting = consultingSubmissions.filter((c) =>
    !searchQuery || c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()) || c.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Sidebar ──────────────────────────────────────────────
  const sidebarItems: { id: AdminPage; label: string; icon: typeof Home; count?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "applications", label: "Applications", icon: ClipboardList, count: pendingApps.length },
    { id: "users", label: "Users & Roles", icon: Users, count: approvedApps.length },
    { id: "moderation", label: "Moderation", icon: Eye },
    { id: "activity", label: "Activity Feed", icon: Activity },
    { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "promotions", label: "Promotions", icon: Tag },
    { id: "consulting", label: "Consulting", icon: MessageSquare, count: consultingSubmissions.length },
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
          <Badge variant={app.status === "pending" ? "secondary" : app.status === "approved" ? "default" : "destructive"} className="capitalize">{app.status}</Badge>
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
                <Button size="sm" onClick={() => updateAppMutation.mutate({ id: app.id, status: "approved", notes: adminNotes })} disabled={updateAppMutation.isPending} className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => updateAppMutation.mutate({ id: app.id, status: "rejected", notes: adminNotes })} disabled={updateAppMutation.isPending} className="flex-1 rounded-lg gap-1"><XCircle className="w-3.5 h-3.5" /> Reject</Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedApp(null)} className="rounded-lg">Cancel</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => { setSelectedApp(app.id); setAdminNotes(""); }} className="w-full rounded-lg mt-2">Review Application</Button>
          )
        )}
      </CardContent>
    </Card>
  );

  // ── Pages ────────────────────────────────────────────────

  // ─── OVERVIEW ───
  const OverviewPage = () => {
    const { data: projectCount = 0 } = useQuery({
      queryKey: ["admin-project-count"],
      queryFn: async () => {
        const { data, error } = await supabase.from("projects").select("id");
        if (error) throw error;
        return data?.length || 0;
      },
    });

    const { data: teamCount = 0 } = useQuery({
      queryKey: ["admin-team-count"],
      queryFn: async () => {
        const { data, error } = await supabase.from("teams").select("id");
        if (error) throw error;
        return data?.length || 0;
      },
    });

    const stats = [
      { label: "Pending Review", value: pendingApps.length, icon: Clock, color: "text-primary", bg: "bg-primary/10" },
      { label: "Approved Users", value: approvedApps.length, icon: UserCheck, color: "text-green-500", bg: "bg-green-500/10" },
      { label: "Total Projects", value: projectCount, icon: FolderOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
      { label: "Teams", value: teamCount, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
      { label: "Rejected", value: rejectedApps.length, icon: UserX, color: "text-destructive", bg: "bg-destructive/10" },
      { label: "Consulting Leads", value: consultingSubmissions.length, icon: MessageSquare, color: "text-amber-500", bg: "bg-amber-500/10" },
    ];
    return (
      <>
        <h2 className="text-2xl font-extrabold mb-1">Overview</h2>
        <p className="text-muted-foreground mb-6">Platform health at a glance</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {stats.map((s) => (
            <Card key={s.label} className="border-border hover:border-primary/20 transition-colors cursor-pointer" onClick={() => s.label.includes("Consulting") ? setCurrentPage("consulting") : s.label.includes("Projects") ? setCurrentPage("moderation") : s.label.includes("Teams") ? setCurrentPage("moderation") : setCurrentPage("applications")}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                <div><p className="text-2xl font-extrabold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <h3 className="text-lg font-bold mb-3">Recent Pending Applications</h3>
        {pendingApps.length === 0 ? (
          <Card className="border-dashed"><CardContent className="p-8 text-center text-muted-foreground">No pending applications 🎉</CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">{pendingApps.slice(0, 4).map((app) => <ApplicationCard key={app.id} app={app} />)}</div>
        )}
        {pendingApps.length > 4 && <Button variant="outline" className="mt-4 gap-1" onClick={() => setCurrentPage("applications")}>View all {pendingApps.length} applications <ChevronRight className="w-4 h-4" /></Button>}
      </>
    );
  };

  // ─── APPLICATIONS ───
  const ApplicationsPage = () => (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div><h2 className="text-2xl font-extrabold mb-1">Applications</h2><p className="text-muted-foreground">Manage early access requests</p></div>
        <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 rounded-lg" /></div>
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

  // ─── USERS & ROLES ───
  const UsersPage = () => {
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteName, setInviteName] = useState("");
    const [inviteRole, setInviteRole] = useState("user");

    const getUserRole = (userId: string) => {
      const role = userRoles.find((r) => r.user_id === userId);
      return role?.role || "user";
    };

    const inviteMutation = useMutation({
      mutationFn: async () => {
        const { data, error } = await supabase.functions.invoke("admin-invite", {
          body: { email: inviteEmail, full_name: inviteName, role: inviteRole, auto_approve: true },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        return data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
        queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
        toast({
          title: "User invited!",
          description: `${inviteEmail} has been invited. Temporary password: ${data?.temp_password || "check email"}`,
        });
        setInviteOpen(false);
        setInviteEmail("");
        setInviteName("");
        setInviteRole("user");
      },
      onError: (err: Error) => toast({ title: "Invite failed", description: err.message, variant: "destructive" }),
    });

    return (
      <>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div><h2 className="text-2xl font-extrabold mb-1">Users & Roles</h2><p className="text-muted-foreground">Manage user accounts and permissions</p></div>
          <div className="flex items-center gap-2">
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 bg-gradient-primary text-primary-foreground hover:opacity-90 rounded-lg">
                  <UserPlus className="w-4 h-4" /> Invite User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" /> Invite New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); inviteMutation.mutate(); }} className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="invite-name" className="text-sm font-medium">Full Name</Label>
                    <Input id="invite-name" placeholder="e.g. Jane Doe" value={inviteName} onChange={(e) => setInviteName(e.target.value)} required className="rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-email" className="text-sm font-medium">Email Address</Label>
                    <Input id="invite-email" type="email" placeholder="e.g. jane@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required className="rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                    <p>The user will be created with a temporary password. Share it with them or ask them to use <strong>"Forgot Password"</strong> to set their own.</p>
                  </div>
                  <Button type="submit" disabled={inviteMutation.isPending || !inviteEmail || !inviteName} className="w-full gap-2 bg-gradient-primary text-primary-foreground hover:opacity-90 rounded-lg">
                    {inviteMutation.isPending ? "Inviting..." : <><Send className="w-4 h-4" /> Send Invite</>}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 rounded-lg" /></div>
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
                  <th className="p-3">Role</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {approvedApps.filter((a) => !searchQuery || a.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium text-sm">{u.full_name}</td>
                    <td className="p-3 text-sm text-muted-foreground font-mono">{u.email}</td>
                    <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">{u.company_name || "—"}</td>
                    <td className="p-3">
                      <Select defaultValue={getUserRole(u.user_id)} onValueChange={(role) => {
                        if (confirm(`Change ${u.full_name}'s role to ${role}?`)) {
                          changeRoleMutation.mutate({ userId: u.user_id, role });
                        }
                      }}>
                        <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
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
  };

  // ─── SUBSCRIPTIONS ───
  const SubscriptionsPage = () => {
    const [subFilter, setSubFilter] = useState("all");
    const [subSearch, setSubSearch] = useState("");

    const { data: subsData, isLoading: subsLoading, refetch: refetchSubs } = useQuery({
      queryKey: ["admin-subscriptions", subFilter],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke("admin-subscriptions", {
          body: { action: "list", status: subFilter },
        });
        if (error) throw error;
        return data;
      },
    });

    const cancelSubMutation = useMutation({
      mutationFn: async (subscriptionId: string) => {
        const { data, error } = await supabase.functions.invoke("admin-subscriptions", {
          body: { action: "cancel", subscription_id: subscriptionId },
        });
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        refetchSubs();
        toast({ title: "Subscription canceled" });
      },
      onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });

    const updateSubMutation = useMutation({
      mutationFn: async ({ subscriptionId, newPriceId }: { subscriptionId: string; newPriceId: string }) => {
        const { data, error } = await supabase.functions.invoke("admin-subscriptions", {
          body: { action: "update", subscription_id: subscriptionId, new_price_id: newPriceId },
        });
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        refetchSubs();
        toast({ title: "Subscription updated" });
      },
      onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });

    const subscriptions = subsData?.subscriptions || [];
    const filteredSubs = subscriptions.filter((s: any) =>
      !subSearch || s.customer_email?.toLowerCase().includes(subSearch.toLowerCase()) || s.customer_name?.toLowerCase().includes(subSearch.toLowerCase())
    );

    // Build flat list of all price options
    const allPlans: { label: string; priceId: string }[] = [];
    for (const [planName, cycles] of Object.entries(STRIPE_PLANS)) {
      for (const [cycle, tiers] of Object.entries(cycles)) {
        for (const [credits, plan] of Object.entries(tiers)) {
          allPlans.push({ label: `${planName} ${credits}cr/${cycle === "annual" ? "yr" : "mo"} - $${plan.amount}`, priceId: plan.priceId });
        }
      }
    }

    const statusColors: Record<string, string> = {
      active: "bg-green-500/10 text-green-600",
      canceled: "bg-destructive/10 text-destructive",
      past_due: "bg-yellow-500/10 text-yellow-600",
      trialing: "bg-blue-500/10 text-blue-600",
      incomplete: "bg-muted text-muted-foreground",
    };

    return (
      <>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div><h2 className="text-2xl font-extrabold mb-1">Subscriptions</h2><p className="text-muted-foreground">Manage all customer subscriptions</p></div>
          <div className="flex items-center gap-2">
            <Select value={subFilter} onValueChange={setSubFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-56"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search email..." value={subSearch} onChange={(e) => setSubSearch(e.target.value)} className="pl-9 rounded-lg h-9" /></div>
            <Button size="sm" variant="outline" onClick={() => refetchSubs()} className="gap-1"><RefreshCw className="w-3.5 h-3.5" /></Button>
          </div>
        </div>

        {subsLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredSubs.length === 0 ? (
          <Card className="border-dashed"><CardContent className="p-12 text-center text-muted-foreground">No subscriptions found</CardContent></Card>
        ) : (
          <div className="rounded-lg border border-border overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <th className="p-3">Customer</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Period End</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSubs.map((sub: any) => {
                  const plan = sub.product_id ? getPlanFromProductId(sub.product_id) : null;
                  return (
                    <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <p className="font-medium text-sm">{sub.customer_name || "—"}</p>
                        <p className="text-xs text-muted-foreground font-mono">{sub.customer_email}</p>
                      </td>
                      <td className="p-3 text-sm">
                        {plan ? (
                          <span className="capitalize">{plan.plan} {plan.credits}cr/{plan.cycle === "annual" ? "yr" : "mo"}</span>
                        ) : sub.price_id ? (
                          <span className="text-muted-foreground font-mono text-xs">{sub.price_id.slice(0, 16)}...</span>
                        ) : "—"}
                      </td>
                      <td className="p-3 text-sm font-medium">${sub.amount}/{sub.interval === "year" ? "yr" : "mo"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[sub.status] || "bg-muted text-muted-foreground"}`}>{sub.status}</span>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{new Date(sub.current_period_end).toLocaleDateString()}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {sub.status === "active" && (
                            <>
                              <Select onValueChange={(newPriceId) => {
                                if (confirm("Change this customer's plan?")) {
                                  updateSubMutation.mutate({ subscriptionId: sub.id, newPriceId });
                                }
                              }}>
                                <SelectTrigger className="w-28 h-7 text-[10px]"><SelectValue placeholder="Change plan" /></SelectTrigger>
                                <SelectContent>
                                  {allPlans.filter((p) => p.priceId !== sub.price_id).map((p) => (
                                    <SelectItem key={p.priceId} value={p.priceId} className="text-xs">{p.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button size="sm" variant="ghost" className="h-7 text-destructive text-[10px] gap-0.5 px-2" onClick={() => {
                                if (confirm(`Cancel subscription for ${sub.customer_email}?`)) cancelSubMutation.mutate(sub.id);
                              }} disabled={cancelSubMutation.isPending}>
                                <XCircle className="w-3 h-3" /> Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  };

  // ─── ANALYTICS ───
  const AnalyticsPage = () => {
    const [period, setPeriod] = useState("month");

    const { data: revenueData, isLoading: revLoading, refetch: refetchRevenue } = useQuery({
      queryKey: ["admin-revenue", period],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke("admin-subscriptions", {
          body: { action: "revenue", period },
        });
        if (error) throw error;
        return data;
      },
    });

    const metricCards = [
      { label: "Total Revenue", value: `$${revenueData?.total_revenue?.toLocaleString() || "0"}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
      { label: "MRR", value: `$${revenueData?.mrr?.toLocaleString() || "0"}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
      { label: "Active Subscribers", value: revenueData?.active_subscribers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
      { label: "Transactions", value: revenueData?.total_charges || 0, icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
    ];

    return (
      <>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div><h2 className="text-2xl font-extrabold mb-1">Analytics</h2><p className="text-muted-foreground">Revenue and subscription metrics</p></div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => refetchRevenue()} className="gap-1"><RefreshCw className="w-3.5 h-3.5" /></Button>
          </div>
        </div>

        {revLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {metricCards.map((m) => (
                <Card key={m.label} className="border-border">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center`}><m.icon className={`w-5 h-5 ${m.color}`} /></div>
                    <div><p className="text-2xl font-extrabold">{m.value}</p><p className="text-xs text-muted-foreground">{m.label}</p></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Daily revenue chart (simple bar chart) */}
            <Card className="border-border">
              <CardContent className="p-5">
                <h3 className="font-bold mb-4">Daily Revenue</h3>
                {revenueData?.daily_revenue?.length > 0 ? (
                  <div className="flex items-end gap-1 h-40 overflow-x-auto pb-6 relative">
                    {revenueData.daily_revenue.map((d: { date: string; amount: number }, i: number) => {
                      const maxAmt = Math.max(...revenueData.daily_revenue.map((r: { amount: number }) => r.amount));
                      const h = maxAmt > 0 ? (d.amount / maxAmt) * 100 : 0;
                      return (
                        <div key={i} className="flex flex-col items-center gap-1 min-w-[28px] group relative">
                          <div className="absolute -top-6 bg-card border border-border rounded px-1.5 py-0.5 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            ${d.amount.toFixed(0)} · {d.date.slice(5)}
                          </div>
                          <div className="w-5 bg-primary/80 rounded-t transition-all hover:bg-primary" style={{ height: `${Math.max(h, 4)}%` }} />
                          <span className="text-[8px] text-muted-foreground -rotate-45 origin-top-left mt-1">{d.date.slice(5)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No revenue data for this period</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </>
    );
  };

  // ─── PROMOTIONS ───
  const PromotionsPage = () => {
    const [couponName, setCouponName] = useState("");
    const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
    const [discountValue, setDiscountValue] = useState("");
    const [duration, setDuration] = useState("once");
    const [durationMonths, setDurationMonths] = useState("3");

    const { data: couponsData, isLoading: couponsLoading, refetch: refetchCoupons } = useQuery({
      queryKey: ["admin-coupons"],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke("admin-subscriptions", {
          body: { action: "list_coupons" },
        });
        if (error) throw error;
        return data;
      },
    });

    const createCouponMutation = useMutation({
      mutationFn: async () => {
        const body: any = { action: "create_coupon", name: couponName, duration };
        if (discountType === "percent") body.percent_off = parseFloat(discountValue);
        else body.amount_off = parseFloat(discountValue);
        if (duration === "repeating") body.duration_in_months = parseInt(durationMonths);
        const { data, error } = await supabase.functions.invoke("admin-subscriptions", { body });
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        refetchCoupons();
        toast({ title: "Coupon created" });
        setCouponName("");
        setDiscountValue("");
      },
      onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });

    const deleteCouponMutation = useMutation({
      mutationFn: async (couponId: string) => {
        const { data, error } = await supabase.functions.invoke("admin-subscriptions", {
          body: { action: "delete_coupon", coupon_id: couponId },
        });
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        refetchCoupons();
        toast({ title: "Coupon deleted" });
      },
      onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });

    const coupons = couponsData?.coupons || [];

    return (
      <>
        <h2 className="text-2xl font-extrabold mb-1">Promotions & Coupons</h2>
        <p className="text-muted-foreground mb-6">Create and manage discount codes</p>

        {/* Create coupon form */}
        <Card className="border-border mb-8">
          <CardContent className="p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> Create New Coupon</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
                <Input placeholder="e.g. LAUNCH20" value={couponName} onChange={(e) => setCouponName(e.target.value)} className="rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Discount Type</label>
                <Select value={discountType} onValueChange={(v) => setDiscountType(v as "percent" | "amount")}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                    <SelectItem value="amount">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{discountType === "percent" ? "Percentage" : "Amount ($)"}</label>
                <Input type="number" placeholder={discountType === "percent" ? "e.g. 20" : "e.g. 10"} value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Duration</label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="repeating">Repeating</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {duration === "repeating" && (
              <div className="mt-3 max-w-[200px]">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Duration (months)</label>
                <Input type="number" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} className="rounded-lg" />
              </div>
            )}
            <Button className="mt-4 gap-1" onClick={() => createCouponMutation.mutate()} disabled={!couponName || !discountValue || createCouponMutation.isPending}>
              <Tag className="w-4 h-4" /> Create Coupon
            </Button>
          </CardContent>
        </Card>

        {/* Existing coupons */}
        <h3 className="font-bold mb-3">Active Coupons</h3>
        {couponsLoading ? (
          <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : coupons.length === 0 ? (
          <Card className="border-dashed"><CardContent className="p-8 text-center text-muted-foreground">No coupons created yet</CardContent></Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {coupons.map((c: any) => (
              <Card key={c.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-sm">{c.name || c.id}</p>
                      <p className="text-xs text-muted-foreground font-mono">{c.id}</p>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      {c.percent_off ? <><Percent className="w-3 h-3" />{c.percent_off}% off</> : `$${(c.amount_off / 100).toFixed(0)} off`}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="capitalize">{c.duration}{c.duration_in_months ? ` · ${c.duration_in_months}mo` : ""}</span>
                    <span>{c.times_redeemed || 0} redeemed</span>
                  </div>
                  <Button size="sm" variant="ghost" className="w-full mt-2 text-destructive gap-1 text-xs" onClick={() => {
                    if (confirm(`Delete coupon "${c.name || c.id}"?`)) deleteCouponMutation.mutate(c.id);
                  }}><Trash2 className="w-3 h-3" /> Delete</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </>
    );
  };

  // ─── CONSULTING ───
  const ConsultingPage = () => (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div><h2 className="text-2xl font-extrabold mb-1">Consulting Leads</h2><p className="text-muted-foreground">Inbound consulting requests</p></div>
        <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 rounded-lg" /></div>
      </div>
      {filteredConsulting.length === 0 ? (
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
                <div className="bg-muted/50 rounded-lg p-3"><p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.message}</p></div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="gap-1 text-xs" asChild>
                    <a href={`mailto:${c.email}?subject=Re: DataAfro Consulting Request`}><Mail className="w-3 h-3" /> Reply via Email</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );

  // ─── SETTINGS ───
  const SettingsPage = () => (
    <>
      <h2 className="text-2xl font-extrabold mb-1">Platform Settings</h2>
      <p className="text-muted-foreground mb-6">Configuration and admin preferences</p>
      <div className="grid gap-6 max-w-2xl">
        <Card className="border-border">
          <CardContent className="p-5">
            <h3 className="font-bold mb-1 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Admin Account</h3>
            <div className="space-y-2 text-sm mt-3">
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Email</span><span className="font-mono">{user?.email}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Role</span><Badge variant="default">Admin</Badge></div>
              <div className="flex justify-between py-2"><span className="text-muted-foreground">User ID</span><span className="font-mono text-xs">{user?.id?.slice(0, 8)}...</span></div>
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

  // ─── MODERATION ───
  const ModerationPage = () => {
    const [modSearch, setModSearch] = useState("");

    const { data: allProjects = [], isLoading: projLoading, refetch: refetchProjects } = useQuery({
      queryKey: ["admin-all-projects"],
      queryFn: async () => {
        const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false }).limit(100);
        if (error) throw error;
        return data;
      },
    });

    const { data: allTeams = [] } = useQuery({
      queryKey: ["admin-all-teams"],
      queryFn: async () => {
        const { data, error } = await supabase.from("teams").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      },
    });

    const { data: fileStats } = useQuery({
      queryKey: ["admin-file-stats"],
      queryFn: async () => {
        const { data, error } = await supabase.from("project_files").select("id, file_size");
        if (error) throw error;
        const totalFiles = data?.length || 0;
        const totalSize = data?.reduce((acc, f) => acc + (f.file_size || 0), 0) || 0;
        return { totalFiles, totalSize };
      },
    });

    const deleteProjectMutation = useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => {
        refetchProjects();
        toast({ title: "Project deleted" });
      },
      onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });

    const filteredProjects = allProjects.filter((p) =>
      !modSearch || p.name.toLowerCase().includes(modSearch.toLowerCase()) || p.description?.toLowerCase().includes(modSearch.toLowerCase())
    );

    const formatBytes = (bytes: number) => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    return (
      <>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div><h2 className="text-2xl font-extrabold mb-1">Content Moderation</h2><p className="text-muted-foreground">Monitor and manage all projects, teams, and storage</p></div>
          <div className="flex items-center gap-2">
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search projects..." value={modSearch} onChange={(e) => setModSearch(e.target.value)} className="pl-9 rounded-lg" /></div>
            <Button size="sm" variant="outline" onClick={() => refetchProjects()} className="gap-1"><RefreshCw className="w-3.5 h-3.5" /></Button>
          </div>
        </div>

        {/* Platform stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><FolderOpen className="w-5 h-5 text-primary" /></div>
              <div><p className="text-2xl font-extrabold">{allProjects.length}</p><p className="text-xs text-muted-foreground">Total Projects</p></div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Users className="w-5 h-5 text-blue-500" /></div>
              <div><p className="text-2xl font-extrabold">{allTeams.length}</p><p className="text-xs text-muted-foreground">Teams</p></div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><FileText className="w-5 h-5 text-amber-500" /></div>
              <div><p className="text-2xl font-extrabold">{fileStats?.totalFiles || 0}</p><p className="text-xs text-muted-foreground">Total Files</p></div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><HardDrive className="w-5 h-5 text-emerald-500" /></div>
              <div><p className="text-2xl font-extrabold">{formatBytes(fileStats?.totalSize || 0)}</p><p className="text-xs text-muted-foreground">Storage Used</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Projects table */}
        <h3 className="font-bold mb-3">All Projects</h3>
        {projLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredProjects.length === 0 ? (
          <Card className="border-dashed"><CardContent className="p-12 text-center text-muted-foreground">No projects found</CardContent></Card>
        ) : (
          <div className="rounded-lg border border-border overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <th className="p-3">Project</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Updated</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{p.description || "No description"}</p>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground font-mono">{p.user_id.slice(0, 8)}…</td>
                    <td className="p-3 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-sm text-muted-foreground">{new Date(p.updated_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" asChild>
                          <Link to={`/dashboard/projects/${p.id}`}><Eye className="w-3 h-3" /> View</Link>
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => {
                          if (confirm(`Delete project "${p.name}"? This cannot be undone.`)) deleteProjectMutation.mutate(p.id);
                        }}><Trash2 className="w-3 h-3" /> Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Teams list */}
        {allTeams.length > 0 && (
          <>
            <h3 className="font-bold mb-3 mt-8">All Teams</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {allTeams.map((t) => (
                <Card key={t.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">Owner: {t.owner_id.slice(0, 8)}…</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </>
    );
  };

  // ─── ACTIVITY FEED ───
  const ActivityFeedPage = () => {
    const [actSearch, setActSearch] = useState("");

    const { data: allActivity = [], isLoading: actLoading, refetch: refetchActivity } = useQuery({
      queryKey: ["admin-all-activity"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("activity_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);
        if (error) throw error;
        return data;
      },
    });

    const filteredActivity = allActivity.filter((a) =>
      !actSearch || a.action.toLowerCase().includes(actSearch.toLowerCase()) || JSON.stringify(a.details || {}).toLowerCase().includes(actSearch.toLowerCase())
    );

    const actionColors: Record<string, string> = {
      file_upload: "bg-blue-500/10 text-blue-500",
      chat_message: "bg-purple-500/10 text-purple-500",
      report_generated: "bg-emerald-500/10 text-emerald-500",
      analysis_run: "bg-amber-500/10 text-amber-500",
      project_shared: "bg-primary/10 text-primary",
      file_deleted: "bg-destructive/10 text-destructive",
      settings_changed: "bg-muted text-muted-foreground",
    };

    return (
      <>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div><h2 className="text-2xl font-extrabold mb-1">Platform Activity</h2><p className="text-muted-foreground">System-wide activity feed across all users</p></div>
          <div className="flex items-center gap-2">
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search activity..." value={actSearch} onChange={(e) => setActSearch(e.target.value)} className="pl-9 rounded-lg" /></div>
            <Button size="sm" variant="outline" onClick={() => refetchActivity()} className="gap-1"><RefreshCw className="w-3.5 h-3.5" /></Button>
          </div>
        </div>

        {actLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredActivity.length === 0 ? (
          <Card className="border-dashed"><CardContent className="p-12 text-center text-muted-foreground">No activity recorded yet</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {filteredActivity.map((a) => {
              const details = (a.details || {}) as Record<string, any>;
              return (
                <Card key={a.id} className="border-border hover:border-primary/10 transition-colors">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${actionColors[a.action] || "bg-muted text-muted-foreground"}`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize">{a.action.replace(/_/g, " ")}</span>
                        {details.name && <span className="text-xs text-muted-foreground">— {details.name}</span>}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono mt-0.5">
                        <span>User: {a.user_id.slice(0, 8)}…</span>
                        {a.project_id && <span>Project: {a.project_id.slice(0, 8)}…</span>}
                        <span>{new Date(a.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </>
    );
  };

  const pages: Record<AdminPage, JSX.Element> = {
    overview: <OverviewPage />,
    applications: <ApplicationsPage />,
    users: <UsersPage />,
    moderation: <ModerationPage />,
    activity: <ActivityFeedPage />,
    subscriptions: <SubscriptionsPage />,
    analytics: <AnalyticsPage />,
    promotions: <PromotionsPage />,
    consulting: <ConsultingPage />,
    settings: <SettingsPage />,
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card fixed inset-y-0 left-0 z-40">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center"><span className="text-sm font-black text-primary-foreground">DA</span></div>
            <span className="text-lg font-extrabold">Data<span className="text-gradient">Afro</span></span>
          </Link>
          <Badge variant="outline" className="gap-1 mt-2 w-full justify-center"><Shield className="w-3 h-3" /> Admin Panel</Badge>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => { setCurrentPage(item.id); setSearchQuery(""); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentPage === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.count !== undefined && item.count > 0 && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${currentPage === item.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>{item.count}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-xs font-bold text-primary">{user?.email?.[0]?.toUpperCase()}</span></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.user_metadata?.full_name || "Admin"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
            <ThemeToggle />
          </div>
          <Button variant="ghost" size="sm" onClick={() => void signOut()} className="w-full gap-2 justify-start text-muted-foreground hover:text-destructive"><LogOut className="w-4 h-4" /> Sign Out</Button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-card h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center"><span className="text-xs font-black text-primary-foreground">DA</span></div>
          <Badge variant="outline" className="gap-1 text-xs"><Shield className="w-3 h-3" /> Admin</Badge>
        </div>
        <div className="flex items-center gap-1"><ThemeToggle /><Button variant="ghost" size="sm" onClick={() => void signOut()}><LogOut className="w-4 h-4" /></Button></div>
      </header>

      {/* Mobile nav (scrollable) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card flex overflow-x-auto">
        {sidebarItems.map((item) => (
          <button key={item.id} onClick={() => { setCurrentPage(item.id); setSearchQuery(""); }}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 py-2.5 px-3 text-[10px] font-medium transition-colors ${currentPage === item.id ? "text-primary" : "text-muted-foreground"}`}>
            <item.icon className="w-4 h-4" />
            {item.label.split(" ")[0]}
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
