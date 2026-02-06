# Petit Lecteur – Implementierungsplan Produktverbesserung

> Ziel: Story-Qualität, Mehrsprachigkeit und Skalierbarkeit verbessern.
> Methode: Block für Block in Cursor umsetzen, nach jedem Block testen.
> Wichtig: Dieses Dokument ins Projekt-Root kopieren, damit Cursor es als Referenz nutzen kann.

---

## Übersicht: 4 Blöcke in optimaler Reihenfolge

| Block | Thema | Warum diese Reihenfolge | Geschätzter Aufwand |
|-------|-------|------------------------|-------------------|
| 1 | DB-Modell: Mehrsprachigkeit | Fundament – alles andere baut darauf auf | 1-2 Tage |
| 2 | Story Engine: Regel-DB + fokussierte Prompts | Kernprodukt – Qualität + Kosten | 2-3 Tage |
| 3 | Story Engine: Parallele Bild-Generierung | UX – User wartet kürzer | 1 Tag |
| 4 | Architektur: generate-story splitten + Cleanup | Wartbarkeit + Stabilität | 1-2 Tage |

---

## Block 1: Datenbank-Modell für Mehrsprachigkeit

### Problem
Aktuell ist Sprache ein einzelnes Feld (`text_language`) auf Stories und User-Profilen. Das reicht nicht für eine App, die in 10 Sprachen funktionieren soll und deren Kernwert die Brücke zwischen Heimat- und Schulsprache ist.

### Ziel
Saubere Sprachtrennung pro Kind: UI-Sprache, Leseprache, Erklärungssprache, Heimatsprachen. Alle abhängigen Tabellen (marked_words, comprehension_questions) wissen, welche Sprache sie betreffen.

### Cursor-Prompt

```
Lies zunächst die ARCHITECTURE.md und den IMPLEMENTATION_PLAN.md im Projekt-Root.

Aufgabe: Erweitere das Datenbank-Schema für vollständige Mehrsprachigkeit.

Änderungen an kid_profiles:
- Füge hinzu: ui_language (text, NOT NULL, default 'fr')
- Füge hinzu: reading_language (text, NOT NULL, default 'fr')
- Füge hinzu: explanation_language (text, NOT NULL, default 'de')
- Füge hinzu: home_languages (text[], NOT NULL, default '{"de"}')
- Behalte die bestehenden Felder (school_system, school_class, etc.)

Änderungen an marked_words:
- Füge hinzu: word_language (text, NOT NULL)
- Füge hinzu: explanation_language (text, NOT NULL)
- Setze Default-Werte basierend auf bestehenden Daten

Änderungen an comprehension_questions:
- Füge hinzu: question_language (text, NOT NULL)

Änderungen an stories:
- Stelle sicher dass text_language NOT NULL ist
- Füge hinzu: kid_profile_id (uuid, REFERENCES kid_profiles(id)) falls nicht vorhanden

Wichtig:
- Erstelle eine neue Supabase Migration (nicht bestehende ändern)
- Schreibe ein Migrations-Script das bestehende Daten korrekt migriert
- Bestehende Stories/Words sollen die Sprache aus dem zugehörigen User-/Kid-Profil erben
- Aktualisiere die TypeScript-Types in src/integrations/supabase/types.ts
- Aktualisiere useKidProfile.tsx um die neuen Felder zu lesen/schreiben
- Aktualisiere die Story-Creation-Seite: die reading_language des aktiven Kid-Profils bestimmt die Story-Sprache
- Aktualisiere explain-word: die explanation_language des Kid-Profils bestimmt die Erklärungssprache

KEINE anderen Dateien ändern als die genannten.
Erstelle KEINE neuen Tabellen – nur bestehende erweitern.
Teste dass npm run dev ohne Fehler startet.
```

### Checkliste: Hat Cursor gute Arbeit gemacht?

