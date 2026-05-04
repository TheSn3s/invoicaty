-- ============================================
-- Drafts table
-- ============================================

CREATE TABLE IF NOT EXISTS drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  serial TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  client TEXT NOT NULL DEFAULT '',
  project TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  summary TEXT DEFAULT '',
  content_html TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Sent','Approved','Archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);

ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own drafts"
  ON drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drafts"
  ON drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drafts"
  ON drafts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drafts"
  ON drafts FOR DELETE
  USING (auth.uid() = user_id);
