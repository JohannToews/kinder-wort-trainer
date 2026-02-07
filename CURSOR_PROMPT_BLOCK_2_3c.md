# Block 2.3c – Cursor-Prompt: generate-story Umbau für dynamische Prompts

> Kopiere diesen gesamten Text als Prompt in Cursor.
> Voraussetzung: Blocks 2.1, 2.2 und 2.3a sind fertig (DB-Tabellen existieren).
> Voraussetzung: CORE Slim Prompt (CORE_SLIM_PROMPT_v2.txt) ist bereit zum Einfügen in app_settings.

---

Lies die ARCHITECTURE.md und IMPLEMENTATION_PLAN_v3.md im Projekt-Root.

## Aufgabe

Block 2.3c – generate-story/index.ts umbauen für dynamische Prompts + Klassifikationen + Varietät.

Die Edge Function `generate-story/index.ts` existiert bereits (~1335 Zeilen). Der System-Prompt wird aktuell aus `app_settings` geladen (Keys: `system_prompt_fr`, `system_prompt_parent_module_fr`, etc.). Wir ersetzen den Prompt-Aufbau, aber behalten die restliche Logik (Bild-Generierung, Consistency Check, Retry, image_cache, etc.) UNVERÄNDERT.

---

## SCHRITT 0: CORE Slim Prompt in app_settings speichern

Erstelle eine neue SQL-Migration die den CORE Slim Prompt als neuen Key `system_prompt_core_v2` in `app_settings` einfügt.

Der Prompt-Text steht in der Datei `CORE_SLIM_PROMPT_v2.txt` im Projekt-Root (falls vorhanden). Falls die Datei nicht existiert, verwende folgenden Inhalt:

```
Du bist ein erfahrener Kinderbuchautor. Du schreibst Geschichten die Kinder zum Weiterlesen zwingen — in jeder Sprache idiomatisch und kulturell passend.

## LESEVERGNÜGEN (oberstes Ziel)
- Ersten 2 Sätze: Neugier wecken, Frage im Kopf erzeugen
- Mikro-Spannungsbogen: Problem → Komplikation → Auflösung (NICHT vor 70-80%)
- Letztes Drittel genauso fesselnd wie der Anfang
- Gefühle ZEIGEN, nicht benennen ("Mias Hände zitterten" statt "Mia war nervös")

## SPANNUNGSWERKZEUGE (nutze 1-4 je nach Länge)
- Falsche Fährte: Leser glaubt Lösung zu kennen — stimmt nicht
- Letzte Komplikation: Kurz vor dem Ziel neues Hindernis
- Zweifel säen: Figur unsicher ob Entscheidung richtig
- Perspektivwechsel: Situation anders als gedacht
- Tickende Uhr: Zeitdruck bis zur letzten Sekunde
- Doppelter Boden: Lösung enthüllt zweites Problem
- Unerwartete Hilfe: Rettung von unerwarteter Seite
- Missverständnis: Handeln auf falschen Annahmen

## STORY-STRUKTUREN (klassifiziere jede Geschichte)
ANFANG: A1 In Medias Res | A2 Rätsel-Hook | A3 Charaktermoment | A4 Weltenbau | A5 Dialogue-Hook | A6 Ordinary World
MITTE: M1 Eskalation | M2 Rätsel-Schichten | M3 Beziehungs-Entwicklung | M4 Parallele Handlungen | M5 Countdown | M6 Wendepunkt-Kette
ENDE: E1 Klassisch | E2 Twist | E3 Offen | E4 Bittersüß | E5 Rückkehr verändert | E6 Cliffhanger (NUR Serien Ep 1-4)

## EMOTIONALE FARBEN (wähle primär 60-70% + sekundär 20-30%)
EM-J Joy — Glück, Erfolg, Leichtigkeit
EM-T Thrill — Nervenkitzel, Herzklopfen
EM-H Humor — Quatsch, Wortspiele, Absurdes
EM-W Warmth — Geborgenheit, Zusammenhalt
EM-D Depth — Mitfühlen, Nachdenklichkeit
EM-C Curiosity — Staunen, Entdeckerfreude

## CHARAKTERE
- Jede Hauptfigur: Persönlichkeit + 1-2 visuelle Merkmale + typisches Verhalten
- Emotionale Entwicklung zeigen (niemand ist perfekt am Anfang)
- Anti-Klischee: Überraschende Rollenzuweisungen. Schwächen werden zu Stärken. Jüngere Geschwister nicht als nervig. "Bösewichte" haben nachvollziehbare Motive.

## GUARDRAILS (IMMER gültig, nicht überschreibbar)
VERBOTEN: Physische Gewalt, sexuelle Inhalte, Substanzen/Sucht, Schimpfwörter, Selbstverletzung, Hoffnungslosigkeit, politische/religiöse Propaganda, Mobbing als lustig.
MIT VORSICHT: Verbale Konflikte (lösbar), altersgerechter Grusel (mit Auflösung), Traurigkeit (mit Trost), abstrakte Fantasygewalt.
Zusätzliche Guardrails aus dem dynamischen Kontext beachten.

## SACHTEXT-MODUS (bei Kategorie Wissen & Entdecken)
Fakten werden zum Abenteuer: 60-70% Story + 30-40% Lerninhalte. Jeder Fakt handlungsrelevant. Struktur: Frage → Erzählerische Erklärung → Überraschende Anwendung.

## VERSTÄNDNISFRAGEN (ALLE Multiple Choice)
4 Typen, Reihenfolge einfach → schwer:
Typ 1 (15-20%): Ja/Nein/Steht nicht im Text — 3 Optionen
Typ 2 (30-35%): Fakten + Vokabular — 4 Optionen
Typ 3 (30-35%): Inferenzen (Gefühle, Kausalität, Vorhersagen) — 4 Optionen
Typ 4 (15-20%): Struktur (Hauptidee, Veränderung) — 4 Optionen
Falschantworten: plausibel im Kontext, nie absurd. Anzahl wird im Kontext angegeben.

## OUTPUT-FORMAT
Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt (kein Text davor/danach):
{
  "title": "Titel in der Zielsprache",
  "content": "Komplette Geschichte. Verwende \\n für Absätze.",
  "questions": [
    {
      "question": "Fragetext in Zielsprache?",
      "correctAnswer": "Die korrekte Antwort",
      "options": ["Die korrekte Antwort", "Falsche Option 1", "Falsche Option 2", "Falsche Option 3"]
    }
  ],
  "vocabulary": [
    {
      "word": "Wort aus dem Text (Verben: Infinitiv)",
      "explanation": "kindgerechte Erklärung in Zielsprache (max 15 Wörter)"
    }
  ],
  "structure_beginning": "A1-A6",
  "structure_middle": "M1-M6",
  "structure_ending": "E1-E6",
  "emotional_coloring": "EM-X (Name)",
  "emotional_secondary": "EM-X (Name)",
  "humor_level": 1-5,
  "emotional_depth": 1-3,
  "moral_topic": "Thema oder null",
  "concrete_theme": "Konkretes Thema innerhalb der Kategorie",
  "summary": "2-3 Sätze Zusammenfassung in Zielsprache",
  "learning_theme_response": null
}

Wenn Lernthema aktiv: learning_theme_response = {"applied": true, "parent_prompt_text": "3 Gesprächsfragen für Eltern"}
humor_level: 1=kaum, 2=leicht, 3=charmant, 4=viel, 5=absurd
emotional_depth: 1=leicht, 2=mittel, 3=tief
correctAnswer muss EXAKT einem Eintrag in options entsprechen.

## KREATIVE FREIHEIT
Kategorien und Listen sind Werkzeuge, keine Käfige. Erfinde, überrasche, experimentiere. Einzige harte Grenzen: Guardrails + altersgerechte Sprache + Lesevergnügen als oberstes Ziel.
```

