import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Check, Clock, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const RegisterPage = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [location, setLocation] = useState("");
  const [intendedUse, setIntendedUse] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const passwordChecks = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "One uppercase", valid: /[A-Z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) },
  ];

  const allPasswordValid = passwordChecks.every((c) => c.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Create the auth account
    const { error } = await signUp(email, password, name);
    if (error) {
      setLoading(false);
      toast({ title: "Sign up failed", description: error, variant: "destructive" });
      return;
    }

    // 2. Get the user to insert the application
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error: appError } = await supabase.from("user_applications").insert({
        user_id: user.id,
        full_name: name,
        email,
        company_name: companyName,
        company_size: companySize || null,
        location,
        intended_use: intendedUse,
      });
      if (appError) {
        console.error("Application insert error:", appError);
      }
    }

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Application Submitted</h1>
          <p className="text-muted-foreground mb-2">We've received your early access request.</p>
          <p className="text-sm text-muted-foreground mb-4">Your account has been created with <span className="font-mono text-primary">{email}</span></p>
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-left mb-8">
            <p className="text-sm text-muted-foreground">Our team will review your application and get back to you within <strong className="text-foreground">48 hours</strong>. You'll receive an email once approved.</p>
          </div>
          <Button asChild className="rounded-xl">
            <Link to="/login">Go to Sign In</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-1/4 right-1/3 w-72 h-72 rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, hsl(0 0% 100%) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }} />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-md"
        >
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <span className="text-base font-black text-primary-foreground">DA</span>
            </div>
            <span className="text-2xl font-extrabold" style={{ color: "hsl(0 0% 95%)" }}>
              Data<span className="text-gradient">Afro</span>
            </span>
          </Link>

          <h2 className="text-3xl font-extrabold leading-tight mb-6" style={{ color: "hsl(0 0% 92%)" }}>
            Built for enterprise<br />
            <span className="text-gradient">data teams.</span>
          </h2>

          <p className="text-sm leading-relaxed mb-10" style={{ color: "hsl(0 0% 50%)" }}>
            DataAfro is currently in private beta. We're selectively onboarding data-intensive organizations and research institutions.
          </p>

          <div className="space-y-3">
            {[
              "Invite-only access for qualified teams",
              "Enterprise-grade security & compliance",
              "Dedicated onboarding support",
            ].map((text, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 14%)" }}
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm" style={{ color: "hsl(0 0% 65%)" }}>{text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — multi-step form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Link to="/" className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-sm font-black text-primary-foreground">DA</span>
            </div>
            <span className="text-xl font-extrabold">Data<span className="text-gradient">Afro</span></span>
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex items-center gap-2 text-sm font-medium ${step === 1 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>1</div>
              Account
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className={`flex items-center gap-2 text-sm font-medium ${step === 2 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</div>
              Organization
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            {step === 1 ? "Request Early Access" : "Tell us about your team"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {step === 1 ? "Create your account to apply for the private beta" : "Help us understand how you'll use DataAfro"}
          </p>

          {step === 1 ? (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required className="h-12 rounded-xl bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Work Email</Label>
                <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-12 rounded-xl bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all pr-11"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex gap-3 pt-1">
                    {passwordChecks.map((c) => (
                      <span key={c.label} className={`text-[11px] font-mono flex items-center gap-1 ${c.valid ? "text-primary" : "text-muted-foreground"}`}>
                        <Check className={`w-3 h-3 ${c.valid ? "opacity-100" : "opacity-30"}`} />
                        {c.label}
                      </span>
                    ))}
                  </motion.div>
                )}
              </div>

              <Button type="submit" disabled={!name || !email || !allPasswordValid} className="w-full h-12 bg-gradient-primary text-primary-foreground hover:opacity-90 font-bold rounded-xl shadow-glow text-base transition-all">
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium">Organization / Company</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="company" placeholder="e.g. Palantir, MIT, Deloitte" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="h-12 rounded-xl bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize" className="text-sm font-medium">Team Size</Label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-border">
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1–10 people</SelectItem>
                    <SelectItem value="11-50">11–50 people</SelectItem>
                    <SelectItem value="51-200">51–200 people</SelectItem>
                    <SelectItem value="201-1000">201–1,000 people</SelectItem>
                    <SelectItem value="1000+">1,000+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <Input id="location" placeholder="e.g. San Francisco, USA" value={location} onChange={(e) => setLocation(e.target.value)} required className="h-12 rounded-xl bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intendedUse" className="text-sm font-medium">What will you use DataAfro for?</Label>
                <Textarea
                  id="intendedUse"
                  placeholder="e.g. We need to process large volumes of PDF research papers and extract structured data for our analytics pipeline..."
                  value={intendedUse}
                  onChange={(e) => setIntendedUse(e.target.value)}
                  required
                  rows={4}
                  className="rounded-xl bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 rounded-xl flex-1">
                  Back
                </Button>
                <Button type="submit" disabled={loading || !companyName || !location || !intendedUse} className="flex-[2] h-12 bg-gradient-primary text-primary-foreground hover:opacity-90 font-bold rounded-xl shadow-glow text-base transition-all">
                  {loading ? "Submitting..." : <>Submit Application <ArrowRight className="ml-2 w-4 h-4" /></>}
                </Button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
          </p>

          <p className="text-center text-[11px] text-muted-foreground mt-4">
            By applying, you agree to our{" "}
            <Link to="/terms" className="underline hover:text-foreground">Terms</Link> and{" "}
            <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
