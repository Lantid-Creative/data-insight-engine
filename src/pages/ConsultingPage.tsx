import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BarChart3, Brain, GraduationCap, FileText, CheckCircle2, Calendar, Users, Globe, Building2, Landmark, Rocket, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const services = [
  {
    icon: BarChart3,
    title: "Data Strategy & Analytics",
    description: "Build robust data pipelines, custom dashboards, KPI frameworks, and data governance structures. We help you move from raw data to actionable intelligence.",
    deliverables: ["Data audit & roadmap", "Custom dashboards", "KPI framework", "Pipeline architecture"],
  },
  {
    icon: Brain,
    title: "AI Implementation",
    description: "From custom ML models to AI-powered automation workflows — we design, build, and deploy intelligent systems that transform how your organization operates.",
    deliverables: ["Custom AI models", "Automation workflows", "Integration setup", "Performance monitoring"],
  },
  {
    icon: GraduationCap,
    title: "Training & Workshops",
    description: "Hands-on, practical sessions to upskill your team in data literacy, AI tools, analytics best practices, and DataAfro platform mastery.",
    deliverables: ["Live workshops", "Custom curriculum", "Certification", "Ongoing support"],
  },
  {
    icon: FileText,
    title: "Custom Reports & Research",
    description: "Bespoke data analysis, market research, competitor intelligence, impact assessments, and professionally formatted deliverables for any audience.",
    deliverables: ["Market analysis", "Impact reports", "Financial modeling", "Executive summaries"],
  },
];

const audiences = [
  { icon: Building2, label: "Businesses & Enterprises", description: "Scale data operations and gain competitive intelligence" },
  { icon: Globe, label: "NGOs & Non-Profits", description: "Impact measurement, donor reporting, and program evaluation" },
  { icon: Landmark, label: "Government Agencies", description: "Census analysis, policy research, and public data management" },
  { icon: BookOpen, label: "Research Institutions", description: "Statistical analysis, survey processing, and publication support" },
  { icon: Rocket, label: "Startups & Founders", description: "Market sizing, investor-ready analytics, and data-driven decisions" },
  { icon: Users, label: "Consultants & Freelancers", description: "White-label reports and analytics you can deliver to your clients" },
];

const process = [
  { step: "01", title: "Discovery Call", description: "We learn about your goals, data landscape, and challenges — completely free." },
  { step: "02", title: "Custom Proposal", description: "We design a tailored solution with clear deliverables, timeline, and pricing." },
  { step: "03", title: "Execution", description: "Our team gets to work. You get regular updates and full transparency." },
  { step: "04", title: "Delivery & Support", description: "We hand over polished deliverables and provide ongoing support as needed." },
];

const ConsultingPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", org: "", service: "", message: "" });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("consulting_submissions").insert({
      full_name: formData.name,
      email: formData.email,
      organization: formData.org || null,
      service_needed: formData.service || null,
      message: formData.message,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 section-dark relative overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-[150px]" />

        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary font-bold">Consulting & Services</span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mt-4 mb-6 text-white">
              We don't just give you tools.<br />
              <span className="text-gradient">We do the work.</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto text-white/55 mb-10">
              From strategy to execution — our team of data scientists, AI engineers, and analysts partner with you to turn complexity into clarity.
            </p>
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground px-8 h-14 text-base font-bold shadow-glow-strong hover:opacity-90 rounded-xl">
              <a href="#contact">
                Book a Free Discovery Call <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">What we offer</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">End-to-end data and AI services tailored to your organization.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-8 rounded-2xl border border-border bg-card shadow-soft hover:shadow-elevated hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{s.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {s.deliverables.map((d) => (
                    <div key={d} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {d}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we work with */}
      <section className="py-24 section-dark">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Who we work with</h2>
            <p className="text-white/50 mt-3 max-w-xl mx-auto">We've partnered with organizations across every sector.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {audiences.map((a, i) => (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="p-6 rounded-2xl border bg-white/[0.03] border-white/[0.08] hover:border-primary/20 transition-all"
              >
                <a.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-bold text-white/90 mb-1">{a.label}</h3>
                <p className="text-sm text-white/45">{a.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">How it works</h2>
            <p className="text-muted-foreground mt-3">From first call to final delivery — simple and transparent.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {process.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-4xl font-extrabold text-gradient mb-4">{p.step}</div>
                <h3 className="font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section className="py-24 section-dark" id="contact">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Calendar className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Book a Discovery Call</h2>
              <p className="text-white/50 mt-3">Tell us about your project. We'll get back within 24 hours.</p>
            </motion.div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-extrabold text-white mb-2">We've received your request!</h3>
                <p className="text-white/50 mb-8">Our team will reach out within 24 hours to schedule your call.</p>
                <Button asChild variant="outline" className="rounded-xl text-white/70 border-white/15 hover:bg-white/5">
                  <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Home</Link>
                </Button>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
                onSubmit={handleSubmit}
                className="space-y-5 p-8 rounded-2xl border bg-white/[0.03] border-white/[0.08]"
              >
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white/70 text-sm">Full Name</Label>
                    <Input id="name" placeholder="Your name" required value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="h-12 rounded-xl bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30 focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/70 text-sm">Email</Label>
                    <Input id="email" type="email" placeholder="you@org.com" required value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="h-12 rounded-xl bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30 focus:border-primary" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="org" className="text-white/70 text-sm">Organization</Label>
                    <Input id="org" placeholder="Company / Org name" value={formData.org} onChange={(e) => setFormData(p => ({ ...p, org: e.target.value }))} className="h-12 rounded-xl bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30 focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service" className="text-white/70 text-sm">Service Needed</Label>
                    <Select value={formData.service} onValueChange={(v) => setFormData(p => ({ ...p, service: v }))}>
                      <SelectTrigger className="h-12 rounded-xl bg-white/[0.05] border-white/[0.1] text-white">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="data-strategy">Data Strategy & Analytics</SelectItem>
                        <SelectItem value="ai-implementation">AI Implementation</SelectItem>
                        <SelectItem value="training">Training & Workshops</SelectItem>
                        <SelectItem value="custom-reports">Custom Reports & Research</SelectItem>
                        <SelectItem value="multiple">Multiple / Not sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white/70 text-sm">Tell us about your project</Label>
                  <Textarea id="message" placeholder="Describe your goals, data challenges, timeline, or anything you'd like us to know..." required rows={5} value={formData.message} onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))} className="rounded-xl bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30 focus:border-primary resize-none" />
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-primary text-primary-foreground hover:opacity-90 font-bold rounded-xl shadow-glow text-base">
                  {loading ? "Submitting..." : <>Submit Request <ArrowRight className="ml-2 w-4 h-4" /></>}
                </Button>

                <p className="text-center text-xs text-white/30">Free consultation • No commitment • Response within 24h</p>
              </motion.form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ConsultingPage;
