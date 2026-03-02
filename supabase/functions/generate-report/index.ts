import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { projectId } = await req.json();
    if (!projectId) throw new Error("projectId is required");

    // Verify project ownership
    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("id, name, description")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();
    if (projErr || !project) throw new Error("Project not found");

    // Get project files
    const { data: files } = await supabase
      .from("project_files")
      .select("file_name, mime_type, file_size, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    // Get all chat history
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })
      .limit(100);

    const fileList = files?.length
      ? files.map((f: any) => `- ${f.file_name} (${f.mime_type}, ${(f.file_size / 1024).toFixed(1)}KB, uploaded ${f.created_at})`).join("\n")
      : "No files uploaded.";

    const conversationSummary = history?.length
      ? history.map((m: any) => `[${m.role}]: ${m.content.slice(0, 500)}`).join("\n\n")
      : "No conversations yet.";

    const systemPrompt = `You are DataAfro AI, generating a comprehensive project report. Create a well-structured, professional report in markdown format.

The report should include:
1. **Executive Summary** - A brief overview of the project and key findings
2. **Data Overview** - Summary of uploaded files, their types, and sizes
3. **Key Insights** - Main findings and patterns from the conversations
4. **Recommendations** - Actionable next steps
5. **Conclusion** - Final summary

Be thorough but concise. Use headers, bullet points, and tables where appropriate.
Format dates nicely. Use professional language.`;

    const userPrompt = `Generate a comprehensive report for the project "${project.name}".

Project description: ${project.description || "No description provided"}

Files in project:
${fileList}

Conversation history:
${conversationSummary}

Generate the full report now.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
        max_tokens: 8192,
        temperature: 0.5,
      }),
    });

    if (aiResponse.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResponse.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errText);
      throw new Error(`AI service error: ${aiResponse.status}`);
    }

    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
