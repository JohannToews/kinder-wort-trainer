import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──

export interface GenerationConfigRow {
  id: string;
  age_group: string;
  story_length: string;
  min_words: number;
  max_words: number;
  scene_image_count: number;
  include_cover: boolean;
  length_labels: Record<string, string>;
  length_description: Record<string, string>;
  estimated_reading_minutes: number;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
}

export interface RateLimitRow {
  id: string;
  plan_type: string;
  max_stories_per_day: number;
  max_stories_per_kid_per_day: number | null;
}

export const AGE_GROUPS = ["6-7", "8-9", "10-11"] as const;
export const STORY_LENGTHS = ["short", "medium", "long", "extra_long"] as const;

export type AgeGroup = (typeof AGE_GROUPS)[number];
export type StoryLengthKey = (typeof STORY_LENGTHS)[number];

// ── Hook ──

export function useGenerationConfig() {
  const [configs, setConfigs] = useState<GenerationConfigRow[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimitRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [configRes, limitsRes] = await Promise.all([
        (supabase as any).from("generation_config").select("*").order("age_group").order("sort_order"),
        (supabase as any).from("rate_limits_config").select("*").order("plan_type"),
      ]);

      if (configRes.data) setConfigs(configRes.data as GenerationConfigRow[]);
      if (limitsRes.data) setRateLimits(limitsRes.data as RateLimitRow[]);
    } catch (err) {
      console.error("[useGenerationConfig] Load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Save all configs (batch upsert) ──
  const saveConfigs = useCallback(async (rows: GenerationConfigRow[]) => {
    // Upsert each row by id
    for (const row of rows) {
      const { error } = await (supabase as any)
        .from("generation_config")
        .update({
          min_words: row.min_words,
          max_words: row.max_words,
          scene_image_count: row.scene_image_count,
          include_cover: row.include_cover,
          estimated_reading_minutes: row.estimated_reading_minutes,
          is_active: row.is_active,
          is_default: row.is_default,
          sort_order: row.sort_order,
        })
        .eq("id", row.id);
      if (error) throw new Error(`Failed to save config ${row.age_group}/${row.story_length}: ${error.message}`);
    }
    setConfigs(rows);
  }, []);

  // ── Save rate limits ──
  const saveRateLimits = useCallback(async (rows: RateLimitRow[]) => {
    for (const row of rows) {
      const { error } = await (supabase as any)
        .from("rate_limits_config")
        .update({
          max_stories_per_day: row.max_stories_per_day,
          max_stories_per_kid_per_day: row.max_stories_per_kid_per_day,
        })
        .eq("id", row.id);
      if (error) throw new Error(`Failed to save rate limit ${row.plan_type}: ${error.message}`);
    }
    setRateLimits(rows);
  }, []);

  // ── Helpers ──
  const getConfigsForAgeGroup = useCallback(
    (ageGroup: string) => configs.filter((c) => c.age_group === ageGroup).sort((a, b) => a.sort_order - b.sort_order),
    [configs]
  );

  const getConfigForSelection = useCallback(
    (ageGroup: string, storyLength: string) => configs.find((c) => c.age_group === ageGroup && c.story_length === storyLength && c.is_active),
    [configs]
  );

  return {
    configs,
    rateLimits,
    isLoading,
    saveConfigs,
    saveRateLimits,
    getConfigsForAgeGroup,
    getConfigForSelection,
    reload: loadAll,
  };
}
