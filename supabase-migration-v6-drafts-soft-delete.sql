-- Add soft delete support to drafts
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
