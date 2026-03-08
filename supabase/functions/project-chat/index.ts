import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function gatherWorkspaceContext(supabase: any, userId: string, currentProjectId: string) {
  const [
    profileRes, allProjectsRes, allFilesRes, teamsRes, teamMembersRes,
    copilotConvsRes, redactionJobsRes, epidemicAlertsRes, epidemicReportsRes,
    pipelinesRes, regDocsRes, dataRoomsRes, recentActivityRes, forumPostsRes,
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

  let ctx = `

---
## 🌐 FULL WORKSPACE CONTEXT (User: ${profile?.full_name || "Unknown"})
`;
  if (profile?.bio) ctx += `Bio: ${profile.bio}\n`;
  if (profile?.expertise_tags?.length) ctx += `Expertise: ${profile.expertise_tags.join(", ")}\n`;

  ctx += `
### My Projects (${allProjects.length} total)
`;
  const otherProjects = allProjects.filter((p: any) => p.id !== currentProjectId);
  if (otherProjects.length) {
    ctx += otherProjects.map((p: any) => {
      const fileCount = allFiles.filter((f: any) => f.project_id === p.id).length;
      return `- **${p.name}**: ${p.description || "No description"} | ${fileCount} files | Last updated: ${p.updated_at}`;
    }).join("\n") + "\n";
  }

  if (teams.length || teamMemberships.length) {
    ctx += `
### Teams
`;
    if (teams.length) ctx += `Owns: ${teams.map((t: any) => t.name).join(", ")}\n`;
    if (teamMemberships.length) ctx += `Member of: ${teamMemberships.length} team(s) (roles: ${teamMemberships.map((m: any) => m.role).join(", ")})\n`;
  }

  if (copilotConvs.length) {
    ctx += `
### Clinical Co-Pilot (${copilotConvs.length} conversations)
`;
    ctx += copilotConvs.slice(0, 5).map((c: any) => `- "${c.title}" (${c.specialty || "General"}) — ${c.updated_at}`).join("\n") + "\n";
  }

  if (redactionJobs.length) {
    const completed = redactionJobs.filter((j: any) => j.status === "complete");
    const totalEntities = completed.reduce((sum: number, j: any) => sum + (j.entity_count || 0), 0);
    ctx += `
### PHI Redaction (${redactionJobs.length} scans, ${totalEntities} entities detected)
`;
    ctx += redactionJobs.slice(0, 5).map((j: any) => `- "${j.file_name}" — ${j.status}, ${j.entity_count || 0} entities, ${j.avg_confidence || 0}% avg confidence`).join("\n") + "\n";
  }

  if (epidemicAlerts.length || epidemicReports.length) {
    ctx += `
### Epidemic Intelligence
`;
    if (epidemicAlerts.length) {
      const active = epidemicAlerts.filter((a: any) => a.is_active);
      ctx += `Active alerts: ${active.length}/${epidemicAlerts.length} total\n`;
      ctx += active.slice(0, 5).map((a: any) => `- [${a.severity.toUpperCase()}] ${a.title} — ${a.region} (${a.disease_category})`).join("\n") + "\n";
    }
    if (epidemicReports.length) ctx += `Reports: ${epidemicReports.length} generated\n`;
  }

  if (pipelines.length) {
    ctx += `
### Pipelines (${pipelines.length} total)
`;
    ctx += pipelines.slice(0, 5).map((p: any) => {
      const stepCount = Array.isArray(p.steps) ? p.steps.length : 0;
      return `- "${p.name}" — ${stepCount} steps, last run: ${p.last_run_status || "never"} (${p.last_run_records || 0} records)`;
    }).join("\n") + "\n";
  }

  if (regDocs.length) {
    ctx += `
### Regulatory Submissions (${regDocs.length} documents)
`;
    ctx += regDocs.slice(0, 5).map((d: any) => `- "${d.name}" — ${d.document_type} for ${d.target_agency?.toUpperCase() || "FDA"}, status: ${d.status}`).join("\n") + "\n";
  }

  if (dataRooms.length) {
    ctx += `
### Data Rooms (${dataRooms.length} rooms)
`;
    ctx += dataRooms.slice(0, 5).map((r: any) => `- "${r.name}" — ${r.status}, access: ${r.access_level}`).join("\n") + "\n";
  }

  if (forumPosts.length) {
    ctx += `
### Community Forum (${forumPosts.length} posts)
`;
    ctx += forumPosts.slice(0, 3).map((p: any) => `- "${p.title}" — ${p.created_at}`).join("\n") + "\n";
  }

  if (recentActivity.length) {
    ctx += `
### Recent Activity (last ${recentActivity.length} actions)
`;
    ctx += recentActivity.slice(0, 10).map((a: any) => `- ${a.action} — ${a.created_at}`).join("\n") + "\n";
  }

  ctx += `---\n`;
  return ctx;
}

// Tool definitions for artifact generation
const ARTIFACT_TOOLS = [
  {
    type: "function",
    function: {
      name: "create_artifact",
      description: `Create an interactive artifact when the user asks you to BUILD, CREATE, MAKE, or GENERATE something functional — such as a calculator, dashboard, form, tracker, tool, visualization, converter, or any interactive widget. Also create artifacts for rich structured documents like comparison tables, checklists, scorecards, and templates. Do NOT create artifacts for simple Q&A, summaries, or explanations — just respond normally in those cases.`,
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short descriptive title for the artifact" },
          description: { type: "string", description: "Brief description of what this artifact does" },
          artifact_type: {
            type: "string",
            enum: ["visualization", "form", "code", "document", "dashboard", "calculator", "tracker"],
            description: "Type of artifact to create"
          },
          content: {
            type: "object",
            description: "The artifact content structure",
            properties: {
              html: { type: "string", description: "Complete self-contained HTML with inline CSS and JavaScript that renders the artifact. Use modern CSS (flexbox/grid), clean design with a dark theme (#1a1a2e background, #e2e8f0 text, #f97316 accent). Must be fully functional and interactive. Include all logic inline. No external dependencies except CDN links for Chart.js or similar if needed." },
              summary: { type: "string", description: "Plain text summary of what this artifact does and how to use it" },
            },
            required: ["html", "summary"],
          },
        },
        required: ["title", "description", "artifact_type", "content"],
      },
    },
  },
];

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

    const { data: project, error: projErr } = await supabase
      .from("projects").select("id, name, description")
      .eq("id", projectId).eq("user_id", user.id).single();
    if (projErr || !project) throw new Error("Project not found");

    const [filesRes, historyRes, workspaceContext] = await Promise.all([
      supabase.from("project_files").select("file_name, mime_type, file_size").eq("project_id", projectId),
      supabase.from("chat_messages").select("role, content").eq("project_id", projectId).order("created_at", { ascending: true }).limit(50),
      gatherWorkspaceContext(supabase, user.id, projectId),
    ]);

    const files = filesRes.data;
    const history = historyRes.data;

    // Save user message
    const { data: savedMsg } = await supabase.from("chat_messages").insert({
      project_id: projectId, user_id: user.id, role: "user", content: message,
    }).select("id").single();

    const fileContext = files?.length
      ? `
Project files: ${files.map((f: any) => `${f.file_name} (${f.mime_type}, ${(f.file_size / 1024).toFixed(1)}KB)`).join(", ")}`
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

