import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const languageConfig: Record<string, { teacherRole: string; rules: string; fallbackQuestions: { question: string; expectedAnswer: string }[] }> = {
  fr: {
    teacherRole: "Tu es un enseignant pour enfants de 6-8 ans.",
    rules: `Règles:
- Questions courtes et simples (1 phrase)
- Réponses attendues courtes (1-2 phrases maximum)
- Les questions doivent porter sur des éléments clés de l'histoire
- Utilise un vocabulaire adapté aux enfants de 6-8 ans
- Les réponses doivent être factuelles et basées sur le texte`,
    fallbackQuestions: [
      { question: "De quoi parle cette histoire?", expectedAnswer: "L'histoire parle de..." },
      { question: "Qui est le personnage principal?", expectedAnswer: "Le personnage principal est..." },
      { question: "Que s'est-il passé à la fin?", expectedAnswer: "À la fin..." }
    ]
  },
  de: {
    teacherRole: "Du bist ein Lehrer für Kinder von 6-8 Jahren.",
    rules: `Regeln:
- Kurze und einfache Fragen (1 Satz)
- Kurze erwartete Antworten (maximal 1-2 Sätze)
- Die Fragen müssen sich auf wichtige Elemente der Geschichte beziehen
- Verwende einen für Kinder von 6-8 Jahren geeigneten Wortschatz
- Die Antworten müssen faktisch und textbasiert sein`,
    fallbackQuestions: [
      { question: "Worum geht es in dieser Geschichte?", expectedAnswer: "Die Geschichte handelt von..." },
      { question: "Wer ist die Hauptfigur?", expectedAnswer: "Die Hauptfigur ist..." },
      { question: "Was ist am Ende passiert?", expectedAnswer: "Am Ende..." }
    ]
  },
  en: {
    teacherRole: "You are a teacher for children aged 6-8.",
    rules: `Rules:
- Short and simple questions (1 sentence)
- Short expected answers (1-2 sentences maximum)
- Questions must focus on key elements of the story
- Use vocabulary suitable for children aged 6-8
- Answers must be factual and text-based`,
    fallbackQuestions: [
      { question: "What is this story about?", expectedAnswer: "The story is about..." },
      { question: "Who is the main character?", expectedAnswer: "The main character is..." },
      { question: "What happened at the end?", expectedAnswer: "At the end..." }
    ]
  },
  es: {
    teacherRole: "Eres un profesor para niños de 6-8 años.",
    rules: `Reglas:
- Preguntas cortas y simples (1 frase)
- Respuestas esperadas cortas (máximo 1-2 frases)
- Las preguntas deben centrarse en elementos clave de la historia
- Usa vocabulario adecuado para niños de 6-8 años
- Las respuestas deben ser factuales y basadas en el texto`,
    fallbackQuestions: [
      { question: "¿De qué trata esta historia?", expectedAnswer: "La historia trata de..." },
      { question: "¿Quién es el personaje principal?", expectedAnswer: "El personaje principal es..." },
      { question: "¿Qué pasó al final?", expectedAnswer: "Al final..." }
    ]
  },
  nl: {
    teacherRole: "Je bent een leraar voor kinderen van 6-8 jaar.",
    rules: `Regels:
- Korte en eenvoudige vragen (1 zin)
- Korte verwachte antwoorden (maximaal 1-2 zinnen)
- De vragen moeten gaan over belangrijke elementen van het verhaal
- Gebruik een woordenschat die geschikt is voor kinderen van 6-8 jaar
- De antwoorden moeten feitelijk en gebaseerd op de tekst zijn`,
    fallbackQuestions: [
      { question: "Waar gaat dit verhaal over?", expectedAnswer: "Het verhaal gaat over..." },
      { question: "Wie is het hoofdpersonage?", expectedAnswer: "Het hoofdpersonage is..." },
      { question: "Wat gebeurde er aan het einde?", expectedAnswer: "Aan het einde..." }
    ]
  },
  it: {
    teacherRole: "Sei un insegnante per bambini di 6-8 anni.",
    rules: `Regole:
- Domande brevi e semplici (1 frase)
- Risposte attese brevi (massimo 1-2 frasi)
- Le domande devono riguardare elementi chiave della storia
- Usa un vocabolario adatto ai bambini di 6-8 anni
- Le risposte devono essere fattuali e basate sul testo`,
    fallbackQuestions: [
      { question: "Di cosa parla questa storia?", expectedAnswer: "La storia parla di..." },
      { question: "Chi è il personaggio principale?", expectedAnswer: "Il personaggio principale è..." },
      { question: "Cosa è successo alla fine?", expectedAnswer: "Alla fine..." }
    ]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storyContent, storyTitle, language = 'fr' } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = languageConfig[language] || languageConfig['fr'];

    const prompt = `${config.teacherRole} Voici une histoire:

Titre: "${storyTitle}"
Texte: "${storyContent}"

Crée exactement 3 questions de compréhension simples pour vérifier si l'enfant a compris l'histoire.

${config.rules}

Réponds UNIQUEMENT avec un JSON valide (pas de markdown):
{
  "questions": [
    {"question": "Question 1?", "expectedAnswer": "Réponse attendue 1"},
    {"question": "Question 2?", "expectedAnswer": "Réponse attendue 2"},
    {"question": "Question 3?", "expectedAnswer": "Réponse attendue 3"}
  ]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    let result;
    try {
      const cleanJson = rawText.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanJson);
    } catch {
      console.error('Failed to parse JSON:', rawText);
      result = { questions: config.fallbackQuestions };
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
