
-- Create story-images storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-images', 'story-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for story-images bucket
CREATE POLICY "Public read access for story-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-images');

-- Service role can upload to story-images (used by edge functions)
CREATE POLICY "Service role can upload to story-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'story-images');

-- Service role can update in story-images
CREATE POLICY "Service role can update story-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'story-images');
