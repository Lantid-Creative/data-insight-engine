import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Outlet, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/projects": "Projects",
  "/dashboard/upload": "Upload",
  "/dashboard/reports": "Reports",
  "/dashboard/api": "API Access",
  "/dashboard/billing": "Billing",
  "/dashboard/settings": "Settings",
};

const DashboardLayout = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const isProjectDetail = /^\/dashboard\/projects\/[^/]+$/.test(location.pathname);
  const pageTitle = breadcrumbMap[location.pathname] || (isProjectDetail ? "Project" : pathSegments[pathSegments.length - 1] || "Dashboard");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 flex-shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="h-5 w-px bg-border hidden sm:block" />
              <span className="text-sm font-medium text-foreground hidden sm:block">{pageTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>
          <main className={`flex-1 overflow-auto ${isProjectDetail ? "" : "p-4 sm:p-6"}`}>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
