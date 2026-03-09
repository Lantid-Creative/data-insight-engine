import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Building, Calendar } from "lucide-react";
import SEOHead from "@/components/SEOHead";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <SEOHead title="Admin Dashboard | HMS" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hospital Administration</h1>
        <p className="text-muted-foreground">Manage your hospital operations and staff.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Staff", value: "128", icon: Users },
          { title: "Active Patients", value: "45", icon: Activity },
          { title: "Departments", value: "8", icon: Building },
          { title: "Appointments Today", value: "32", icon: Calendar },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}