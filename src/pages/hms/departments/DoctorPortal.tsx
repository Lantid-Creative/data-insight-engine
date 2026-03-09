import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar as CalendarIcon, Clock, FileText, CheckCircle2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";

export default function DoctorPortal() {
  const appointments = [
    { time: "09:00 AM", patient: "James Wilson", type: "Follow-up", status: "Completed" },
    { time: "10:30 AM", patient: "Maria Garcia", type: "Consultation", status: "In Progress" },
    { time: "11:15 AM", patient: "David Brown", type: "Check-up", status: "Waiting" },
    { time: "02:00 PM", patient: "Linda Martinez", type: "Lab Results", status: "Scheduled" },
    { time: "03:30 PM", patient: "Robert Taylor", type: "Follow-up", status: "Scheduled" },
  ];

  return (
    <div className="space-y-6">
      <SEOHead title="Doctor Portal | HMS" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctor Portal</h1>
          <p className="text-muted-foreground">Welcome back, Dr. Jenkins. Here is your schedule for today.</p>
        </div>
        <Button><FileText className="mr-2 h-4 w-4" /> New Prescription</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "My Patients", value: "42", icon: Users, desc: "Assigned to you" },
          { title: "Appointments Today", value: "8", icon: CalendarIcon, desc: "3 remaining" },
          { title: "Pending Reports", value: "3", icon: FileText, desc: "Requires review" },
          { title: "Hours Logged", value: "32h", icon: Clock, desc: "This week" },
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

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-7">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your appointments for {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Appointment Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{apt.time}</TableCell>
                    <TableCell>{apt.patient}</TableCell>
                    <TableCell>{apt.type}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          apt.status === "Completed" ? "outline" : 
                          apt.status === "In Progress" ? "default" : "secondary"
                        }
                      >
                        {apt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {apt.status === "Scheduled" || apt.status === "Waiting" ? (
                        <Button size="sm"><PlayCircle className="mr-2 h-4 w-4"/> Start</Button>
                      ) : apt.status === "In Progress" ? (
                        <Button size="sm" variant="secondary"><CheckCircle2 className="mr-2 h-4 w-4"/> Finish</Button>
                      ) : (
                        <Button size="sm" variant="ghost">View Notes</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}