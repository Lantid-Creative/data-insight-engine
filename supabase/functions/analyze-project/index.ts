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

    const { projectId, prompt } = await req.json();
    if (!projectId) throw new Error("projectId is required");

    // Verify project ownership
    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("id, name, description")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();
    if (projErr || !project) throw new Error("Project not found");

    // Get project files for context
    const { data: files } = await supabase
      .from("project_files")
      .select("file_name, mime_type, file_size, created_at")
      .eq("project_id", projectId);

    // Get chat messages for analysis
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })
      .limit(100);

    const fileContext = files?.length
      ? files.map((f: any) => `- ${f.file_name} (${f.mime_type}, ${(f.file_size / 1024).toFixed(1)}KB, uploaded ${f.created_at})`).join("\n")
      : "No files uploaded yet.";

    const chatSummary = messages?.length
      ? `Total messages: ${messages.length} (${messages.filter((m: any) => m.role === "user").length} user, ${messages.filter((m: any) => m.role === "assistant").length} AI)`
      : "No chat history.";

    const userPrompt = prompt || "Generate a comprehensive analysis of this project data.";

    const systemPrompt = `You are **DataAfro AI** — an elite data intelligence engine operating at principal data scientist level. Your analysis must be **deeply structured, rigorously quantitative, and boardroom-ready**.

Project: "${project.name}"
Description: ${project.description || "No description"}

Files:
${fileContext}

Chat Activity:
${chatSummary}

## MANDATE
Produce an exhaustive analytical dashboard from the available project data. Do NOT hold back — generate the maximum useful analysis. If data is limited, perform meta-analysis on file composition, activity patterns, temporal distribution, and data quality signals.

IMPORTANT: You MUST return a valid JSON object with the following structure. No markdown, no explanation, ONLY JSON:

{
  "insights": [
    { "title": "string", "value": "string", "change": "up|down|neutral", "description": "Analytical explanation with specific numbers and context — not generic filler" }
  ],
  "charts": [
    {
      "id": "unique_id",
      "title": "Descriptive analytical title",
      "description": "What this visualization reveals — the insight, not just the data description",
      "type": "bar|line|pie|area|scatter|radar|treemap",
      "data": [{ "name": "string", "value": number }],
      "dataKeys": ["value"],
      "xKey": "name",
      "code": "// Complete React/Recharts code"
    }
  ],
  "tables": [
    {
      "id": "unique_id",
      "title": "string",
      "description": "string",
      "headers": ["col1", "col2"],
      "rows": [["val1", "val2"]],
      "code": "// React code for this table"
    }
  ],
  "recommendations": [
    { "title": "string", "description": "Specific, actionable recommendation with expected impact — never generic advice", "priority": "high|medium|low" }
  ]
}

## QUALITY STANDARDS
- Generate **5-8** KPI insight cards with quantified metrics, delta indicators, and contextual interpretation
- Generate **3-5** charts using diverse types (bar, line, pie, area, scatter, radar, treemap) — each revealing a different analytical dimension
- Generate **1-3** data tables for detailed breakdowns, comparisons, and rankings
- Generate **3-5** recommendations ranked by impact, each with a concrete expected outcome
- Every "description" field must contain a genuine analytical observation — zero filler
- Chart data must be realistic, internally consistent, and derived from actual project context
- The "code" field must contain production-grade React/Recharts code
- If data is sparse, perform second-order analysis: file type distribution, upload velocity, engagement patterns, data completeness scoring`;

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
        max_tokens: 8192,
        temperature: 0.4,
      }),
    });

    if (aiResponse.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResponse.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errText);
      throw new Error(`AI service error: ${aiResponse.status}`);
    }

    const result = await aiResponse.json();
    const content = result.choices?.[0]?.message?.content || "";
    
    // Try to parse JSON from the response (it might be wrapped in ```json blocks)
    let analysisData;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      analysisData = JSON.parse(jsonStr.trim());
    } catch {
      // If JSON parsing fails, return a structured error with raw content
      analysisData = {
        insights: [
          { title: "Analysis Status", value: "Partial", change: "neutral", description: "AI returned unstructured data" }
        ],
        charts: [],
        tables: [],
        recommendations: [
          { title: "Retry Analysis", description: "The AI response was not properly structured. Try again or refine your prompt.", priority: "high" }
        ],
        rawContent: content,
      };
    }

    return new Response(JSON.stringify(analysisData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-project error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
