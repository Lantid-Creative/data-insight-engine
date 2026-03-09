import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bed, Activity, ClipboardList, Clock } from "lucide-react";
import SEOHead from "@/components/SEOHead";

export default function NurseStation() {
  return (
    <div className="space-y-6">
      <SEOHead title="Nurse Station | HMS" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nurse Station</h1>
        <p className="text-muted-foreground">Manage ward beds and patient vitals.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Occupied Beds", value: "24/30", icon: Bed },
          { title: "Vitals Pending", value: "12", icon: Activity },
          { title: "Tasks Todo", value: "8", icon: ClipboardList },
          { title: "Next Shift", value: "14:00", icon: Clock },
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