**Im Code prüfen (Cursor fragen: "Zeig mir die neue Migration"):**
- [ ] Neue Migration-Datei unter `supabase/migrations/` vorhanden
- [ ] Migration enthält `ALTER TABLE` Statements (nicht `CREATE TABLE`)
- [ ] Default-Werte gesetzt für neue Spalten
- [ ] Bestehende Daten werden migriert (UPDATE Statements)

**In der App testen:**
- [ ] App startet ohne Fehler (`npm run dev` → keine roten Fehler in Console)
- [ ] Du kannst ein Kid-Profil bearbeiten und siehst die neuen Sprachfelder
- [ ] Bestehende Kid-Profile haben sinnvolle Default-Werte
- [ ] Du kannst eine Story erstellen → sie wird in der reading_language des Kindes generiert
- [ ] Bestehende Stories sind noch lesbar und zeigen korrekt an
- [ ] Wenn du auf ein Wort tippst, kommt die Erklärung in der explanation_language

**Red Flags (Cursor hat Mist gebaut):**
- ❌ Bestehende Daten sind verschwunden
- ❌ App zeigt leere Seiten oder Ladebildschirme die nie aufhören
- ❌ Fehlermeldungen mit "column does not exist"
- ❌ Migration erstellt neue Tabellen statt bestehende zu erweitern
- ❌ Types in types.ts passen nicht zum neuen Schema

---

## Block 2: Story Engine – Regel-DB + fokussierte Prompts

### Problem
Aktuell werden 30k-Token-Prompts aus `app_settings` (Key-Value Store) geladen und komplett ans LLM geschickt. Das ist langsam, teuer, und das LLM verliert Fokus bei so viel Kontext.

### Ziel
Strukturierte Regel-Tabellen in der DB. Pro Story-Generierung werden nur die relevanten Regeln geladen (ca. 3-5k Tokens statt 30k).

### Cursor-Prompt

```
Lies zunächst die ARCHITECTURE.md und den IMPLEMENTATION_PLAN.md im Projekt-Root.

Aufgabe: Erstelle Regel-Tabellen für die Story-Generierung und baue den Prompt-Aufbau um.

SCHRITT 1: Neue Tabellen erstellen (Supabase Migration)

Tabelle: age_rules
- id (uuid, PK)
- min_age (integer, NOT NULL)
- max_age (integer, NOT NULL)
- language (text, NOT NULL) -- z.B. 'fr', 'de', 'en'
- max_sentence_length (integer) -- max Wörter pro Satz
- vocabulary_level (integer) -- 1-5
- complexity_level (integer) -- 1-5
- narrative_guidelines (text) -- Erzählstil-Regeln als Text
- example_sentences (text[]) -- Beispielsätze für das Alter
- created_at, updated_at

Tabelle: theme_rules
- id (uuid, PK)
- theme_key (text, NOT NULL) -- z.B. 'dragon', 'space', 'friendship'
- language (text, NOT NULL)
- plot_templates (text[]) -- mögliche Plot-Strukturen
- setting_descriptions (text) -- atmosphärische Beschreibungen
- character_archetypes (text[]) -- passende Charakter-Typen
- sensory_details (text) -- Sinneseindrücke für dieses Thema
- created_at, updated_at

Tabelle: emotion_rules
- id (uuid, PK)
- emotion_key (text, NOT NULL) -- z.B. 'courage', 'friendship', 'curiosity'
- language (text, NOT NULL)
- conflict_patterns (text[]) -- passende Konfliktbögen
- character_development (text) -- wie Charaktere sich entwickeln
- resolution_patterns (text[]) -- wie die Geschichte aufgelöst wird
- created_at, updated_at

Tabelle: image_style_rules
- id (uuid, PK)
- age_group (text, NOT NULL) -- z.B. '4-6', '7-9', '10-12'
- theme_key (text) -- optional, themen-spezifisch
- style_prompt (text, NOT NULL) -- Stil-Anweisungen für Bildgenerierung
- negative_prompt (text) -- was vermieden werden soll
- created_at, updated_at

SCHRITT 2: Seed-Daten

Extrahiere die bestehenden Regeln aus app_settings (die System-Prompts).
Analysiere den Inhalt und verteile ihn auf die neuen Tabellen.
Erstelle ein Seed-Script das die Tabellen mit initialen Regeln befüllt.
Beginne mit Französisch als Primärsprache.
Für die anderen Sprachen erstelle Platzhalter-Einträge.

SCHRITT 3: Neuer Prompt-Builder

Erstelle eine neue Datei: supabase/functions/_shared/promptBuilder.ts

Diese Funktion:
1. Erhält: age, reading_language, theme, emotion, story_type
2. Lädt per Supabase Query nur die relevanten Regeln:
   - age_rules WHERE min_age <= age AND max_age >= age AND language = reading_language
   - theme_rules WHERE theme_key = theme AND language = reading_language
   - emotion_rules WHERE emotion_key = emotion AND language = reading_language
   - image_style_rules WHERE age_group matches AND theme_key = theme
3. Baut daraus einen fokussierten System-Prompt (Ziel: 3-5k Tokens)
4. Gibt den Prompt als String zurück

SCHRITT 4: generate-story anpassen

In supabase/functions/generate-story/index.ts:
- Importiere den neuen promptBuilder
- Ersetze das Laden der monolithischen Prompts aus app_settings
- Nutze stattdessen den promptBuilder mit den Kind-Parametern
- Behalte den Rest des Flows (Bild-Generierung, Consistency Check) vorerst unverändert

Wichtig:
- Die alten app_settings Prompts NICHT löschen (Fallback)
- Neue Tabellen mit RLS-Policies: SELECT für authenticated, INSERT/UPDATE nur für admin
- Der promptBuilder soll gut loggen welche Regeln er geladen hat (console.log ist OK für jetzt)
- Teste mit einem einfachen Fall: Alter 6, Französisch, Thema Abenteuer
```

