-- Block 1: Add multilingual fields for full language separation per kid profile
-- kid_profiles: ui_language, reading_language, explanation_language, home_languages
-- marked_words: word_language, explanation_language
-- comprehension_questions: question_language
-- stories: make text_language NOT NULL with default

-- ============================================================
-- 1. kid_profiles: Add language fields
-- ============================================================

-- UI language (the language the app interface is shown in)
ALTER TABLE public.kid_profiles
  ADD COLUMN IF NOT EXISTS ui_language text NOT NULL DEFAULT 'fr';

-- Reading/story language (the language stories are generated in)
ALTER TABLE public.kid_profiles
  ADD COLUMN IF NOT EXISTS reading_language text NOT NULL DEFAULT 'fr';

-- Explanation language (the language word explanations are given in)
ALTER TABLE public.kid_profiles
  ADD COLUMN IF NOT EXISTS explanation_language text NOT NULL DEFAULT 'de';

-- Home languages (languages spoken at home, array for multilingual families)
ALTER TABLE public.kid_profiles
  ADD COLUMN IF NOT EXISTS home_languages text[] NOT NULL DEFAULT '{"de"}';

-- ============================================================
-- 2. Migrate existing kid_profiles data
--    Derive reading_language from school_system (which was the old proxy for language)
--    Derive ui_language from school_system
--    explanation_language defaults to 'de' (most users are German-speaking parents)
--    home_languages defaults to '{"de"}'
-- ============================================================

-- Set reading_language and ui_language from school_system for existing profiles
UPDATE public.kid_profiles
SET
  ui_language = LOWER(school_system),
  reading_language = LOWER(school_system)
WHERE ui_language = 'fr' AND school_system != 'fr';

-- For German school system, set explanation to German too
UPDATE public.kid_profiles
SET explanation_language = 'de', home_languages = '{"de"}'
WHERE school_system = 'de';

-- For French school system, set explanation to French (parents likely speak French)
-- But keep default 'de' for FR school system since app's main use case is
-- German-speaking parents with kids in French schools
-- (no update needed, defaults are correct for this case)

-- ============================================================
-- 3. marked_words: Add language tracking
-- ============================================================

ALTER TABLE public.marked_words
  ADD COLUMN IF NOT EXISTS word_language text NOT NULL DEFAULT 'fr';

ALTER TABLE public.marked_words
  ADD COLUMN IF NOT EXISTS explanation_language text NOT NULL DEFAULT 'de';

-- Migrate existing marked_words: derive language from the story they belong to
UPDATE public.marked_words mw
SET word_language = COALESCE(s.text_language, 'fr')
FROM public.stories s
WHERE mw.story_id = s.id
  AND mw.word_language = 'fr'
  AND s.text_language IS NOT NULL
  AND s.text_language != 'fr';

-- ============================================================
-- 4. comprehension_questions: Add language tracking
-- ============================================================

ALTER TABLE public.comprehension_questions
  ADD COLUMN IF NOT EXISTS question_language text NOT NULL DEFAULT 'fr';

-- Migrate existing comprehension_questions: derive language from the story
UPDATE public.comprehension_questions cq
SET question_language = COALESCE(s.text_language, 'fr')
FROM public.stories s
WHERE cq.story_id = s.id
  AND cq.question_language = 'fr'
  AND s.text_language IS NOT NULL
  AND s.text_language != 'fr';

-- ============================================================
-- 5. stories: Make text_language NOT NULL with default
-- ============================================================

-- First, set any NULL text_language values to 'fr'
UPDATE public.stories
SET text_language = 'fr'
WHERE text_language IS NULL;

-- Now alter the column to NOT NULL with default
ALTER TABLE public.stories
  ALTER COLUMN text_language SET NOT NULL,
  ALTER COLUMN text_language SET DEFAULT 'fr';
