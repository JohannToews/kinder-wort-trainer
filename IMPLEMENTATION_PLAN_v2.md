# Petit Lecteur – Implementierungsplan Produktverbesserung (v2)

> Ziel: Story-Qualität, Mehrsprachigkeit und Skalierbarkeit verbessern.
> Methode: Block für Block in Cursor umsetzen, nach jedem Block testen.
> Wichtig: Dieses Dokument ins Projekt-Root kopieren, damit Cursor es als Referenz nutzen kann.
> Referenz-Dokument: STORY_ENGINE_BLOCK2.md enthält die detaillierten Konzepte für Lernthemen, Guardrails und Branching.

---

## Übersicht: Blöcke in optimaler Reihenfolge

| Block | Thema | Status | Geschätzter Aufwand |
|-------|-------|--------|-------------------|
| 1 | DB-Modell: Mehrsprachigkeit | ✅ FERTIG | 1-2 Tage |
| 2.1 | Stammdaten: Lernthemen + Guardrails (DB + UI) | offen | 1-2 Tage |
| 2.2 | Regel-DB: age_rules, theme_rules, emotion_rules, image_style_rules | offen | 1-2 Tage |
| 2.3 | Story Engine: promptBuilder + generate-story Umbau | offen | 2-3 Tage |
| 2.4 | Story Engine: Parallele Bild-Generierung | offen | 1 Tag |
| 2.5 | Architektur: generate-story splitten + Cleanup | offen | 1-2 Tage |
| 3 | Branching & Serien-Modul (später) | geplant | 3-5 Tage |

---

## Block 1: Datenbank-Modell für Mehrsprachigkeit ✅ FERTIG

Sprachfelder auf kid_profiles, marked_words, comprehension_questions, stories.
Language Derivation Chain über school_system → kidAppLanguage, kidReadingLanguage, kidExplanationLanguage.
Translation-Konsolidierung (statusLabels, difficultyLabels, ternary-chains).

---

## Block 2.1: Stammdaten – Lernthemen + Content Guardrails

### Problem
Eltern haben aktuell keine Möglichkeit, erzieherische Schwerpunkte zu setzen oder zu steuern, welche emotionalen Themen in Geschichten vorkommen dürfen. Beides ist entscheidend für Eltern-Akzeptanz, Weiterempfehlung und Kinderschutz.

### Ziel
Referenztabellen + Konfigurationstabellen + Eltern-UI für Lernthemen und Guardrail-Level. Noch KEIN Umbau der Story-Generierung – nur die Datengrundlage und das UI.

### Cursor-Prompt