### Checkliste: Hat Cursor gute Arbeit gemacht?

**Im Code prüfen:**
- [ ] 4 neue Tabellen in der Migration (age_rules, theme_rules, emotion_rules, image_style_rules)
- [ ] Seed-Script vorhanden das mindestens Französisch-Regeln enthält
- [ ] `promptBuilder.ts` existiert in `supabase/functions/_shared/`
- [ ] `generate-story/index.ts` importiert und nutzt den promptBuilder
- [ ] Alte app_settings Prompts sind noch da (nicht gelöscht)

**In der App testen:**
- [ ] App startet ohne Fehler
- [ ] Erstelle eine neue Geschichte mit einem Kind (Alter 6, Französisch)
- [ ] Geschichte wird generiert (keine Fehlermeldung)
- [ ] Vergleiche Qualität: Ist die Geschichte mindestens so gut wie vorher?
- [ ] Vergleiche Geschwindigkeit: Geht es schneller als vorher?
- [ ] In Supabase Dashboard → Table Editor: Sind die neuen Tabellen mit Daten befüllt?

**Qualitätstest (der wichtigste!):**
- [ ] Generiere 5 Geschichten mit verschiedenen Parametern
- [ ] Bewerte jede Geschichte: Altersgerecht? Satzlänge passend? Thema getroffen?
- [ ] Vergleiche mit 5 Geschichten aus der alten Version
- [ ] Wenn die neue Version schlechter ist: Regeln in den Tabellen anpassen, nicht den Code

**Red Flags:**
- ❌ promptBuilder macht keinen DB-Query sondern hat Regeln hardcoded
- ❌ generate-story lädt immer noch die alten app_settings Prompts als Primärquelle
- ❌ Neue Tabellen haben keine Daten
- ❌ Geschichten werden deutlich kürzer oder qualitativ schlechter
- ❌ Fehlermeldungen bei Story-Generierung

---

## Block 3: Parallele Bild-Generierung

### Problem
Aktuell werden Bilder sequenziell generiert: erst Cover, dann Story-Bilder eins nach dem anderen. Bei 3 Bildern wartet der User dreimal so lang wie nötig.

### Ziel
Cover + alle Story-Bilder werden parallel generiert. User wartet nur so lang wie das langsamste Bild braucht.

### Cursor-Prompt

