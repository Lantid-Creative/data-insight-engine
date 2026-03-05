import { useState } from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface DataRoom {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived" | "pending";
  organizations: number;
  members: number;
  files: number;
  created: string;
  accessLevel: "restricted" | "confidential" | "top-secret";
  storageUsed: number;
  storageTotal: number;
}

interface RoomFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  accessed: number;
}

interface RoomMember {
  id: string;
  name: string;
  email: string;
  org: string;
  role: "owner" | "editor" | "viewer";
  lastActive: string;
}

const sampleRooms: DataRoom[] = [
  { id: "1", name: "CARDIO-TRIAL Phase III Data Exchange", description: "Multi-site clinical trial data sharing for cardiovascular study", status: "active", organizations: 4, members: 18, files: 142, created: "2024-01-05", accessLevel: "confidential", storageUsed: 2.4, storageTotal: 10 },
  { id: "2", name: "Pharma-Hospital Partnership (Oncology)", description: "De-identified patient data for oncology drug development", status: "active", organizations: 2, members: 8, files: 67, created: "2024-01-12", accessLevel: "top-secret", storageUsed: 1.1, storageTotal: 5 },
  { id: "3", name: "Public Health Surveillance — WHO Collaboration", description: "Disease surveillance data shared with WHO regional office", status: "pending", organizations: 3, members: 12, files: 34, created: "2024-01-18", accessLevel: "restricted", storageUsed: 0.6, storageTotal: 5 },
];

const sampleFiles: RoomFile[] = [
  { id: "f1", name: "CSR_Phase3_Final.pdf", type: "PDF", size: "24.5 MB", uploadedBy: "Dr. Sarah Chen", uploadedAt: "2h ago", accessed: 12 },
  { id: "f2", name: "Patient_Demographics_DeID.csv", type: "CSV", size: "8.2 MB", uploadedBy: "James Wilson", uploadedAt: "6h ago", accessed: 8 },
  { id: "f3", name: "Lab_Results_Q4.xlsx", type: "Excel", size: "15.1 MB", uploadedBy: "Lisa Park", uploadedAt: "1d ago", accessed: 5 },
  { id: "f4", name: "MRI_Scans_Batch12.zip", type: "Archive", size: "245 MB", uploadedBy: "Dr. Amara Obi", uploadedAt: "2d ago", accessed: 3 },
  { id: "f5", name: "Protocol_Amendment_v3.docx", type: "Word", size: "2.1 MB", uploadedBy: "Dr. Sarah Chen", uploadedAt: "3d ago", accessed: 18 },
];

const sampleMembers: RoomMember[] = [
  { id: "m1", name: "Dr. Sarah Chen", email: "s.chen@mayo.edu", org: "Mayo Clinic", role: "owner", lastActive: "2m ago" },
  { id: "m2", name: "James Wilson", email: "j.wilson@pfizer.com", org: "Pfizer", role: "editor", lastActive: "1h ago" },
  { id: "m3", name: "Dr. Amara Obi", email: "a.obi@who.int", org: "WHO Africa", role: "viewer", lastActive: "3h ago" },
  { id: "m4", name: "Lisa Park", email: "l.park@stanford.edu", org: "Stanford Health", role: "editor", lastActive: "5h ago" },
  { id: "m5", name: "Robert Kim", email: "r.kim@fda.gov", org: "FDA", role: "viewer", lastActive: "1d ago" },
];

const recentActivity = [
  { user: "Dr. Sarah Chen", org: "Mayo Clinic", action: "uploaded 3 files", time: "2h ago", type: "upload" },
  { user: "James Wilson", org: "Pfizer", action: "viewed CSR document", time: "4h ago", type: "view" },
  { user: "Dr. Amara Obi", org: "WHO Africa", action: "requested access", time: "6h ago", type: "access" },
  { user: "Lisa Park", org: "Stanford Health", action: "approved data export", time: "1d ago", type: "export" },
  { user: "Robert Kim", org: "FDA", action: "downloaded Protocol Amendment", time: "1d ago", type: "download" },
  { user: "Dr. Sarah Chen", org: "Mayo Clinic", action: "invited 2 new members", time: "2d ago", type: "invite" },
];