```
Lies die ARCHITECTURE.md, IMPLEMENTATION_PLAN.md und STORY_ENGINE_BLOCK2.md im Projekt-Root.

Aufgabe: Erstelle die Stammdaten-Tabellen und das Eltern-UI für Lernthemen und Content Guardrails.

SCHRITT 1: Neue Referenz-Tabellen (Supabase Migration)

Tabelle: learning_themes
- id (uuid, PK, default gen_random_uuid())
- theme_key (text, NOT NULL, UNIQUE) -- z.B. 'sharing', 'patience', 'honesty'
- category (text, NOT NULL) -- 'social', 'emotional', 'character', 'cognitive'
- labels (jsonb, NOT NULL) -- {"de": "Teilen & Großzügigkeit", "fr": "Partage et générosité", "en": "Sharing & generosity"}
- descriptions (jsonb, NOT NULL) -- {"de": "Kind lernt...", "fr": "L'enfant apprend..."}
- sort_order (integer, NOT NULL, default 0)
- created_at (timestamptz, default now())

Seed-Daten für learning_themes (aus STORY_ENGINE_BLOCK2.md Thema 1):
Sozial: sharing, empathy, friendship, cooperation
Emotional: patience, frustration, courage, anger_management
Charakter: honesty, independence, responsibility, admitting_mistakes
Kognitiv: curiosity, problem_solving, creativity
→ 15 Einträge, jeweils mit Labels in DE, FR, EN (weitere Sprachen als Platzhalter)

Tabelle: content_themes_by_level
- id (uuid, PK, default gen_random_uuid())
- theme_key (text, NOT NULL) -- z.B. 'divorce', 'pet_death', 'bullying', 'war'
- labels (jsonb, NOT NULL) -- {"de": "Scheidung", "fr": "Divorce"}
- min_safety_level (integer, NOT NULL) -- ab welchem Level erlaubt (1-4)
- min_age (integer) -- ab welchem Alter erlaubt (optional)
- example_texts (jsonb, NOT NULL) -- {"de": "Linas Eltern leben in zwei Häusern", "fr": "Les parents de Lina vivent dans deux maisons"}
- sort_order (integer, NOT NULL, default 0)
- created_at (timestamptz, default now())

Seed-Daten für content_themes_by_level (aus STORY_ENGINE_BLOCK2.md Thema 2):
Level 1 (GESCHÜTZT): Nichts mit emotionaler Tiefe erlaubt
Level 2 (LEICHT): friend_conflict, minor_sadness, minor_fear, disappointment
Level 3 (MITTEL): divorce, moving, bullying, loneliness, pet_death, jealousy
Level 4 (OFFEN): death, war_flight, serious_illness, complex_families
Globale Ausschlüsse (alle Level): explicit_violence, sexual_content, suicide, drug_abuse, unresolved_horror

SCHRITT 2: Konfigurationstabellen (Supabase Migration)

Tabelle: parent_learning_config
- id (uuid, PK, default gen_random_uuid())
- kid_profile_id (uuid, NOT NULL, REFERENCES kid_profiles(id) ON DELETE CASCADE, UNIQUE)
- active_themes (text[], NOT NULL, default '{}')
- frequency (integer, NOT NULL, default 2) -- 1=gelegentlich, 2=regelmäßig, 3=häufig
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
- CHECK (array_length(active_themes, 1) <= 3 OR active_themes = '{}')

Neues Feld auf kid_profiles:
- content_safety_level (integer, NOT NULL, default 2)
- CHECK (content_safety_level BETWEEN 1 AND 4)

Default-Logik für content_safety_level bei bestehenden Profilen:
- Alter 4-5 → Level 1
- Alter 6-7 → Level 2
- Alter 8-9 → Level 2
- Alter 10+ → Level 3

Neue Felder auf stories (für spätere Nutzung, noch nicht befüllt):
- learning_theme_applied (text) -- z.B. 'sharing' oder NULL
- parent_prompt_text (text) -- generierter Gesprächsleitfaden oder NULL

SCHRITT 3: RLS-Policies

learning_themes: SELECT für alle (anon + authenticated), kein INSERT/UPDATE/DELETE für anon
content_themes_by_level: SELECT für alle, kein INSERT/UPDATE/DELETE für anon
parent_learning_config: SELECT/INSERT/UPDATE/DELETE nur für den User der das kid_profile besitzt
kid_profiles.content_safety_level: bestehende RLS-Policies greifen

SCHRITT 4: TypeScript-Types aktualisieren

Aktualisiere src/integrations/supabase/types.ts mit allen neuen Tabellen und Feldern.

SCHRITT 5: Eltern-Panel UI

Erstelle eine neue Komponente: src/components/ParentSettingsPanel.tsx

Diese Komponente zeigt zwei Bereiche:

BEREICH 1: Lernthemen
- Lade alle learning_themes aus der DB, gruppiert nach category
- Zeige Labels in der kidAppLanguage des aktiven Kindprofils
- Eltern können max. 3 Themen aktivieren (Checkboxen/Toggles)
- Frequenz-Regler: Slider oder Dropdown (gelegentlich/regelmäßig/häufig)
- Speichern in parent_learning_config

BEREICH 2: Content Guardrails
- 4 Stufen als Karten oder Radio-Buttons
- Für jede Stufe: zeige Beispiele aus content_themes_by_level
  → "Auf dieser Stufe kann vorkommen:" + erlaubte Themen mit Beispielsätzen
  → "Wird NICHT vorkommen:" + ausgeschlossene Themen
- Labels und Beispiele in der kidAppLanguage
- Speichern auf kid_profiles.content_safety_level

Wo das Panel einbinden:
- Als neuer Tab oder Section auf der Seite wo Kid-Profile bearbeitet werden
- ODER als eigene Seite erreichbar vom Hauptmenü (mit einem Eltern-Symbol)
- Entscheide was besser in die bestehende Navigation passt

Styling: shadcn/ui Komponenten, passend zum bestehenden App-Design.
Übersetzungen: Alle Labels aus der DB laden (jsonb), UI-Texte in translations.ts hinzufügen.

Wichtig:
- KEINE Änderungen an der Story-Generierung – das kommt in Block 2.3
- Die neuen Felder auf stories (learning_theme_applied, parent_prompt_text) bleiben vorerst NULL
- Erstelle EINE Migration für alle DB-Änderungen
- Teste dass npm run dev ohne Fehler startet
- Teste dass bestehende Funktionalität nicht bricht
```

