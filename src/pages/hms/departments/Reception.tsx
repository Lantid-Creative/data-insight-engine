import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, UserPlus, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { useHospitalContext } from "@/hooks/useHospitalContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RegisterPatientDialog } from "@/components/hms/reception/RegisterPatientDialog";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Reception() {
  const { data: ctx, isLoading: ctxLoading } = useHospitalContext();
  const hospitalId = ctx?.hospital_id;
  const queryClient = useQueryClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data: appointments = [], isLoading: apptLoading } = useQuery({
    queryKey: ["hms_appointments_today", hospitalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hms_appointments")
        .select("*, hms_patients(first_name, last_name), hms_staff(first_name, last_name)")
        .eq("hospital_id", hospitalId!)
        .gte("appointment_time", todayStart.toISOString())
        .lte("appointment_time", todayEnd.toISOString())
        .order("appointment_time");
      if (error) throw error;
      return data;
    },
    enabled: !!hospitalId,
  });

  const { data: patientCount = 0 } = useQuery({
    queryKey: ["hms_patients_count", hospitalId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("hms_patients")
        .select("*", { count: "exact", head: true })
        .eq("hospital_id", hospitalId!);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!hospitalId,
  });

  const waitingCount = appointments.filter(a => a.status === "Waiting" || a.status === "Checked In").length;

  const handleCheckIn = async (appointmentId: string) => {
    const { error } = await supabase
      .from("hms_appointments")
      .update({ status: "Checked In" })
      .eq("id", appointmentId);
    if (error) {
      toast.error("Check-in failed: " + error.message);
      return;
    }
    toast.success("Patient checked in!");
    queryClient.invalidateQueries({ queryKey: ["hms_appointments_today"] });
  };

  if (ctxLoading) return <div className="p-8">Loading reception context...</div>;

  return (
    <div className="space-y-6">
      <SEOHead title="Reception | HMS" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Front Desk & Reception</h1>
          <p className="text-muted-foreground">Manage patient registrations, check-ins, and appointments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Calendar className="mr-2 h-4 w-4" /> Book Appointment</Button>
          {hospitalId && <RegisterPatientDialog hospitalId={hospitalId} />}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Today's Appointments", value: String(appointments.length), icon: Calendar, desc: `${appointments.filter(a => a.status === "Completed").length} completed` },
          { title: "Registered Patients", value: String(patientCount), icon: UserPlus, desc: "Total in system" },
          { title: "Waiting Room", value: String(waitingCount), icon: Users, desc: "Current patients" },
          { title: "Active Calls", value: "0", icon: PhoneCall, desc: "In queue" },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arrivals & Check-ins</CardTitle>
          <CardDescription>Today's appointments and current waiting room status.</CardDescription>
        </CardHeader>
        <CardContent>
          {apptLoading ? (
            <div className="py-4 text-center text-muted-foreground">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">No appointments scheduled for today.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">
                      {format(new Date(appt.appointment_time), "hh:mm a")}
                    </TableCell>
                    <TableCell>
                      {(appt.hms_patients as any)?.first_name} {(appt.hms_patients as any)?.last_name}
                    </TableCell>
                    <TableCell>
                      Dr. {(appt.hms_staff as any)?.first_name} {(appt.hms_staff as any)?.last_name}
                    </TableCell>
                    <TableCell>{appt.type}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          appt.status === "Checked In" ? "default" : 
                          appt.status === "Waiting" ? "secondary" : "outline"
                        }
                      >
                        {appt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {appt.status === "Scheduled" ? (
                        <Button size="sm" onClick={() => handleCheckIn(appt.id)}>Check In</Button>
                      ) : (
                        <Button size="sm" variant="ghost">Edit</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
