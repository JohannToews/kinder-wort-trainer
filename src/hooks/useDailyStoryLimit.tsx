import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Hardcoded fallback if rate_limits_config can't be loaded
const FALLBACK_DAILY_LIMIT = 5;

export function useDailyStoryLimit(kidProfileId: string | undefined) {
  const [storiesCreatedToday, setStoriesCreatedToday] = useState(0);
  const [limit, setLimit] = useState(FALLBACK_DAILY_LIMIT);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!kidProfileId) {
      setStoriesCreatedToday(0);
      setLoading(false);
      return;
    }

    try {
      // 1. Load rate limit from DB (use 'beta' plan for now — can be expanded later)
      const { data: limitRow } = await (supabase as any)
        .from('rate_limits_config')
        .select('max_stories_per_day, max_stories_per_kid_per_day')
        .eq('plan_type', 'beta')
        .maybeSingle();

      if (limitRow) {
        // Use per-kid limit if set, otherwise per-account limit
        const effectiveLimit = limitRow.max_stories_per_kid_per_day ?? limitRow.max_stories_per_day ?? FALLBACK_DAILY_LIMIT;
        setLimit(effectiveLimit);
      }

      // 2. Count stories created today for this kid profile
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { count, error } = await supabase
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .eq('kid_profile_id', kidProfileId)
        .gte('created_at', todayISO);

      if (!error && count !== null) {
        setStoriesCreatedToday(count);
      }
    } catch (e) {
      console.error('[useDailyStoryLimit] Error:', e);
    } finally {
      setLoading(false);
    }
  }, [kidProfileId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const remaining = Math.max(0, limit - storiesCreatedToday);
  const limitReached = remaining <= 0;

  return {
    storiesCreatedToday,
    remaining,
    limit,
    limitReached,
    loading,
    refresh: fetchAll,
  };
}
