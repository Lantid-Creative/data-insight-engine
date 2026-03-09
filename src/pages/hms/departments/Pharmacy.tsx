import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pill, AlertTriangle, FileText, ShoppingCart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";

export default function Pharmacy() {
  const inventory = [
    { id: "MED-001", name: "Amoxicillin 500mg", stock: 1250, threshold: 500, status: "Good" },
    { id: "MED-002", name: "Lisinopril 250mg", stock: 320, threshold: 400, status: "Low Stock" },
    { id: "MED-003", name: "Ibuprofen 10mg", stock: 85, threshold: 200, status: "Critical" },
    { id: "MED-004", name: "Metformin 400mg", stock: 2100, threshold: 1000, status: "Good" },
    { id: "MED-005", name: "Omeprazole 500mg", stock: 450, threshold: 500, status: "Low Stock" },
  ];

  return (
    <div className="space-y-6">
      <SEOHead title="Pharmacy | HMS" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pharmacy</h1>
          <p className="text-muted-foreground">Manage prescriptions, inventory, and dispensing.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><ShoppingCart className="mr-2 h-4 w-4" /> Order Stock</Button>
          <Button><Plus className="mr-2 h-4 w-4" /> Dispense</Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Pending Prescriptions", value: "15", icon: FileText, desc: "Needs fulfillment" },
          { title: "Low Stock Items", value: "8", icon: AlertTriangle, desc: "Below threshold" },
          { title: "Total Inventory Items", value: "1,240", icon: Pill, desc: "In database" },
          { title: "Orders Placed", value: "5", icon: ShoppingCart, desc: "Awaiting delivery" },
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
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Current medication stock levels and alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Medication Name</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>{item.threshold}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          item.status === "Critical" ? "destructive" : 
                          item.status === "Low Stock" ? "secondary" : "default"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">Reorder</Button>
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