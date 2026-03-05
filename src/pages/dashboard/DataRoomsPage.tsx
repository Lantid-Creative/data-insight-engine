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
import {
  Lock, Plus, Users, FileText, Shield, Clock, Eye,
  Building2, Upload, Settings, MoreHorizontal, Activity,
  CheckCircle2, AlertTriangle, FolderLock, Globe, Trash2, UserPlus,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

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

const sampleRooms: DataRoom[] = [
  {
    id: "1", name: "CARDIO-TRIAL Phase III Data Exchange", description: "Multi-site clinical trial data sharing for cardiovascular study",
    status: "active", organizations: 4, members: 18, files: 142, created: "2024-01-05",
    accessLevel: "confidential", storageUsed: 2.4, storageTotal: 10,
  },
  {
    id: "2", name: "Pharma-Hospital Partnership (Oncology)", description: "De-identified patient data for oncology drug development",
    status: "active", organizations: 2, members: 8, files: 67, created: "2024-01-12",
    accessLevel: "top-secret", storageUsed: 1.1, storageTotal: 5,
  },
  {
    id: "3", name: "Public Health Surveillance — WHO Collaboration", description: "Disease surveillance data shared with WHO regional office",
    status: "pending", organizations: 3, members: 12, files: 34, created: "2024-01-18",
    accessLevel: "restricted", storageUsed: 0.6, storageTotal: 5,
  },
];

const recentActivity = [
  { user: "Dr. Sarah Chen", org: "Mayo Clinic", action: "uploaded 3 files", time: "2h ago" },
  { user: "James Wilson", org: "Pfizer", action: "viewed CSR document", time: "4h ago" },
  { user: "Dr. Amara Obi", org: "WHO Africa", action: "requested access", time: "6h ago" },
  { user: "Lisa Park", org: "Stanford Health", action: "approved data export", time: "1d ago" },
];

const DataRoomsPage = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomDesc, setRoomDesc] = useState("");
  const [accessLevel, setAccessLevel] = useState("confidential");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

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
    const map = {
      active: "bg-green-500/10 text-green-500",
      archived: "bg-muted text-muted-foreground",
      pending: "bg-yellow-500/10 text-yellow-500",
    };
    return <Badge variant="outline" className={`text-[10px] capitalize ${map[status]}`}>{status}</Badge>;
  };

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
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Data Rooms List */}
        <div className="lg:col-span-2 space-y-3">
          {sampleRooms.map((room) => (
            <motion.div key={room.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card
                className={`cursor-pointer transition-all ${
                  selectedRoom === room.id ? "border-primary shadow-glow" : "hover:border-primary/20"
                }`}
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
                      { label: "Organizations", value: room.organizations, icon: Building2 },
                      { label: "Members", value: room.members, icon: Users },
                      { label: "Files", value: room.files, icon: FileText },
                      { label: "Created", value: room.created, icon: Clock },
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
                      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1">
                        <UserPlus className="w-3 h-3" /> Invite
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Settings className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarFallback className="text-[10px] bg-muted">{a.user.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
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

          <div className="px-6 pb-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Security</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "End-to-end encryption", active: true },
                    { label: "Watermarked downloads", active: true },
                    { label: "Access expiration", active: true },
                    { label: "IP-based restrictions", active: false },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{f.label}</span>
                      {f.active ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </Card>
      </div>

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
    </div>
  );
};

export default DataRoomsPage;
