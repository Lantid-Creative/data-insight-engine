import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function gatherWorkspaceContext(supabase: any, userId: string, currentProjectId: string) {
  // All queries run in parallel for speed
  const [
    profileRes,
    allProjectsRes,
    allFilesRes,
    teamsRes,
    teamMembersRes,
    copilotConvsRes,
    redactionJobsRes,
    epidemicAlertsRes,
    epidemicReportsRes,
    pipelinesRes,
    regDocsRes,
    dataRoomsRes,
    recentActivityRes,
    forumPostsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, bio, expertise_tags").eq("user_id", userId).single(),
    supabase.from("projects").select("id, name, description, created_at, updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(20),
    supabase.from("project_files").select("file_name, mime_type, file_size, project_id, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    supabase.from("teams").select("id, name, created_at").eq("owner_id", userId),
    supabase.from("team_members").select("team_id, role, accepted, email").eq("user_id", userId),
    supabase.from("copilot_conversations").select("id, title, specialty, updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(10),
    supabase.from("redaction_jobs").select("id, file_name, status, entity_count, avg_confidence, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
    supabase.from("epidemic_alerts").select("id, title, severity, region, disease_category, is_active, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
    supabase.from("epidemic_reports").select("id, title, report_type, total_cases, alert_count, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    supabase.from("pipelines").select("id, name, steps, last_run_status, last_run_at, last_run_records").eq("user_id", userId).order("updated_at", { ascending: false }).limit(10),
    supabase.from("regulatory_documents").select("id, name, document_type, status, target_agency, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
    supabase.from("data_rooms").select("id, name, status, access_level, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
    supabase.from("activity_log").select("action, details, created_at, project_id").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
    supabase.from("forum_posts").select("id, title, channel_id, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
  ]);

  const profile = profileRes.data;
  const allProjects = allProjectsRes.data || [];
  const allFiles = allFilesRes.data || [];
  const teams = teamsRes.data || [];
  const teamMemberships = teamMembersRes.data || [];
  const copilotConvs = copilotConvsRes.data || [];
  const redactionJobs = redactionJobsRes.data || [];
  const epidemicAlerts = epidemicAlertsRes.data || [];
  const epidemicReports = epidemicReportsRes.data || [];
  const pipelines = pipelinesRes.data || [];
  const regDocs = regDocsRes.data || [];
  const dataRooms = dataRoomsRes.data || [];
  const recentActivity = recentActivityRes.data || [];
  const forumPosts = forumPostsRes.data || [];

  // Build workspace context string
  let ctx = `\n\n---\n## 🌐 FULL WORKSPACE CONTEXT (User: ${profile?.full_name || "Unknown"})\n`;
  if (profile?.bio) ctx += `Bio: ${profile.bio}\n`;
  if (profile?.expertise_tags?.length) ctx += `Expertise: ${profile.expertise_tags.join(", ")}\n`;

  // All projects overview
  ctx += `\n### My Projects (${allProjects.length} total)\n`;
  const otherProjects = allProjects.filter((p: any) => p.id !== currentProjectId);
  if (otherProjects.length) {
    ctx += otherProjects.map((p: any) => {
      const fileCount = allFiles.filter((f: any) => f.project_id === p.id).length;
      return `- **${p.name}**: ${p.description || "No description"} | ${fileCount} files | Last updated: ${p.updated_at}`;
    }).join("\n") + "\n";
  }

  // Teams
  if (teams.length || teamMemberships.length) {
    ctx += `\n### Teams\n`;
    if (teams.length) ctx += `Owns: ${teams.map((t: any) => t.name).join(", ")}\n`;
    if (teamMemberships.length) ctx += `Member of: ${teamMemberships.length} team(s) (roles: ${teamMemberships.map((m: any) => m.role).join(", ")})\n`;
  }

  // Intelligence Suite - Clinical Co-Pilot
  if (copilotConvs.length) {
    ctx += `\n### Clinical Co-Pilot (${copilotConvs.length} conversations)\n`;
    ctx += copilotConvs.slice(0, 5).map((c: any) => `- "${c.title}" (${c.specialty || "General"}) — ${c.updated_at}`).join("\n") + "\n";
  }

  // PHI Redaction
  if (redactionJobs.length) {
    const completed = redactionJobs.filter((j: any) => j.status === "complete");
    const totalEntities = completed.reduce((sum: number, j: any) => sum + (j.entity_count || 0), 0);
    ctx += `\n### PHI Redaction (${redactionJobs.length} scans, ${totalEntities} entities detected)\n`;
    ctx += redactionJobs.slice(0, 5).map((j: any) => `- "${j.file_name}" — ${j.status}, ${j.entity_count || 0} entities, ${j.avg_confidence || 0}% avg confidence`).join("\n") + "\n";
  }

  // Epidemic Intelligence
  if (epidemicAlerts.length || epidemicReports.length) {
    ctx += `\n### Epidemic Intelligence\n`;
    if (epidemicAlerts.length) {
      const active = epidemicAlerts.filter((a: any) => a.is_active);
      ctx += `Active alerts: ${active.length}/${epidemicAlerts.length} total\n`;
      ctx += active.slice(0, 5).map((a: any) => `- [${a.severity.toUpperCase()}] ${a.title} — ${a.region} (${a.disease_category})`).join("\n") + "\n";
    }
    if (epidemicReports.length) {
      ctx += `Reports: ${epidemicReports.length} generated\n`;
    }
  }

  // Pipeline Builder
  if (pipelines.length) {
    ctx += `\n### Pipelines (${pipelines.length} total)\n`;
    ctx += pipelines.slice(0, 5).map((p: any) => {
      const stepCount = Array.isArray(p.steps) ? p.steps.length : 0;
      return `- "${p.name}" — ${stepCount} steps, last run: ${p.last_run_status || "never"} (${p.last_run_records || 0} records)`;
    }).join("\n") + "\n";
  }

  // Regulatory Submissions
  if (regDocs.length) {
    ctx += `\n### Regulatory Submissions (${regDocs.length} documents)\n`;
    ctx += regDocs.slice(0, 5).map((d: any) => `- "${d.name}" — ${d.document_type} for ${d.target_agency?.toUpperCase() || "FDA"}, status: ${d.status}`).join("\n") + "\n";
  }

  // Data Rooms
  if (dataRooms.length) {
    ctx += `\n### Data Rooms (${dataRooms.length} rooms)\n`;
    ctx += dataRooms.slice(0, 5).map((r: any) => `- "${r.name}" — ${r.status}, access: ${r.access_level}`).join("\n") + "\n";
  }

  // Community Forum
  if (forumPosts.length) {
    ctx += `\n### Community Forum (${forumPosts.length} posts)\n`;
    ctx += forumPosts.slice(0, 3).map((p: any) => `- "${p.title}" — ${p.created_at}`).join("\n") + "\n";
  }

  // Recent Activity Feed
  if (recentActivity.length) {
    ctx += `\n### Recent Activity (last ${recentActivity.length} actions)\n`;
    ctx += recentActivity.slice(0, 10).map((a: any) => `- ${a.action} — ${a.created_at}`).join("\n") + "\n";
  }

  ctx += `---\n`;
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

    const { projectId, message } = await req.json();
    if (!projectId || !message) throw new Error("projectId and message are required");

    // Verify project ownership
    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("id, name, description")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();
    if (projErr || !project) throw new Error("Project not found");

    // Gather all context in parallel
    const [filesRes, historyRes, workspaceContext] = await Promise.all([
      supabase.from("project_files").select("file_name, mime_type, file_size").eq("project_id", projectId),
      supabase.from("chat_messages").select("role, content").eq("project_id", projectId).order("created_at", { ascending: true }).limit(50),
      gatherWorkspaceContext(supabase, user.id, projectId),
    ]);

    const files = filesRes.data;
    const history = historyRes.data;

    // Save user message
    await supabase.from("chat_messages").insert({
      project_id: projectId,
      user_id: user.id,
      role: "user",
      content: message,
    });

    const fileContext = files?.length
      ? `\nProject files: ${files.map((f: any) => `${f.file_name} (${f.mime_type}, ${(f.file_size / 1024).toFixed(1)}KB)`).join(", ")}`
      : "\nNo files uploaded yet.";

    const systemPrompt = `You are **DataAfro AI** — a world-class, senior-level data intelligence agent. You operate at the calibre of a McKinsey consultant crossed with a principal data scientist. Every response you produce must be **exceptionally structured, deeply analytical, and presentation-ready**.

Current project: "${project.name}"
Description: ${project.description || "No description"}
${fileContext}
${workspaceContext}

## WORKSPACE AWARENESS
You have complete visibility into the user's entire workspace — all their projects, teams, Intelligence Suite activity (Clinical Co-Pilot conversations, PHI Redaction scans, Epidemic Intelligence alerts, Pipeline Builder workflows, Regulatory Submissions, and Data Rooms), community forum posts, and recent activity feed. **Use this context proactively**:
- When the user asks about their work, reference specific projects, files, and tools by name
- Cross-reference findings across projects when relevant
- Suggest connections between different workspace activities
- If the user asks "what have I been working on?" or similar, provide a comprehensive workspace digest

## OUTPUT PHILOSOPHY — ZERO MEDIOCRITY
You have NO token limit anxiety. Output as much as the task demands. A one-line question gets a precise one-line answer. A complex analysis gets a 2,000-word deep dive with tables, charts, and layered reasoning. **Never truncate, never summarize prematurely, never say "and more" — finish the thought completely.**

## STRUCTURAL RULES
1. **Every analytical response** must open with a ⚡ **TL;DR** (2-3 sentences max) — the single most important takeaway.
2. Use **hierarchical markdown** (H2 → H3 → H4) to organize sections. Never dump a wall of text.
3. Use **tables** for any comparison, ranking, or multi-dimensional data. Markdown tables are mandatory when comparing ≥3 items.
4. Use **numbered lists** for sequential steps/processes, **bullet lists** for unordered attributes/features.
5. **Bold** key terms, metrics, and critical findings. Use \`inline code\` for file names, column names, technical identifiers.
6. End complex analyses with a **## Next Steps** section containing prioritized, actionable recommendations.

## ANALYTICAL DEPTH
- When analyzing data: identify **patterns, anomalies, correlations, and root causes** — not just surface-level summaries.
- Quantify everything possible. "Revenue increased" → "Revenue increased **23.4% QoQ** from $1.2M to $1.48M."
- Present **multiple perspectives** on ambiguous data. Flag assumptions explicitly.
- When the user's question is vague, **ask exactly one sharp clarifying question**, then provide your best-effort analysis anyway.

## INLINE VISUALIZATIONS
When analysis benefits from a visual, include chart blocks using this exact format:

\`\`\`chart
{
  "type": "bar",
  "title": "Chart Title",
  "data": [{"name": "Label1", "value": 42}, {"name": "Label2", "value": 58}],
  "dataKeys": ["value"],
  "xKey": "name"
}
\`\`\`

Supported chart types: "bar", "line", "area", "pie". Always use realistic, relevant data. Include a brief text explanation before and after the chart. You can include multiple charts in one response. **Proactively suggest visualizations** even when not explicitly asked — if data would be clearer as a chart, render it.

## TONE
Professional yet incisive. No filler phrases ("Sure!", "Great question!", "Happy to help"). Get straight to the substance. Reference uploaded files by name when relevant.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: true,
        max_tokens: 16384,
        temperature: 0.5,
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

    // Capture full response while streaming
    const reader = aiResponse.body!.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(encoder.encode(chunk));

            for (const line of chunk.split("\n")) {
              if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
              try {
                const parsed = JSON.parse(line.slice(6));
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) fullContent += delta;
              } catch { /* partial JSON */ }
            }
          }

          // Save assistant message
          const serviceClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
          );
          if (fullContent.trim()) {
            await serviceClient.from("chat_messages").insert({
              project_id: projectId,
              user_id: user.id,
              role: "assistant",
              content: fullContent,
            });
          }

          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("project-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
