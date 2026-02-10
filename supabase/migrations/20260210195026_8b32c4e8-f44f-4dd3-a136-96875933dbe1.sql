-- Increase statement timeout for authenticated role to 30 seconds
ALTER ROLE authenticated SET statement_timeout = '30s';

-- Make sure the index is being used effectively
-- Create a more specific composite index for the common admin query pattern
CREATE INDEX IF NOT EXISTS idx_stories_user_deleted_created 
ON public.stories (user_id, is_deleted, created_at DESC)
WHERE is_deleted = false;