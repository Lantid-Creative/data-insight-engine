import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, FileText, DollarSign, AlertCircle, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";

export default function Billing() {
  const invoices = [
    { id: "INV-2023-001", patient: "James Wilson", amount: "$450.00", date: "Oct 24, 2023", status: "Paid" },
    { id: "INV-2023-002", patient: "Maria Garcia", amount: "$1,250.00", date: "Oct 24, 2023", status: "Pending Insurance" },
    { id: "INV-2023-003", patient: "David Brown", amount: "$150.00", date: "Oct 23, 2023", status: "Unpaid" },
    { id: "INV-2023-004", patient: "Linda Martinez", amount: "$3,400.00", date: "Oct 20, 2023", status: "Overdue" },
  ];

  return (
    <div className="space-y-6">
      <SEOHead title="Billing | HMS" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Insurance</h1>
          <p className="text-muted-foreground">Manage invoices, payments, and insurance claims.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Receipt className="mr-2 h-4 w-4" /> Generate Report</Button>
          <Button><Plus className="mr-2 h-4 w-4" /> New Invoice</Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Pending Invoices", value: "45", icon: FileText, desc: "Action required" },
          { title: "Payments Today", value: "$4,250", icon: DollarSign, desc: "12 transactions" },
          { title: "Insurance Claims", value: "18", icon: CreditCard, desc: "Processing" },
          { title: "Overdue Accounts", value: "12", icon: AlertCircle, desc: "Requires follow-up" },
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
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest patient billing records and payment statuses.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.patient}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          invoice.status === "Paid" ? "default" : 
                          invoice.status === "Overdue" ? "destructive" : 
                          invoice.status === "Pending Insurance" ? "secondary" : "outline"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.status === "Unpaid" || invoice.status === "Overdue" ? (
                        <Button size="sm">Process Payment</Button>
                      ) : (
                        <Button size="sm" variant="ghost">View Details</Button>
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

// Ensure Plus is imported if used (added above)
import { Plus } from "lucide-react";