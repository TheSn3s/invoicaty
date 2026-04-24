-- ============================================
-- FIX: "Database error saving new user"
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- STEP 1: Diagnose what's missing
-- Run this first and check the output
SELECT
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='onboarding_completed') AS has_onboarding_col,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='preferred_language') AS has_language_col,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='country_code') AS has_country_col,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='default_currency') AS has_currency_col,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='invoice_template') AS has_template_col,
  EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='on_auth_user_created') AS has_trigger;

-- ============================================
-- STEP 2: Ensure all required columns exist (safe, idempotent)
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country_code CHAR(2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_currency CHAR(3);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language CHAR(2) DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invoice_template TEXT DEFAULT 'modern';

-- Relax any NOT NULL constraints that might trip the trigger
ALTER TABLE profiles ALTER COLUMN full_name DROP NOT NULL;

-- ============================================
-- STEP 3: Replace the trigger with a BULLETPROOF version
-- This version NEVER fails signup — even if the profile insert errors,
-- the user is still created. We log the error but don't block auth.
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use ON CONFLICT to handle duplicates gracefully (re-registration edge case)
  INSERT INTO profiles (
    id, full_name, email,
    preferred_language, onboarding_completed,
    invoice_template, brand_color, tax_rate
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    'en',
    FALSE,
    'modern',
    '#3b82f6',
    0
  )
  ON CONFLICT (id) DO NOTHING;  -- if profile already exists, skip

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't block user creation
  RAISE WARNING 'handle_new_user failed for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- STEP 4: Verify — try inserting a test user (optional)
-- Uncomment to test. Remove the test user from auth.users dashboard after.
-- ============================================
-- Check what's in profiles vs auth.users (orphans?)
SELECT
  (SELECT COUNT(*) FROM auth.users) AS total_auth_users,
  (SELECT COUNT(*) FROM profiles) AS total_profiles,
  (SELECT COUNT(*) FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id)) AS users_without_profile;

-- ============================================
-- STEP 5: Backfill any users who are missing a profile
-- ============================================
INSERT INTO profiles (id, full_name, email, preferred_language, onboarding_completed, invoice_template, brand_color, tax_rate)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE(u.email, ''),
  'en',
  FALSE,
  'modern',
  '#3b82f6',
  0
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
