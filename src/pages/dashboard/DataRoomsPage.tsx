import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Lock, Plus, Users, FileText, Shield, Clock, Eye,
  Building2, Upload, Settings, Activity,
  CheckCircle2, AlertTriangle, FolderLock, Trash2, UserPlus,
  Download, Search, BarChart3, History, File, Image, Table2,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DataRoom {
  id: string;
  name: string;
  description: string;
  status: string;
  access_level: string;
  watermarking_enabled: boolean;
  encryption_enabled: boolean;
  ip_restrictions_enabled: boolean;
  two_factor_required: boolean;
  download_limits_enabled: boolean;
  access_expiration_enabled: boolean;
  created_at: string;
}

interface RoomFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by_name: string;
  view_count: number;
  created_at: string;
  file_path: string;
}

interface RoomMember {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  last_active_at: string;
}

interface RoomActivity {
  id: string;
  user_name: string;
  organization: string;
  action: string;
  action_type: string;
  created_at: string;
}

const DataRoomsPage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<DataRoom[]>([]);
  const [roomFiles, setRoomFiles] = useState<RoomFile[]>([]);
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [roomActivity, setRoomActivity] = useState<RoomActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomDesc, setRoomDesc] = useState("");
  const [accessLevel, setAccessLevel] = useState("confidential");
  const [watermark, setWatermark] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteOrg, setInviteOrg] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [fileSearch, setFileSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchRooms = useCallback(async () => {
    const { data } = await supabase.from("data_rooms").select("*").order("created_at", { ascending: false });
    setRooms((data as any[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const fetchRoomDetail = useCallback(async (roomId: string) => {
    const [filesRes, membersRes, activityRes] = await Promise.all([
      supabase.from("data_room_files").select("*").eq("room_id", roomId).order("created_at", { ascending: false }),
      supabase.from("data_room_members").select("*").eq("room_id", roomId).order("created_at", { ascending: false }),
      supabase.from("data_room_activity").select("*").eq("room_id", roomId).order("created_at", { ascending: false }).limit(50),
    ]);
    setRoomFiles((filesRes.data as any[]) || []);
    setRoomMembers((membersRes.data as any[]) || []);
    setRoomActivity((activityRes.data as any[]) || []);
  }, []);

  useEffect(() => {
    if (selectedRoom) fetchRoomDetail(selectedRoom);
  }, [selectedRoom, fetchRoomDetail]);

  const createRoom = async () => {
    if (!roomName.trim() || !user) return;
    setCreating(true);
    const { error } = await supabase.from("data_rooms").insert({
      user_id: user.id,
      name: roomName,
      description: roomDesc,
      access_level: accessLevel,
      watermarking_enabled: watermark,
    } as any);
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success("Data room created!");
    setCreateOpen(false);
    setRoomName("");
    setRoomDesc("");
    fetchRooms();
  };

  const deleteRoom = async (id: string) => {
    const { error } = await supabase.from("data_rooms").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Room deleted");
    if (selectedRoom === id) setSelectedRoom(null);
    fetchRooms();
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !selectedRoom || !user) return;
    const { error } = await supabase.from("data_room_members").insert({
      room_id: selectedRoom,
      email: inviteEmail,
      name: inviteName,
      organization: inviteOrg,
      role: inviteRole,
      invited_by: user.id,
    } as any);
    if (error) return toast.error(error.message);
    // Log activity
    await supabase.from("data_room_activity").insert({
      room_id: selectedRoom,
      user_id: user.id,
      user_name: user.user_metadata?.full_name || user.email || "",
      action: `invited ${inviteEmail}`,
      action_type: "invite",
    } as any);
    toast.success("Invitation sent!");
    setInviteOpen(false);
    setInviteEmail("");
    setInviteName("");
    setInviteOrg("");
    fetchRoomDetail(selectedRoom);
  };

  const removeMember = async (memberId: string) => {
    if (!selectedRoom) return;
    const { error } = await supabase.from("data_room_members").delete().eq("id", memberId);
    if (error) return toast.error(error.message);
    toast.success("Member removed");
    fetchRoomDetail(selectedRoom);
  };

  const handleFileUpload = async (files: FileList) => {
    if (!selectedRoom || !user) return;
    const profile = user.user_metadata?.full_name || user.email || "";
    for (const file of Array.from(files)) {
      const path = `${selectedRoom}/${crypto.randomUUID()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("data-room-files").upload(path, file);
      if (uploadError) { toast.error(`Failed: ${file.name}`); continue; }
      const ext = file.name.split(".").pop()?.toUpperCase() || "";
      await supabase.from("data_room_files").insert({
        room_id: selectedRoom,
        file_name: file.name,
        file_path: path,
        file_type: ext,
        file_size: file.size,
        uploaded_by: user.id,
        uploaded_by_name: profile,
      } as any);
      await supabase.from("data_room_activity").insert({
        room_id: selectedRoom,
        user_id: user.id,
        user_name: profile,
        action: `uploaded ${file.name}`,
        action_type: "upload",
      } as any);
    }
    toast.success("File(s) uploaded!");
    fetchRoomDetail(selectedRoom);
  };

  const downloadFile = async (file: RoomFile) => {
    const { data, error } = await supabase.storage.from("data-room-files").download(file.file_path);
    if (error || !data) return toast.error("Download failed");
    saveAs(data, file.file_name);
    // Increment view count
    await supabase.from("data_room_files").update({ view_count: file.view_count + 1 } as any).eq("id", file.id);
  };

  const toggleSecurity = async (field: string, value: boolean) => {
    if (!selectedRoom) return;
    const { error } = await supabase.from("data_rooms").update({ [field]: value } as any).eq("id", selectedRoom);
    if (error) return toast.error(error.message);
    toast.success("Setting updated");
    fetchRooms();
  };

  const exportRoomZip = async () => {
    const room = rooms.find(r => r.id === selectedRoom);
    if (!room) return toast.error("Select a data room first");
    const zip = new JSZip();
    const folder = zip.folder(room.name.replace(/[^a-zA-Z0-9_\- ]/g, ""))!;
    const manifest = [
      `Data Room Export: ${room.name}`,
      `Description: ${room.description}`,
      `Access Level: ${room.access_level}`,
      `Status: ${room.status}`,
      `Exported: ${new Date().toISOString()}`,
      "", "=== FILES ===",
      ...roomFiles.map(f => `  ${f.file_name} (${formatSize(f.file_size)}) — uploaded by ${f.uploaded_by_name}`),
      "", "=== MEMBERS ===",
      ...roomMembers.map(m => `  ${m.name} <${m.email}> — ${m.organization} — ${m.role}`),
      "", "=== AUDIT TRAIL ===",
      ...roomActivity.map(a => `  [${new Date(a.created_at).toLocaleString()}] ${a.user_name}: ${a.action}`),
    ].join("\n");
    folder.file("MANIFEST.txt", manifest);
    folder.file("members.csv", ["Name,Email,Organization,Role", ...roomMembers.map(m => `"${m.name}","${m.email}","${m.organization}","${m.role}"`)].join("\n"));
    folder.file("file_index.csv", ["File Name,Type,Size,Uploaded By,Views", ...roomFiles.map(f => `"${f.file_name}","${f.file_type}","${formatSize(f.file_size)}","${f.uploaded_by_name}",${f.view_count}`)].join("\n"));
    folder.file("audit_trail.csv", ["Timestamp,User,Action,Type", ...roomActivity.map(a => `"${a.created_at}","${a.user_name}","${a.action}","${a.action_type}"`)].join("\n"));
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${room.name.replace(/\s+/g, "_")}_export.zip`);
    toast.success("Data room exported as ZIP");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const accessBadge = (level: string) => {
    const map: Record<string, { color: string; label: string }> = {
      restricted: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Restricted" },
      confidential: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", label: "Confidential" },
      "top-secret": { color: "bg-red-500/10 text-red-500 border-red-500/20", label: "Top Secret" },
    };
    const m = map[level] || map.restricted;
    return <Badge variant="outline" className={`text-[10px] ${m.color}`}>{m.label}</Badge>;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { active: "bg-green-500/10 text-green-500", archived: "bg-muted text-muted-foreground", pending: "bg-yellow-500/10 text-yellow-500" };
    return <Badge variant="outline" className={`text-[10px] capitalize ${map[status] || ""}`}>{status}</Badge>;
  };

  const fileIcon = (type: string) => {
    if (type === "PDF") return <FileText className="w-4 h-4 text-red-500" />;
    if (["CSV", "XLS", "XLSX"].includes(type)) return <Table2 className="w-4 h-4 text-green-500" />;
    if (["DOC", "DOCX"].includes(type)) return <File className="w-4 h-4 text-blue-500" />;
    if (["PNG", "JPG", "JPEG"].includes(type)) return <Image className="w-4 h-4 text-purple-500" />;
    return <File className="w-4 h-4 text-muted-foreground" />;
  };

  const roleBadge = (role: string) => {
    const map: Record<string, string> = { owner: "bg-primary/10 text-primary", editor: "bg-blue-500/10 text-blue-500", viewer: "bg-muted text-muted-foreground" };
    return <Badge variant="outline" className={`text-[9px] capitalize ${map[role] || ""}`}>{role}</Badge>;
  };

  const activityIcon = (type: string) => {
    if (type === "upload") return <Upload className="w-3.5 h-3.5 text-green-500" />;
    if (type === "view") return <Eye className="w-3.5 h-3.5 text-blue-500" />;
    if (type === "download") return <Download className="w-3.5 h-3.5 text-purple-500" />;
    if (type === "access") return <Lock className="w-3.5 h-3.5 text-yellow-500" />;
    if (type === "export") return <CheckCircle2 className="w-3.5 h-3.5 text-primary" />;
    return <Activity className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  const filteredFiles = roomFiles.filter((f) => f.file_name.toLowerCase().includes(fileSearch.toLowerCase()));
  const currentRoom = rooms.find(r => r.id === selectedRoom);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <FolderLock className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Secure Data Rooms</h1>
            <p className="text-xs text-muted-foreground">Multi-org virtual data rooms with granular permissions</p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedRoom && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={exportRoomZip}>
              <Download className="w-3.5 h-3.5" /> Export ZIP
            </Button>
          )}
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Create Data Room
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Rooms", value: rooms.filter(r => r.status === "active").length, icon: FolderLock, color: "text-primary" },
          { label: "Total Rooms", value: rooms.length, icon: Building2, color: "text-blue-500" },
          { label: "Total Members", value: roomMembers.length, icon: Users, color: "text-green-500" },
          { label: "Total Files", value: roomFiles.length, icon: FileText, color: "text-yellow-500" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <kpi.icon className={`w-5 h-5 ${kpi.color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Room List */}
      {rooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderLock className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No data rooms yet</p>
            <p className="text-xs text-muted-foreground/60 mb-4">Create your first secure data room to start collaborating</p>
            <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="w-3.5 h-3.5 mr-1" /> Create Data Room</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <motion.div key={room.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card
                className={`cursor-pointer transition-all ${selectedRoom === room.id ? "border-primary shadow-glow" : "hover:border-primary/20"}`}
                onClick={() => setSelectedRoom(room.id === selectedRoom ? null : room.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{room.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{room.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {accessBadge(room.access_level)}
                      {statusBadge(room.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground">Created {timeAgo(room.created_at)}</span>
                    <div className="flex-1" />
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={(e) => { e.stopPropagation(); setInviteOpen(true); setSelectedRoom(room.id); }}>
                        <UserPlus className="w-3 h-3" /> Invite
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}>
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Room Detail Tabs */}
      {selectedRoom && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Tabs defaultValue="files">
            <TabsList>
              <TabsTrigger value="files" className="gap-1 text-xs"><FileText className="w-3.5 h-3.5" /> Files ({roomFiles.length})</TabsTrigger>
              <TabsTrigger value="members" className="gap-1 text-xs"><Users className="w-3.5 h-3.5" /> Members ({roomMembers.length})</TabsTrigger>
              <TabsTrigger value="activity" className="gap-1 text-xs"><History className="w-3.5 h-3.5" /> Audit Trail</TabsTrigger>
              <TabsTrigger value="security" className="gap-1 text-xs"><Shield className="w-3.5 h-3.5" /> Security</TabsTrigger>
            </TabsList>

            <TabsContent value="files" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Room Files</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search files..." value={fileSearch} onChange={(e) => setFileSearch(e.target.value)} className="pl-8 h-8 text-xs w-48" />
                      </div>
                      <Button size="sm" className="gap-1 h-8 text-xs" onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.multiple = true;
                        input.onchange = (e) => { const files = (e.target as HTMLInputElement).files; if (files) handleFileUpload(files); };
                        input.click();
                      }}>
                        <Upload className="w-3 h-3" /> Upload
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredFiles.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-sm">No files yet. Upload files to get started.</div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            {fileIcon(file.file_type)}
                            <div>
                              <p className="text-xs font-medium text-foreground">{file.file_name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted-foreground">{formatSize(file.file_size)}</span>
                                <span className="text-[10px] text-muted-foreground">· by {file.uploaded_by_name}</span>
                                <span className="text-[10px] text-muted-foreground">· {timeAgo(file.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">{file.view_count} views</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => downloadFile(file)}>
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Room Members</CardTitle>
                    <Button size="sm" className="gap-1 h-8 text-xs" onClick={() => setInviteOpen(true)}>
                      <UserPlus className="w-3 h-3" /> Invite Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {roomMembers.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-sm">No members yet. Invite collaborators to get started.</div>
                  ) : (
                    <div className="divide-y divide-border">
                      {roomMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-[10px] bg-muted">
                                {member.name ? member.name.split(" ").map((n) => n[0]).join("") : member.email[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-medium text-foreground">{member.name || member.email}</p>
                                {roleBadge(member.role)}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted-foreground">{member.email}</span>
                                {member.organization && <span className="text-[10px] text-muted-foreground">· {member.organization}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">Active {timeAgo(member.last_active_at)}</span>
                            {member.role !== "owner" && (
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeMember(member.id)}>
                                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="w-4 h-4" /> Audit Trail
                  </CardTitle>
                  <CardDescription className="text-xs">Complete record of all room activity for compliance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {roomActivity.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground text-sm">No activity yet</div>
                  ) : roomActivity.map((a) => (
                    <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="mt-0.5">{activityIcon(a.action_type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">
                          <span className="font-medium">{a.user_name}</span>
                          <span className="text-muted-foreground"> {a.action}</span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {a.organization && <><Building2 className="w-3 h-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">{a.organization}</span></>}
                          <span className="text-[10px] text-muted-foreground">· {timeAgo(a.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-4">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Security Controls</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { field: "encryption_enabled", label: "End-to-end encryption", desc: "All files encrypted at rest and in transit" },
                      { field: "watermarking_enabled", label: "Watermarked downloads", desc: "Downloaded files include user-specific watermarks" },
                      { field: "access_expiration_enabled", label: "Access expiration", desc: "Automatically revoke access after set period" },
                      { field: "ip_restrictions_enabled", label: "IP-based restrictions", desc: "Restrict access to specific IP ranges" },
                      { field: "two_factor_required", label: "Two-factor authentication", desc: "Require 2FA for all room access" },
                      { field: "download_limits_enabled", label: "Download limits", desc: "Limit number of file downloads per user" },
                    ].map((f) => (
                      <div key={f.field} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                          <p className="text-xs font-medium text-foreground">{f.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{f.desc}</p>
                        </div>
                        <Switch
                          checked={!!(currentRoom as any)?.[f.field]}
                          onCheckedChange={(val) => toggleSecurity(f.field, val)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Secure Data Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Room Name</label>
              <Input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g., Phase III Clinical Data Exchange" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Textarea value={roomDesc} onChange={(e) => setRoomDesc(e.target.value)} placeholder="Purpose of this data room..." rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Access Level</label>
              <Select value={accessLevel} onValueChange={setAccessLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="confidential">Confidential</SelectItem>
                  <SelectItem value="top-secret">Top Secret</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Enable Watermarking</p>
                <p className="text-xs text-muted-foreground">All downloaded files will be watermarked</p>
              </div>
              <Switch checked={watermark} onCheckedChange={setWatermark} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={createRoom} disabled={creating || !roomName.trim()}>
              {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email Address</label>
              <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@organization.com" type="email" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Dr. Jane Smith" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Organization</label>
              <Input value={inviteOrg} onChange={(e) => setInviteOrg(e.target.value)} placeholder="Mayo Clinic" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Permission Level</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer — View & download only</SelectItem>
                  <SelectItem value="editor">Editor — Upload, edit, & manage files</SelectItem>
                  <SelectItem value="owner">Owner — Full administrative access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={inviteMember} disabled={!inviteEmail.trim()}>
              <UserPlus className="w-4 h-4 mr-2" /> Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataRoomsPage;
