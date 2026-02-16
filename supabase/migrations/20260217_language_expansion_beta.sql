-- ============================================================
-- Migration: Expand rule tables for 8 beta languages
-- Copies EN entries as base for: hu, pt, tr, bg, lt, ca, pl, sk
-- ============================================================

-- 1. age_rules: copies all EN age groups for 8 new languages
-- After block2_2b adjustments, age groups are: 6-7, 8-9, 10-11, 12-13
-- Columns: vocabulary_level and complexity_level were dropped in 2b
INSERT INTO age_rules (
  min_age, max_age, language,
  max_sentence_length, allowed_tenses, sentence_structures,
  min_word_count, max_word_count,
  paragraph_length, dialogue_ratio, narrative_perspective,
  narrative_guidelines, example_sentences
)
SELECT
  ar.min_age, ar.max_age, new_lang.code,
  ar.max_sentence_length, ar.allowed_tenses, ar.sentence_structures,
  ar.min_word_count, ar.max_word_count,
  ar.paragraph_length, ar.dialogue_ratio, ar.narrative_perspective,
  ar.narrative_guidelines, ar.example_sentences
FROM age_rules ar
CROSS JOIN (
  VALUES ('hu'), ('pt'), ('tr'), ('bg'), ('lt'), ('ca'), ('pl'), ('sk')
) AS new_lang(code)
WHERE ar.language = 'en'
ON CONFLICT (min_age, max_age, language) DO NOTHING;

-- 2. difficulty_rules: copies all EN difficulty levels for 8 new languages
-- Schema: difficulty_level, language, label, description, vocabulary_scope,
--         new_words_per_story, figurative_language, idiom_usage,
--         humor_types, repetition_strategy, example_vocabulary
INSERT INTO difficulty_rules (
  difficulty_level, language,
  label, description, vocabulary_scope,
  new_words_per_story, figurative_language, idiom_usage,
  humor_types, repetition_strategy, example_vocabulary
)
SELECT
  dr.difficulty_level, new_lang.code,
  dr.label, dr.description, dr.vocabulary_scope,
  dr.new_words_per_story, dr.figurative_language, dr.idiom_usage,
  dr.humor_types, dr.repetition_strategy, dr.example_vocabulary
FROM difficulty_rules dr
CROSS JOIN (
  VALUES ('hu'), ('pt'), ('tr'), ('bg'), ('lt'), ('ca'), ('pl'), ('sk')
) AS new_lang(code)
WHERE dr.language = 'en'
ON CONFLICT (difficulty_level, language) DO NOTHING;

-- 3. theme_rules: copies all EN themes for 8 new languages
-- Schema: theme_key, language, labels, plot_templates, setting_descriptions,
--         character_archetypes, sensory_details, typical_conflicts
INSERT INTO theme_rules (
  theme_key, language,
  labels, plot_templates, setting_descriptions,
  character_archetypes, sensory_details, typical_conflicts
)
SELECT
  tr.theme_key, new_lang.code,
  tr.labels, tr.plot_templates, tr.setting_descriptions,
  tr.character_archetypes, tr.sensory_details, tr.typical_conflicts
FROM theme_rules tr
CROSS JOIN (
  VALUES ('hu'), ('pt'), ('tr'), ('bg'), ('lt'), ('ca'), ('pl'), ('sk')
) AS new_lang(code)
WHERE tr.language = 'en'
ON CONFLICT (theme_key, language) DO NOTHING;

-- 4. emotion_rules: copies all EN emotions for 8 new languages
-- Schema: emotion_key, language, labels, conflict_patterns,
--         character_development, resolution_patterns, emotional_vocabulary
INSERT INTO emotion_rules (
  emotion_key, language,
  labels, conflict_patterns, character_development,
  resolution_patterns, emotional_vocabulary
)
SELECT
  er.emotion_key, new_lang.code,
  er.labels, er.conflict_patterns, er.character_development,
  er.resolution_patterns, er.emotional_vocabulary
FROM emotion_rules er
CROSS JOIN (
  VALUES ('hu'), ('pt'), ('tr'), ('bg'), ('lt'), ('ca'), ('pl'), ('sk')
) AS new_lang(code)
WHERE er.language = 'en'
ON CONFLICT (emotion_key, language) DO NOTHING;