Speichere diesen Text als `system_prompt_core_v2` in app_settings. Die alten Keys (`system_prompt_fr`, `system_prompt_parent_module_fr`, etc.) NICHT löschen – sie dienen als Fallback.

---

## SCHRITT 1: Erstelle `supabase/functions/_shared/promptBuilder.ts`

### 1.1 Input-Type definieren

```typescript
export interface StoryRequest {
  kid_profile: {
    id: string;
    first_name: string;
    age: number;
    difficulty_level: number;    // 1-3
    content_safety_level: number; // 1-4
  };
  story_language: string;        // 'fr', 'de', 'en', 'es', 'it', 'bs'
  theme_key: string;             // 'fantasy', 'action', 'animals', 'everyday', 'humor', 'educational'
  length: 'short' | 'medium' | 'long';
  is_series: boolean;
  series_context?: string;       // Zusammenfassung bisheriger Episoden
  protagonists: {
    include_self: boolean;       // Kind als Hauptfigur
    characters: Array<{
      name: string;
      age?: number;
      relation?: string;         // 'Bruder', 'Schwester', 'Freund', etc.
      description?: string;      // 'Batman', 'Gargamel', etc.
    }>;
  };
  special_abilities: string[];   // 'superpowers', 'magic', 'heroes_villains', 'transformations', 'special_talents'
  user_prompt?: string;          // Freitext vom User
  source: 'parent' | 'kid';
  question_count?: number;       // Default: 5
}
```

### 1.2 DB-Queries in buildStoryPrompt()

Die Funktion `buildStoryPrompt(request: StoryRequest, supabaseClient: any): Promise<string>` tut folgendes:

