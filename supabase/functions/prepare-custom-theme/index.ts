import { getAuthenticatedUser } from '../_shared/auth.ts';
import { getCorsHeaders, handleCorsOptions } from '../_shared/cors.ts';

const GEMINI_MODEL = 'gemini-2.0-flash';

Deno.serve(async (req) => {
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;

  const headers = getCorsHeaders(req);

  try {
    const { userId } = await getAuthenticatedUser(req);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const { description, kid_language } = await req.json();
    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return new Response(JSON.stringify({ error: 'Description too short (min 10 chars)' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const systemPrompt = `Du bist ein Experte für Kinderpsychologie und Leseförderung.
Ein Elternteil möchte folgendes Lernthema für sein Kind:
"${description.trim()}"

Erstelle daraus ein strukturiertes Lernthema im gleichen Format wie die bestehenden Fablino-Lernthemen.

Antworte NUR als JSON:
{
  "name": { 
    "de": "Kurzer Titel (2-4 Wörter)",
    "fr": "Titre court (2-4 mots)", 
    "en": "Short title (2-4 words)", 
    "es": "Título corto (2-4 palabras)" 
  },
  "description": {
    "de": "Kind lernt, ... (1 Satz, beginnt mit 'Kind lernt')",
    "fr": "L'enfant apprend à ... (1 phrase)",
    "en": "Child learns to ... (1 sentence)",
    "es": "El niño aprende a ... (1 frase)"
  },
  "category": "social" | "emotional" | "character" | "cognitive",
  "story_guidance": "Konkreter Hinweis für die Story-Generierung auf Deutsch, z.B. 'Baue eine Szene ein in der die Hauptfigur eifersüchtig auf ein Geschwisterkind ist und lernt damit umzugehen'"
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('[prepare-custom-theme] Gemini error:', errText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(rawText);

    if (!parsed.name || !parsed.description || !parsed.category || !parsed.story_guidance) {
      throw new Error('Invalid response structure from Gemini');
    }

    console.log('[prepare-custom-theme] Success:', parsed.name?.de);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[prepare-custom-theme] Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});