### Checkliste: Hat Cursor gute Arbeit gemacht?

**Im Code prüfen (Cursor fragen: "Zeig mir die neue Migration"):**
- [ ] Migration erstellt: learning_themes, content_themes_by_level, parent_learning_config
- [ ] content_safety_level auf kid_profiles hinzugefügt (mit ALTER TABLE)
- [ ] learning_theme_applied und parent_prompt_text auf stories hinzugefügt
- [ ] Seed-Daten: 15 Lernthemen mit Labels in mind. DE, FR, EN
- [ ] Seed-Daten: Content-Themen pro Level mit Beispieltexten
- [ ] Default content_safety_level basierend auf Alter gesetzt
- [ ] CHECK Constraints: max 3 active_themes, safety_level 1-4
- [ ] RLS-Policies auf allen neuen Tabellen

**In der App testen:**
- [ ] App startet ohne Fehler
- [ ] ParentSettingsPanel ist erreichbar
- [ ] Lernthemen werden angezeigt, gruppiert nach Kategorie
- [ ] Labels erscheinen in der richtigen Sprache (kidAppLanguage)
- [ ] Du kannst 3 Themen aktivieren – beim 4. kommt eine Meldung/Blockierung
- [ ] Frequenz-Regler funktioniert und speichert
- [ ] Guardrail-Level wird angezeigt mit Beispielen
- [ ] Beispiele ändern sich je nach Level (Level 1 restriktiver als Level 4)
- [ ] Level speichert auf kid_profiles
- [ ] Bestehende Story-Generierung funktioniert noch wie vorher
- [ ] Bestehende Kid-Profile haben sinnvollen Default-Safety-Level

**Red Flags:**
- ❌ Lernthemen-Labels sind hardcoded statt aus DB geladen
- ❌ Beispieltexte fehlen oder sind nicht übersetzt
- ❌ Kein CHECK Constraint auf active_themes (man kann 10 auswählen)
- ❌ Safety-Level speichert nicht oder hat keinen Default
- ❌ Bestehende Seiten/Funktionen sind kaputt
- ❌ Migration löscht oder ändert bestehende Tabellen-Struktur

---

## Block 2.2: Regel-DB – age_rules, theme_rules, emotion_rules, image_style_rules

### Problem
Story-Regeln (Satzlänge, Zeitennutzung, Vokabular, Plot-Strukturen) stecken in monolithischen 30k-Token-Prompts. Nicht granular, nicht pro Sprache, nicht wartbar.

### Ziel
Strukturierte Tabellen mit allen Story-Generierungsregeln. Noch KEIN Umbau von generate-story – nur die Datengrundlage.

### Cursor-Prompt