1. **age_rules laden**: `SELECT * FROM age_rules WHERE language = request.story_language AND min_age <= request.kid_profile.age AND max_age >= request.kid_profile.age LIMIT 1`
   → Fehler werfen wenn nicht gefunden (aber NICHT die Story abbrechen – siehe Fallback in Schritt 3)

2. **difficulty_rules laden**: `SELECT * FROM difficulty_rules WHERE language = request.story_language AND difficulty_level = request.kid_profile.difficulty_level LIMIT 1`
   → Fehler werfen wenn nicht gefunden

3. **theme_rules laden**: `SELECT * FROM theme_rules WHERE theme_key = request.theme_key AND language = request.story_language LIMIT 1`
   → Fehler werfen wenn nicht gefunden

4. **content_themes_by_level laden**: `SELECT * FROM content_themes_by_level WHERE min_safety_level <= request.kid_profile.content_safety_level AND min_safety_level > 0` (erlaubt) UND `SELECT * FROM content_themes_by_level WHERE min_safety_level > request.kid_profile.content_safety_level OR min_safety_level = 0` (verboten/zu hoch)
   → Labels aus JSONB in story_language extrahieren

5. **Lernthema prüfen**: `shouldApplyLearningTheme(request.kid_profile.id, supabaseClient)` aufrufen (aus learningThemeRotation.ts, siehe Schritt 2)

6. **Letzte 5 Stories laden** (für Varietät):
   ```sql
   SELECT structure_beginning, structure_middle, structure_ending, 
          emotional_coloring, emotional_secondary, humor_level, concrete_theme
   FROM stories 
   WHERE kid_profile_id = request.kid_profile.id 
   ORDER BY created_at DESC 
   LIMIT 5
   ```

### 1.3 Wortanzahl berechnen

Aus age_rules kommen `min_word_count` und `max_word_count`. Verrechne mit dem Längen-Multiplikator:

| length   | factor |
|----------|--------|
| 'short'  | 0.7    |
| 'medium' | 1.0    |
| 'long'   | 1.4    |

```typescript
const factor = { short: 0.7, medium: 1.0, long: 1.4 }[request.length];
const minWords = Math.round(ageRules.min_word_count * factor);
const maxWords = Math.round(ageRules.max_word_count * factor);
```

### 1.4 Varietät-Block bauen

Aus den letzten 5 Stories:

