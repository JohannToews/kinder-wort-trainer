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
    const { length, difficulty, description, childAge, schoolLevel } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Map length to approximate word count
    const lengthMap: Record<string, string> = {
      short: "100-150 Wörter",
      medium: "200-300 Wörter",
      long: "400-500 Wörter",
    };

    // Map difficulty to vocabulary complexity
    const difficultyMap: Record<string, string> = {
      easy: "sehr einfache Wörter, kurze Sätze, grundlegende Grammatik",
      medium: "moderate Komplexität, einige längere Sätze, alltägliche Vokabeln",
      difficult: "reichhaltigerer Wortschatz, komplexere Satzstrukturen, literarische Elemente",
    };

    const systemPrompt = `Du bist ein erfahrener Kinderbuchautor, der französische Geschichten für Kinder schreibt.
Du erstellst kindgerechte, pädagogisch wertvolle Geschichten auf Französisch.
Die Geschichten sollen das Leseverständnis fördern und altersgerecht sein.

WICHTIG: 
- Schreibe NUR auf Französisch
- Die Geschichte soll für ein ${childAge}-jähriges Kind sein (Schulniveau: ${schoolLevel})
- Verwende ${difficultyMap[difficulty] || difficultyMap.medium}
- Die Geschichte soll ${lengthMap[length] || lengthMap.medium} lang sein
- Erstelle auch einen passenden französischen Titel`;

    const userPrompt = `Erstelle eine französische Geschichte basierend auf dieser Beschreibung: "${description}"

Antworte im folgenden JSON-Format:
{
  "title": "Der französische Titel der Geschichte",
  "content": "Der vollständige Text der Geschichte auf Französisch"
}

Achte darauf, dass die Geschichte:
1. Einen klaren Anfang, Mittelteil und Ende hat
2. Interessant und spannend für Kinder ist
3. Positive Werte vermittelt
4. Dem gewünschten Schwierigkeitsgrad entspricht`;

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit erreicht. Bitte versuche es später erneut." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Zahlungsproblem. Bitte kontaktiere den Administrator." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in response");
    }

    // Parse the JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse story JSON");
    }

    const story = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(story), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating story:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