## ARTIFACT CREATION — CRITICAL
You have the ability to create **live, interactive artifacts** using the \`create_artifact\` tool. Use it when the user asks you to BUILD, CREATE, MAKE, or GENERATE something functional:
- Calculators, converters, estimators
- Interactive dashboards with charts
- Forms, surveys, questionnaires
- Data trackers, timelines, kanban boards
- Comparison tables, scorecards, matrices
- Code tools, generators, validators
- Any interactive widget or mini-application

**When creating HTML artifacts:**
- Use a clean, modern dark theme: background #0f0f23, cards #1a1a2e, text #e2e8f0, accent #f97316 (orange)
- Make them FULLY FUNCTIONAL with real interactivity (buttons work, calculations happen, data updates)
- Use modern CSS (flexbox, grid, border-radius, subtle shadows)
- Include pleasant micro-interactions and transitions
- For charts, use Chart.js via CDN: https://cdn.jsdelivr.net/npm/chart.js
- For icons, use simple SVG or emoji
- Make forms actually validate and show results
- Ensure responsive design
- The HTML must be completely self-contained — everything in one HTML string
- NEVER use placeholder/dummy functionality — make everything REAL and WORKING

Do NOT create artifacts for simple Q&A, explanations, or text-heavy responses. Just answer normally.

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

Supported chart types: "bar", "line", "area", "pie". Always use realistic, relevant data.

## TONE
Professional yet incisive. No filler phrases ("Sure!", "Great question!", "Happy to help"). Get straight to the substance.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // First call: check if the AI wants to create an artifact (non-streaming with tools)
    const toolCheckResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        tools: ARTIFACT_TOOLS,
        tool_choice: "auto",
        max_tokens: 16384,
        temperature: 0.5,
      }),
    });

    if (toolCheckResponse.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (toolCheckResponse.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!toolCheckResponse.ok) {
      const errText = await toolCheckResponse.text();
      console.error("AI API error:", toolCheckResponse.status, errText);
      throw new Error(`AI service error: ${toolCheckResponse.status}`);
    }

    const toolCheckData = await toolCheckResponse.json();
    const choice = toolCheckData.choices?.[0];
    const toolCalls = choice?.message?.tool_calls;

    // If the AI called the create_artifact tool
    if (toolCalls && toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      if (toolCall.function?.name === "create_artifact") {
        let artifactData: any;
        try {
          artifactData = JSON.parse(toolCall.function.arguments);
        } catch {
          throw new Error("Failed to parse artifact data");
        }

        // Save artifact to database
        const serviceClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const { data: artifact, error: artifactErr } = await serviceClient
          .from("artifacts")
          .insert({
            project_id: projectId,
            user_id: user.id,
            chat_message_id: savedMsg?.id || null,
            title: artifactData.title,
            description: artifactData.description,
            artifact_type: artifactData.artifact_type,
            content: artifactData.content,
          })
          .select("id")
          .single();

        if (artifactErr) {
          console.error("Failed to save artifact:", artifactErr);
        }

        // Now do a second streaming call to get the text response
        // Include the tool result so the AI can reference the artifact
        const followUpMessages = [
          ...messages,
          choice.message, // the assistant message with tool_call
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              success: true,
              artifact_id: artifact?.id || "created",
              title: artifactData.title,
            }),
          },
        ];

        const streamResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: followUpMessages,
            stream: true,
            max_tokens: 4096,
            temperature: 0.5,
          }),
        });

        if (!streamResponse.ok) {
          // Fallback: return a non-streaming response with the artifact info
          const fallbackContent = `${artifactData.content.summary}\n\n*Artifact "${artifactData.title}" has been created and is displayed above.*`;
          
          await serviceClient.from("chat_messages").insert({
            project_id: projectId, user_id: user.id, role: "assistant", content: fallbackContent,
          });

          // Create a synthetic SSE response with artifact metadata
          const encoder = new TextEncoder();
          const body = encoder.encode(
            `data: ${JSON.stringify({ choices: [{ delta: { content: fallbackContent } }] })}\n\n` +
            `data: ${JSON.stringify({ choices: [{ delta: {} }], artifact: { id: artifact?.id, ...artifactData } })}\n\n` +
            `data: [DONE]\n\n`
          );

          return new Response(body, {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }

        // Stream the follow-up response, prepend artifact metadata
        const reader = streamResponse.body!.getReader();
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        let fullContent = "";

        const stream = new ReadableStream({
          async start(controller) {
            try {
              // First, send the artifact metadata as a special event
              const artifactEvent = `data: ${JSON.stringify({
                artifact: {
                  id: artifact?.id,
                  title: artifactData.title,
                  description: artifactData.description,
                  artifact_type: artifactData.artifact_type,
                  content: artifactData.content,
                },
              })}\n\n`;
              controller.enqueue(encoder.encode(artifactEvent));

              // Then stream the text response
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
                  } catch { /* partial */ }
                }
              }

              // Save assistant message
              if (fullContent.trim()) {
                await serviceClient.from("chat_messages").insert({
                  project_id: projectId, user_id: user.id, role: "assistant", content: fullContent,
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
      }
    }

    // No tool call — regular streaming response
    const regularContent = choice?.message?.content || "";
    
    // If we got a non-streaming response with content, re-stream it
    // But better: make a new streaming call
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

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errText);
      throw new Error(`AI service error: ${aiResponse.status}`);
    }

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
              } catch { /* partial */ }
            }
          }

          const serviceClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
          );
          if (fullContent.trim()) {
            await serviceClient.from("chat_messages").insert({
              project_id: projectId, user_id: user.id, role: "assistant", content: fullContent,
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
