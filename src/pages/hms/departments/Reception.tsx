import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, UserPlus, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";

export default function Reception() {
  const arrivals = [
    { time: "09:00 AM", patient: "James Wilson", doctor: "Dr. Smith", type: "Follow-up", status: "Checked In" },
    { time: "09:15 AM", patient: "Emma Thomas", doctor: "Dr. Jenkins", type: "Consultation", status: "Waiting" },
    { time: "09:30 AM", patient: "Michael Brown", doctor: "Dr. Davis", type: "Check-up", status: "Expected" },
    { time: "10:00 AM", patient: "Sarah Miller", doctor: "Dr. Smith", type: "New Patient", status: "Expected" },
  ];

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
          <Button><UserPlus className="mr-2 h-4 w-4" /> Register Patient</Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Today's Appointments", value: "64", icon: Calendar, desc: "12 completed" },
          { title: "New Registrations", value: "12", icon: UserPlus, desc: "This week" },
          { title: "Waiting Room", value: "8", icon: Users, desc: "Current patients" },
          { title: "Active Calls", value: "2", icon: PhoneCall, desc: "In queue" },
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
            <CardTitle>Arrivals & Check-ins</CardTitle>
            <CardDescription>Upcoming appointments and current waiting room status.</CardDescription>
          </CardHeader>
          <CardContent>
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
                {arrivals.map((arrival, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{arrival.time}</TableCell>
                    <TableCell>{arrival.patient}</TableCell>
                    <TableCell>{arrival.doctor}</TableCell>
                    <TableCell>{arrival.type}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          arrival.status === "Checked In" ? "default" : 
                          arrival.status === "Waiting" ? "secondary" : "outline"
                        }
                      >
                        {arrival.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {arrival.status === "Expected" ? (
                        <Button size="sm">Check In</Button>
                      ) : (
                        <Button size="sm" variant="ghost">Edit</Button>
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