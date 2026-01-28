import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Gemini API endpoint
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Helper function to make Gemini API request with retry
async function makeGeminiRequest(apiKey: string, systemPrompt: string, userPrompt: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) {
          return content;
        }
        throw new Error("No content in response");
      }

      // If rate limited and we have retries left, wait and retry
      if (response.status === 429 && attempt < retries) {
        console.log(`Rate limited, waiting ${attempt * 2} seconds before retry ${attempt + 1}/${retries}`);
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        continue;
      }

      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.log(`Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }

  throw new Error("Max retries exceeded");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { word, correctExplanation } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = "Tu es un assistant qui génère des quiz de vocabulaire pour enfants. Réponds toujours en JSON valide sans markdown.";

    const userPrompt = `Crée un quiz pour le mot français "${word}".
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

    let result;
    try {
      const rawText = await makeGeminiRequest(GEMINI_API_KEY, systemPrompt, userPrompt);
      
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
    } catch (error) {
      console.error('Gemini API error:', error);
      // Return fallback data so quiz can continue
      console.log('API error, using fallback options');
      return new Response(
        JSON.stringify({ 
          infinitive: word,
          wrongOptions: [
            "Une couleur vive",
            "Un animal de la forêt", 
            "Quelque chose de rond"
          ],
          fallback: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
