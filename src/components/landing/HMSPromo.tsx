import { Hospital, Users, Stethoscope, Pill, TestTube, CreditCard, CalendarClock, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const modules = [
  { icon: Users, title: "Admin Dashboard", desc: "Full hospital oversight with staff, departments & analytics" },
  { icon: Stethoscope, title: "Doctor Portal", desc: "Patient records, appointments & clinical decision support" },
  { icon: Pill, title: "Pharmacy", desc: "Real-time inventory tracking with automated stock alerts" },
  { icon: TestTube, title: "Laboratory", desc: "Sample tracking, test results & reporting workflows" },
  { icon: CreditCard, title: "Billing", desc: "Invoice generation, insurance claims & payment tracking" },
  { icon: CalendarClock, title: "Roster & Shifts", desc: "Staff scheduling, shift management & availability tracking" },
];

const HMSPromo = () => {
  return (
    <section className="py-28 bg-muted/30 relative overflow-hidden" id="hms">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-primary/5 blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Hospital className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono uppercase tracking-[0.15em] text-primary font-bold">Hospital Management</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Run your entire hospital
              <span className="text-primary"> from one platform.</span>
            </h2>

            <p className="text-lg mt-6 text-muted-foreground leading-relaxed max-w-lg">
              DataAfro HMS is a fully integrated hospital management system — from patient registration and pharmacy inventory to staff scheduling and billing. Built on the same secure infrastructure trusted by health data teams worldwide.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mt-8">
              <Button size="lg" className="gap-2 font-bold" asChild>
                <Link to="/hms">
                  Explore HMS
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>HIPAA-compliant · Multi-tenant · Role-based access</span>
              </div>
            </div>
          </motion.div>

          {/* Right — Module grid */}
          <div className="grid grid-cols-2 gap-4">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 to-transparent" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <mod.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{mod.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{mod.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HMSPromo;
