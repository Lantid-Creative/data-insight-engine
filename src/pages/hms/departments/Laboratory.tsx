import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TestTube, FileText, AlertCircle, CheckCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";

export default function Laboratory() {
  const labTests = [
    { id: "LAB-1023", patient: "John Doe", test: "Complete Blood Count", priority: "Routine", status: "Pending" },
    { id: "LAB-1024", patient: "Alice Smith", test: "Lipid Panel", priority: "Urgent", status: "Processing" },
    { id: "LAB-1025", patient: "Bob Johnson", test: "Urinalysis", priority: "Routine", status: "Completed" },
    { id: "LAB-1026", patient: "Carol White", test: "Metabolic Panel", priority: "STAT", status: "Pending" },
  ];

  return (
    <div className="space-y-6">
      <SEOHead title="Laboratory | HMS" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laboratory</h1>
          <p className="text-muted-foreground">Manage test requests, samples, and results entry.</p>
        </div>
        <Button><Upload className="mr-2 h-4 w-4" /> Upload Results</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Pending Tests", value: "28", icon: FileText, desc: "Awaiting processing" },
          { title: "Samples to Collect", value: "12", icon: TestTube, desc: "Collection required" },
          { title: "Critical Results", value: "3", icon: AlertCircle, desc: "Needs immediate review" },
          { title: "Completed Today", value: "45", icon: CheckCircle, desc: "Results dispatched" },
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
            <CardTitle>Test Queue</CardTitle>
            <CardDescription>Recent and pending laboratory test requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test ID</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.id}</TableCell>
                    <TableCell>{test.patient}</TableCell>
                    <TableCell>{test.test}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          test.priority === "STAT" ? "destructive" : 
                          test.priority === "Urgent" ? "secondary" : "outline"
                        }
                      >
                        {test.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          test.status === "Completed" ? "default" : 
                          test.status === "Processing" ? "secondary" : "outline"
                        }
                      >
                        {test.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {test.status === "Completed" ? (
                        <Button size="sm" variant="ghost">View Results</Button>
                      ) : (
                        <Button size="sm">Enter Results</Button>
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