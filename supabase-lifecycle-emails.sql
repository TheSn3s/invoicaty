-- ============================================================
-- Lifecycle Emails Schema
-- Tracks which activation/re-engagement emails were sent to whom
-- ============================================================

-- 1. Add tracking columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS activation_email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reengagement_email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_unsubscribed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT UNIQUE;

-- Generate unsubscribe tokens for existing users
UPDATE profiles
SET unsubscribe_token = encode(gen_random_bytes(24), 'hex')
WHERE unsubscribe_token IS NULL;

-- 2. Email log table (audit trail of every lifecycle email sent)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  email_type TEXT NOT NULL, -- 'activation' | 'reengagement' | 'welcome' | ...
  resend_id TEXT,           -- id returned by Resend for tracking delivery
  status TEXT DEFAULT 'sent', -- sent | failed | bounced | complained
  error TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_logs_user_id_idx ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS email_logs_type_idx ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS email_logs_sent_at_idx ON email_logs(sent_at DESC);

-- 3. Backfill unsubscribe_token for any future profile rows
CREATE OR REPLACE FUNCTION set_unsubscribe_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unsubscribe_token IS NULL THEN
    NEW.unsubscribe_token := encode(gen_random_bytes(24), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_unsubscribe_token ON profiles;
CREATE TRIGGER ensure_unsubscribe_token
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_unsubscribe_token();
