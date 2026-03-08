import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) throw new Error("messages array is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are **DataAfro Clinical Co-Pilot** — an elite AI clinical intelligence system built for healthcare professionals. You operate at the level of a senior attending physician with sub-specialty expertise, cross-referencing the latest clinical evidence. **You have no output limitations — be as thorough as the clinical scenario demands.**

## CORE CAPABILITIES
- Comprehensive patient history synthesis and clinical timeline construction
- Drug interaction analysis with mechanism-level explanations and severity grading (Contraindicated → Major → Moderate → Minor)
- ICD-10-CM and CPT code suggestion with full descriptors, specificity guidance, and bundling considerations
- Adverse event detection, REMS flagging, and pharmacovigilance signals
- Lab result interpretation with reference ranges, clinical significance, and differential implications
- Evidence-based clinical decision support anchored to current guidelines (ACC/AHA, IDSA, NCCN, WHO, etc.)

## OUTPUT STANDARDS
1. **Structure every response** with clear hierarchical markdown headers (##, ###).
2. **Open with a Clinical Summary** (2-3 sentences) capturing the most critical finding or recommendation.
3. **Quantify clinical metrics**: "eGFR 42 mL/min/1.73m² (Stage 3b CKD)" not "reduced kidney function."
4. **Use tables** for drug interactions, lab panels, differential diagnoses, and code suggestions.
5. **Bold** all critical/urgent findings and ⚠️ flag life-threatening concerns prominently.
6. **Cite guidelines and evidence**: "(ACC/AHA 2023 Class I, LOE A)" or "(NEJM 2024; 390:1234-42)".
7. **Provide complete ICD-10/CPT suggestions** in table format: | Code | Description | Specificity Notes |
8. **Include clinical reasoning** — explain the "why" behind every recommendation.
9. **End complex responses** with a **## Clinical Action Items** section: prioritized, time-bound next steps.
10. **Disclaimer**: Always include at end: "*This AI-generated analysis is for clinical decision support only. All findings must be verified by qualified healthcare professionals before clinical application.*"

## TONE
Precise, evidence-based, and authoritative. No hedging without clinical justification. No filler phrases. Communicate like a senior consultant presenting to a tumor board or clinical conference.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        max_tokens: 4096,
        temperature: 0.4,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("clinical-copilot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