```
Lies die ARCHITECTURE.md, IMPLEMENTATION_PLAN.md und STORY_ENGINE_BLOCK2.md im Projekt-Root.

Aufgabe: Erstelle die Regel-Tabellen für die Story-Generierung und befülle sie mit Seed-Daten.

SCHRITT 1: Neue Tabellen (Supabase Migration)

Tabelle: age_rules
- id (uuid, PK, default gen_random_uuid())
- min_age (integer, NOT NULL)
- max_age (integer, NOT NULL)
- language (text, NOT NULL) -- 'fr', 'de', 'en', etc.
- max_sentence_length (integer, NOT NULL) -- max Wörter pro Satz
- allowed_tenses (text[], NOT NULL) -- z.B. '{"présent", "passé composé"}' oder '{"Präsens"}'
- sentence_structures (text, NOT NULL) -- Fließtext: welche Satzstrukturen erlaubt
- vocabulary_level (integer, NOT NULL) -- 1-5
- complexity_level (integer, NOT NULL) -- 1-5
- min_word_count (integer, NOT NULL) -- Mindestwortanzahl Story
- max_word_count (integer, NOT NULL) -- Maximalwortanzahl Story
- paragraph_length (text) -- z.B. "2-3 Sätze pro Absatz"
- dialogue_ratio (text) -- z.B. "30-40% der Geschichte soll Dialog sein"
- narrative_perspective (text) -- z.B. "dritte Person" oder "Ich-Erzähler"
- narrative_guidelines (text, NOT NULL) -- Fließtext: Erzählstil-Regeln
- example_sentences (text[]) -- Beispielsätze für dieses Alter/Sprache
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
- UNIQUE(min_age, max_age, language)

Tabelle: theme_rules
- id (uuid, PK, default gen_random_uuid())
- theme_key (text, NOT NULL) -- z.B. 'dragon', 'space', 'friendship'
- language (text, NOT NULL)
- labels (jsonb, NOT NULL) -- {"de": "Drache", "fr": "Dragon"} (für UI)
- plot_templates (text[], NOT NULL) -- mögliche Plot-Strukturen
- setting_descriptions (text, NOT NULL) -- atmosphärische Beschreibungen
- character_archetypes (text[]) -- passende Charakter-Typen
- sensory_details (text) -- Sinneseindrücke für dieses Thema
- typical_conflicts (text[]) -- typische Konflikte
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
- UNIQUE(theme_key, language)

Tabelle: emotion_rules
- id (uuid, PK, default gen_random_uuid())
- emotion_key (text, NOT NULL) -- z.B. 'courage', 'friendship', 'curiosity'
- language (text, NOT NULL)
- labels (jsonb, NOT NULL) -- {"de": "Mut", "fr": "Courage"}
- conflict_patterns (text[], NOT NULL) -- passende Konfliktbögen
- character_development (text, NOT NULL) -- wie Charaktere sich entwickeln
- resolution_patterns (text[]) -- wie die Geschichte aufgelöst wird
- emotional_vocabulary (text[]) -- passende emotionale Wörter für dieses Alter
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
- UNIQUE(emotion_key, language)

Tabelle: image_style_rules
- id (uuid, PK, default gen_random_uuid())
- age_group (text, NOT NULL) -- '4-6', '7-9', '10-12'
- theme_key (text) -- optional, für themen-spezifische Stile
- style_prompt (text, NOT NULL) -- Stil-Anweisungen für Bildgenerierung
- negative_prompt (text) -- was im Bild vermieden werden soll
- color_palette (text) -- z.B. "warm, sanft, pastellfarben"
- art_style (text) -- z.B. "Aquarell-Illustration", "kinderbuchähnlich"
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

SCHRITT 2: Seed-Daten

WICHTIG: Analysiere zuerst die bestehenden System-Prompts in app_settings.
Frage: "Zeig mir alle Einträge in app_settings die 'system_prompt' oder 'prompt' im Key haben."
Extrahiere daraus die konkreten Regeln und verteile sie auf die Tabellen.

Für age_rules erstelle mindestens diese Einträge (Französisch als Primärsprache):
- Alter 4-5, FR: sehr einfache Sätze, nur Präsens, max 6 Wörter/Satz, 150-250 Wörter
- Alter 6-7, FR: einfache Sätze, Präsens + Passé composé, max 10 Wörter/Satz, 250-400 Wörter
- Alter 8-9, FR: mittlere Komplexität, alle Grundzeiten, max 14 Wörter/Satz, 400-600 Wörter
- Alter 10-12, FR: komplexere Sätze, alle Zeiten, max 18 Wörter/Satz, 600-900 Wörter
Für DE und EN: gleiche Altersgruppen mit sprachspezifischen Anpassungen.
Für andere Sprachen: Platzhalter mit Basiswerten.

Für theme_rules: Erstelle Einträge für alle Themen die aktuell in der App verfügbar sind
(schaue in src/assets/story-types/ und in der Story-Creation-UI welche Themen angeboten werden).
Mindestens auf Französisch, Deutsch, Englisch.

Für emotion_rules: Erstelle Einträge für die wichtigsten Emotionen
(courage, friendship, curiosity, humor, wonder, empathy).
Mindestens auf Französisch, Deutsch, Englisch.

Für image_style_rules: Erstelle Einträge für die 3 Altersgruppen.
Jüngere Kinder → weichere Farben, rundere Formen, fröhlicher Stil.
Ältere Kinder → detailliertere Illustrationen, realistischere Proportionen.

SCHRITT 3: RLS-Policies
Alle 4 Tabellen: SELECT für authenticated, INSERT/UPDATE/DELETE nur admin.

SCHRITT 4: TypeScript-Types aktualisieren

Wichtig:
- KEINE Änderungen an generate-story oder anderen Edge Functions
- KEINE Änderungen an der UI (außer types.ts)
- Fokus: saubere Tabellen + reichhaltige Seed-Daten
- Die Seed-Daten sind das Herzstück – hier muss Qualität rein
```

### Checkliste: Hat Cursor gute Arbeit gemacht?

