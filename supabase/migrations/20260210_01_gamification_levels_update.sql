-- =============================================================================
-- Aufgabe 1: levels-Tabelle aktualisieren
-- Date: 2026-02-10
-- Description:
--   - Add unlock_feature and icon_url columns
--   - Update 5 levels with new names, emojis, colors, star thresholds
--   - Remove 6th level (Fablino Meister at 500 stars – now at 300)
-- =============================================================================

-- 1. Add new columns
ALTER TABLE levels ADD COLUMN IF NOT EXISTS unlock_feature TEXT;
ALTER TABLE levels ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- 2. Update existing levels (match by sort_order which is stable)
UPDATE levels SET 
  name = 'Bücherfuchs', 
  emoji = '🦊', 
  stars_required = 0, 
  color = '#CD7F32', 
  unlock_feature = NULL,
  icon_url = NULL
WHERE sort_order = 1;

UPDATE levels SET 
  name = 'Geschichtenentdecker', 
  emoji = '🔍', 
  stars_required = 25, 
  color = '#C0C0C0', 
  unlock_feature = 'sharing',
  icon_url = NULL
WHERE sort_order = 2;

UPDATE levels SET 
  name = 'Leseheld', 
  emoji = '🛡️', 
  stars_required = 75, 
  color = '#FFD700', 
  unlock_feature = 'series',
  icon_url = NULL
WHERE sort_order = 3;

UPDATE levels SET 
  name = 'Wortmagier', 
  emoji = '✨', 
  stars_required = 150, 
  color = '#B9F2FF', 
  unlock_feature = 'special_themes',
  icon_url = NULL
WHERE sort_order = 4;

UPDATE levels SET 
  name = 'Fablino-Meister', 
  emoji = '👑', 
  stars_required = 300, 
  color = '#E5E4E2', 
  unlock_feature = 'secret_story',
  icon_url = NULL
WHERE sort_order = 5;

-- 3. Remove the 6th level (old "Fablino Meister" at sort_order=6, 500 stars)
--    This is safe because levels.id is not referenced by foreign keys.
DELETE FROM levels WHERE sort_order = 6;

-- =============================================================================
-- DONE – Aufgabe 1
-- Verify: SELECT * FROM levels ORDER BY sort_order;
-- Expected: 5 rows with sort_order 1-5, stars_required 0/25/75/150/300
-- =============================================================================
