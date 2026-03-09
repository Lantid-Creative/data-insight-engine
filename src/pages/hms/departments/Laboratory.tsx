import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestTube, FileText, AlertCircle, CheckCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";

export default function Laboratory() {
  return (
    <div className="space-y-6">
      <SEOHead title="Laboratory | HMS" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laboratory</h1>
        <p className="text-muted-foreground">Manage test requests and results.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Pending Tests", value: "28", icon: FileText },
          { title: "Samples to Collect", value: "12", icon: TestTube },
          { title: "Critical Results", value: "3", icon: AlertCircle },
          { title: "Completed Today", value: "45", icon: CheckCircle },
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