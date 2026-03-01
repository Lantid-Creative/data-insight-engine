import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, MoreHorizontal } from "lucide-react";

const projects = [
  { name: "Q4 Financial Review", files: 3, reports: 5, status: "Complete", date: "Feb 28, 2026" },
  { name: "Market Research 2026", files: 7, reports: 3, status: "Processing", date: "Feb 27, 2026" },
  { name: "Customer Survey Analysis", files: 1, reports: 2, status: "Complete", date: "Feb 25, 2026" },
  { name: "Competitor Benchmarking", files: 4, reports: 4, status: "Complete", date: "Feb 20, 2026" },
];

const ProjectsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">My Projects</h1>
        <p className="text-muted-foreground mt-1">All your data analysis projects in one place.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {projects.map((p) => (
          <Card key={p.name} className="shadow-soft hover:shadow-card transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">{p.name}</CardTitle>
              </div>
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span>{p.files} files</span>
                <span>{p.reports} reports</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant={p.status === "Complete" ? "default" : "secondary"}>
                  {p.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{p.date}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
