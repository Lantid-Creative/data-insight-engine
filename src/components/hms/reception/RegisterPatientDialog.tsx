import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface RegisterPatientDialogProps {
  hospitalId: string;
}

export function RegisterPatientDialog({ hospitalId }: RegisterPatientDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    patient_id_number: "",
    contact_number: "",
    gender: "",
    blood_group: "",
    date_of_birth: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.patient_id_number) {
      toast.error("First name, last name, and patient ID are required.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("hms_patients").insert({
      first_name: form.first_name,
      last_name: form.last_name,
      patient_id_number: form.patient_id_number,
      hospital_id: hospitalId,
      contact_number: form.contact_number || null,
      gender: form.gender || null,
      blood_group: form.blood_group || null,
      date_of_birth: form.date_of_birth || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to register patient: " + error.message);
      return;
    }
    toast.success("Patient registered successfully!");
    queryClient.invalidateQueries({ queryKey: ["hms_patients"] });
    setOpen(false);
    setForm({ first_name: "", last_name: "", patient_id_number: "", contact_number: "", gender: "", blood_group: "", date_of_birth: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><UserPlus className="mr-2 h-4 w-4" /> Register Patient</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>First Name *</Label>
              <Input value={form.first_name} onChange={(e) => setForm(f => ({ ...f, first_name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Last Name *</Label>
              <Input value={form.last_name} onChange={(e) => setForm(f => ({ ...f, last_name: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Patient ID Number *</Label>
            <Input value={form.patient_id_number} onChange={(e) => setForm(f => ({ ...f, patient_id_number: e.target.value }))} placeholder="e.g. PAT-001" />
          </div>
          <div className="space-y-1">
            <Label>Contact Number</Label>
            <Input value={form.contact_number} onChange={(e) => setForm(f => ({ ...f, contact_number: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm(f => ({ ...f, gender: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Blood Group</Label>
              <Select value={form.blood_group} onValueChange={(v) => setForm(f => ({ ...f, blood_group: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Date of Birth</Label>
            <Input type="date" value={form.date_of_birth} onChange={(e) => setForm(f => ({ ...f, date_of_birth: e.target.value }))} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registering..." : "Register Patient"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
