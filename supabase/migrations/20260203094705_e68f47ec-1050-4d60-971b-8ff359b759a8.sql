-- Add text_language column to stories table
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS text_language text DEFAULT 'fr';

-- Update existing stories to use the user's text_language setting
UPDATE public.stories s
SET text_language = (
  SELECT u.text_language 
  FROM public.user_profiles u 
  WHERE u.id = s.user_id
)
WHERE s.text_language IS NULL OR s.text_language = 'fr';