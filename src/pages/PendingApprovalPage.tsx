import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Clock, LogOut, Mail, RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const { user, signOut, applicationStatus, isAdmin, loading, refreshApplicationStatus } = useAuth();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (isAdmin) {
      navigate("/admin", { replace: true });
      return;
    }
    if (applicationStatus === "approved") {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, isAdmin, applicationStatus, navigate]);

  const handleCheckStatus = async () => {
    setChecking(true);
    await refreshApplicationStatus();
    setChecking(false);
    if (applicationStatus === "approved") {
      toast.success("You've been approved! Redirecting…");
    } else {
      toast.info("Your application is still under review.");
    }
  };

  const isRejected = applicationStatus === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg"
      >
        {/* Back to home */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </Link>

        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isRejected ? "bg-destructive/10" : "bg-primary/10"}`}>
          {isRejected ? (
            <Mail className="w-10 h-10 text-destructive" />
          ) : (
            <Clock className="w-10 h-10 text-primary" />
          )}
        </div>

        <h1 className="text-2xl font-extrabold mb-2">
          {isRejected ? "Application Not Approved" : "Your Application is Under Review"}
        </h1>

        <p className="text-muted-foreground mb-6">
          {isRejected
            ? "Unfortunately, your application wasn't approved at this time. If you believe this is an error, please contact our team."
            : "Thank you for applying to the DataAfro private beta. Our team is reviewing your application and you'll receive an email once you're approved."
          }
        </p>

        {!isRejected && (
          <div className="rounded-xl border border-border bg-muted/30 p-5 text-left mb-8 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-foreground font-medium">Application Status: Pending Review</span>
            </div>
            <p className="text-sm text-muted-foreground pl-5">
              Typical review time is 24–48 hours. We'll notify you at <span className="font-mono text-primary">{user?.email}</span>
            </p>

            {/* Progress steps */}
            <div className="pl-5 pt-2 space-y-2">
              {[
                { label: "Application submitted", done: true },
                { label: "Under review", done: false, active: true },
                { label: "Approved & ready", done: false },
              ].map((step) => (
                <div key={step.label} className="flex items-center gap-2.5">
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : (
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${step.active ? "border-primary animate-pulse" : "border-muted-foreground/30"}`} />
                  )}
                  <span className={`text-sm ${step.done ? "text-muted-foreground line-through" : step.active ? "text-foreground font-medium" : "text-muted-foreground/50"}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          {!isRejected && (
            <Button
              variant="outline"
              onClick={handleCheckStatus}
              disabled={checking}
              className="rounded-xl gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
              {checking ? "Checking…" : "Check Status"}
            </Button>
          )}
          <Button variant="ghost" onClick={() => void signOut()} className="rounded-xl gap-2 text-muted-foreground">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {isRejected && (
          <p className="text-sm text-muted-foreground mt-6">
            Questions? <Link to="/contact" className="text-primary hover:underline font-medium">Contact our team</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default PendingApprovalPage;
