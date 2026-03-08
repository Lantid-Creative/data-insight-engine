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

    // Get project files for context
    const { data: files } = await supabase
      .from("project_files")
      .select("file_name, mime_type, file_size")
      .eq("project_id", projectId);

    // Get recent chat history
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })
      .limit(50);

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

    // We need to capture the full response to save it, while also streaming
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
            // Pass through to client
            controller.enqueue(encoder.encode(chunk));

            // Parse for saving
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
