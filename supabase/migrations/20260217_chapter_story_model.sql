-- ============================================================
-- Migration: Chapter Story Model
-- Adds series_episode_count to stories for variable episode counts (3-7)
-- NULL = legacy/single story (defaults to 5 in code)
-- ============================================================

ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS series_episode_count INTEGER;