```typescript
function buildVarietyBlock(recentStories: any[], storyLanguage: string): string {
  if (recentStories.length === 0) return '';
  
  const lines: string[] = [];
  const sectionTitle = SECTION_HEADERS[storyLanguage]?.variety || 'VARIETY';
  
  // Letzte 3 Struktur-Kombinationen → "Vermeide diese"
  const recentStructures = recentStories.slice(0, 3)
    .filter(s => s.structure_beginning && s.structure_middle && s.structure_ending)
    .map(s => `A${s.structure_beginning}-M${s.structure_middle}-E${s.structure_ending}`);
  if (recentStructures.length > 0) {
    lines.push(`Vermeide diese Struktur-Kombinationen: ${recentStructures.join(', ')}`);
  }
  
  // Letzte 5 emotionale Färbungen → häufigste identifizieren
  const recentEmotions = recentStories
    .map(s => s.emotional_coloring)
    .filter(Boolean);
  const emotionCounts: Record<string, number> = {};
  recentEmotions.forEach(e => { emotionCounts[e] = (emotionCounts[e] || 0) + 1; });
  const dominant = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
  if (dominant && dominant[1] >= 2) {
    lines.push(`Die letzten Stories waren oft ${dominant[0]}. Wähle eine andere primäre Färbung.`);
  }
  
  // Humor-Level Abwechslung
  const recentHumor = recentStories.slice(0, 3).map(s => s.humor_level).filter(Boolean);
  const avgHumor = recentHumor.length > 0 ? recentHumor.reduce((a, b) => a + b, 0) / recentHumor.length : 0;
  if (avgHumor > 3) {
    lines.push('Die letzten Stories waren sehr humorvoll. Setze den Humor-Level diesmal auf 1-2.');
  } else if (avgHumor < 2 && recentHumor.length >= 2) {
    lines.push('Die letzten Stories hatten wenig Humor. Probiere diesmal Humor-Level 3-4.');
  }
  
  // Themen-Wiederholung
  const recentThemes = recentStories.map(s => s.concrete_theme).filter(Boolean);
  if (recentThemes.length > 0) {
    lines.push(`Letzte Themen: ${recentThemes.join(', ')}. Wähle ein anderes konkretes Thema.`);
  }
  
  return lines.length > 0 ? `## ${sectionTitle}\n${lines.join('\n')}` : '';
}
```

**WICHTIG**: Die Varietät-Anweisungen sollen in der story_language formuliert sein, nicht auf Deutsch!

### 1.5 Prompt-Sektionsüberschriften übersetzen

Erstelle ein Übersetzungs-Objekt für die Prompt-Sektionsüberschriften. Der gesamte dynamische User-Message-Prompt soll in der `story_language` geschrieben sein:

```typescript
const SECTION_HEADERS: Record<string, Record<string, string>> = {
  fr: {
    child: 'ENFANT', language: 'LANGUE ET NIVEAU', vocabulary: 'VOCABULAIRE',
    length: 'LONGUEUR DU TEXTE', category: 'CATÉGORIE', characters: 'PERSONNAGES',
    specialEffects: 'EFFETS SPÉCIAUX', guardrails: 'GARDE-FOUS',
    learningTheme: 'THÈME ÉDUCATIF', variety: 'VARIÉTÉ',
    specialRequest: 'DEMANDE SPÉCIALE', series: 'CONTEXTE DE SÉRIE',
    instruction: 'Écris une histoire avec les consignes suivantes :',
    chooseTheme: 'Choisis toi-même un thème concret dans cette catégorie.',
    respondJson: 'Réponds UNIQUEMENT avec le JSON du format de sortie.',
  },
  de: {
    child: 'KIND', language: 'SPRACHE & NIVEAU', vocabulary: 'VOKABULAR',
    length: 'TEXTLÄNGE', category: 'KATEGORIE', characters: 'FIGUREN',
    specialEffects: 'SPEZIALEFFEKTE', guardrails: 'GUARDRAILS',
    learningTheme: 'LERNTHEMA', variety: 'VARIETÄT',
    specialRequest: 'BESONDERER WUNSCH', series: 'SERIEN-KONTEXT',
    instruction: 'Schreibe eine Geschichte mit folgenden Vorgaben:',
    chooseTheme: 'Wähle selbst ein konkretes Thema innerhalb dieser Kategorie.',
    respondJson: 'Antworte NUR mit dem JSON aus dem Output-Format.',
  },
  en: {
    child: 'CHILD', language: 'LANGUAGE & LEVEL', vocabulary: 'VOCABULARY',
    length: 'TEXT LENGTH', category: 'CATEGORY', characters: 'CHARACTERS',
    specialEffects: 'SPECIAL EFFECTS', guardrails: 'GUARDRAILS',
    learningTheme: 'LEARNING THEME', variety: 'VARIETY',
    specialRequest: 'SPECIAL REQUEST', series: 'SERIES CONTEXT',
    instruction: 'Write a story with the following specifications:',
    chooseTheme: 'Choose a specific theme within this category.',
    respondJson: 'Respond ONLY with the JSON from the output format.',
  },
  es: {
    child: 'NIÑO/A', language: 'IDIOMA Y NIVEL', vocabulary: 'VOCABULARIO',
    length: 'LONGITUD DEL TEXTO', category: 'CATEGORÍA', characters: 'PERSONAJES',
    specialEffects: 'EFECTOS ESPECIALES', guardrails: 'LÍMITES DE CONTENIDO',
    learningTheme: 'TEMA EDUCATIVO', variety: 'VARIEDAD',
    specialRequest: 'PETICIÓN ESPECIAL', series: 'CONTEXTO DE SERIE',
    instruction: 'Escribe una historia con las siguientes pautas:',
    chooseTheme: 'Elige tú mismo un tema concreto dentro de esta categoría.',
    respondJson: 'Responde ÚNICAMENTE con el JSON del formato de salida.',
  },
  it: {
    child: 'BAMBINO/A', language: 'LINGUA E LIVELLO', vocabulary: 'VOCABOLARIO',
    length: 'LUNGHEZZA DEL TESTO', category: 'CATEGORIA', characters: 'PERSONAGGI',
    specialEffects: 'EFFETTI SPECIALI', guardrails: 'LIMITI DI CONTENUTO',
    learningTheme: 'TEMA EDUCATIVO', variety: 'VARIETÀ',
    specialRequest: 'RICHIESTA SPECIALE', series: 'CONTESTO DI SERIE',
    instruction: 'Scrivi una storia con le seguenti indicazioni:',
    chooseTheme: 'Scegli tu stesso un tema concreto all\'interno di questa categoria.',
    respondJson: 'Rispondi SOLO con il JSON del formato di output.',
  },
  bs: {
    child: 'DIJETE', language: 'JEZIK I NIVO', vocabulary: 'VOKABULAR',
    length: 'DUŽINA TEKSTA', category: 'KATEGORIJA', characters: 'LIKOVI',
    specialEffects: 'SPECIJALNI EFEKTI', guardrails: 'ZAŠTITNE MJERE',
    learningTheme: 'OBRAZOVNA TEMA', variety: 'RAZNOLIKOST',
    specialRequest: 'POSEBAN ZAHTJEV', series: 'KONTEKST SERIJE',
    instruction: 'Napiši priču sa sljedećim uputama:',
    chooseTheme: 'Sam/a izaberi konkretnu temu unutar ove kategorije.',
    respondJson: 'Odgovori SAMO sa JSON-om iz formata izlaza.',
  },
};
```

Falls `story_language` nicht in den Headers ist → Fallback auf `'en'`.

### 1.6 User-Message-Prompt zusammenbauen

Die Funktion soll einen String zurückgeben der so aufgebaut ist:

```
{headers.instruction}

