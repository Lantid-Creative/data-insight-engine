import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hospital, Building2, Users, ShieldCheck, Activity } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { ThemeToggle } from "@/components/ThemeToggle";

const HMSLandingPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead 
        title="Hospital Management System | DataAfro"
        description="Comprehensive enterprise healthcare management system for modern hospitals."
      />
      
      {/* Navbar */}
      <nav className="border-b bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hospital className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">DataAfro HMS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/hms/login">
              <Button variant="ghost">Department Login</Button>
            </Link>
            <Link to="/hms/register">
              <Button>Register Hospital</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Enterprise Hospital<br />Management System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            A unified platform for managing all hospital departments, patient records, staff portals, and clinical data processing.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/hms/register">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                Onboard Your Hospital
              </Button>
            </Link>
            <Link to="/hms/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8">
                Staff & Department Portal
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-xl border">
                <Building2 className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Unified Departments</h3>
                <p className="text-muted-foreground">Pharmacy, Lab, OPD, IPD, Billing, and HR seamlessly connected.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border">
                <Users className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Staff Portals</h3>
                <p className="text-muted-foreground">Dedicated login portals for Doctors, Nurses, Receptionists, and Admins.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border">
                <Activity className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Data Processing</h3>
                <p className="text-muted-foreground">Direct integration with DataAfro's main intelligence suite for analytics.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HMSLandingPage;