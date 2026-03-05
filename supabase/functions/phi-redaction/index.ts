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
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { text, fileName, fileSize } = await req.json();
    if (!text || typeof text !== "string") throw new Error("text is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from("redaction_jobs")
      .insert({
        user_id: user.id,
        file_name: fileName || "Pasted Text",
        file_size: fileSize || text.length,
        original_text: text,
        status: "scanning",
      })
      .select()
      .single();

    if (jobError) throw new Error("Failed to create redaction job: " + jobError.message);

    // Audit: scan started
    await supabase.from("redaction_audit_log").insert({
      user_id: user.id,
      job_id: job.id,
      action: "scan_started",
      details: { file_name: fileName, text_length: text.length },
    });

    // Call AI to detect PHI entities
    const systemPrompt = `You are a HIPAA-compliant PHI detection engine. Analyze the provided text and identify ALL Protected Health Information (PHI) entities per the HIPAA Safe Harbor method (18 identifiers).

For each entity found, return a JSON array of objects with these fields:
- "entity_type": one of "Patient Name", "SSN", "Phone Number", "Address", "MRN", "Date of Birth", "Email", "Account Number", "License Number", "Vehicle ID", "Device ID", "IP Address", "Biometric ID", "Photo", "Health Plan Number", "Certificate Number", "Fax Number", "URL"
- "original_value": the exact text found
- "redacted_value": the replacement tag like [REDACTED_NAME], [REDACTED_SSN], etc.
- "confidence": a number 0-100 representing detection confidence
- "start_index": approximate character index where the entity starts in the text
- "end_index": approximate character index where the entity ends

CRITICAL: Return ONLY the JSON array, no markdown, no explanation, no code blocks. Just the raw JSON array.
If no PHI is found, return an empty array: []`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        temperature: 0.1,
        max_tokens: 8192,
      }),
    });

    if (aiResponse.status === 429) {
      await supabase.from("redaction_jobs").update({ status: "failed" }).eq("id", job.id);
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResponse.status === 402) {
      await supabase.from("redaction_jobs").update({ status: "failed" }).eq("id", job.id);
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      await supabase.from("redaction_jobs").update({ status: "failed" }).eq("id", job.id);
      throw new Error("AI service error");
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "[]";

    // Parse entities - strip any markdown code blocks
    let entities: any[] = [];
    try {
      const cleaned = rawContent.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
      entities = JSON.parse(cleaned);
      if (!Array.isArray(entities)) entities = [];
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      entities = [];
    }

    // Build redacted text
    let redactedText = text;
    // Sort entities by start_index descending so replacements don't shift indices
    const sortedEntities = [...entities].sort((a, b) => (b.start_index || 0) - (a.start_index || 0));
    for (const entity of sortedEntities) {
      if (entity.original_value) {
        redactedText = redactedText.replaceAll(entity.original_value, entity.redacted_value || "[REDACTED]");
      }
    }

    // Save entities to DB
    if (entities.length > 0) {
      const entityRows = entities.map((e: any) => ({
        job_id: job.id,
        user_id: user.id,
        entity_type: e.entity_type || "Unknown",
        original_value: e.original_value || "",
        redacted_value: e.redacted_value || "[REDACTED]",
        confidence: e.confidence || 0,
        start_index: e.start_index || 0,
        end_index: e.end_index || 0,
        is_redacted: true,
      }));
      await supabase.from("redaction_entities").insert(entityRows);
    }

    // Calculate avg confidence
    const avgConfidence = entities.length > 0
      ? entities.reduce((sum: number, e: any) => sum + (e.confidence || 0), 0) / entities.length
      : 0;

    // Update job as complete
    await supabase.from("redaction_jobs").update({
      redacted_text: redactedText,
      status: "complete",
      entity_count: entities.length,
      avg_confidence: Math.round(avgConfidence * 100) / 100,
      completed_at: new Date().toISOString(),
    }).eq("id", job.id);

    // Audit: scan completed
    await supabase.from("redaction_audit_log").insert({
      user_id: user.id,
      job_id: job.id,
      action: "scan_completed",
      details: { entity_count: entities.length, avg_confidence: avgConfidence },
    });

    // Audit: auto-redaction applied
    await supabase.from("redaction_audit_log").insert({
      user_id: user.id,
      job_id: job.id,
      action: "auto_redaction_applied",
      details: { entities_redacted: entities.length },
    });

    return new Response(JSON.stringify({
      job_id: job.id,
      entities,
      redacted_text: redactedText,
      entity_count: entities.length,
      avg_confidence: avgConfidence,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("phi-redaction error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