```
Lies zunächst die ARCHITECTURE.md und den IMPLEMENTATION_PLAN.md im Projekt-Root.

Aufgabe: Refactore die Bild-Generierung in generate-story/index.ts für parallele Ausführung.

Aktueller Flow (sequenziell):
1. Story-Text generieren
2. Cover-Bild generieren (warten)
3. Story-Bild 1 generieren (warten)
4. Story-Bild 2 generieren (warten)
5. Alles zusammen zurückgeben

Neuer Flow (parallel):
1. Story-Text generieren
2. Aus dem Text Bild-Prompts extrahieren (für Cover + Story-Bilder)
3. ALLE Bilder gleichzeitig starten mit Promise.all() oder Promise.allSettled()
4. Warten bis alle fertig (oder Timeout nach 30 Sekunden)
5. Für fehlgeschlagene Bilder: Fallback-Bild oder nochmal versuchen
6. Alles zusammen zurückgeben

Wichtig:
- Nutze Promise.allSettled() statt Promise.all() damit ein fehlgeschlagenes Bild nicht alles abbricht
- Setze ein Timeout von 30 Sekunden pro Bild
- Wenn ein Bild fehlschlägt, verwende ein Placeholder/Fallback und logge den Fehler
- Die Bild-Prompts sollen die image_style_rules aus Block 2 nutzen (falls bereits implementiert)
- Behalte den image_cache Mechanismus bei
- Behalte die Fallback-Kette (Gemini → Lovable Gateway) bei

Keine anderen Flows ändern (Consistency Check, Text-Generierung etc.)
```

### Checkliste: Hat Cursor gute Arbeit gemacht?

**Im Code prüfen (frag Cursor: "Zeig mir den Bild-Generierungs-Code in generate-story"):**
- [ ] `Promise.allSettled()` oder `Promise.all()` wird verwendet
- [ ] Alle Bild-Requests starten gleichzeitig (nicht nacheinander)
- [ ] Timeout pro Bild ist gesetzt
- [ ] Fehlerbehandlung: einzelnes fehlgeschlagenes Bild crasht nicht die ganze Story

**In der App testen:**
- [ ] Erstelle eine Geschichte und miss die Zeit (Stoppuhr)
- [ ] Erstelle eine gleiche Geschichte nochmal und vergleiche mit vorher
- [ ] Ist es schneller? (Sollte 30-60% schneller sein bei 3 Bildern)
- [ ] Alle Bilder werden angezeigt (Cover + Story-Bilder)
- [ ] Bilder passen zum Story-Inhalt (keine verwechselten Bilder)

**Red Flags:**
- ❌ Code wartet immer noch sequenziell (await im Loop statt Promise.allSettled)
- ❌ Wenn ein Bild fehlschlägt, gibt es gar keine Geschichte mehr
- ❌ Bilder werden vertauscht (Cover an falscher Stelle etc.)
- ❌ Mehr als 5 parallele API-Calls gleichzeitig (Rate Limit Risiko)

---

## Block 4: generate-story splitten + Cleanup

### Problem
`generate-story/index.ts` hat 1335 Zeilen und macht Text-Generierung, Consistency Check, Bild-Generierung und Caching in einer Datei. Cursor verliert bei so großen Dateien den Überblick und erzeugt Regression Bugs.

### Ziel
Die Funktion in logische Module aufteilen. Gleiche Funktionalität, bessere Wartbarkeit.

### Cursor-Prompt

