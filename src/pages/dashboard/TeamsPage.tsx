import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Trash2, Mail, Crown, Shield, UserCheck, Eye, UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ROLE_CONFIG = {
  owner: { label: "Owner", icon: Crown, color: "text-amber-500" },
  admin: { label: "Admin", icon: Shield, color: "text-primary" },
  member: { label: "Member", icon: UserCheck, color: "text-foreground" },
  viewer: { label: "Viewer", icon: Eye, color: "text-muted-foreground" },
} as const;

const TeamsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteTeamId, setInviteTeamId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("member");

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*, team_members(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createTeam = useMutation({
    mutationFn: async () => {
      const { data: team, error } = await supabase
        .from("teams")
        .insert({ name: teamName, owner_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      // Add owner as member
      await supabase.from("team_members").insert({
        team_id: team.id,
        user_id: user!.id,
        email: user!.email!,
        role: "owner" as any,
        accepted: true,
        invited_by: user!.id,
      });
      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setCreateOpen(false);
      setTeamName("");
      toast.success("Team created!");
    },
    onError: () => toast.error("Failed to create team"),
  });

  const inviteMember = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("team_members").insert({
        team_id: inviteTeamId!,
        user_id: user!.id, // placeholder, will be updated when user accepts
        email: inviteEmail,
        role: inviteRole as any,
        invited_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setInviteOpen(false);
      setInviteEmail("");
      toast.success("Invitation sent!");
    },
    onError: (e: any) => toast.error(e.message?.includes("duplicate") ? "Already a member" : "Failed to invite"),
  });

  const removeMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Member removed");
    },
  });

  const deleteTeam = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teams").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team deleted");
    },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Teams</h1>
          <p className="text-muted-foreground mt-1 text-sm">Collaborate with your organization.</p>
        </div>
        <Button
          className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> New Team
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <Card key={i} className="h-32 animate-pulse" />)}
        </div>
      ) : teams.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">No teams yet</h3>
            <p className="text-muted-foreground mt-1 mb-5 max-w-sm">Create a team to collaborate on projects together.</p>
            <Button className="bg-gradient-primary text-primary-foreground" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {teams.map((team: any, i: number) => {
            const members = team.team_members || [];
            const isOwner = team.owner_id === user?.id;
            return (
              <motion.div key={team.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="shadow-soft">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{team.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{members.length} member{members.length !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isOwner && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setInviteTeamId(team.id); setInviteOpen(true); }}
                            >
                              <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Invite
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => deleteTeam.mutate(team.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[200px]">
                      <div className="space-y-2">
                        {members.map((m: any) => {
                          const config = ROLE_CONFIG[m.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.member;
                          const RoleIcon = config.icon;
                          return (
                            <div key={m.id} className="flex items-center gap-3 py-1.5 group">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-[10px] bg-muted font-bold">
                                  {m.email.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{m.email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-[10px] ${config.color}`}>
                                  <RoleIcon className="w-2.5 h-2.5 mr-1" />
                                  {config.label}
                                </Badge>
                                {!m.accepted && (
                                  <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-300">Pending</Badge>
                                )}
                                {isOwner && m.role !== "owner" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                                    onClick={() => removeMember.mutate(m.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create team dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Team</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Team Name</label>
              <Input placeholder="e.g. Data Science Team" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            </div>
            <Button
              className="w-full bg-gradient-primary text-primary-foreground"
              disabled={!teamName.trim() || createTeam.isPending}
              onClick={() => createTeam.mutate()}
            >
              {createTeam.isPending ? "Creating…" : "Create Team"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite member dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Role</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin — full access</SelectItem>
                  <SelectItem value="member">Member — can edit</SelectItem>
                  <SelectItem value="viewer">Viewer — read only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-gradient-primary text-primary-foreground"
              disabled={!inviteEmail.includes("@") || inviteMember.isPending}
              onClick={() => inviteMember.mutate()}
            >
              {inviteMember.isPending ? "Inviting…" : "Send Invitation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamsPage;
