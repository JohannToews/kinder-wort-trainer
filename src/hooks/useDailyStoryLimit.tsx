import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DAILY_STORY_LIMIT = 5;

export function useDailyStoryLimit(kidProfileId: string | undefined) {
  const [storiesCreatedToday, setStoriesCreatedToday] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    if (!kidProfileId) {
      setStoriesCreatedToday(0);
      setLoading(false);
      return;
    }

    try {
      // Get start of today in UTC
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
      console.error('[useDailyStoryLimit] Error fetching count:', e);
    } finally {
      setLoading(false);
    }
  }, [kidProfileId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  const remaining = Math.max(0, DAILY_STORY_LIMIT - storiesCreatedToday);
  const limitReached = remaining <= 0;

  return {
    storiesCreatedToday,
    remaining,
    limit: DAILY_STORY_LIMIT,
    limitReached,
    loading,
    refresh: fetchCount,
  };
}
