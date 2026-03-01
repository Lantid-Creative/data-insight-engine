import { BarChart3, Upload, FileText, TrendingUp, FolderOpen, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const DashboardHome = () => {
  const { user } = useAuth();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, updated_at, project_files(count), chat_messages(count)")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const stats = [
    { label: "Total Projects", value: String(projects.length), icon: FolderOpen, change: "Active" },
    { label: "Files Uploaded", value: String(projects.reduce((a: number, p: any) => a + (p.project_files?.[0]?.count ?? 0), 0)), icon: Upload, change: "Across all projects" },
    { label: "AI Conversations", value: String(projects.reduce((a: number, p: any) => a + (p.chat_messages?.[0]?.count ?? 0), 0)), icon: FileText, change: "Messages exchanged" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{s.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild className="bg-gradient-primary text-primary-foreground hover:opacity-90">
            <Link to="/dashboard/projects">
              <Plus className="w-4 h-4 mr-2" /> New Project
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard/projects">View All Projects</Link>
          </Button>
        </CardContent>
      </Card>

      {projects.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.map((p: any) => (
              <Link key={p.id} to={`/dashboard/projects/${p.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{p.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(p.updated_at).toLocaleDateString()}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardHome;
