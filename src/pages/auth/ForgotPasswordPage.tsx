import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-1/3 right-1/3 w-72 h-72 rounded-full bg-primary/8 blur-[120px]" />

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
            Don't worry,<br />
            <span className="text-gradient">we got you.</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "hsl(0 0% 50%)" }}>
            Password resets happen. We'll get you back to forging data in no time.
          </p>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-sm font-black text-primary-foreground">DA</span>
            </div>
            <span className="text-xl font-extrabold">Data<span className="text-gradient">Afro</span></span>
          </Link>

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }} className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </motion.div>
                <h1 className="text-2xl font-extrabold mb-2">Check your inbox</h1>
                <p className="text-muted-foreground text-sm mb-2">We've sent a reset link to</p>
                <p className="font-mono text-sm text-primary mb-8">{email}</p>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/login"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In</Link>
                </Button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Reset password</h1>
                <p className="text-muted-foreground mb-8">Enter your email and we'll send you a reset link</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-primary text-primary-foreground hover:opacity-90 font-bold rounded-xl shadow-glow text-base">
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-8">
                  <Link to="/login" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Back to Sign In
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
