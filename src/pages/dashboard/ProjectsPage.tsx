import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FolderOpen, Plus, Trash2, MessageSquare, Files } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ProjectsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, project_files(count), chat_messages(count)")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createProject = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .insert({ user_id: user!.id, name, description })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      setName("");
      setDescription("");
      toast.success("Project created!");
      navigate(`/dashboard/projects/${data.id}`);
    },
    onError: () => toast.error("Failed to create project"),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">My Projects</h1>
          <p className="text-muted-foreground mt-1">Create and manage your data analysis projects.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Project Name</label>
                <Input placeholder="e.g. Q1 Revenue Analysis" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description (optional)</label>
                <Textarea placeholder="What is this project about?" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <Button
                className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                disabled={!name.trim() || createProject.isPending}
                onClick={() => createProject.mutate()}
              >
                {createProject.isPending ? "Creating…" : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse h-40" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No projects yet</h3>
            <p className="text-muted-foreground mt-1 mb-4">Create your first project to start analysing data.</p>
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {projects.map((p: any) => (
            <Card
              key={p.id}
              className="shadow-soft hover:shadow-card transition-shadow cursor-pointer group"
              onClick={() => navigate(`/dashboard/projects/${p.id}`)}
            >
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <FolderOpen className="w-5 h-5 text-primary flex-shrink-0" />
                  <CardTitle className="text-base truncate">{p.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this project and all its data?")) deleteProject.mutate(p.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent>
                {p.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{p.description}</p>}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Files className="w-3.5 h-3.5" /> {p.project_files?.[0]?.count ?? 0} files</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {p.chat_messages?.[0]?.count ?? 0} messages</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Active</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(p.updated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
