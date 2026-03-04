import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, type, title, message, link, metadata } = await req.json();

    if (!user_id || !type || !title || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: user_id, type, title, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insert notification
    const { error: insertError } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id,
        type,
        title,
        message,
        link: link || null,
        metadata: metadata || {},
      });

    if (insertError) throw insertError;

    // Get user email for email notification (critical events only)
    const criticalTypes = ["team_invite", "project_share", "security", "billing"];
    if (criticalTypes.includes(type)) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(user_id);
      if (userData?.user?.email) {
        console.log(
          `[notify] Would send email to ${userData.user.email}: ${title} - ${message}`
        );
        // Email sending would go here when email domain is configured
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[notify] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
