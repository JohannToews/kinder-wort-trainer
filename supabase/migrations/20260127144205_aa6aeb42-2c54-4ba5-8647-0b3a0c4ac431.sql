-- Add user_id to user_results table for user-specific results
ALTER TABLE public.user_results 
ADD COLUMN user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX idx_user_results_user_id ON public.user_results(user_id);