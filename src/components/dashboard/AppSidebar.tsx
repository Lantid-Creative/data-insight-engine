import {
  Upload, FolderOpen, FileText, Key, CreditCard, Settings,
  LayoutDashboard, Sparkles, ChevronUp, Plus, MessageSquare, Search,
  MoreHorizontal, Pencil, Trash2, Users, Shield,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { toast } from "sonner";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Projects", url: "/dashboard/projects", icon: FolderOpen },
  { title: "Teams", url: "/dashboard/teams", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const [chatSearch, setChatSearch] = useState("");

  // Rename/delete dialog state
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");
  const [renameDesc, setRenameDesc] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const isInProject = location.pathname.startsWith("/dashboard/projects/");
  const projectId = isInProject ? location.pathname.split("/")[3] : null;

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path + "/"));

  const initials = user?.email?.slice(0, 2).toUpperCase() || "U";

  const { data: recentProjects = [] } = useQuery({
    queryKey: ["sidebar-projects", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects").select("id, name, description, updated_at")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const renameProject = useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name: string; description: string }) => {
      const { error } = await supabase.from("projects").update({ name, description }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      toast.success("Project updated");
      setRenameOpen(false);
    },
    onError: () => toast.error("Failed to update project"),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
      setDeleteOpen(false);
      // If we're viewing the deleted project, navigate away
      if (deleteId === projectId) {
        navigate("/dashboard/projects");
      }
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete project"),
  });

  const filteredProjects = recentProjects.filter((p) =>
    p.name.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const renderItems = (items: typeof mainItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive(item.url)}>
            <NavLink
              to={item.url}
              end={item.url === "/dashboard"}
              className="hover:bg-sidebar-accent/50 transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
            >
              <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <>
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Brand */}
        <div className="p-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-base font-extrabold text-sidebar-accent-foreground tracking-tight">
              DataAfro
            </span>
          )}
        </div>

        {/* Search & New Project */}
        {!collapsed && (
          <div className="px-3 space-y-2 mb-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sidebar-foreground/40" />
              <Input
                placeholder="Search projects…"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                className="h-8 text-xs pl-8 bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs gap-1.5 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              onClick={() => navigate("/dashboard/projects")}
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </Button>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(mainItems)}</SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Projects */}
        {!collapsed && filteredProjects.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Recent Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <ScrollArea className="max-h-[200px]">
                <SidebarMenu>
                  {filteredProjects.map((p) => (
                    <SidebarMenuItem key={p.id} className="group/project">
                      <div className="flex items-center w-full">
                        <SidebarMenuButton
                          asChild
                          isActive={projectId === p.id}
                          className="flex-1 min-w-0"
                        >
                          <NavLink
                            to={`/dashboard/projects/${p.id}`}
                            className="hover:bg-sidebar-accent/50 transition-colors"
                            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                          >
                            <MessageSquare className="mr-2 h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate text-xs">{p.name}</span>
                          </NavLink>
                        </SidebarMenuButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="opacity-0 group-hover/project:opacity-100 p-1 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all flex-shrink-0 mr-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" side="right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => {
                              setRenameId(p.id);
                              setRenameName(p.name);
                              setRenameDesc(p.description || "");
                              setRenameOpen(true);
                            }}>
                              <Pencil className="w-3.5 h-3.5 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setDeleteId(p.id);
                                setDeleteName(p.name);
                                setDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

      </SidebarContent>

      {/* User footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 cursor-pointer">
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <span className="text-sm truncate">{user?.email}</span>
                      <ChevronUp className="w-4 h-4 text-sidebar-foreground/50" />
                    </div>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/dashboard/api")}>
                  <Key className="mr-2 h-4 w-4" /> API Access
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/billing")}>
                  <CreditCard className="mr-2 h-4 w-4" /> Billing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

    {/* Rename Dialog */}
    <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Project Name</label>
            <Input value={renameName} onChange={(e) => setRenameName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Description (optional)</label>
            <Textarea value={renameDesc} onChange={(e) => setRenameDesc(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRenameOpen(false)}>Cancel</Button>
          <Button
            disabled={!renameName.trim() || renameProject.isPending}
            onClick={() => renameId && renameProject.mutate({ id: renameId, name: renameName, description: renameDesc })}
          >
            {renameProject.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Delete Confirm Dialog */}
    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteName}"</span>? This will permanently remove the project and all its data.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={deleteProject.isPending}
            onClick={() => deleteId && deleteProject.mutate(deleteId)}
          >
            {deleteProject.isPending ? "Deleting…" : "Delete Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
