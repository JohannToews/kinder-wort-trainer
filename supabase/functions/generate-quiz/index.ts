import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { word, correctExplanation } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `Crée un quiz pour le mot français "${word}".
La bonne réponse est: "${correctExplanation}"

IMPORTANT: Si le mot "${word}" est un verbe conjugué, convertis-le d'abord en infinitif.
Par exemple: "dépasse" → "dépasser", "mangeons" → "manger", "allait" → "aller"

Génère 3 FAUSSES réponses qui:
- Sont plausibles mais incorrectes
- Ont la même longueur que la bonne réponse (environ ${correctExplanation.split(' ').length} mots)
- Sont en français simple pour enfant de 7 ans
- Ne sont PAS des synonymes de la bonne réponse

Réponds UNIQUEMENT avec un JSON valide (pas de markdown):
{
  "infinitive": "le mot en infinitif (si verbe) ou le mot original",
  "wrongOptions": ["fausse réponse 1", "fausse réponse 2", "fausse réponse 3"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Tu es un assistant qui génère des quiz de vocabulaire pour enfants. Réponds toujours en JSON valide sans markdown." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add credits' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || '';
    
    let result;
    try {
      const cleanJson = rawText.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanJson);
    } catch {
      console.error('Failed to parse JSON:', rawText);
      result = { 
        infinitive: word,
        wrongOptions: [
          "Une couleur vive",
          "Un animal de la forêt", 
          "Quelque chose de rond"
        ] 
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