**Im Code prüfen:**
- [ ] Migration erstellt: age_rules, theme_rules, emotion_rules, image_style_rules
- [ ] UNIQUE Constraints auf den richtigen Spalten
- [ ] Seed-Daten: age_rules hat mindestens 4 Altersgruppen × 3 Sprachen = 12 Einträge
- [ ] Seed-Daten: theme_rules deckt alle Themen ab die in der App angeboten werden
- [ ] Seed-Daten: emotion_rules hat mindestens 6 Emotionen × 3 Sprachen
- [ ] Seed-Daten: image_style_rules hat mindestens 3 Altersgruppen
- [ ] RLS-Policies auf allen 4 Tabellen
- [ ] types.ts aktualisiert

**Seed-Daten-Qualität prüfen (im Supabase Dashboard → Table Editor):**
- [ ] age_rules FR Alter 6-7: Satzlänge, Zeiten, Vokabular – macht das Sinn?
- [ ] theme_rules: Plot-Templates klingen nach guten Geschichten?
- [ ] emotion_rules: Konfliktmuster passen zur Emotion?
- [ ] narrative_guidelines: konkreter Fließtext, nicht generisch?
- [ ] Bestehende App-Prompts wurden analysiert und einbezogen?

**Red Flags:**
- ❌ Seed-Daten sind generisch/oberflächlich ("Erzähle eine gute Geschichte")
- ❌ Bestehende Prompt-Regeln aus app_settings wurden ignoriert
- ❌ Nur eine Sprache vorhanden (kein DE, kein EN)
- ❌ age_rules hat keine sprachspezifischen Anpassungen (Französisch Zeiten ≠ Deutsche Zeiten)
- ❌ Tabellen sind leer nach Migration

---

## Block 2.3: Story Engine – promptBuilder + generate-story Umbau

### Problem
generate-story lädt monolithische Prompts aus app_settings. Die neuen Regel-Tabellen, Lernthemen und Guardrails werden noch nicht genutzt.

### Ziel
Neuer promptBuilder der alle Layer zusammenfügt. generate-story nutzt den neuen Builder.

### Cursor-Prompt

