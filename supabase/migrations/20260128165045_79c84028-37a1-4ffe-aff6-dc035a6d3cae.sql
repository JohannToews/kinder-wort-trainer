-- Add story_images array column to store additional progress images
ALTER TABLE public.stories 
ADD COLUMN story_images text[] DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN public.stories.story_images IS 'Array of URLs for 1-2 additional story progress images (muted colors)';