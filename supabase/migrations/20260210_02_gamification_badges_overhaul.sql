-- =============================================================================
-- Aufgabe 2: badges-Tabelle überarbeiten
-- Date: 2026-02-10
-- Description:
--   - Drop old CHECK constraint on badges.category
--   - Add new columns: bonus_stars, fablino_message, frame_color, repeatable
--   - Add new CHECK constraint with updated categories
--   - Drop UNIQUE constraint on user_badges (child_id, badge_id) for repeatable badges
--   - Delete all existing badges (CASCADE deletes user_badges automatically)
--   - Insert 23 new badges in 4 categories
-- =============================================================================

-- 1. Drop the old CHECK constraint on badges.category
ALTER TABLE badges DROP CONSTRAINT IF EXISTS badges_category_check;

-- 2. Delete all existing badges FIRST (before adding new constraint)
--    user_badges CASCADE-deleted automatically via FK
DELETE FROM badges;

-- 3. Add new columns to badges
ALTER TABLE badges ADD COLUMN IF NOT EXISTS bonus_stars INTEGER DEFAULT 0;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS fablino_message TEXT;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS frame_color TEXT;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS repeatable BOOLEAN DEFAULT false;

-- 4. Add new CHECK constraint with updated categories
ALTER TABLE badges ADD CONSTRAINT badges_category_check 
  CHECK (category IN ('milestone', 'weekly', 'streak', 'special'));

-- 5. Drop UNIQUE constraint on user_badges (child_id, badge_id)
--    This is needed to allow repeatable weekly badges.
--    Duplicate prevention is handled in the check_and_award_badges RPC.
ALTER TABLE user_badges DROP CONSTRAINT IF EXISTS user_badges_child_id_badge_id_key;

-- 6. Insert 23 new badges

-- MEILENSTEIN-BADGES (category = 'milestone')
INSERT INTO badges (name, description, emoji, category, condition_type, condition_value, bonus_stars, frame_color, fablino_message, sort_order, repeatable) VALUES
('Bronzener Leser',     'Dein erstes Abzeichen! Stark!',            '🥉', 'milestone', 'total_stars',  5,   2,  '#CD7F32', 'Dein erstes Abzeichen! Stark!', 1, false),
('Blitzstart',          'Du bist echt schnell dabei!',              '⚡', 'milestone', 'total_stars',  10,  2,  '#FFD700', 'Du bist echt schnell dabei!', 2, false),
('Silberner Leser',     'Silber! Du wirst zum Profi!',             '🥈', 'milestone', 'total_stars',  25,  3,  '#C0C0C0', 'Silber! Du wirst zum Profi!', 3, false),
('Kristall-Leser',      'Ein echter Kristall-Leser!',              '💎', 'milestone', 'total_stars',  50,  3,  '#B9F2FF', 'Ein echter Kristall-Leser!', 4, false),
('Goldener Leser',      'GOLD! Das schaffen nicht viele!',          '🥇', 'milestone', 'total_stars',  75,  5,  '#FFD700', 'GOLD! Das schaffen nicht viele!', 5, false),
('Magischer Leser',     'Deine Lesekraft ist magisch!',            '🔮', 'milestone', 'total_stars',  100, 5,  '#9B59B6', 'Deine Lesekraft ist magisch!', 6, false),
('Diamant-Leser',       'Diamant! Unzerstörbar!',                  '💠', 'milestone', 'total_stars',  150, 5,  '#B9F2FF', 'Diamant! Unzerstörbar!', 7, false),
('Sternensammler',      '200 Sterne leuchten für dich!',           '🌟', 'milestone', 'total_stars',  200, 8,  '#F39C12', '200 Sterne leuchten für dich!', 8, false),
('Legenden-Leser',      'Du bist eine Legende!',                   '👑', 'milestone', 'total_stars',  300, 10, '#E5E4E2', 'Du bist eine Legende!', 9, false),

-- WOCHEN-BADGES (category = 'weekly', repeatable = true)
('Flammen-Leser',       '3 Stories diese Woche! Du brennst!',      '🔥', 'weekly', 'weekly_stories', 3, 1, '#E74C3C', '3 Stories diese Woche! Du brennst!', 10, true),
('Blitz-Leser',         '5 Stories! Blitzschnell!',                '⚡', 'weekly', 'weekly_stories', 5, 2, '#F39C12', '5 Stories! Blitzschnell!', 11, true),
('Sturm-Leser',         '7 Stories! Unaufhaltsam!',                '🌪️', 'weekly', 'weekly_stories', 7, 3, '#8E44AD', '7 Stories! Unaufhaltsam!', 12, true),

-- STREAK-BADGES (category = 'streak')
('Ketten-Leser',        '3 Tage am Stück! Weiter so!',            '🔗', 'streak', 'streak_days', 3,  2,  '#9B59B6', '3 Tage am Stück! Weiter so!', 13, false),
('Feuer-Kette',         'Eine Woche am Stück! Feuer!',            '🔥', 'streak', 'streak_days', 7,  5,  '#E74C3C', 'Eine Woche am Stück! Feuer!', 14, false),
('Unaufhaltsam',        '14 Tage! Niemand stoppt dich!',          '⛓️', 'streak', 'streak_days', 14, 8,  '#8E44AD', '14 Tage! Niemand stoppt dich!', 15, false),
('Diamant-Streak',      '30 Tage! Diamant-Status!',               '💎', 'streak', 'streak_days', 30, 15, '#B9F2FF', '30 Tage! Diamant-Status!', 16, false),

-- SPEZIAL-BADGES (category = 'special')
('Fablinos Freund',     'Deine erste Geschichte! Willkommen!',     '🦊', 'special', 'total_stories_read',       1,  1, '#E8863A', 'Deine erste Geschichte! Willkommen!', 17, false),
('Perfektionist',       '3x perfekt hintereinander!',             '🎯', 'special', 'consecutive_perfect_quiz',  3,  3, '#FFD700', '3x perfekt hintereinander!', 18, false),
('Super-Hirn',          '10 perfekte Quizze! Genial!',            '🧠', 'special', 'total_perfect_quiz',        10, 5, '#3498DB', '10 perfekte Quizze! Genial!', 19, false),
('Bücherwurm',          '10 Geschichten gelesen!',                 '📚', 'special', 'total_stories_read',       10, 3, '#27AE60', '10 Geschichten gelesen!', 20, false),
('Vielleser',           '25 Geschichten! Wahnsinn!',               '📖', 'special', 'total_stories_read',       25, 5, '#27AE60', '25 Geschichten! Wahnsinn!', 21, false),
('Serien-Fan',          'Erste Serie komplett!',                   '🏆', 'special', 'series_completed',          1,  5, '#E67E22', 'Erste Serie komplett!', 22, false),
('Sprach-Entdecker',    'Stories in 2 Sprachen! Toll!',            '🌍', 'special', 'languages_read',            2,  5, '#1ABC9C', 'Stories in 2 Sprachen! Toll!', 23, false);

-- =============================================================================
-- DONE – Aufgabe 2
-- Verify: SELECT name, emoji, category, condition_type, condition_value, bonus_stars, repeatable FROM badges ORDER BY sort_order;
-- Expected: 23 rows (9 milestone + 3 weekly + 4 streak + 7 special)
-- =============================================================================