```
Lies zunächst die ARCHITECTURE.md und den IMPLEMENTATION_PLAN.md im Projekt-Root.

Aufgabe: Refactore generate-story/index.ts in kleinere, fokussierte Module.

Zielstruktur:
supabase/functions/generate-story/
  ├── index.ts              → Hauptfunktion: Orchestrierung (max 100 Zeilen)
  ├── textGenerator.ts      → Story-Text generieren (Gemini Call + Retry-Logik)
  ├── imageGenerator.ts     → Alle Bilder generieren (parallel, mit Fallback-Kette)
  ├── consistencyChecker.ts → Consistency Check
  ├── promptBuilder.ts      → Import aus _shared/promptBuilder.ts (oder move hierher)
  └── types.ts              → Shared Types für diesen Flow

Regeln:
- index.ts importiert die Module und orchestriert den Flow
- Jedes Modul hat eine klare, einzelne Verantwortung
- Jedes Modul exportiert genau eine Hauptfunktion
- Shared Types in types.ts
- KEINE Funktionalität ändern – nur umstrukturieren
- Der Output muss exakt identisch sein wie vorher
- Entferne console.log Statements die für Debugging waren (behalte Error-Logs)
- Ersetze "any" Types wo offensichtlich möglich

Teste nach dem Refactoring:
1. Generiere eine Story und vergleiche das Ergebnis mit einer Story vor dem Refactoring
2. Stelle sicher dass Consistency Check noch funktioniert
3. Stelle sicher dass Bilder noch generiert werden
4. Stelle sicher dass image_cache noch funktioniert
```

### Checkliste: Hat Cursor gute Arbeit gemacht?

**Im Code prüfen:**
- [ ] `generate-story/index.ts` ist jetzt deutlich kürzer (< 150 Zeilen)
- [ ] Separate Dateien existieren: textGenerator.ts, imageGenerator.ts, consistencyChecker.ts
- [ ] Jede Datei hat klare Imports und Exports
- [ ] Keine `any` Types in den neuen Dateien
- [ ] Console.log Spam ist reduziert

**In der App testen:**
- [ ] Erstelle eine Geschichte → funktioniert wie vorher
- [ ] Geschichte hat Bilder → wie vorher
- [ ] Tippe auf ein Wort → Erklärung kommt → wie vorher
- [ ] Erstelle eine Serien-Geschichte → funktioniert wie vorher
- [ ] Erstelle Geschichten mit verschiedenen Typen (Abenteuer, Sachtext, Fantasy)

**Red Flags:**
- ❌ index.ts ist immer noch > 500 Zeilen (nicht wirklich aufgeteilt)
- ❌ Module importieren sich gegenseitig zirkulär
- ❌ Fehler bei Story-Generierung die vorher nicht da waren
- ❌ Bilder fehlen oder Consistency Check läuft nicht mehr

---

## Generelle Tipps für die Arbeit mit Cursor

### Vor jedem Block
1. Committe den aktuellen Stand in Git ("vor Block X")
2. So kannst du jederzeit zurück wenn etwas schiefgeht

### Während Cursor arbeitet
- Lass Cursor den kompletten Prompt ausführen
- Wenn Cursor Rückfragen stellt: beantworte sie
- Wenn Cursor fertig ist: teste ZUERST ob die App startet

### Nach jedem Block
1. Geh die Checkliste durch
2. Wenn alles grün: Committe ("Block X fertig")
3. Wenn Red Flags: sag mir was passiert ist, wir fixen es zusammen
4. Wenn unsicher: kopier mir den relevanten Code hierher

### Wenn etwas kaputtgeht
```
git stash        → aktuelle Änderungen zur Seite legen
git log          → letzte Commits anschauen
git checkout .   → alles auf letzten Commit zurücksetzen
```
Oder sag mir einfach was passiert ist.

---

## Nach allen 4 Blöcken: Was haben wir erreicht?

- ✅ App ist ready für 10 Sprachen
- ✅ Story-Qualität durch fokussierte, regelbasierte Prompts
- ✅ ~80% weniger Tokens pro Story (Kostenersparnis)
- ✅ ~50% schnellere Story-Generierung (parallele Bilder)
- ✅ Wartbarer Code den Cursor zuverlässig bearbeiten kann
- ✅ Solide Basis für Stripe, Security und Launch

## Nächste Schritte (nach diesen 4 Blöcken)
- RLS-Policies fixen (vor Tester-Welle 2)
- Gemini Paid Tier einrichten
- Lovable Gateway Abhängigkeit entfernen
- Security Hardening (vor Public Launch)
- Stripe Integration
- Audio-Modus ausbauen