```
Lies die ARCHITECTURE.md, IMPLEMENTATION_PLAN.md und STORY_ENGINE_BLOCK2.md im Projekt-Root.

Aufgabe: Erstelle den promptBuilder und baue generate-story um, alle Prompt-Layer zu nutzen.

SCHRITT 1: promptBuilder erstellen

Erstelle: supabase/functions/_shared/promptBuilder.ts

Input-Parameter:
{
  age: number,
  reading_language: string,
  theme: string,
  emotion: string,
  story_type: string,           -- 'fantasy' | 'everyday' | 'educational'
  kid_name: string,
  kid_gender: string,
  content_safety_level: number, -- 1-4
  learning_theme: string | null,-- z.B. 'sharing' oder null
  series_context: object | null -- für spätere Serien-Unterstützung
}

Der Builder lädt per Supabase Query:
1. age_rules WHERE min_age <= age AND max_age >= age AND language = reading_language
2. theme_rules WHERE theme_key = theme AND language = reading_language
3. emotion_rules WHERE emotion_key = emotion AND language = reading_language
4. image_style_rules WHERE age_group passend zum Alter
5. content_themes_by_level WHERE min_safety_level <= content_safety_level
6. learning_themes WHERE theme_key = learning_theme (wenn aktiv)

Der Builder baut einen System-Prompt in dieser Layer-Struktur:

LAYER 1: BASE
- Sprache, Name des Kindes, Alter, Geschlecht
- "Du bist ein kreativer Geschichtenerzähler für Kinder..."

LAYER 2: ALTERSREGELN (aus age_rules)
- Satzlänge, Zeiten, Vokabular, Textlänge
- Narrative Guidelines
- Beispielsätze

LAYER 3: THEMA (aus theme_rules)
- Plot-Templates, Setting, Charakter-Archetypen
- Sensorische Details, typische Konflikte

LAYER 4: EMOTION (aus emotion_rules)
- Konfliktmuster, Charakterentwicklung
- Emotionales Vokabular

LAYER 5: CONTENT GUARDRAILS (aus content_themes_by_level)
- "ERLAUBT:" Liste der erlaubten emotionalen Themen
- "NICHT ERLAUBT:" Liste der verbotenen Themen
- "Wenn ein emotionales Thema vorkommt, MUSS eine Bewältigungsperspektive geboten werden."

LAYER 6: LERNTHEMA (wenn aktiv, aus learning_themes)
- "Aktuelles Lernthema: [Label]"
- "Webe dieses Thema SUBTIL in die Handlung. KEIN erhobener Zeigefinger."
- "Generiere zusätzlich: parent_conversation_prompts (3 Gesprächsfragen)"

LAYER 7: OUTPUT FORMAT
- Structured JSON Output: title, content, questions, vocabulary, structure_ratings
- Wenn Lernthema aktiv: zusätzlich learning_theme_applied + parent_prompt_text

Ziel: Der fertige Prompt soll 3-5k Tokens haben, nicht 30k.
Der Builder soll loggen: welche Regeln geladen, wieviel Tokens geschätzt.

SCHRITT 2: generate-story/index.ts anpassen

- Importiere promptBuilder
- Lade kid_profile (inkl. content_safety_level)
- Lade parent_learning_config für das Kind
- Bestimme ob ein Lernthema aktiv ist (basierend auf Frequenz + Rotation):
  → Zähle letzte N Stories für dieses Kind
  → Prüfe ob gemäß Frequenz jetzt ein Lernthema dran ist
  → Wenn ja: wähle das nächste Thema aus active_themes (Round-Robin)
- Rufe promptBuilder auf mit allen Parametern
- Nutze den generierten Prompt statt der alten app_settings Prompts
- Wenn Lernthema aktiv war: speichere learning_theme_applied + parent_prompt_text auf der Story
- Behalte Consistency Check und Bild-Generierung vorerst unverändert

SCHRITT 3: Lernthema-Rotation Logik

Erstelle: supabase/functions/_shared/learningThemeRotation.ts

Diese Funktion:
1. Lädt parent_learning_config für das Kind
2. Wenn keine aktiven Themen → return null
3. Zählt letzte Stories mit learning_theme_applied für dieses Kind
4. Basierend auf frequency (1=jede 4., 2=jede 2.-3., 3=jede 2.):
   → Prüft ob jetzt ein Lernthema dran ist
5. Wenn ja: nimmt das nächste Thema aus active_themes (Round-Robin, basierend auf welches zuletzt dran war)
6. Return: theme_key oder null

Wichtig:
- Alte app_settings Prompts NICHT löschen (Fallback wenn Regel-Tabellen leer)
- Wenn eine Regel-Tabelle leer ist für die angefragte Sprache: Fallback auf 'fr' oder auf alte Prompts
- Logge klar welcher Pfad genommen wird (neue Regeln vs. Fallback)
- Teste mit: Alter 6, Französisch, Thema Abenteuer, Safety Level 2, Lernthema 'sharing'
```

### Checkliste: Hat Cursor gute Arbeit gemacht?

**Im Code prüfen:**
- [ ] `promptBuilder.ts` existiert in `supabase/functions/_shared/`
- [ ] `learningThemeRotation.ts` existiert in `supabase/functions/_shared/`
- [ ] `generate-story/index.ts` importiert und nutzt beide
- [ ] Prompt wird aus DB-Regeln gebaut (nicht hardcoded)
- [ ] Alle 7 Layer sind im generierten Prompt erkennbar
- [ ] Fallback-Logik vorhanden (leere Tabellen → alte Prompts)
- [ ] Lernthema-Rotation: Round-Robin + Frequenz-Logik
- [ ] Stories speichern learning_theme_applied + parent_prompt_text

**In der App testen:**
- [ ] App startet ohne Fehler
- [ ] Erstelle eine Story OHNE Lernthemen konfiguriert → funktioniert wie vorher
- [ ] Konfiguriere Lernthemen im Eltern-Panel (z.B. 'sharing', Frequenz 'häufig')
- [ ] Erstelle 3-4 Stories → mindestens eine sollte das Lernthema subtil enthalten
- [ ] Story mit Lernthema: hat parent_prompt_text (Gesprächsfragen)?
- [ ] Erstelle Story mit Safety Level 1 → keine emotionalen Konflikte in der Geschichte
- [ ] Erstelle Story mit Safety Level 3 → darf Themen wie Streit enthalten
- [ ] Vergleiche Qualität mit alten Stories (mindestens gleich gut!)

**Qualitätstest Lernthemen (der wichtigste!):**
- [ ] Ist das Lernthema SUBTIL eingewoben? (Kein "Und die Moral der Geschichte ist...")
- [ ] Ergibt sich das Thema natürlich aus der Handlung?
- [ ] Passen die Gesprächsfragen zur konkreten Geschichte?
- [ ] Würdest du als Elternteil den Gesprächsleitfaden nützlich finden?

