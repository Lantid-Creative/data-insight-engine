import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, AlertTriangle, FileText, ShoppingCart } from "lucide-react";
import SEOHead from "@/components/SEOHead";

export default function Pharmacy() {
  return (
    <div className="space-y-6">
      <SEOHead title="Pharmacy | HMS" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pharmacy</h1>
        <p className="text-muted-foreground">Manage prescriptions and inventory.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Pending Prescriptions", value: "15", icon: FileText },
          { title: "Low Stock Items", value: "8", icon: AlertTriangle },
          { title: "Total Inventory", value: "1,240", icon: Pill },
          { title: "Orders Placed", value: "5", icon: ShoppingCart },
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