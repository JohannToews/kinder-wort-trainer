-- =============================================================================
-- Aufgabe 7: get_results_page RPC erweitern
-- Date: 2026-02-10
-- Description:
--   Returns all data needed for the Results page in one query:
--   - Child name, total stars, streak, weekly stats
--   - Current + next level (with unlock_feature)
--   - All levels for roadmap
--   - All badges with earned status + times_earned for repeatable
-- =============================================================================

CREATE OR REPLACE FUNCTION get_results_page(p_child_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_progress RECORD;
  v_levels JSONB;
  v_badges JSONB;
  v_current_level JSONB;
  v_next_level JSONB;
  v_child_name TEXT;
BEGIN
  -- Child name
  SELECT name INTO v_child_name FROM kid_profiles WHERE id = p_child_id;

  -- Progress
  SELECT * INTO v_progress FROM user_progress WHERE kid_profile_id = p_child_id;

  -- All levels (for roadmap)
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id, 'name', name, 'emoji', emoji, 
      'stars_required', stars_required, 'color', color,
      'unlock_feature', unlock_feature, 'icon_url', icon_url,
      'sort_order', sort_order
    ) ORDER BY sort_order
  ) INTO v_levels FROM levels;

  -- Current level (highest where stars_required <= total_stars)
  SELECT jsonb_build_object(
    'id', id, 'name', name, 'emoji', emoji, 
    'stars_required', stars_required, 'color', color,
    'sort_order', sort_order
  ) INTO v_current_level
  FROM levels 
  WHERE stars_required <= COALESCE(v_progress.total_stars, 0)
  ORDER BY stars_required DESC LIMIT 1;

  -- Next level (lowest where stars_required > total_stars)
  SELECT jsonb_build_object(
    'id', id, 'name', name, 'emoji', emoji, 
    'stars_required', stars_required, 'color', color,
    'unlock_feature', unlock_feature
  ) INTO v_next_level
  FROM levels 
  WHERE stars_required > COALESCE(v_progress.total_stars, 0)
  ORDER BY stars_required ASC LIMIT 1;

  -- All badges with earned status
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', b.id, 'name', b.name, 'emoji', b.emoji,
      'category', b.category, 'condition_type', b.condition_type,
      'condition_value', b.condition_value, 'bonus_stars', b.bonus_stars,
      'fablino_message', b.fablino_message, 'frame_color', b.frame_color,
      'icon_url', b.icon_url, 'repeatable', b.repeatable,
      'sort_order', b.sort_order,
      'earned', (
        SELECT COUNT(*) > 0 FROM user_badges 
        WHERE child_id = p_child_id AND badge_id = b.id
      ),
      'earned_at', (
        SELECT MAX(earned_at) FROM user_badges 
        WHERE child_id = p_child_id AND badge_id = b.id
      ),
      'times_earned', (
        SELECT COUNT(*) FROM user_badges 
        WHERE child_id = p_child_id AND badge_id = b.id
      )
    ) ORDER BY b.sort_order
  ) INTO v_badges
  FROM badges b;

  RETURN jsonb_build_object(
    'child_name', v_child_name,
    'total_stars', COALESCE(v_progress.total_stars, 0),
    'current_streak', COALESCE(v_progress.current_streak, 0),
    'longest_streak', COALESCE(v_progress.longest_streak, 0),
    'weekly_stories_count', COALESCE(v_progress.weekly_stories_count, 0),
    'weekly_bonus_claimed', v_progress.weekly_bonus_claimed,
    'total_stories_read', COALESCE(v_progress.total_stories_read, 0),
    'total_perfect_quizzes', COALESCE(v_progress.total_perfect_quizzes, 0),
    'languages_read', COALESCE(v_progress.languages_read, '{}'),
    'current_level', v_current_level,
    'next_level', v_next_level,
    'levels', v_levels,
    'badges', v_badges
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- DONE – Aufgabe 7
-- Test: SELECT get_results_page('<kid_profile_id>');
-- Expected: JSONB with child_name, total_stars, levels (5), badges (23), etc.
-- =============================================================================
