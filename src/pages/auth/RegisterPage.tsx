import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Check } from "lucide-react";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  const passwordChecks = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "One uppercase", valid: /[A-Z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) },
  ];

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

          {/* Floating cards */}
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

            <Button type="submit" className="w-full h-12 bg-gradient-primary text-primary-foreground hover:opacity-90 font-bold rounded-xl shadow-glow text-base transition-all">
              Create Account <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-3 text-muted-foreground">or sign up with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11 rounded-xl font-medium">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </Button>
            <Button variant="outline" className="h-11 rounded-xl font-medium">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </Button>
          </div>

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
