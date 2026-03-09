import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, UserPlus, PhoneCall } from "lucide-react";
import SEOHead from "@/components/SEOHead";

export default function Reception() {
  return (
    <div className="space-y-6">
      <SEOHead title="Reception | HMS" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Front Desk & Reception</h1>
        <p className="text-muted-foreground">Manage patient registrations and appointments.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Today's Appointments", value: "64", icon: Calendar },
          { title: "New Registrations", value: "12", icon: UserPlus },
          { title: "Waiting Room", value: "8", icon: Users },
          { title: "Active Calls", value: "2", icon: PhoneCall },
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