const DataRoomsPage = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomDesc, setRoomDesc] = useState("");
  const [accessLevel, setAccessLevel] = useState("confidential");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [fileSearch, setFileSearch] = useState("");

  const accessBadge = (level: DataRoom["accessLevel"]) => {
    const map = {
      restricted: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Restricted" },
      confidential: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", label: "Confidential" },
      "top-secret": { color: "bg-red-500/10 text-red-500 border-red-500/20", label: "Top Secret" },
    };
    const m = map[level];
    return <Badge variant="outline" className={`text-[10px] ${m.color}`}>{m.label}</Badge>;
  };

  const statusBadge = (status: DataRoom["status"]) => {
    const map = { active: "bg-green-500/10 text-green-500", archived: "bg-muted text-muted-foreground", pending: "bg-yellow-500/10 text-yellow-500" };
    return <Badge variant="outline" className={`text-[10px] capitalize ${map[status]}`}>{status}</Badge>;
  };

  const fileIcon = (type: string) => {
    if (type === "PDF") return <FileText className="w-4 h-4 text-red-500" />;
    if (type === "CSV" || type === "Excel") return <Table2 className="w-4 h-4 text-green-500" />;
    if (type === "Word") return <File className="w-4 h-4 text-blue-500" />;
    if (type === "Image") return <Image className="w-4 h-4 text-purple-500" />;
    return <File className="w-4 h-4 text-muted-foreground" />;
  };

  const roleBadge = (role: string) => {
    const map = { owner: "bg-primary/10 text-primary", editor: "bg-blue-500/10 text-blue-500", viewer: "bg-muted text-muted-foreground" };
    return <Badge variant="outline" className={`text-[9px] capitalize ${map[role as keyof typeof map] || ""}`}>{role}</Badge>;
  };

  const activityIcon = (type: string) => {
    if (type === "upload") return <Upload className="w-3.5 h-3.5 text-green-500" />;
    if (type === "view") return <Eye className="w-3.5 h-3.5 text-blue-500" />;
    if (type === "download") return <Download className="w-3.5 h-3.5 text-purple-500" />;
    if (type === "access") return <Lock className="w-3.5 h-3.5 text-yellow-500" />;
    if (type === "export") return <CheckCircle2 className="w-3.5 h-3.5 text-primary" />;
    return <Activity className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  const filteredFiles = sampleFiles.filter((f) => f.name.toLowerCase().includes(fileSearch.toLowerCase()));

  return (
    <div className="space-y-6 p-4 sm:p-6">
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
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> Create Data Room
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Rooms", value: "2", icon: FolderLock, color: "text-primary" },
          { label: "Organizations", value: "9", icon: Building2, color: "text-blue-500" },
          { label: "Total Members", value: "38", icon: Users, color: "text-green-500" },
          { label: "Shared Files", value: "243", icon: FileText, color: "text-yellow-500" },
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
      <div className="space-y-3">
        {sampleRooms.map((room) => (
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
                    {accessBadge(room.accessLevel)}
                    {statusBadge(room.status)}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-3">
                  {[
                    { label: "Organizations", value: room.organizations },
                    { label: "Members", value: room.members },
                    { label: "Files", value: room.files },
                    { label: "Created", value: room.created },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">Storage</span>
                      <span className="text-[10px] text-muted-foreground">{room.storageUsed}GB / {room.storageTotal}GB</span>
                    </div>
                    <Progress value={(room.storageUsed / room.storageTotal) * 100} className="h-1.5" />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={(e) => { e.stopPropagation(); setInviteOpen(true); }}>
                      <UserPlus className="w-3 h-3" /> Invite
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                      <Settings className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Room Detail Tabs — shown when a room is selected */}
      {selectedRoom && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Tabs defaultValue="files">
            <TabsList>
              <TabsTrigger value="files" className="gap-1 text-xs"><FileText className="w-3.5 h-3.5" /> Files</TabsTrigger>
              <TabsTrigger value="members" className="gap-1 text-xs"><Users className="w-3.5 h-3.5" /> Members</TabsTrigger>
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
                      <Button size="sm" className="gap-1 h-8 text-xs" onClick={() => toast.success("Upload dialog would open")}>
                        <Upload className="w-3 h-3" /> Upload
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {filteredFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {fileIcon(file.type)}
                          <div>
                            <p className="text-xs font-medium text-foreground">{file.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted-foreground">{file.size}</span>
                              <span className="text-[10px] text-muted-foreground">· by {file.uploadedBy}</span>
                              <span className="text-[10px] text-muted-foreground">· {file.uploadedAt}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{file.accessed} views</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.success("File preview would open")}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.success("Download started")}>
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="divide-y divide-border">
                    {sampleMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-[10px] bg-muted">
                              {member.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-foreground">{member.name}</p>
                              {roleBadge(member.role)}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted-foreground">{member.email}</span>
                              <span className="text-[10px] text-muted-foreground">· {member.org}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">Active {member.lastActive}</span>
                          {member.role !== "owner" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.success("Member removed")}>
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
                  {recentActivity.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="mt-0.5">{activityIcon(a.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">
                          <span className="font-medium">{a.user}</span>
                          <span className="text-muted-foreground"> {a.action}</span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{a.org}</span>
                          <span className="text-[10px] text-muted-foreground">· {a.time}</span>
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
                      { label: "End-to-end encryption", desc: "All files encrypted at rest and in transit", active: true },
                      { label: "Watermarked downloads", desc: "Downloaded files include user-specific watermarks", active: true },
                      { label: "Access expiration", desc: "Automatically revoke access after set period", active: true },
                      { label: "IP-based restrictions", desc: "Restrict access to specific IP ranges", active: false },
                      { label: "Two-factor authentication", desc: "Require 2FA for all room access", active: true },
                      { label: "Download limits", desc: "Limit number of file downloads per user", active: false },
                    ].map((f) => (
                      <div key={f.label} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                          <p className="text-xs font-medium text-foreground">{f.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{f.desc}</p>
                        </div>
                        <Switch checked={f.active} onCheckedChange={() => toast.success(`${f.label} toggled`)} />
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
              <Switch defaultChecked />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => { setCreateOpen(false); toast.success("Data room created!"); }}>Create Room</Button>
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
            <Button onClick={() => { setInviteOpen(false); setInviteEmail(""); toast.success("Invitation sent!"); }}>
              <UserPlus className="w-4 h-4 mr-2" /> Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataRoomsPage;