**Qualitätstest Guardrails:**
- [ ] Safety Level 1: Wirklich nur fröhlich/sicher? Kein Streit, keine Angst?
- [ ] Safety Level 2: Leichte Konflikte ja, aber keine schweren Themen?
- [ ] Safety Level 3: Passt zum Beispiel-Katalog?

**Red Flags:**
- ❌ promptBuilder macht keinen DB-Query (Regeln hardcoded)
- ❌ generate-story lädt immer noch primär aus app_settings
- ❌ Lernthema wird in JEDER Geschichte eingebaut (Frequenz ignoriert)
- ❌ Guardrails werden im Prompt nicht erwähnt
- ❌ Geschichten werden deutlich kürzer/schlechter
- ❌ Fehlermeldungen bei Story-Generierung
- ❌ parent_prompt_text ist immer NULL obwohl Lernthema aktiv

---

## Block 2.4: Parallele Bild-Generierung

### Problem
Bilder werden sequenziell generiert. Bei 3 Bildern wartet der User dreimal so lang wie nötig.

### Ziel
Cover + alle Story-Bilder parallel generieren. User wartet nur so lang wie das langsamste Bild.

### Cursor-Prompt

```
Lies die ARCHITECTURE.md und IMPLEMENTATION_PLAN.md im Projekt-Root.

Aufgabe: Refactore die Bild-Generierung in generate-story für parallele Ausführung.

Aktueller Flow (sequenziell):
1. Story-Text generieren
2. Cover-Bild generieren (warten)
3. Story-Bild 1 generieren (warten)
4. Story-Bild 2 generieren (warten)
5. Alles zusammen zurückgeben

Neuer Flow (parallel):
1. Story-Text generieren
2. Aus dem Text Bild-Prompts extrahieren (für Cover + Story-Bilder)
3. ALLE Bilder gleichzeitig starten mit Promise.allSettled()
4. Warten bis alle fertig (oder Timeout nach 30 Sekunden)
5. Für fehlgeschlagene Bilder: Fallback-Bild oder nochmal versuchen
6. Alles zusammen zurückgeben

Die Bild-Prompts sollen die image_style_rules aus der DB nutzen (aus Block 2.2).

Wichtig:
- Promise.allSettled() statt Promise.all() (ein Fehler bricht nicht alles ab)
- Timeout 30 Sekunden pro Bild
- Fallback bei Fehler: Placeholder-Bild + Error-Log
- image_cache Mechanismus beibehalten
- Fallback-Kette (Gemini → Lovable Gateway) beibehalten
- Max 4 parallele Calls gleichzeitig (Rate Limit Schutz)

Keine anderen Flows ändern.
```

### Checkliste: Hat Cursor gute Arbeit gemacht?

**Im Code prüfen:**
- [ ] Promise.allSettled() wird verwendet
- [ ] Alle Bild-Requests starten gleichzeitig
- [ ] Timeout pro Bild gesetzt (30s)
- [ ] Einzelnes fehlgeschlagenes Bild crasht nicht die Story
- [ ] image_style_rules werden aus DB geladen für Bild-Prompts
- [ ] Max 4 parallele Calls (kein unbegrenztes Promise.all)

**In der App testen:**
- [ ] Erstelle eine Geschichte und miss die Zeit (Stoppuhr)
- [ ] Ist es schneller als vorher? (30-60% erwartet)
- [ ] Alle Bilder werden angezeigt (Cover + Story-Bilder)
- [ ] Bilder passen zum Story-Inhalt
- [ ] image_cache funktioniert noch (gleiche Story nochmal → schneller)

**Red Flags:**
- ❌ Code wartet sequenziell (await im Loop statt Promise.allSettled)
- ❌ Bild-Fehler → keine Geschichte
- ❌ Bilder vertauscht (Cover an falscher Stelle)
- ❌ Mehr als 5 parallele API-Calls

---

## Block 2.5: generate-story splitten + Cleanup

### Problem
generate-story ist eine Riesendatei. Cursor verliert bei großen Dateien den Überblick.

### Ziel
Logische Module, gleiche Funktionalität, bessere Wartbarkeit.

### Cursor-Prompt

