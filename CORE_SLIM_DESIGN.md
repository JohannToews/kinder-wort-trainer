# Block 2.3b – CORE Slim Prompt Design

> Ziel: System-Prompt von ~6500+ Tokens auf ~1500 Tokens reduzieren.
> Methode: Alles Kind-/Story-spezifische in dynamischen Kontext auslagern (aus DB geladen).
> Status: ENTWURF – gemeinsam mit Johann reviewen und finalisieren.

---

## 1. Analyse: Was ist aktuell im System-Prompt?

### CORE (~4500 Tokens)
| Sektion | ~Tokens | Bleibt | Wohin |
|---------|---------|--------|-------|
| Kontext & Zielgruppe (Use Cases, Sprachniveau) | 400 | ❌ | Dynamic: `source` flag + `difficulty_rules` |
| Lesevergnügen (3 Säulen, Lahme-Ende-Verbot) | 350 | ✅ gekürzt | CORE Slim |
| Spannungswerkzeuge (8 Werkzeuge + Tabelle) | 400 | ✅ gekürzt | CORE Slim (ohne Beispiele) |
| Emotionales Spektrum (6 Farben + Kombinationen + Affinitäten) | 600 | ✅ gekürzt | CORE Slim (nur Codes + 1-Zeiler) |
| Content-Guardrails (verboten + erlaubt mit Vorsicht) | 500 | ✅ gekürzt | CORE Slim (kompakte Liste) |
| Textlängen-System (5 Stufen) | 150 | ❌ | Dynamic: `age_rules × Multiplikator` |
| Story-Typen (Fiction vs Sachtext) | 300 | ✅ mini | CORE Slim (3 Sätze Sachtext-Modus) |
| Story-Struktur A/M/E (6+6+6 mit Beispielen) | 800 | ✅ stark gekürzt | CORE Slim (nur Codes + 1-Satz) |
| Charakterentwicklung + Anti-Klischee | 350 | ✅ gekürzt | CORE Slim |
| Alters-Spezifika 6-7, 8-9, 10-12 (je ~250 Tok) | 750 | ❌ | Dynamic: `age_rules` (nur 1 Zeile) |
| Verständnisfragen-System (4 Typen + Beispiele) | 600 | ✅ gekürzt | CORE Slim (Format, ohne Beispiele) |
| Qualitäts-Checkliste | 300 | ❌ | Implizit in den Regeln |
| Output-Format | 150 | ✅ erweitert | CORE Slim (neues JSON mit Klassifikationen) |

