-- Custom Learning Themes: user-created learning themes via AI
CREATE TABLE IF NOT EXISTS custom_learning_themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  kid_profile_id UUID REFERENCES kid_profiles(id),
  name JSONB NOT NULL,
  description JSONB NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('social', 'emotional', 'character', 'cognitive')),
  story_guidance TEXT NOT NULL,
  original_input TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Users can only see/create/delete their own custom themes
ALTER TABLE custom_learning_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom themes"
  ON custom_learning_themes FOR SELECT
  USING (auth.uid()::text IN (
    SELECT up.supabase_uid FROM user_profiles up WHERE up.id = custom_learning_themes.user_id
  ));

CREATE POLICY "Users can insert own custom themes"
  ON custom_learning_themes FOR INSERT
  WITH CHECK (auth.uid()::text IN (
    SELECT up.supabase_uid FROM user_profiles up WHERE up.id = custom_learning_themes.user_id
  ));

CREATE POLICY "Users can delete own custom themes"
  ON custom_learning_themes FOR DELETE
  USING (auth.uid()::text IN (
    SELECT up.supabase_uid FROM user_profiles up WHERE up.id = custom_learning_themes.user_id
  ));

CREATE POLICY "Users can update own custom themes"
  ON custom_learning_themes FOR UPDATE
  USING (auth.uid()::text IN (
    SELECT up.supabase_uid FROM user_profiles up WHERE up.id = custom_learning_themes.user_id
  ));

-- Service role bypass for edge functions
CREATE POLICY "Service role full access to custom_learning_themes"
  ON custom_learning_themes FOR ALL
  USING (auth.role() = 'service_role');
