import {
  FolderOpen, FileText, Key, CreditCard, Settings,
  LayoutDashboard, Sparkles, ChevronUp, MessageSquare,
  Users, Shield, BookOpen,
  Stethoscope, Globe, Workflow, FolderLock, ShieldCheck, Bell,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Projects", url: "/dashboard/projects", icon: FolderOpen },
  { title: "Teams", url: "/dashboard/teams", icon: Users },
  { title: "Community", url: "/dashboard/community", icon: MessageSquare },
];

const intelligenceItems = [
  { title: "Clinical Co-Pilot", url: "/dashboard/copilot", icon: Stethoscope },
  { title: "PHI Redaction", url: "/dashboard/phi-redaction", icon: ShieldCheck },
  { title: "Epidemic Intel", url: "/dashboard/epidemic", icon: Globe },
  { title: "Pipeline Builder", url: "/dashboard/pipelines", icon: Workflow },
  { title: "Reg. Submissions", url: "/dashboard/submissions", icon: FileText },
  { title: "Data Rooms", url: "/dashboard/data-rooms", icon: FolderLock },
];

export function AppSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path + "/"));

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  const renderItems = (items: typeof mainItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive(item.url)}>
            <NavLink
              to={item.url}
              end={item.url === "/dashboard"}
              className="hover:bg-sidebar-accent/50 transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
              onClick={handleNavClick}
            >
              <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Brand */}
        <div className="p-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-base font-extrabold text-sidebar-accent-foreground tracking-tight">
              DataAfro
            </span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(mainItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Intelligence Suite</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(intelligenceItems)}</SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* User footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 cursor-pointer">
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm truncate font-medium text-sidebar-accent-foreground">{displayName}</p>
                        <p className="text-[10px] truncate text-sidebar-foreground/50">{user?.email}</p>
                      </div>
                      <ChevronUp className="w-4 h-4 text-sidebar-foreground/50 flex-shrink-0" />
                    </div>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/dashboard/notifications")}>
                  <Bell className="mr-2 h-4 w-4" /> Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/api")}>
                  <Key className="mr-2 h-4 w-4" /> API Access
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/billing")}>
                  <CreditCard className="mr-2 h-4 w-4" /> Billing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/security")}>
                  <Shield className="mr-2 h-4 w-4" /> Security
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
