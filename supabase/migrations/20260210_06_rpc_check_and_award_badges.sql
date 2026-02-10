-- =============================================================================
-- Aufgabe 6: check_and_award_badges RPC überarbeiten
-- Date: 2026-02-10
-- Description:
--   Handles all 23 badge types across 4 categories:
--   - milestone (total_stars thresholds)
--   - weekly (weekly_stories, repeatable per week)
--   - streak (streak_days)
--   - special (total_stories_read, consecutive_perfect_quiz, 
--              total_perfect_quiz, series_completed, languages_read)
--   Awards bonus_stars for each new badge.
-- =============================================================================

CREATE OR REPLACE FUNCTION check_and_award_badges(p_child_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_progress RECORD;
  v_badge RECORD;
  v_new_badges JSONB := '[]'::jsonb;
  v_badge_bonus INTEGER := 0;
  v_condition_met BOOLEAN;
  v_already_earned BOOLEAN;
  v_series_count INTEGER;
BEGIN
  SELECT * INTO v_progress FROM user_progress WHERE kid_profile_id = p_child_id;

  IF NOT FOUND THEN
    RETURN '[]'::jsonb;
  END IF;

  FOR v_badge IN SELECT * FROM badges ORDER BY sort_order LOOP
    v_condition_met := false;
    
    -- Check if badge already earned
    IF v_badge.repeatable THEN
      -- For weekly badges: check if earned THIS WEEK
      SELECT EXISTS(
        SELECT 1 FROM user_badges 
        WHERE child_id = p_child_id 
          AND badge_id = v_badge.id 
          AND earned_at >= date_trunc('week', CURRENT_TIMESTAMP)
      ) INTO v_already_earned;
    ELSE
      -- For non-repeatable: check if ever earned
      SELECT EXISTS(
        SELECT 1 FROM user_badges 
        WHERE child_id = p_child_id 
          AND badge_id = v_badge.id
      ) INTO v_already_earned;
    END IF;

    IF v_already_earned THEN
      CONTINUE;
    END IF;

    -- Check condition based on condition_type
    CASE v_badge.condition_type
      WHEN 'total_stars' THEN
        v_condition_met := COALESCE(v_progress.total_stars, 0) >= v_badge.condition_value;

      WHEN 'weekly_stories' THEN
        v_condition_met := COALESCE(v_progress.weekly_stories_count, 0) >= v_badge.condition_value;

      WHEN 'streak_days' THEN
        v_condition_met := COALESCE(v_progress.current_streak, 0) >= v_badge.condition_value;

      WHEN 'consecutive_perfect_quiz' THEN
        v_condition_met := COALESCE(v_progress.consecutive_perfect_quizzes, 0) >= v_badge.condition_value;

      WHEN 'total_perfect_quiz' THEN
        v_condition_met := COALESCE(v_progress.total_perfect_quizzes, 0) >= v_badge.condition_value;

      WHEN 'total_stories_read' THEN
        v_condition_met := COALESCE(v_progress.total_stories_read, 0) >= v_badge.condition_value;

      WHEN 'series_completed' THEN
        -- Count completed series (3+ episodes with a final episode)
        SELECT COUNT(DISTINCT series_id) INTO v_series_count
        FROM stories 
        WHERE series_id IS NOT NULL 
          AND kid_profile_id = p_child_id
          AND episode_number >= 3;
        v_condition_met := v_series_count >= v_badge.condition_value;

      WHEN 'languages_read' THEN
        v_condition_met := COALESCE(array_length(v_progress.languages_read, 1), 0) >= v_badge.condition_value;

      ELSE
        v_condition_met := false;
    END CASE;

    -- Award badge if condition met
    IF v_condition_met THEN
      INSERT INTO user_badges (child_id, badge_id, is_new)
      VALUES (p_child_id, v_badge.id, true);

      -- Add bonus stars
      IF COALESCE(v_badge.bonus_stars, 0) > 0 THEN
        UPDATE user_progress SET
          total_stars = COALESCE(total_stars, 0) + v_badge.bonus_stars
        WHERE kid_profile_id = p_child_id;
        v_badge_bonus := v_badge_bonus + v_badge.bonus_stars;
      END IF;

      -- Add badge to result
      v_new_badges := v_new_badges || jsonb_build_object(
        'id', v_badge.id,
        'name', v_badge.name,
        'emoji', v_badge.emoji,
        'category', v_badge.category,
        'bonus_stars', COALESCE(v_badge.bonus_stars, 0),
        'fablino_message', v_badge.fablino_message,
        'frame_color', v_badge.frame_color
      );
    END IF;
  END LOOP;

  RETURN v_new_badges;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- DONE – Aufgabe 6
-- Test: SELECT check_and_award_badges('<kid_profile_id>');
-- Expected: JSONB array of newly awarded badges (or empty [])
-- =============================================================================
