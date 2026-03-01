import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[ADMIN-SUBS] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const userId = userData.user?.id;
    if (!userId) throw new Error("User not authenticated");

    // Admin check
    const { data: isAdmin } = await supabaseClient.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden: admin role required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.json().catch(() => ({}));
    const action = body.action || "list";

    logStep("Action", { action, userId });

    // ── LIST ALL SUBSCRIPTIONS ──
    if (action === "list") {
      const status = body.status || undefined; // "active", "canceled", "past_due", etc.
      const params: Stripe.SubscriptionListParams = { limit: 100, expand: ["data.customer"] };
      if (status && status !== "all") params.status = status;

      const subs = await stripe.subscriptions.list(params);
      const result = subs.data.map((s) => {
        const customer = s.customer as Stripe.Customer;
        const item = s.items.data[0];
        return {
          id: s.id,
          status: s.status,
          customer_email: customer?.email || "unknown",
          customer_name: customer?.name || "",
          customer_id: customer?.id,
          product_id: typeof item?.price?.product === "string" ? item.price.product : null,
          price_id: item?.price?.id,
          amount: item?.price?.unit_amount ? item.price.unit_amount / 100 : 0,
          currency: item?.price?.currency || "usd",
          interval: item?.price?.recurring?.interval || null,
          current_period_start: new Date(s.current_period_start * 1000).toISOString(),
          current_period_end: new Date(s.current_period_end * 1000).toISOString(),
          created: new Date(s.created * 1000).toISOString(),
          canceled_at: s.canceled_at ? new Date(s.canceled_at * 1000).toISOString() : null,
        };
      });

      return new Response(JSON.stringify({ subscriptions: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── REVENUE ANALYTICS ──
    if (action === "revenue") {
      const { period } = body; // "month", "quarter", "year"
      const now = new Date();
      let since: Date;
      if (period === "year") since = new Date(now.getFullYear(), 0, 1);
      else if (period === "quarter") since = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      else since = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get charges
      const charges = await stripe.charges.list({
        created: { gte: Math.floor(since.getTime() / 1000) },
        limit: 100,
      });

      let totalRevenue = 0;
      let totalCharges = 0;
      const dailyRevenue: Record<string, number> = {};

      for (const c of charges.data) {
        if (c.status === "succeeded") {
          const amount = c.amount / 100;
          totalRevenue += amount;
          totalCharges++;
          const day = new Date(c.created * 1000).toISOString().split("T")[0];
          dailyRevenue[day] = (dailyRevenue[day] || 0) + amount;
        }
      }

      // Active subscribers count
      const activeSubs = await stripe.subscriptions.list({ status: "active", limit: 1 });
      const activeCount = activeSubs.data.length;

      // MRR estimate (sum of active subscription amounts)
      const allActive = await stripe.subscriptions.list({ status: "active", limit: 100 });
      let mrr = 0;
      for (const s of allActive.data) {
        const item = s.items.data[0];
        if (item?.price?.unit_amount) {
          const amt = item.price.unit_amount / 100;
          if (item.price.recurring?.interval === "year") mrr += amt / 12;
          else mrr += amt;
        }
      }

      return new Response(JSON.stringify({
        total_revenue: totalRevenue,
        total_charges: totalCharges,
        mrr: Math.round(mrr * 100) / 100,
        active_subscribers: allActive.data.length,
        daily_revenue: Object.entries(dailyRevenue).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date)),
        period,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── CANCEL SUBSCRIPTION ──
    if (action === "cancel") {
      const { subscription_id } = body;
      if (!subscription_id) throw new Error("subscription_id required");
      const canceled = await stripe.subscriptions.cancel(subscription_id);
      logStep("Canceled subscription", { id: canceled.id });
      return new Response(JSON.stringify({ success: true, status: canceled.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── UPDATE SUBSCRIPTION (change plan) ──
    if (action === "update") {
      const { subscription_id, new_price_id } = body;
      if (!subscription_id || !new_price_id) throw new Error("subscription_id and new_price_id required");
      const sub = await stripe.subscriptions.retrieve(subscription_id);
      const itemId = sub.items.data[0].id;
      const updated = await stripe.subscriptions.update(subscription_id, {
        items: [{ id: itemId, price: new_price_id }],
        proration_behavior: "create_prorations",
      });
      logStep("Updated subscription", { id: updated.id, newPrice: new_price_id });
      return new Response(JSON.stringify({ success: true, status: updated.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── CREATE COUPON ──
    if (action === "create_coupon") {
      const { name, percent_off, amount_off, duration, duration_in_months, currency } = body;
      const couponParams: Stripe.CouponCreateParams = { name, duration: duration || "once" };
      if (percent_off) couponParams.percent_off = percent_off;
      if (amount_off) { couponParams.amount_off = Math.round(amount_off * 100); couponParams.currency = currency || "usd"; }
      if (duration === "repeating" && duration_in_months) couponParams.duration_in_months = duration_in_months;
      const coupon = await stripe.coupons.create(couponParams);
      logStep("Created coupon", { id: coupon.id });
      return new Response(JSON.stringify({ success: true, coupon }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── LIST COUPONS ──
    if (action === "list_coupons") {
      const coupons = await stripe.coupons.list({ limit: 50 });
      return new Response(JSON.stringify({ coupons: coupons.data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DELETE COUPON ──
    if (action === "delete_coupon") {
      const { coupon_id } = body;
      if (!coupon_id) throw new Error("coupon_id required");
      await stripe.coupons.del(coupon_id);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error?.message?.includes("Forbidden") ? 403 : 500,
    });
  }
});
