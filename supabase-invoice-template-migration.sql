-- Add invoice_template column to profiles
-- Allows users to choose between 'modern', 'classic', or 'minimal' PDF templates
-- Run this in Supabase SQL Editor.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS invoice_template TEXT DEFAULT 'modern';

-- Optional: enforce allowed values via CHECK constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_invoice_template_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_invoice_template_check
CHECK (invoice_template IN ('modern', 'classic', 'minimal'));

-- Backfill any existing rows with NULL → 'modern'
UPDATE profiles SET invoice_template = 'modern' WHERE invoice_template IS NULL;
