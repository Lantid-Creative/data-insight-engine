import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
      const prompt = `You are an epidemic intelligence AI analyst. Generate a realistic, data-driven epidemic surveillance report.

Parameters:
- Time Range: ${timeRange || "6 months"}
- Disease Filter: ${diseaseFilter || "all"}
${customQuery ? `- User Query: ${customQuery}` : ""}

Return a JSON object with EXACTLY this structure (no markdown, no code fences, just raw JSON):
{
  "summary": "2-3 sentence executive summary of the current global surveillance picture",
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
    {"severity": "critical|high|medium|low", "title": "<alert title>", "description": "<1-2 sentence description>", "region": "<region>", "diseaseCategory": "<category>", "caseCount": <number>, "changePercent": <number>}
  ]
}

Generate 8 trend data points, 6 regions, 5 disease categories (summing to 100), and 4-6 alerts with varying severities. Make data realistic for current global health surveillance patterns. Focus on real-world disease patterns and regions.`;

      const response = await fetch("https://lovable.dev/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          model: "google/gemini-2.5-flash",
          stream: false,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`AI API error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || data.content || "";

      // Parse JSON from response
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
      const prompt = `You are an epidemic intelligence expert. Provide a detailed analysis for this query:

"${customQuery}"

Time context: ${timeRange || "recent"}
Disease focus: ${diseaseFilter || "all diseases"}

Provide a thorough, evidence-based analysis in markdown format covering:
1. Current situation assessment
2. Key risk factors and transmission dynamics
3. Vulnerable populations
4. Recommended interventions
5. Projected trajectory (best/worst/likely scenarios)

Be specific with data points and cite realistic epidemiological patterns.`;

      const response = await fetch("https://lovable.dev/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          model: "google/gemini-2.5-flash",
          stream: false,
        }),
      });

      if (!response.ok) throw new Error(`AI API error: ${response.status}`);

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || data.content || "";

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
