import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, FileText, DollarSign, AlertCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";

export default function Billing() {
  return (
    <div className="space-y-6">
      <SEOHead title="Billing | HMS" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Insurance</h1>
        <p className="text-muted-foreground">Manage invoices, payments, and insurance claims.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Pending Invoices", value: "45", icon: FileText },
          { title: "Payments Today", value: "$4,250", icon: DollarSign },
          { title: "Insurance Claims", value: "18", icon: CreditCard },
          { title: "Overdue Accounts", value: "12", icon: AlertCircle },
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