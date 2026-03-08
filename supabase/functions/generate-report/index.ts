import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function gatherWorkspaceSnapshot(supabase: any, userId: string) {
  const [
    profileRes, allProjectsRes, allFilesRes, teamsRes,
    copilotRes, redactionRes, alertsRes, pipelinesRes, regDocsRes, dataRoomsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, expertise_tags").eq("user_id", userId).single(),
    supabase.from("projects").select("id, name, description").eq("user_id", userId).limit(20),
    supabase.from("project_files").select("file_name, project_id").eq("user_id", userId).limit(50),
    supabase.from("teams").select("id, name").eq("owner_id", userId),
    supabase.from("copilot_conversations").select("id, title, specialty").eq("user_id", userId).limit(10),
    supabase.from("redaction_jobs").select("id, status, entity_count").eq("user_id", userId).limit(10),
    supabase.from("epidemic_alerts").select("id, title, severity, is_active").eq("user_id", userId).limit(10),
    supabase.from("pipelines").select("id, name, last_run_status").eq("user_id", userId).limit(10),
    supabase.from("regulatory_documents").select("id, name, document_type, status").eq("user_id", userId).limit(10),
    supabase.from("data_rooms").select("id, name, status").eq("user_id", userId).limit(10),
  ]);

  const profile = profileRes.data;
  const projects = allProjectsRes.data || [];
  const files = allFilesRes.data || [];

  let ctx = `\n\n## Workspace Context (${profile?.full_name || "User"})`;
  ctx += `\n- ${projects.length} projects, ${files.length} total files`;
  if ((teamsRes.data || []).length) ctx += `\n- ${teamsRes.data.length} teams owned`;
  if ((copilotRes.data || []).length) ctx += `\n- ${copilotRes.data.length} Clinical Co-Pilot conversations`;
  if ((redactionRes.data || []).length) {
    const entities = redactionRes.data.reduce((s: number, j: any) => s + (j.entity_count || 0), 0);
    ctx += `\n- ${redactionRes.data.length} PHI scans (${entities} entities)`;
  }
  if ((alertsRes.data || []).length) ctx += `\n- ${alertsRes.data.filter((a: any) => a.is_active).length} active epidemic alerts`;
  if ((pipelinesRes.data || []).length) ctx += `\n- ${pipelinesRes.data.length} pipelines`;
  if ((regDocsRes.data || []).length) ctx += `\n- ${regDocsRes.data.length} regulatory documents`;
  if ((dataRoomsRes.data || []).length) ctx += `\n- ${dataRoomsRes.data.length} data rooms`;

  // Other projects for cross-referencing
  if (projects.length > 1) {
    ctx += `\n\nOther projects: ${projects.map((p: any) => `"${p.name}"`).join(", ")}`;
  }

  return ctx;
}

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

    const { projectId, config } = await req.json();
    if (!projectId) throw new Error("projectId is required");

    const {
      sections = ["executive_summary", "data_overview", "key_insights", "recommendations", "conclusion"],
      tone = "professional",
      focusAreas = [],
      customInstructions = "",
      reportTitle = "",
      includeCharts = false,
      language = "English",
    } = config || {};

    // Verify project ownership
    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("id, name, description")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();
    if (projErr || !project) throw new Error("Project not found");

    // Gather all context in parallel
    const [filesRes, historyRes, workspaceSnapshot] = await Promise.all([
      supabase.from("project_files").select("file_name, mime_type, file_size, created_at").eq("project_id", projectId).order("created_at", { ascending: true }),
      supabase.from("chat_messages").select("role, content, created_at").eq("project_id", projectId).order("created_at", { ascending: true }).limit(100),
      gatherWorkspaceSnapshot(supabase, user.id),
    ]);

    const files = filesRes.data;
    const history = historyRes.data;

    const fileList = files?.length
      ? files.map((f: any) => `- ${f.file_name} (${f.mime_type}, ${(f.file_size / 1024).toFixed(1)}KB, uploaded ${f.created_at})`).join("\n")
      : "No files uploaded.";

    const conversationSummary = history?.length
      ? history.map((m: any) => `[${m.role}]: ${m.content.slice(0, 500)}`).join("\n\n")
      : "No conversations yet.";

    const sectionMap: Record<string, string> = {
      executive_summary: "**Executive Summary** - A concise overview of the project, its purpose, and the most critical findings. Highlight the main takeaway.",
      data_overview: "**Data Overview** - Summary of all uploaded files including types, sizes, structure, and data quality observations.",
      key_insights: "**Key Insights** - The most important patterns, trends, anomalies, and findings discovered from the data and conversations.",
      statistical_analysis: "**Statistical Analysis** - Quantitative analysis including means, medians, distributions, correlations, and any significant statistical findings.",
      recommendations: "**Recommendations** - Actionable next steps based on the findings. Prioritize by impact and feasibility.",
      risk_assessment: "**Risk Assessment** - Potential risks, data quality issues, gaps, and areas that need attention.",
      methodology: "**Methodology** - How the analysis was conducted, what tools and approaches were used.",
      data_quality: "**Data Quality Report** - Assessment of data completeness, accuracy, consistency, and any cleaning steps needed.",
      comparative_analysis: "**Comparative Analysis** - Compare different data segments, time periods, or categories to identify differences.",
      conclusion: "**Conclusion** - Final summary tying together all sections with a clear closing statement.",
      appendix: "**Appendix** - Additional data tables, raw numbers, or supplementary information referenced in the report.",
    };

    const selectedSections = sections.map((s: string) => sectionMap[s]).filter(Boolean).map((s: string, i: number) => `${i + 1}. ${s}`).join("\n");

    const toneMap: Record<string, string> = {
      professional: "Use formal, professional language suitable for business stakeholders and executives.",
      technical: "Use technical language with precise terminology. Include technical details, methodologies, and specifications.",
      executive: "Write for C-level executives. Be extremely concise, lead with impact, and focus on business outcomes and ROI.",
      academic: "Use academic writing style with proper citations format, methodology discussion, and scholarly tone.",
      casual: "Use a friendly, conversational tone that's easy to understand for non-technical readers.",
    };

    const toneInstruction = toneMap[tone] || toneMap.professional;
    const focusInstruction = focusAreas.length > 0 ? `\n\nPay special attention to these focus areas:\n${focusAreas.map((f: string) => `- ${f}`).join("\n")}` : "";
    const customInstr = customInstructions.trim() ? `\n\nAdditional instructions:\n${customInstructions}` : "";
    const chartInstruction = includeCharts ? "\n\nWhere appropriate, suggest data visualizations. Use markdown tables to present data when possible." : "";
    const langInstruction = language !== "English" ? `\n\nIMPORTANT: Write the entire report in ${language}.` : "";

    const systemPrompt = `You are **DataAfro AI** — producing a publication-grade analytical report. Your output quality must match that of a top-tier consulting firm's deliverable. **No token limits — write as comprehensively as the analysis demands.**

${toneInstruction}
${workspaceSnapshot}

## WORKSPACE AWARENESS
You have visibility into the user's entire workspace. Use this to enrich the report with cross-project correlations, workspace utilization patterns, and Intelligence Suite findings when relevant.

## REPORT STRUCTURE
The report MUST include these sections in this order:
${selectedSections}

## QUALITY MANDATES
1. **Open every section** with a key finding or metric — never with generic introductions ("This section covers...")
2. **Quantify everything**. Replace vague language with specific numbers, percentages, and comparisons.
3. **Use markdown tables** whenever comparing ≥3 data points, ranking items, or presenting multi-dimensional data.
4. **Bold** all critical metrics, key findings, and important terms.
5. **Use hierarchical headers** (##, ###, ####) for clean navigation.
6. **Include actionable specifics** in every recommendation — who should do what, expected impact, and timeline.
7. **Never use filler** ("It is worth noting", "As we can see"). Every sentence must carry analytical weight.
8. **Cross-reference** between sections — insights in one section should connect to recommendations in another.
9. Format dates as human-readable (e.g., "March 8, 2026").
10. End with a **Key Takeaways** summary of the 3-5 most critical findings.${focusInstruction}${customInstr}${chartInstruction}${langInstruction}`;

    const title = reportTitle.trim() || project.name;

    const userPrompt = `Generate a comprehensive report titled "${title}" for the project "${project.name}".

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
        max_tokens: 16384,
        temperature: 0.4,
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
