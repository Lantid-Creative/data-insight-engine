import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Clock, FileText } from "lucide-react";
import SEOHead from "@/components/SEOHead";

export default function DoctorPortal() {
  return (
    <div className="space-y-6">
      <SEOHead title="Doctor Portal | HMS" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doctor Portal</h1>
        <p className="text-muted-foreground">View your appointments and patient records.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "My Patients", value: "42", icon: Users },
          { title: "Appointments", value: "8", icon: Calendar },
          { title: "Pending Reports", value: "3", icon: FileText },
          { title: "Hours Logged", value: "32h", icon: Clock },
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