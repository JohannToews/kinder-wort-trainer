-- Add LLM classification fields to stories table
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS structure_beginning INTEGER CHECK (structure_beginning >= 1 AND structure_beginning <= 5),
ADD COLUMN IF NOT EXISTS structure_middle INTEGER CHECK (structure_middle >= 1 AND structure_middle <= 5),
ADD COLUMN IF NOT EXISTS structure_ending INTEGER CHECK (structure_ending >= 1 AND structure_ending <= 5),
ADD COLUMN IF NOT EXISTS emotional_coloring TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.stories.structure_beginning IS 'LLM self-rating for story beginning (1-5)';
COMMENT ON COLUMN public.stories.structure_middle IS 'LLM self-rating for story middle/development (1-5)';
COMMENT ON COLUMN public.stories.structure_ending IS 'LLM self-rating for story ending (1-5)';
COMMENT ON COLUMN public.stories.emotional_coloring IS 'LLM classification of emotional tone';