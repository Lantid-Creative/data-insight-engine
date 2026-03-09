import { Outlet, Link, useLocation } from "react-router-dom";
import { Hospital, LayoutDashboard, Stethoscope, UserRound, Pill, TestTube, Users, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const HMSLayout = () => {
  const location = useLocation();
  
  const navigation = [
    { name: "Admin Dashboard", href: "/hms/admin", icon: LayoutDashboard },
    { name: "Doctor Portal", href: "/hms/doctor", icon: Stethoscope },
    { name: "Nurse Station", href: "/hms/nurse", icon: UserRound },
    { name: "Pharmacy", href: "/hms/pharmacy", icon: Pill },
    { name: "Laboratory", href: "/hms/lab", icon: TestTube },
    { name: "Reception", href: "/hms/reception", icon: Users },
    { name: "Billing", href: "/hms/billing", icon: CreditCard },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-card border-r">
        <div className="p-6 flex items-center gap-2 border-b">
          <Hospital className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">DataAfro HMS</span>
        </div>
        
        <div className="flex-1 py-6 flex flex-col gap-1 px-4 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-start gap-2" asChild>
            <Link to="/hms">
              <LogOut className="h-4 w-4" />
              Exit Portal
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b bg-card flex items-center px-6 md:hidden">
          <div className="flex items-center gap-2">
            <Hospital className="h-5 w-5 text-primary" />
            <span className="font-bold">DataAfro HMS</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HMSLayout;
