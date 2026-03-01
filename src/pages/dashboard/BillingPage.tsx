import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { STRIPE_PLANS } from "@/lib/stripe-plans";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";

const BillingPage = () => {
  const {
    subscribed, planName, credits, cycle, subscriptionEnd,
    loading, checkout, manageSubscription, checkSubscription,
  } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription activated! Refreshing...");
      checkSubscription();
    }
    if (searchParams.get("canceled") === "true") {
      toast.info("Checkout canceled.");
    }
  }, [searchParams, checkSubscription]);

  const handleCheckout = async (priceId: string) => {
    setCheckoutLoading(priceId);
    try {
      await checkout(priceId);
    } catch {
      toast.error("Failed to start checkout.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManage = async () => {
    try {
      await manageSubscription();
    } catch {
      toast.error("Failed to open subscription portal.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and usage.</p>
      </div>

      {/* Current plan */}
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            <Badge variant={subscribed ? "default" : "secondary"}>
              {subscribed ? `${planName?.charAt(0).toUpperCase()}${planName?.slice(1)} – ${credits} credits` : "Free"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscribed ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Billing cycle</span>
                <span className="font-medium capitalize">{cycle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Renews on</span>
                <span className="font-medium">
                  {subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString() : "—"}
                </span>
              </div>
              <Button onClick={handleManage} variant="outline" className="w-full mt-2">
                Manage Subscription <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily credits</span>
                <span className="font-medium">10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly cap</span>
                <span className="font-medium">30</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Upgrade options */}
      {!subscribed && (
        <>
          <h2 className="text-lg font-bold pt-2">Upgrade your plan</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(STRIPE_PLANS).map(([planKey, cycles]) => (
              <Card key={planKey} className={`shadow-soft ${planKey === "pro" ? "border-primary/30" : ""}`}>
                <CardHeader>
                  <CardTitle className="capitalize flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    {planKey}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(cycles.monthly).map(([creditKey, plan]) => (
                    <div key={creditKey} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{plan.credits} credits/mo</span>
                      <Button
                        size="sm"
                        disabled={!!checkoutLoading}
                        onClick={() => handleCheckout(plan.priceId)}
                        className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                      >
                        {checkoutLoading === plan.priceId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          `$${plan.amount}/mo`
                        )}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BillingPage;
