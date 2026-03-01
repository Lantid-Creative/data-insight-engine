import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Clock, LogOut, Mail } from "lucide-react";

const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const { user, signOut, applicationStatus, isAdmin, loading } = useAuth();

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

  const isRejected = applicationStatus === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg"
      >
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
          </div>
        )}

        <Button variant="outline" onClick={() => void signOut()} className="rounded-xl gap-2">
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </motion.div>
    </div>
  );
};

export default PendingApprovalPage;
