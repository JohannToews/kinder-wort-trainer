-- Create table for consistency check tracking
CREATE TABLE public.consistency_check_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  story_title TEXT NOT NULL,
  story_length TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  issues_found INTEGER NOT NULL DEFAULT 0,
  issues_corrected INTEGER NOT NULL DEFAULT 0,
  issue_details TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consistency_check_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read consistency_check_results" 
ON public.consistency_check_results 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert consistency_check_results" 
ON public.consistency_check_results 
FOR INSERT 
WITH CHECK (true);

-- Index for faster queries
CREATE INDEX idx_consistency_check_results_created_at ON public.consistency_check_results(created_at DESC);