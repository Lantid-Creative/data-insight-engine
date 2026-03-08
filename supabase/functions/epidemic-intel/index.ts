import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { action, timeRange, diseaseFilter, customQuery } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    if (action === "analyze") {
      const prompt = `You are **DataAfro Epidemic Intelligence Engine** — a world-class epidemiological surveillance AI operating at WHO/CDC analyst level. Generate a rigorous, data-driven epidemic surveillance report that would satisfy a senior epidemiologist.

Parameters:
- Time Range: ${timeRange || "6 months"}
- Disease Filter: ${diseaseFilter || "all"}
${customQuery ? `- Analytical Focus: ${customQuery}` : ""}

## QUALITY MANDATES
- All numbers must be epidemiologically plausible and internally consistent
- Trend data must show realistic epidemiological curves (not random noise)
- Region data must reflect actual global health burden distribution
- Alerts must have actionable specificity — no generic "monitor the situation"
- Disease breakdown percentages must sum to exactly 100

Return a JSON object with EXACTLY this structure (no markdown, no code fences, just raw JSON):
{
  "summary": "3-4 sentence executive intelligence brief with specific metrics, key threat assessment, and strategic outlook — written like a WHO situation report opening paragraph",
  "totalCases": <number>,
  "activeOutbreaks": <number>,
  "resolvedOutbreaks": <number>,
  "affectedRegions": <number>,
  "trendData": [
    {"date": "Mon YYYY", "cases": <number>, "deaths": <number>, "recovered": <number>}
  ],
  "regionData": [
    {"name": "<region>", "cases": <number>, "change": <number>, "status": "rising|declining|stable"}
  ],
  "diseaseBreakdown": [
    {"name": "<category>", "value": <percentage>}
  ],
  "alerts": [
    {"severity": "critical|high|medium|low", "title": "<specific alert title with location>", "description": "Actionable 2-sentence intelligence brief with epidemiological context and recommended response", "region": "<region>", "diseaseCategory": "<category>", "caseCount": <number>, "changePercent": <number>}
  ]
}

Generate 8-10 trend data points showing realistic epidemic curves, 6-8 regions with accurate global burden distribution, 5-6 disease categories summing to 100, and 5-7 alerts with graduated severities. Base all data on real-world epidemiological patterns for ${diseaseFilter || "global infectious diseases"}.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          model: "google/gemini-3-flash-preview",
          max_tokens: 8192,
          temperature: 0.3,
        }),
      });

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`AI API error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      let parsed;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch {
        throw new Error("Failed to parse AI response as JSON");
      }

      return new Response(JSON.stringify({ success: true, data: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "deep-analysis") {
      const prompt = `You are **DataAfro Epidemic Intelligence Engine** — a senior epidemiologist AI producing a comprehensive threat assessment. Your analysis must be **publication-grade, deeply structured, and evidence-anchored**.

## ANALYTICAL QUERY
"${customQuery}"

Time context: ${timeRange || "recent"}
Disease focus: ${diseaseFilter || "all diseases"}

## REQUIRED OUTPUT STRUCTURE (use markdown)

### ⚡ Executive Intelligence Summary
2-3 sentences: the single most critical takeaway from this analysis.

### 1. Current Epidemiological Situation
- Case counts, incidence rates, R₀/Rₜ estimates where applicable
- Geographic spread pattern and velocity
- Comparison to baseline/historical norms with specific numbers

### 2. Transmission Dynamics & Risk Factors
- Primary transmission routes with evidence
- Environmental/seasonal factors with quantified impact
- Super-spreader event analysis if applicable
- Table comparing risk factors by magnitude

### 3. Vulnerable Population Analysis
| Population Group | Risk Level | Key Factors | Estimated Impact |
Use tables. Be specific about demographics, comorbidities, and geographic vulnerability.

### 4. Intervention Framework
Prioritized by impact and feasibility:
| Intervention | Expected Impact | Timeline | Resource Requirements |
Include both pharmaceutical and non-pharmaceutical interventions.

### 5. Scenario Projections
**Best Case**: specific metrics and conditions
**Most Likely**: specific metrics and conditions
**Worst Case**: specific metrics and conditions
Include projected case counts, timelines, and trigger indicators for each scenario.

### 6. Strategic Recommendations
Numbered, time-bound, with assigned responsibility levels (local/national/international).

Be specific with data points. Reference real epidemiological patterns, WHO guidelines, and established surveillance frameworks. **No filler — every sentence must carry analytical weight.**`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          model: "google/gemini-3-flash-preview",
          max_tokens: 16384,
          temperature: 0.4,
          stream: false,
        }),
      });

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!response.ok) throw new Error(`AI API error: ${response.status}`);

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ success: true, analysis: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
