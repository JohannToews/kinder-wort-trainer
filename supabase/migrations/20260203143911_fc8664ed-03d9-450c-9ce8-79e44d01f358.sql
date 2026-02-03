-- Add kid_profile_id to user_results for per-child tracking
ALTER TABLE public.user_results 
ADD COLUMN kid_profile_id uuid REFERENCES public.kid_profiles(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX idx_user_results_kid_profile_id ON public.user_results(kid_profile_id);

-- Migrate existing data: try to assign kid_profile_id from the referenced story
UPDATE public.user_results ur
SET kid_profile_id = s.kid_profile_id
FROM public.stories s
WHERE ur.reference_id = s.id 
  AND ur.kid_profile_id IS NULL
  AND s.kid_profile_id IS NOT NULL;