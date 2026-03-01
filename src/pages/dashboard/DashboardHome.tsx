import { BarChart3, Upload, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  { label: "Total Analyses", value: "12", icon: BarChart3, change: "+3 this month" },
  { label: "Files Uploaded", value: "28", icon: Upload, change: "+7 this week" },
  { label: "Reports Generated", value: "45", icon: FileText, change: "5 pending" },
  { label: "Insights Found", value: "156", icon: TrendingUp, change: "+24 today" },
];

const DashboardHome = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your data overview.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{s.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild className="bg-gradient-primary text-primary-foreground hover:opacity-90">
            <Link to="/dashboard/upload">
              <Upload className="w-4 h-4 mr-2" /> Upload New Data
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard/reports">View Reports</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