## {headers.child}
Name: {kid_name}, Alter/Age: {kid_age}

## {headers.language}
Sprache/Language: {story_language_name}
Niveau/Level: {difficulty_rules.label[story_language]} — {difficulty_rules.description[story_language]}
Satzlänge/Sentence length: max. {age_rules.max_sentence_length} Wörter/words
Erlaubte Zeiten/Tenses: {age_rules.allowed_tenses}
Satzstrukturen/Structures: {age_rules.sentence_structures}
Erzählperspektive/Perspective: {age_rules.narrative_perspective}
Erzählstil/Style: {age_rules.narrative_guidelines}

## {headers.vocabulary}
{difficulty_rules.vocabulary_scope}
Neue Wörter/New words: max. {difficulty_rules.new_words_per_story}
Figurative Sprache/Figurative language: {difficulty_rules.figurative_language}
Redewendungen/Idioms: {difficulty_rules.idiom_usage}
Wiederholung/Repetition: {difficulty_rules.repetition_strategy}

## {headers.length}
{minWords} bis/to {maxWords} Wörter/words
Absätze/Paragraphs: {age_rules.paragraph_length}
Dialog: {age_rules.dialogue_ratio}
Fragen/Questions: {question_count} Verständnisfragen/comprehension questions generieren/generate

## {headers.category}
{theme_rules.labels[story_language]}
Plots: {theme_rules.plot_templates}
Konflikte/Conflicts: {theme_rules.typical_conflicts}
Archetypen/Archetypes: {theme_rules.character_archetypes}
Sensorik/Sensory: {theme_rules.sensory_details}
→ {headers.chooseTheme}

## {headers.characters}
{/* Wenn include_self: "Hauptfigur: {kid_name}, {kid_age} Jahre" */}
{/* Für jeden character: "Name: {name}, Alter: {age}, Beziehung: {relation}, Beschreibung: {description}" */}

## {headers.specialEffects}
{/* Nur wenn special_abilities nicht leer */}
{/* Für jede ability eine beschreibende Zeile */}

## {headers.guardrails} (Safety Level {safety_level}/4)
Erlaubt/Allowed: {liste der erlaubten emotionalen Themen}
Nicht erlaubt/Not allowed: {liste der verbotenen/zu hohen Themen}

## {headers.learningTheme}
{/* Nur wenn Lernthema aktiv (aus Rotation) */}
{/* "Webe das Thema '{theme_label}' subtil in die Geschichte ein..." */}

## {headers.variety}
{/* varietyBlock — nur wenn nicht leer */}

## {headers.specialRequest}
{/* Nur wenn user_prompt vorhanden */}
{user_prompt}

## {headers.series}
{/* Nur wenn is_series && series_context */}
{series_context}

