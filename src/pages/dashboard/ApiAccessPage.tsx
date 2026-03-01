import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

const ApiAccessPage = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">API Access</h1>
        <p className="text-muted-foreground mt-1">Integrate DataForge AI into your applications.</p>
      </div>
      <Card className="shadow-soft">
        <CardHeader><CardTitle>API Key</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <code className="flex-1 p-3 rounded-lg bg-muted text-sm font-mono">df_sk_••••••••••••••••••••••••</code>
            <Button variant="outline" size="sm"><Copy className="w-4 h-4" /></Button>
          </div>
          <p className="text-xs text-muted-foreground">Keep your API key secret. Do not share it publicly.</p>
        </CardContent>
      </Card>
      <Card className="shadow-soft">
        <CardHeader><CardTitle>Endpoints</CardTitle></CardHeader>
        <CardContent className="space-y-2 font-mono text-sm">
          <p><span className="text-success font-bold">POST</span> /api/v1/upload</p>
          <p><span className="text-success font-bold">POST</span> /api/v1/analyze</p>
          <p><span className="text-primary font-bold">GET</span>  /api/v1/reports</p>
          <p><span className="text-destructive font-bold">DELETE</span> /api/v1/project/:id</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiAccessPage;
