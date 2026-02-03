-- Create story_ratings table to store user feedback
CREATE TABLE public.story_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  kid_profile_id UUID REFERENCES public.kid_profiles(id) ON DELETE SET NULL,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  story_title TEXT NOT NULL,
  story_prompt TEXT,
  kid_name TEXT,
  kid_school_class TEXT,
  kid_school_system TEXT,
  quality_rating INTEGER NOT NULL CHECK (quality_rating >= 1 AND quality_rating <= 5),
  weakest_part TEXT CHECK (weakest_part IN ('beginning', 'development', 'ending')),
  weakness_reason TEXT CHECK (weakness_reason IN ('too_short', 'too_shallow', 'too_repetitive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.story_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can read story_ratings" ON public.story_ratings FOR SELECT USING (true);
CREATE POLICY "Anyone can create story_ratings" ON public.story_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update story_ratings" ON public.story_ratings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete story_ratings" ON public.story_ratings FOR DELETE USING (true);

-- Add index for faster queries
CREATE INDEX idx_story_ratings_user_id ON public.story_ratings(user_id);
CREATE INDEX idx_story_ratings_story_id ON public.story_ratings(story_id);
CREATE INDEX idx_story_ratings_created_at ON public.story_ratings(created_at DESC);