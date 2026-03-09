import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pill, AlertTriangle, FileText, ShoppingCart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { useHospitalContext } from "@/hooks/useHospitalContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function getStatus(stock: number, threshold: number): string {
  if (stock <= threshold * 0.25) return "Critical";
  if (stock < threshold) return "Low Stock";
  return "Good";
}

export default function Pharmacy() {
  const { data: ctx, isLoading: ctxLoading } = useHospitalContext();
  const hospitalId = ctx?.hospital_id;

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["hms_inventory", hospitalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hms_inventory")
        .select("*")
        .eq("hospital_id", hospitalId!)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!hospitalId,
  });

  const criticalCount = inventory.filter(i => getStatus(i.stock, i.threshold) === "Critical").length;
  const lowStockCount = inventory.filter(i => getStatus(i.stock, i.threshold) === "Low Stock").length;

  if (ctxLoading) return <div className="p-8">Loading pharmacy context...</div>;

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
          { title: "Pending Prescriptions", value: "0", icon: FileText, desc: "Needs fulfillment" },
          { title: "Low Stock Items", value: String(lowStockCount + criticalCount), icon: AlertTriangle, desc: `${criticalCount} critical` },
          { title: "Total Inventory Items", value: String(inventory.length), icon: Pill, desc: "In database" },
          { title: "Orders Placed", value: "0", icon: ShoppingCart, desc: "Awaiting delivery" },
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

      <Card>
        <CardHeader>
          <CardTitle>Inventory Status</CardTitle>
          <CardDescription>Current medication stock levels and alerts.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-4 text-center text-muted-foreground">Loading inventory...</div>
          ) : inventory.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">No inventory items found. Add medications to get started.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Medication Name</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => {
                  const status = getStatus(item.stock, item.threshold);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.item_code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.stock}</TableCell>
                      <TableCell>{item.threshold}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            status === "Critical" ? "destructive" : 
                            status === "Low Stock" ? "secondary" : "default"
                          }
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost">Reorder</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
