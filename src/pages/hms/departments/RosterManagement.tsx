import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import SEOHead from "@/components/SEOHead";
import { CalendarClock, Plus } from "lucide-react";

export default function RosterManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  // New shift form state
  const [staffId, setStaffId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");

  const { data: userContext } = useQuery({
    queryKey: ["hms_user_context", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("hms_staff")
        .select("hospital_id, department_id, role")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  const hospitalId = userContext?.hospital_id;

  const { data: departments = [] } = useQuery({
    queryKey: ["hms_departments", hospitalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hms_departments")
        .select("*")
        .eq("hospital_id", hospitalId);
      if (error) throw error;
      return data;
    },
    enabled: !!hospitalId,
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["hms_staff", hospitalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hms_staff")
        .select("*")
        .eq("hospital_id", hospitalId)
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
    enabled: !!hospitalId,
  });

  const { data: shifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ["hms_shifts", hospitalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hms_shifts")
        .select(`
          *,
          hms_staff (first_name, last_name, role),
          hms_departments (name)
        `)
        .eq("hospital_id", hospitalId)
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!hospitalId,
  });

  const addShiftMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("hms_shifts")
        .insert({
          hospital_id: hospitalId,
          department_id: departmentId,
          staff_id: staffId,
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
          notes: notes || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hms_shifts", hospitalId] });
      toast({ title: "Shift scheduled successfully" });
      setOpen(false);
      // Reset form
      setStaffId("");
      setDepartmentId("");
      setStartTime("");
      setEndTime("");
      setNotes("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Error scheduling shift", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId || !departmentId || !startTime || !endTime) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    
    if (new Date(startTime) >= new Date(endTime)) {
      toast({ title: "End time must be after start time", variant: "destructive" });
      return;
    }

    addShiftMutation.mutate();
  };

  if (!hospitalId) return <div className="p-8 text-center text-muted-foreground">Please configure your hospital profile first.</div>;

  return (
    <div className="space-y-6">
      <SEOHead title="Roster & Shifts | HMS" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roster Management</h1>
          <p className="text-muted-foreground">Manage staff schedules and assignments.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Schedule Shift</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Schedule New Shift</DialogTitle>
                <DialogDescription>
                  Assign a staff member to a department shift.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={departmentId} onValueChange={setDepartmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="staff">Staff Member</Label>
                  <Select value={staffId} onValueChange={setStaffId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.first_name} {s.last_name} ({s.role.replace('_', ' ')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input 
                      id="startTime" 
                      type="datetime-local" 
                      value={startTime} 
                      onChange={(e) => setStartTime(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input 
                      id="endTime" 
                      type="datetime-local" 
                      value={endTime} 
                      onChange={(e) => setEndTime(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input 
                    id="notes" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="E.g., On-call duty, ICU ward..." 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={addShiftMutation.isPending}>
                  {addShiftMutation.isPending ? "Scheduling..." : "Schedule Shift"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Upcoming Shifts
          </CardTitle>
          <CardDescription>Scheduled shifts across all departments.</CardDescription>
        </CardHeader>
        <CardContent>
          {shiftsLoading ? (
            <div className="py-8 text-center">Loading shifts...</div>
          ) : shifts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground border border-dashed rounded-lg">
              No shifts scheduled yet. Click 'Schedule Shift' to add one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map((shift) => {
                  const start = new Date(shift.start_time);
                  const end = new Date(shift.end_time);
                  return (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">{format(start, "MMM d, yyyy")}</TableCell>
                      <TableCell>{format(start, "h:mm a")} - {format(end, "h:mm a")}</TableCell>
                      <TableCell>{shift.hms_staff?.first_name} {shift.hms_staff?.last_name}</TableCell>
                      <TableCell className="capitalize">{shift.hms_staff?.role.replace('_', ' ')}</TableCell>
                      <TableCell>{shift.hms_departments?.name}</TableCell>
                      <TableCell className="text-muted-foreground">{shift.notes || '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
