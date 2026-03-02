import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller is an admin
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await userClient.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").single();
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { email, full_name, role = "user", auto_approve = true } = body;

    if (!email || !full_name) {
      return new Response(JSON.stringify({ error: "Email and full_name are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client to create the user
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Generate a temporary password
    const tempPassword = crypto.randomUUID().slice(0, 12) + "A1!";

    // Create the user via admin API
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (createError) {
      // Check if user already exists
      if (createError.message?.includes("already been registered") || createError.message?.includes("already exists")) {
        return new Response(JSON.stringify({ error: "A user with this email already exists" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw createError;
    }

    const newUserId = newUser.user.id;

    // Create application record (auto-approved if specified)
    await adminClient.from("user_applications").insert({
      user_id: newUserId,
      full_name,
      email,
      company_name: "Invited by admin",
      location: "—",
      intended_use: "Admin invite",
      status: auto_approve ? "approved" : "pending",
      reviewed_by: user.id,
      reviewed_at: auto_approve ? new Date().toISOString() : null,
      admin_notes: `Invited by ${user.email}`,
    });

    // Assign role
    if (role === "admin") {
      await adminClient.from("user_roles").insert({
        user_id: newUserId,
        role: "admin",
      });
    }

    // Send password reset email so user can set their own password
    await adminClient.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `User ${email} invited successfully. They should use "Forgot Password" to set their own password.`,
        user_id: newUserId,
        temp_password: tempPassword,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Admin invite error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
