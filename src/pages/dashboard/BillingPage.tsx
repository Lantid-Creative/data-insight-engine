import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const BillingPage = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and usage.</p>
      </div>
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            <Badge>Free</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Analyses used</span>
            <span className="font-medium">1 / 3</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">File outputs</span>
            <span className="font-medium">2 / 2</span>
          </div>
          <Button className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 mt-4">Upgrade to Pro</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingPage;
