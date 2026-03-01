import StaticPageLayout from "@/components/landing/StaticPageLayout";

const ApiDocsPage = () => (
  <StaticPageLayout title="API Documentation" subtitle="Integrate DataAfro's intelligence into your own products.">
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-card p-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Getting Started</h2>
        <p className="text-muted-foreground mb-4">
          Our RESTful API allows you to upload files, trigger processing, and retrieve structured data programmatically. All endpoints require an API key which you can generate from your dashboard.
        </p>
        <div className="rounded-lg bg-muted p-4 font-mono text-sm text-foreground">
          <p className="text-muted-foreground mb-1"># Upload a file</p>
          <p>curl -X POST https://api.dataafro.com/v1/upload \</p>
          <p className="pl-4">-H "Authorization: Bearer YOUR_API_KEY" \</p>
          <p className="pl-4">-F "file=@document.pdf"</p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Endpoints</h2>
        <div className="space-y-4">
          {[
            { method: "POST", path: "/v1/upload", desc: "Upload a file for processing" },
            { method: "GET", path: "/v1/jobs/:id", desc: "Check processing status" },
            { method: "GET", path: "/v1/results/:id", desc: "Retrieve extracted data" },
            { method: "DELETE", path: "/v1/files/:id", desc: "Delete a processed file" },
          ].map((ep) => (
            <div key={ep.path} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{ep.method}</span>
              <span className="font-mono text-sm text-foreground">{ep.path}</span>
              <span className="text-sm text-muted-foreground ml-auto">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Rate Limits</h2>
        <p className="text-muted-foreground">
          Free tier: 100 requests/day. Pro tier: 10,000 requests/day. Enterprise: unlimited. Contact us for custom limits.
        </p>
      </div>
    </div>
  </StaticPageLayout>
);

export default ApiDocsPage;