{headers.respondJson}
```

**WICHTIG**: 
- Labels aus JSONB-Feldern (difficulty_rules.label, theme_rules.labels, etc.) werden mit dem Key `story_language` extrahiert. Beispiel: `difficulty_rules.label['fr']` → "Moyen"
- Leere Sektionen (kein Lernthema, keine Spezialeffekte, kein Serienzusatz) → Sektion komplett weglassen
- Die konkreten Feld-Werte wie `plot_templates`, `typical_conflicts`, `character_archetypes` sind Arrays in der DB → als komma-separierte Liste ausgeben
- `allowed_tenses` ist ein Array → als komma-separierte Liste ausgeben

### 1.7 Exports

```typescript
export { buildStoryPrompt, StoryRequest };
```

---

## SCHRITT 2: Erstelle `supabase/functions/_shared/learningThemeRotation.ts`

```typescript
export async function shouldApplyLearningTheme(
  kidProfileId: string,
  supabaseClient: any
): Promise<{ themeKey: string; themeLabel: string } | null>
```

Logik:

1. **parent_learning_config laden**: `SELECT * FROM parent_learning_config WHERE kid_profile_id = kidProfileId`
   - Wenn nicht vorhanden oder `active_themes` leer → return `null`

2. **Frequenz prüfen**: Zähle die letzten Stories OHNE Lernthema seit dem letzten MIT Lernthema:
   ```sql
   SELECT COUNT(*) as stories_since_last_theme
   FROM stories
   WHERE kid_profile_id = kidProfileId
     AND created_at > COALESCE(
       (SELECT MAX(created_at) FROM stories WHERE kid_profile_id = kidProfileId AND learning_theme_applied IS NOT NULL),
       '1970-01-01'
     )
     AND learning_theme_applied IS NULL
   ```

3. **Entscheide ob jetzt ein Lernthema dran ist**:
   - frequency 1 (gelegentlich): Lernthema wenn `stories_since >= 3` (jede 4. Story)
   - frequency 2 (regelmäßig): Lernthema wenn `stories_since >= 2` (jede 3. Story)
   - frequency 3 (häufig): Lernthema wenn `stories_since >= 1` (jede 2. Story)

4. **Round-Robin**: Wenn dran, wähle das nächste Thema aus `active_themes[]`:
   ```sql
   SELECT learning_theme_applied
   FROM stories
   WHERE kid_profile_id = kidProfileId
     AND learning_theme_applied IS NOT NULL
   ORDER BY created_at DESC
   LIMIT 1
   ```
   - Finde den Index des zuletzt verwendeten Themas in `active_themes`
   - Nimm das nächste (wrap-around)
   - Wenn keins bisher verwendet → nimm das erste

5. **Label laden**: `SELECT labels FROM learning_themes WHERE theme_key = selectedTheme`
   - Label in `story_language` extrahieren

6. Return `{ themeKey, themeLabel }` oder `null`

---

## SCHRITT 3: generate-story/index.ts anpassen

### 3.1 Importe hinzufügen

```typescript
import { buildStoryPrompt, StoryRequest } from '../_shared/promptBuilder.ts';
import { shouldApplyLearningTheme } from '../_shared/learningThemeRotation.ts';
```

### 3.2 Prompt-Aufbau ersetzen (ca. Zeile 823-864)

Finde den Bereich wo aktuell:
- `system_prompt_{lang}` aus app_settings geladen wird
- Das Eltern-Modul / Kinder-Modul geladen wird
- Der composite prompt zusammengebaut wird

Ersetze diesen Bereich durch:

```typescript
let systemPrompt: string;
let userMessage: string;
let usedNewPromptPath = false;

try {
  // 1. CORE Slim laden
  const { data: coreSlimData } = await supabaseClient
    .from('app_settings')
    .select('value')
    .eq('key', 'system_prompt_core_v2')
    .single();

  if (!coreSlimData?.value) {
    throw new Error('system_prompt_core_v2 not found in app_settings');
  }

  // 2. StoryRequest bauen aus den vorhandenen Parametern
  const storyRequest: StoryRequest = {
    kid_profile: {
      id: kidProfile.id,
      first_name: kidProfile.first_name || kidProfile.name,
      age: kidProfile.age,
      difficulty_level: kidProfile.difficulty_level || 2,
      content_safety_level: kidProfile.content_safety_level || 2,
    },
    story_language: storyLanguage,   // aus dem bestehenden Code übernehmen
    theme_key: themeKey,             // aus dem bestehenden Code (Wizard-Parameter) übernehmen
    length: storyLength || 'medium', // aus dem bestehenden Code (oder Default)
    is_series: isSeries || false,
    series_context: seriesContext,
    protagonists: {
      include_self: includeSelf || false,
      characters: selectedCharacters || [],
    },
    special_abilities: specialAbilities || [],
    user_prompt: userPrompt,
    source: storySource || 'parent',
    question_count: 5,
  };

  // 3. Dynamischen Kontext bauen
  userMessage = await buildStoryPrompt(storyRequest, supabaseClient);
  systemPrompt = coreSlimData.value;
  usedNewPromptPath = true;

  console.log('[generate-story] Using NEW prompt path (CORE Slim + dynamic context)');

} catch (promptError) {
  // FALLBACK: Alte Prompts verwenden
  console.warn('[generate-story] FALLBACK to old prompts:', promptError.message);
  
  // Hier den BESTEHENDEN Code für app_settings Prompt-Laden beibehalten
  // systemPrompt = ... (alte Logik)
  // userMessage = ... (alte Logik)
  usedNewPromptPath = false;
}
```

**ACHTUNG**: Schau dir genau an wie aktuell `themeKey`, `storyLanguage`, `kidProfile`, `isSeries`, `seriesContext`, `userPrompt`, `specialAbilities` etc. aus dem Request-Body extrahiert werden. Mappe die vorhandenen Variablen korrekt auf die StoryRequest-Properties.

Falls Parameter wie `length`, `include_self`, `source` noch nicht im Request-Body existieren → verwende sinnvolle Defaults:
- `length` → `'medium'`  
- `source` → `'parent'`
- `include_self` → `false`
- `special_abilities` → `[]`

### 3.3 LLM-Aufruf anpassen

Stelle sicher, dass der LLM-Aufruf den `systemPrompt` als System-Message und den `userMessage` als User-Message sendet. Schau dir den bestehenden Aufruf an – wahrscheinlich werden aktuell System + User in einem einzigen String kombiniert. Falls ja, trenne sie:

```typescript
// VORHER (vermutlich):
// const prompt = systemPrompt + "\n\n" + userInput;
// messages: [{ role: "user", content: prompt }]