```
Lies die ARCHITECTURE.md und IMPLEMENTATION_PLAN.md im Projekt-Root.

Aufgabe: Refactore generate-story in kleinere Module.

Zielstruktur:
supabase/functions/generate-story/
  ├── index.ts              → Orchestrierung (max 100-150 Zeilen)
  ├── textGenerator.ts      → Story-Text generieren (Gemini Call + Retry)
  ├── imageGenerator.ts     → Parallele Bilder (mit Fallback-Kette)
  ├── consistencyChecker.ts → Consistency Check
  └── types.ts              → Shared Types

supabase/functions/_shared/
  ├── promptBuilder.ts      → (bereits vorhanden aus Block 2.3)
  └── learningThemeRotation.ts → (bereits vorhanden aus Block 2.3)

Regeln:
- Jedes Modul: eine klare Verantwortung, eine Hauptfunktion
- KEINE Funktionalität ändern – nur umstrukturieren
- Output muss identisch sein
- Entferne Debug-console.logs (behalte Error-Logs)
- Ersetze offensichtliche "any" Types
```

### Checkliste: Hat Cursor gute Arbeit gemacht?

**Im Code prüfen:**
- [ ] index.ts < 150 Zeilen
- [ ] textGenerator.ts, imageGenerator.ts, consistencyChecker.ts existieren
- [ ] Klare Imports/Exports, keine zirkulären Abhängigkeiten
- [ ] Console.log Spam reduziert
- [ ] Keine neuen "any" Types

**In der App testen:**
- [ ] Story erstellen → funktioniert wie vorher
- [ ] Bilder da → wie vorher
- [ ] Lernthema-Funktion → wie vorher
- [ ] Guardrails → wie vorher
- [ ] Serien-Story → wie vorher
- [ ] Verschiedene Story-Typen (Abenteuer, Sachtext, Fantasy) → alle funktionieren

**Red Flags:**
- ❌ index.ts > 500 Zeilen (nicht aufgeteilt)
- ❌ Zirkuläre Imports
- ❌ Neue Fehler bei Story-Generierung
- ❌ Lernthemen/Guardrails gehen verloren beim Refactoring

---

## Generelle Tipps für die Arbeit mit Cursor

### Vor jedem Block
1. Committe den aktuellen Stand: `git add -A && git commit -m "vor Block X.Y"`
2. So kannst du jederzeit zurück

### Während Cursor arbeitet
- Lass Cursor den kompletten Prompt ausführen
- Wenn Cursor Rückfragen stellt: beantworte sie
- Wenn Cursor fertig ist: teste ZUERST ob die App startet (`npm run dev`)

### Nach jedem Block
1. Geh die Checkliste durch
2. Alles grün → `git add -A && git commit -m "Block X.Y fertig"`
3. Red Flags → berichte Johann was passiert ist
4. Unsicher → kopier den relevanten Code hierher

### Nach jedem Block: ARCHITECTURE.md aktualisieren
Sag Cursor: "Aktualisiere ARCHITECTURE.md basierend auf den Änderungen aus Block X.Y."

### Wenn etwas kaputtgeht
```
git stash        → Änderungen zur Seite
git log          → letzte Commits anschauen
git checkout .   → zurück zum letzten Commit
```

---

## Nach Block 2.5: Was haben wir erreicht?

- ✅ App ist ready für 10 Sprachen (Block 1)
- ✅ Eltern können erzieherische Schwerpunkte setzen (Block 2.1)
- ✅ Content Guardrails schützen Kinder altersgerecht (Block 2.1)
- ✅ Story-Qualität durch fokussierte, regelbasierte Prompts (Block 2.2 + 2.3)
- ✅ Lernthemen werden subtil in Geschichten eingewoben (Block 2.3)
- ✅ ~80% weniger Tokens pro Story (Block 2.3)
- ✅ ~50% schnellere Story-Generierung (Block 2.4)
- ✅ Wartbarer, modularer Code (Block 2.5)

## Nächste Schritte

**Block 3: Branching & Serien** (aus STORY_ENGINE_BLOCK2.md Thema 3)
- Blueprint-Generierung
- Episode-on-demand mit Branch-Logik
- Neues DB-Schema: story_series, story_episodes, branch_history

**Danach:**
- RLS-Policies fixen (vor Tester-Welle 2)
- Gemini Paid Tier einrichten + Lovable Gateway entfernen
- Security Hardening (vor Public Launch)
- Stripe Integration
- Audio-Modus ausbauen (Anti-Screen-Time Argument)
- Eltern-Dashboard mit Lernfortschritt
