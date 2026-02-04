-- Add gender and age columns to kid_profiles
ALTER TABLE public.kid_profiles
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER;