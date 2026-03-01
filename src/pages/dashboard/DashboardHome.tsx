import { FolderOpen, Plus, Upload, MessageSquare, ArrowRight, Sparkles, TrendingUp, Files } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, description, updated_at, project_files(count), chat_messages(count)")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.email?.split("@")[0] || "there";

  const totalFiles = projects.reduce((a: number, p: any) => a + (p.project_files?.[0]?.count ?? 0), 0);
  const totalMessages = projects.reduce((a: number, p: any) => a + (p.chat_messages?.[0]?.count ?? 0), 0);

  const stats = [
    { label: "Projects", value: projects.length, icon: FolderOpen, color: "text-primary" },
    { label: "Files", value: totalFiles, icon: Files, color: "text-accent-foreground" },
    { label: "AI Messages", value: totalMessages, icon: MessageSquare, color: "text-primary" },
  ];

  const quickActions = [
    { label: "New Project", description: "Start analyzing data", icon: Plus, to: "/dashboard/projects", primary: true },
    { label: "Upload Files", description: "Add data to a project", icon: Upload, to: "/dashboard/upload" },
    { label: "View Reports", description: "See generated insights", icon: TrendingUp, to: "/dashboard/reports" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading">
          {greeting}, <span className="text-gradient">{firstName}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening in your workspace.</p>
      </motion.div>

      {/* Stats */}
      <motion.div className="grid grid-cols-3 gap-3 sm:gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
        {stats.map((s) => (
          <Card key={s.label} className="shadow-soft hover:shadow-card transition-shadow">
            <CardContent className="p-4 sm:p-5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {quickActions.map((a) => (
            <Card
              key={a.label}
              className={`cursor-pointer group transition-all hover:shadow-card ${a.primary ? "border-primary/30 bg-primary/5" : "hover:border-primary/20"}`}
              onClick={() => navigate(a.to)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.primary ? "bg-gradient-primary" : "bg-muted"}`}>
                  <a.icon className={`w-5 h-5 ${a.primary ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Recent Projects */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Projects</h2>
          {projects.length > 0 && (
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link to="/dashboard/projects">View all <ArrowRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          )}
        </div>

        {projects.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Create your first project</h3>
              <p className="text-muted-foreground mt-1 mb-5 max-w-sm">
                Upload your data, chat with AI, and get insights in seconds.
              </p>
              <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90" onClick={() => navigate("/dashboard/projects")}>
                <Plus className="w-4 h-4 mr-2" /> New Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {projects.map((p: any) => (
              <Card
                key={p.id}
                className="shadow-soft hover:shadow-card transition-all cursor-pointer group"
                onClick={() => navigate(`/dashboard/projects/${p.id}`)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{p.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><Files className="w-3 h-3" /> {p.project_files?.[0]?.count ?? 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {p.chat_messages?.[0]?.count ?? 0}</span>
                      <span>{new Date(p.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardHome;
