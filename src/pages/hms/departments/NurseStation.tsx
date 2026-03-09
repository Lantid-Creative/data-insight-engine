import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bed, Activity, ClipboardList, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";

export default function NurseStation() {
  const patients = [
    { bed: "W1-B01", name: "John Doe", condition: "Post-Op Recovery", nextCheck: "10:00 AM", status: "Stable" },
    { bed: "W1-B02", name: "Alice Smith", condition: "Pneumonia", nextCheck: "10:15 AM", status: "Critical" },
    { bed: "W1-B05", name: "Bob Johnson", condition: "Observation", nextCheck: "11:30 AM", status: "Stable" },
    { bed: "W2-B12", name: "Carol White", condition: "Cardiac Monitor", nextCheck: "09:45 AM", status: "Attention" },
  ];

  return (
    <div className="space-y-6">
      <SEOHead title="Nurse Station | HMS" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nurse Station</h1>
          <p className="text-muted-foreground">Manage ward beds, patient vitals, and shift tasks.</p>
        </div>
        <Button><Activity className="mr-2 h-4 w-4" /> Record Vitals</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Occupied Beds", value: "24/30", icon: Bed, desc: "6 available" },
          { title: "Vitals Pending", value: "12", icon: Activity, desc: "Due next hour" },
          { title: "Tasks Todo", value: "8", icon: ClipboardList, desc: "3 high priority" },
          { title: "Shift Ends In", value: "4h 30m", icon: Clock, desc: "14:00 PM" },
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
            <CardTitle>Ward Overview</CardTitle>
            <CardDescription>Current patients in your assigned ward</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bed</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Next Check</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{patient.bed}</TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.condition}</TableCell>
                    <TableCell>{patient.nextCheck}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          patient.status === "Critical" ? "destructive" : 
                          patient.status === "Attention" ? "default" : "secondary"
                        }
                      >
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">Update Chart</Button>
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