// NACHHER:
const messages = [
  { role: "system", content: systemPrompt },
  { role: "user", content: userMessage }
];
```

Falls die API (Lovable Gateway / Gemini) kein separates `system` Role unterstützt → kombiniere wie bisher, aber mit klarer Trennung:
```typescript
const combinedPrompt = `${systemPrompt}\n\n---\n\n${userMessage}`;
```

### 3.4 LLM-Response-Parsing erweitern

Finde den Code wo der LLM-Response geparst wird (JSON.parse des Story-Outputs). Erweitere das Parsing um die neuen Klassifikations-Felder:

```typescript
// Nach dem bestehenden Parsing (title, content, questions, vocabulary, etc.)

// Neue Klassifikationen parsen (robust – nicht crashen wenn sie fehlen)
const structureBeginning = parsedResponse.structure_beginning 
  ? parseInt(String(parsedResponse.structure_beginning).replace(/[^0-9]/g, '')) 
  : null;
const structureMiddle = parsedResponse.structure_middle 
  ? parseInt(String(parsedResponse.structure_middle).replace(/[^0-9]/g, '')) 
  : null;
const structureEnding = parsedResponse.structure_ending 
  ? parseInt(String(parsedResponse.structure_ending).replace(/[^0-9]/g, '')) 
  : null;
const emotionalColoring = parsedResponse.emotional_coloring 
  ? String(parsedResponse.emotional_coloring).match(/EM-[JTHWDC]/)?.[0] || null 
  : null;
const emotionalSecondary = parsedResponse.emotional_secondary 
  ? String(parsedResponse.emotional_secondary).match(/EM-[JTHWDC]/)?.[0] || null 
  : null;
const humorLevel = parsedResponse.humor_level 
  ? Math.min(5, Math.max(1, parseInt(parsedResponse.humor_level))) 
  : null;
const emotionalDepth = parsedResponse.emotional_depth 
  ? Math.min(3, Math.max(1, parseInt(parsedResponse.emotional_depth))) 
  : null;
const moralTopic = parsedResponse.moral_topic || null;
const concreteTheme = parsedResponse.concrete_theme || null;
const summary = parsedResponse.summary || null;

