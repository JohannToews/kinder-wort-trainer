-- =============================================================================
-- Aufgabe 4: user_progress-Tabelle erweitern
-- Date: 2026-02-10
-- Description:
--   - Consolidate total_points + total_stars into one column (total_stars)
--   - Add weekly tracking columns
--   - Add quiz/stories tracking columns
--   - Add languages_read array
-- =============================================================================

-- 1. Consolidate star columns
--    total_points (original, NOT NULL DEFAULT 0, used by useGamification.tsx)
--    total_stars  (added later via ALTER TABLE, DEFAULT 0, may have data)
--    Strategy: Keep the higher value in total_stars, then drop total_points.

-- First ensure total_stars has the best data from both columns
UPDATE user_progress 
SET total_stars = GREATEST(COALESCE(total_stars, 0), COALESCE(total_points, 0));

-- Now drop total_points (total_stars is the single source of truth)
ALTER TABLE user_progress DROP COLUMN IF EXISTS total_points;

-- 2. Add weekly tracking columns
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS weekly_stories_count INTEGER DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS weekly_reset_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS weekly_bonus_claimed TEXT DEFAULT NULL;

-- 3. Add quiz tracking columns
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS consecutive_perfect_quizzes INTEGER DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS total_perfect_quizzes INTEGER DEFAULT 0;

-- 4. Add total stories read (consolidate with existing stories_read_total / stories_completed)
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS total_stories_read INTEGER DEFAULT 0;

-- Copy existing data from older columns into total_stories_read
UPDATE user_progress 
SET total_stories_read = GREATEST(
  COALESCE(total_stories_read, 0),
  COALESCE(stories_read_total, 0),
  COALESCE(stories_completed, 0)
);

-- 5. Add languages_read array
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS languages_read TEXT[] DEFAULT '{}';

-- =============================================================================
-- DONE – Aufgabe 4
-- Verify: SELECT column_name, data_type FROM information_schema.columns 
--         WHERE table_name = 'user_progress' ORDER BY ordinal_position;
-- Key columns should include: total_stars, weekly_stories_count, 
--   weekly_reset_date, weekly_bonus_claimed, consecutive_perfect_quizzes,
--   total_perfect_quizzes, total_stories_read, languages_read
-- =============================================================================
