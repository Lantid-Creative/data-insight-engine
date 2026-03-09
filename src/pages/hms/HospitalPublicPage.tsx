import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hospital, MapPin, Phone, Mail, Users, Building2, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HospitalPublicPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: hospital, isLoading, error } = useQuery({
    queryKey: ["public_hospital", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hms_hospitals")
        .select("*")
        .eq("slug", slug)
        .eq("is_public", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["public_hospital_departments", hospital?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hms_departments")
        .select("id, name, description")
        .eq("hospital_id", hospital!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!hospital?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-lg px-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
        <Hospital className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-3xl font-bold text-foreground">Hospital Not Found</h1>
        <p className="text-muted-foreground text-center max-w-md">
          This hospital page doesn't exist or isn't publicly available yet.
        </p>
        <Link to="/hms">
          <Button>Back to DataAfro HMS</Button>
        </Link>
      </div>
    );
  }

  const primaryColor = hospital.primary_color || "#2563eb";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${hospital.name} | DataAfro HMS`}
        description={hospital.tagline || `${hospital.name} - Powered by DataAfro HMS`}
      />

      {/* Navbar */}
      <nav className="border-b bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hospital.logo_url ? (
              <img src={hospital.logo_url} alt={hospital.name} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor + "20" }}>
                <Hospital className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
            )}
            <span className="text-xl font-bold tracking-tight">{hospital.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/hms/login">
              <Button variant="outline" size="sm">Staff Login</Button>
            </Link>
            <Link to="/hms">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                Powered by DataAfro
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 30% 50%, ${primaryColor}, transparent 70%)` }} />
        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {hospital.logo_url && (
              <img src={hospital.logo_url} alt={hospital.name} className="h-20 w-20 rounded-2xl object-cover mx-auto mb-6 shadow-lg" />
            )}
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              {hospital.name}
            </h1>
            {hospital.tagline && (
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4">
                {hospital.tagline}
              </p>
            )}
            {hospital.registration_number && (
              <Badge variant="secondary" className="text-sm mb-8">
                Reg. No: {hospital.registration_number}
              </Badge>
            )}
          </motion.div>

          {/* Contact Info Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground"
          >
            {hospital.address && (
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {hospital.address}</span>
            )}
            {hospital.phone && (
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {hospital.phone}</span>
            )}
            {hospital.contact_email && (
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {hospital.contact_email}</span>
            )}
            {hospital.capacity && (
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {hospital.capacity} bed capacity</span>
            )}
          </motion.div>
        </div>
      </section>

      {/* About */}
      {hospital.about && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold mb-4 text-center">About Us</h2>
            <p className="text-muted-foreground leading-relaxed text-center whitespace-pre-line">{hospital.about}</p>
          </div>
        </section>
      )}

      {/* Departments */}
      {departments.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">Our Departments</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {departments.map((dept, i) => (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <Card className="h-full hover:border-primary/30 transition-colors">
                    <CardContent className="p-5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: primaryColor + "15" }}>
                        <Building2 className="w-4 h-4" style={{ color: primaryColor }} />
                      </div>
                      <h3 className="font-semibold text-sm">{dept.name}</h3>
                      {dept.description && <p className="text-xs text-muted-foreground mt-1">{dept.description}</p>}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Staff Login CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <Shield className="w-10 h-10 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-3">Staff Portal</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Authorized staff members can access the hospital management system through the secure login portal.
          </p>
          <Link to="/hms/login">
            <Button size="lg" className="gap-2">
              Staff Login <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {hospital.name}. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Powered by <Link to="/hms" className="text-primary font-medium hover:underline">DataAfro HMS</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
