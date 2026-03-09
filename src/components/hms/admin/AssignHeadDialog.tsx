import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";

type Department = Database["public"]["Tables"]["hms_departments"]["Row"];
type Staff = Database["public"]["Tables"]["hms_staff"]["Row"];

interface AssignHeadDialogProps {
  hospitalId: string;
  departments: Department[];
  staff: Staff[];
}

export function AssignHeadDialog({ hospitalId, departments, staff }: AssignHeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState("");
  const [staffId, setStaffId] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("hms_departments")
        .update({ head_staff_id: staffId })
        .eq("id", departmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hms_departments", hospitalId] });
      toast({ title: "Department head assigned successfully" });
      setOpen(false);
      setDepartmentId("");
      setStaffId("");
    },
    onError: (error) => {
      toast({ 
        title: "Error assigning head", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !staffId) {
      toast({ title: "Please select both department and staff member", variant: "destructive" });
      return;
    }
    assignMutation.mutate();
  };

  // Filter staff to show only doctors/nurses for head positions typically, or just anyone
  const eligibleStaff = staff.filter(s => s.is_active);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Assign Unit Head</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Department Head</DialogTitle>
            <DialogDescription>
              Select a department and assign a staff member as the unit head. Unit heads can manage staff schedules.
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
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} {dept.head_staff_id ? "(Has Head)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="staff">Staff Member</Label>
              <Select value={staffId} onValueChange={setStaffId} disabled={!departmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleStaff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.role.replace('_', ' ')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={assignMutation.isPending}>
              {assignMutation.isPending ? "Assigning..." : "Assign Head"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
