import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { GenerationConfigRow } from "./useGenerationConfig";

/**
 * Maps a numeric kid age to the generation_config age_group.
 */
function ageToGroup(age: number | null | undefined): string {
  if (!age || age <= 7) return "6-7";
  if (age <= 9) return "8-9";
  return "10-11";
}

/**
 * Loads story length options from generation_config for a given kid age.
 * Used in the Story Wizard to show length selection cards.
 */
export function useStoryLengthOptions(kidAge: number | null | undefined) {
  const [options, setOptions] = useState<GenerationConfigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultLength, setDefaultLength] = useState<string>("medium");

  const ageGroup = ageToGroup(kidAge);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("generation_config")
        .select("*")
        .eq("age_group", ageGroup)
        .eq("is_active", true)
        .order("sort_order");

      if (!error && data) {
        setOptions(data as GenerationConfigRow[]);
        const def = (data as GenerationConfigRow[]).find((d) => d.is_default);
        if (def) setDefaultLength(def.story_length);
      }
    } catch (err) {
      console.error("[useStoryLengthOptions] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [ageGroup]);

  useEffect(() => {
    load();
  }, [load]);

  return { options, defaultLength, ageGroup, loading };
}