### ELTERN-MODUL (~1500 Tokens) → wird eliminiert
| Sektion | Wohin |
|---------|-------|
| Kontext (Sprachlerner) | Dynamic: `source: 'parent'` |
| Inferenz-Architektur (Show don't tell) | 1 Zeile in CORE Slim ("Gefühle ZEIGEN") |
| Vokabular-Strategie (3 Techniken) | Dynamic: `difficulty_rules` |
| Vokabular-Menge nach Alter | Dynamic: `difficulty_rules.new_words_per_story` |
| Verständnisfragen (Erwartungshorizont) | Nicht genutzt (alle MC) |
| Schwierigkeitsgrade (Leicht/Mittel/Schwer) | Dynamic: `difficulty_rules` |

### KINDER-MODUL (~2500 Tokens) → wird eliminiert
| Sektion | Wohin |
|---------|-------|
| 6 Story-Typen (je ~300 Tok detailliert) | Dynamic: `theme_rules` (1 Eintrag) |
| Charaktere (Ich, Familie, Freunde etc.) | Dynamic: `protagonists` aus Wizard |
| Spezialeffekte (Superkräfte, Magie etc.) | Dynamic: `special_abilities` aus Wizard |
| Freitext verarbeiten | Dynamic: `user_prompt` |
| Setting-Auswahl | Implizit in `theme_rules` |
| Story-Generierung Schritt-für-Schritt | Nicht nötig (promptBuilder steuert) |

### SERIEN-MODUL (~3000 Tokens) → bleibt vorerst (nur bei Serien geladen)

---

## 2. Token-Bilanz

| | Aktuell | Neu | Ersparnis |
|---|---|---|---|
| System Message | ~4500 (CORE) + ~2000 (Modul) = **~6500** | **~1500** (CORE Slim) | **~77%** |
| User Message | ~200 (nur Parameter) | ~600-800 (aus DB + Varietät) | +400-600 |
| **Total pro Call** | **~6700** | **~2100-2300** | **~65-68%** |
| Bei Serien | ~9700 | ~4100-4300 | ~55-60% |

**Kosteneffekt bei Gemini:** ~65% weniger Input-Tokens = ~65% weniger Kosten pro Story.

---

## 3. CORE Slim Prompt (ENTWURF)

> Diesen Text als `system_prompt_core_v2` in `app_settings` speichern.

```
Du bist ein erfahrener Kinderbuchautor. Du schreibst Geschichten die Kinder zum Weiterlesen zwingen – in jeder Sprache idiomatisch und kulturell passend.

## LESEVERGNÜGEN (oberstes Ziel)
- Ersten 2 Sätze: Neugier wecken, Frage im Kopf erzeugen
- Mikro-Spannungsbogen: Problem → Komplikation → Auflösung (NICHT vor 70-80%)
- Letztes Drittel genauso fesselnd wie der Anfang
- Gefühle ZEIGEN, nicht benennen ("Mias Hände zitterten" statt "Mia war nervös")

## SPANNUNGSWERKZEUGE (nutze 1-4 je nach Länge)
- Falsche Fährte: Leser glaubt Lösung zu kennen – stimmt nicht
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
EM-J Joy – Glück, Erfolg, Leichtigkeit
EM-T Thrill – Nervenkitzel, Herzklopfen
EM-H Humor – Quatsch, Wortspiele, Absurdes
EM-W Warmth – Geborgenheit, Zusammenhalt
EM-D Depth – Mitfühlen, Nachdenklichkeit
EM-C Curiosity – Staunen, Entdeckerfreude

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
Typ 1 (15-20%): Ja/Nein/Steht nicht im Text – 3 Optionen
Typ 2 (30-35%): Fakten + Vokabular – 4 Optionen
Typ 3 (30-35%): Inferenzen (Gefühle, Kausalität, Vorhersagen) – 4 Optionen
Typ 4 (15-20%): Struktur (Hauptidee, Veränderung) – 4 Optionen
Falschantworten: plausibel im Kontext, nie absurd. Anzahl wird im Kontext angegeben.

## OUTPUT-FORMAT
Antworte AUSSCHLIESSLICH mit diesem JSON (kein Text davor/danach):
{
  "title": "string",
  "story": "Komplette Geschichte mit \\n\\n zwischen Absätzen",
  "new_words": ["wort1", "wort2"],
  "summary": "2-3 Sätze Zusammenfassung",
  "questions": [
    {"type": 1, "question": "...", "options": ["Ja","Nein","Steht nicht im Text"], "correct": 0},
    {"type": 2, "question": "...", "options": ["A","B","C","D"], "correct": 2}
  ],
  "classifications": {
    "structure_beginning": 3,
    "structure_middle": 1,
    "structure_ending": 2,
    "emotional_coloring": "EM-T",
    "emotional_secondary": "EM-W",
    "humor_level": 2,
    "emotional_depth": 2,
    "moral_topic": "Mut",
    "concrete_theme": "Piraten"
  },
  "learning_theme_response": null
}

Wenn Lernthema aktiv: learning_theme_response = {"applied": true, "parent_prompt_text": "3 Gesprächsfragen für Eltern"}
humor_level: 1=kaum, 2=leicht, 3=charmant, 4=viel, 5=absurd
emotional_depth: 1=leicht, 2=mittel, 3=tief
correct: 0-basierter Index

## KREATIVE FREIHEIT
Kategorien und Listen sind Werkzeuge, keine Käfige. Erfinde, überrasche, experimentiere.
```

---

## 4. Dynamischer Kontext – User Message Template

> Wird vom `promptBuilder.ts` befüllt. Sprache: immer die Story-Sprache.

```
Schreibe eine Geschichte mit folgenden Vorgaben:

## KIND
Name: {kid_name}, Alter: {kid_age} Jahre

## SPRACHE & NIVEAU
Sprache: {story_language_name}
Niveau: {difficulty_label} – {difficulty_description}
Satzlänge: max. {max_sentence_length} Wörter
Erlaubte Zeiten: {allowed_tenses}
Satzstrukturen: {sentence_structures}
Erzählperspektive: {narrative_perspective}
Erzählstil: {narrative_guidelines}

## VOKABULAR
{vocabulary_scope}
Neue Wörter: max. {new_words_per_story}
Figurative Sprache: {figurative_language}
Redewendungen: {idiom_usage}
Wiederholung: {repetition_strategy}

## TEXTLÄNGE
{min_words} bis {max_words} Wörter
Absätze: {paragraph_length}
Dialog: {dialogue_ratio}
Fragen: {question_count} Verständnisfragen generieren

## KATEGORIE
{theme_label}
Plots: {plot_templates}
Konflikte: {typical_conflicts}
Archetypen: {character_archetypes}
Sensorik: {sensory_details}
→ Wähle ein konkretes Thema innerhalb dieser Kategorie.

## FIGUREN
{figuren_block}

## SPEZIALEFFEKTE
{spezialeffekte_block}

## GUARDRAILS (Safety Level {safety_level}/4)
Erlaubt: {allowed_themes}
Nicht erlaubt: {forbidden_themes}

## LERNTHEMA
{lernthema_block}

## VARIETÄT
{varietaet_block}

## BESONDERER WUNSCH
{user_prompt_block}

## SERIE
{serien_block}

Antworte NUR mit dem JSON aus dem Output-Format.
```

---

## 5. Offene Fragen

### Q1: Prompt-Sprache
CORE Slim ist auf Deutsch. Optionen:
- a) Deutsch lassen (LLM schreibt trotzdem in story_language) ← **Empfehlung**
- b) Pro Sprache eine Version
- c) Auf Englisch

### Q2: Verständnisfragen-Format
Neues JSON-Format (`"options": [...], "correct": 2`) statt Textformat mit ○/✓.
**Empfehlung:** JSON – sauberer parsbar. Aber: Wie parst die Edge Function das aktuell?
→ **Bitte Cursor fragen:** "Zeige den Parsing-Code in generate-story wo der LLM-Response verarbeitet wird."

### Q3: Serien-Modul
Vorerst so lassen, kürzen in Block 3? **Empfehlung: Ja.**

### Q4: Humor-Level Skala
Alt: 1-10. Neu: 1-5. Mapping: 1=kaum, 2=leicht, 3=charmant, 4=viel, 5=absurd.
**OK?**

### Q5: Eltern-Modus Inferenz-Architektur
Alt: Ganze Sektion über "rückwärts konstruieren, Show don't tell".
Neu: 1 Zeile im CORE Slim. **Reicht das, oder soll mehr rein?**

---

## 6. Nächste Schritte

1. Johann reviewt dieses Dokument + beantwortet Fragen
2. Wir finalisieren den CORE Slim
3. Johann speichert ihn als `system_prompt_core_v2` in app_settings
4. Weiter mit Block 2.3c (Edge Function Umbau)
