import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Activity, Building, Calendar, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";

export default function AdminDashboard() {
  const staffMembers = [
    { id: "STF-001", name: "Dr. Sarah Jenkins", role: "Chief of Surgery", department: "Surgery", status: "Active" },
    { id: "STF-002", name: "Michael Chen", role: "Head Nurse", department: "ICU", status: "Active" },
    { id: "STF-003", name: "Dr. Robert Smith", role: "Cardiologist", department: "Cardiology", status: "On Leave" },
    { id: "STF-004", name: "Emily Davis", role: "Pharmacist", department: "Pharmacy", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      <SEOHead title="Admin Dashboard | HMS" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hospital Administration</h1>
          <p className="text-muted-foreground">Manage your hospital operations, staff, and departments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Settings className="mr-2 h-4 w-4" /> Settings</Button>
          <Button><Plus className="mr-2 h-4 w-4" /> Add Staff</Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Staff", value: "128", icon: Users, trend: "+4 this month" },
          { title: "Active Patients", value: "45", icon: Activity, trend: "-2 since yesterday" },
          { title: "Departments", value: "8", icon: Building, trend: "Fully operational" },
          { title: "Appointments Today", value: "32", icon: Calendar, trend: "+12% from avg" },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-7">
          <CardHeader>
            <CardTitle>Staff Directory</CardTitle>
            <CardDescription>Recent staff additions and status updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.id}</TableCell>
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell>
                      <Badge variant={staff.status === "Active" ? "default" : "secondary"}>
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
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