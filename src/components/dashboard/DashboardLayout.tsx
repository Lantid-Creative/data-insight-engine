import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Outlet, useLocation, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { GlobalSearch } from "@/components/dashboard/GlobalSearch";
import { ChevronRight, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/projects": "Projects",
  "/dashboard/upload": "Upload",
  "/dashboard/reports": "Reports",
  "/dashboard/api": "API Access",
  "/dashboard/billing": "Billing",
  "/dashboard/settings": "Settings",
  "/dashboard/teams": "Teams",
  "/dashboard/notifications": "Notifications",
  "/dashboard/security": "Security",
  "/dashboard/copilot": "Clinical Co-Pilot",
  "/dashboard/phi-redaction": "PHI Redaction",
  "/dashboard/epidemic": "Epidemic Intelligence",
  "/dashboard/pipelines": "Pipeline Builder",
  "/dashboard/submissions": "Regulatory Submissions",
  "/dashboard/data-rooms": "Secure Data Rooms",
};

const parentMap: Record<string, string> = {
  "/dashboard/copilot": "Intelligence Suite",
  "/dashboard/phi-redaction": "Intelligence Suite",
  "/dashboard/epidemic": "Intelligence Suite",
  "/dashboard/pipelines": "Intelligence Suite",
  "/dashboard/submissions": "Intelligence Suite",
  "/dashboard/data-rooms": "Intelligence Suite",
  "/dashboard/api": "Account",
  "/dashboard/billing": "Account",
  "/dashboard/settings": "Account",
  "/dashboard/security": "Account",
  "/dashboard/notifications": "Account",
};

const DashboardLayout = () => {
  const location = useLocation();
  const isProjectDetail = /^\/dashboard\/projects\/[^/]+$/.test(location.pathname);
  const pageTitle = breadcrumbMap[location.pathname] || (isProjectDetail ? "Project" : "Dashboard");
  const parentLabel = parentMap[location.pathname];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 flex-shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-2 min-w-0">
              <SidebarTrigger className="flex-shrink-0" />
              <div className="h-5 w-px bg-border hidden sm:block flex-shrink-0" />
              
              {/* Breadcrumb */}
              <nav className="hidden sm:flex items-center gap-1 text-sm min-w-0">
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                  <Home className="w-3.5 h-3.5" />
                </Link>
                {parentLabel && (
                  <>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                    <span className="text-muted-foreground text-xs flex-shrink-0">{parentLabel}</span>
                  </>
                )}
                {location.pathname !== "/dashboard" && (
                  <>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                    <span className="font-medium text-foreground truncate">{pageTitle}</span>
                  </>
                )}
              </nav>

              {/* Mobile title */}
              <span className="sm:hidden text-sm font-medium text-foreground truncate">{pageTitle}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <GlobalSearch />
              <NotificationBell />
              <ThemeToggle />
            </div>
          </header>
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`flex-1 overflow-auto ${isProjectDetail ? "" : "p-4 sm:p-6"}`}
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
