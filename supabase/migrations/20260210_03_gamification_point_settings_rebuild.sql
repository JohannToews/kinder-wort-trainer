-- =============================================================================
-- Aufgabe 3: point_settings-Tabelle neu erstellen
-- Date: 2026-02-10
-- Description:
--   - Rename old point_settings to point_settings_legacy (keep data)
--   - Create new point_settings with setting_key/value/description schema
--   - Seed with 8 star/bonus configuration entries
--   - Enable RLS, allow public reads
-- =============================================================================

-- 1. Rename old table (preserves data for reference)
ALTER TABLE point_settings RENAME TO point_settings_legacy;

-- 2. Create new point_settings table
CREATE TABLE point_settings (
  setting_key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT
);

-- 3. Enable RLS
ALTER TABLE point_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "point_settings_select_all"
  ON point_settings FOR SELECT
  USING (true);

-- Only service role / RPC can write (no direct user writes)
-- Admin writes will go through the PointsConfigSection component

-- 4. Seed default values
INSERT INTO point_settings (setting_key, value, description) VALUES
('stars_story_read',    '1', 'Sterne pro gelesene Story'),
('stars_quiz_perfect',  '2', 'Sterne bei 100% Quiz'),
('stars_quiz_passed',   '1', 'Sterne bei ≥80% Quiz'),
('stars_quiz_failed',   '0', 'Sterne bei <80% Quiz'),
('quiz_pass_threshold', '80', 'Prozent-Schwelle für bestanden'),
('weekly_bonus_3',      '3', 'Bonus-Sterne für 3 Stories/Woche'),
('weekly_bonus_5',      '5', 'Bonus-Sterne für 5 Stories/Woche'),
('weekly_bonus_7',      '8', 'Bonus-Sterne für 7 Stories/Woche');

-- =============================================================================
-- DONE – Aufgabe 3
-- Verify: SELECT * FROM point_settings ORDER BY setting_key;
-- Expected: 8 rows with setting_key/value/description
-- Also: SELECT COUNT(*) FROM point_settings_legacy; (should have old data)
-- =============================================================================
