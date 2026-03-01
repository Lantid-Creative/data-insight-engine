import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      toast({ title: "Sign up failed", description: error, variant: "destructive" });
    } else {
      setRegistered(true);
    }
  };

  const passwordChecks = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "One uppercase", valid: /[A-Z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) },
  ];

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Check your email</h1>
          <p className="text-muted-foreground mb-2">We've sent a confirmation link to</p>
          <p className="font-mono text-sm text-primary mb-8">{email}</p>
          <p className="text-sm text-muted-foreground">Click the link in your email to activate your account, then sign in.</p>
          <Button asChild className="mt-6 rounded-xl">
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
            Start forging<br />
            <span className="text-gradient">in minutes.</span>
          </h2>

          <p className="text-sm leading-relaxed mb-10" style={{ color: "hsl(0 0% 50%)" }}>
            3 free analyses every month. No credit card. No setup complexity. Just upload and go.
          </p>

          <div className="space-y-3">
            {["50,000+ files processed", "98% user satisfaction", "Used in 40+ countries"].map((text, i) => (
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

      {/* Right panel — form */}
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

          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">Start transforming data in minutes</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required className="h-12 rounded-xl bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all" />
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

            <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-primary text-primary-foreground hover:opacity-90 font-bold rounded-xl shadow-glow text-base transition-all">
              {loading ? "Creating account..." : <>Create Account <ArrowRight className="ml-2 w-4 h-4" /></>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
          </p>

          <p className="text-center text-[11px] text-muted-foreground mt-4">
            By creating an account, you agree to our{" "}
            <Link to="#" className="underline hover:text-foreground">Terms</Link> and{" "}
            <Link to="#" className="underline hover:text-foreground">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