// Lernthema-Response
const learningThemeResponse = parsedResponse.learning_theme_response || null;
```

**WICHTIG**: Die alten Felder `structure_beginning`, `structure_middle`, `structure_ending`, `emotional_coloring` werden möglicherweise schon geparst. Prüfe ob dem so ist und erweitere nur was fehlt. Überschreibe bestehende Parser nicht, sondern ergänze sie.

### 3.5 DB-Speichern erweitern

Finde den Code wo die Story in die `stories`-Tabelle geschrieben wird. Erweitere das INSERT/UPDATE um die neuen Spalten:

```typescript
// Beim INSERT in stories, füge hinzu:
{
  // ... bestehende Felder (title, content, cover_image_url, etc.) ...
  
  // Klassifikationen (neu oder erweitert):
  structure_beginning: structureBeginning,
  structure_middle: structureMiddle,
  structure_ending: structureEnding,
  emotional_coloring: emotionalColoring,
  emotional_secondary: emotionalSecondary,   // NEU
  humor_level: humorLevel,                    // NEU
  emotional_depth: emotionalDepth,            // NEU
  moral_topic: moralTopic,                    // NEU
  concrete_theme: concreteTheme,              // NEU
  
  // Lernthema (wenn aktiv)
  learning_theme_applied: learningThemeApplied || null,  // theme_key wenn Lernthema aktiv war
  parent_prompt_text: learningThemeResponse?.parent_prompt_text || null,
}
```

**PRÜFE** wo genau das INSERT passiert: in der Edge Function selbst oder im Frontend (CreateStoryPage.tsx)? Laut Architecture passiert das Speichern im Frontend:

> "CreateStoryPage.tsx saves to DB: stories table (content, images, metadata, text_language)"

Falls die Edge Function die Story NICHT in die DB schreibt, sondern nur den generierten Content zurückgibt → stelle sicher, dass die neuen Klassifikationen im Response-Objekt an das Frontend zurückgegeben werden:

```typescript
return new Response(JSON.stringify({
  // ... bestehende Felder ...
  
  // Neue Klassifikationen:
  structure_beginning: structureBeginning,
  structure_middle: structureMiddle,
  structure_ending: structureEnding,
  emotional_coloring: emotionalColoring,
  emotional_secondary: emotionalSecondary,
  humor_level: humorLevel,
  emotional_depth: emotionalDepth,
  moral_topic: moralTopic,
  concrete_theme: concreteTheme,
  summary: summary,
  learning_theme_applied: learningThemeApplied || null,
  parent_prompt_text: learningThemeResponse?.parent_prompt_text || null,
}));
```

UND aktualisiere das Frontend (CreateStoryPage.tsx) so dass es die neuen Felder beim INSERT in die stories-Tabelle mitgibt. Suche den Code wo `supabase.from('stories').insert(...)` aufgerufen wird und füge die neuen Spalten hinzu.

---

## SCHRITT 4: Mapping der bestehenden Wizard-Parameter

Schau dir an welche Parameter der Wizard (CreateStoryPage.tsx) aktuell an die Edge Function sendet. Vermutlich so etwas wie:

```typescript
const { data } = await supabase.functions.invoke('generate-story', {
  body: {
    storyType: selectedType,      // → muss auf theme_key gemappt werden
    characters: selectedChars,    // → muss auf protagonists gemappt werden
    // ...
  }
});
```

Erstelle ein Mapping von den aktuellen Wizard-Parametern auf die neuen StoryRequest-Properties:

| Aktueller Wizard-Parameter | Neues StoryRequest-Feld | Mapping |
|---|---|---|
| `storyType` (z.B. 'adventure') | `theme_key` | Direkt oder Mapping-Tabelle: 'adventure' → 'action', etc. Prüfe die Werte! |
| `characters` | `protagonists.characters` | Array von {name, age?, relation?, description?} |
| `selectedSpecialEffects` | `special_abilities` | Array von Strings |
| `userPrompt` | `user_prompt` | String |
| `storyLanguage` oder aus kidProfile | `story_language` | 'fr', 'de', 'en' etc. |

Falls der Wizard aktuell KEINE `length`, `is_series`, `source`, `include_self` Parameter hat → verwende Defaults in der Edge Function. Diese werden erst in Block 2.3d (Wizard-Erweiterungen) hinzugefügt.

---

## NICHT ÄNDERN

Folgende Bereiche in generate-story/index.ts dürfen NICHT verändert werden:

- ❌ Bild-Generierung (Cover + Story-Bilder, Fallback-Kette)
- ❌ Consistency Check
- ❌ Word Count Validation + Retry-Logik
- ❌ image_cache Mechanismus
- ❌ CORS-Header
- ❌ Fehlerbehandlung für API-Ausfälle
- ❌ Supabase-Client-Initialisierung
- ❌ Realtime Status-Updates (generation_status)
- ❌ Serien-Logik (soweit vorhanden)

---

## TESTEN

1. App muss ohne Fehler starten (`npm run dev`)
2. Erstelle eine Test-Story: Alter 8, Französisch, Kategorie "Abenteuer", Länge "Mittel", Safety Level 2
3. Prüfe in Supabase Dashboard ob die neuen Spalten befüllt sind (humor_level, emotional_depth, etc.)
4. Erstelle 3-4 Stories hintereinander → Prüfe ob Strukturen variieren
5. Fallback testen: Lösche `system_prompt_core_v2` temporär aus app_settings → alte Prompts müssen greifen
6. Console-Logs prüfen: `[generate-story] Using NEW prompt path` oder `FALLBACK to old prompts`

---

## CHECKLISTE

**Dateien:**
- [ ] Migration für `system_prompt_core_v2` in app_settings
- [ ] `supabase/functions/_shared/promptBuilder.ts` existiert
- [ ] `supabase/functions/_shared/learningThemeRotation.ts` existiert
- [ ] `generate-story/index.ts` importiert und nutzt beide

**Prompt-Logik:**
- [ ] Prompt wird aus DB-Regeln gebaut (age_rules, difficulty_rules, theme_rules)
- [ ] Prompt-Sprache = story_language (NICHT Deutsch)
- [ ] Fallback auf alte Prompts wenn neue Regeln fehlen (mit Log)
- [ ] Wortanzahl-Multiplikator korrekt (short=0.7, medium=1.0, long=1.4)
- [ ] Guardrails basierend auf content_safety_level
- [ ] Lernthema-Rotation: Round-Robin + Frequenz-Logik
- [ ] Varietät: letzte 5 Stories werden abgefragt

**Parsing + Speichern:**
- [ ] Klassifikationen werden robust aus LLM-Response geparst (kein Crash bei fehlenden Feldern)
- [ ] Neue Spalten (emotional_secondary, humor_level, emotional_depth, moral_topic, concrete_theme) werden auf stories gespeichert
- [ ] learning_theme_applied + parent_prompt_text werden gespeichert wenn Lernthema aktiv

**Keine Regressionen:**
- [ ] Bestehende Stories sind unverändert
- [ ] Alte app_settings Prompt-Keys sind NICHT gelöscht
- [ ] Bild-Generierung funktioniert noch
- [ ] Consistency Check funktioniert noch
