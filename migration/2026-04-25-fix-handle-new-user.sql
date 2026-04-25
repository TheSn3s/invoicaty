-- =====================================================
-- Fix: Make handle_new_user trigger more robust
-- =====================================================
-- Problem: Some auth.users were created without a corresponding
-- row in public.profiles. This rewrites the trigger to:
--   1. Be idempotent (ON CONFLICT DO NOTHING)
--   2. Never block signup if profile insert fails
--   3. Handle missing metadata gracefully
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block signup because of profile creation issues.
  -- Log the error but allow the auth.user insert to succeed.
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it points at the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Backfill: ensure every auth.user has a profile
-- (safe to run anytime — no-op if already in sync)
-- =====================================================
INSERT INTO public.profiles (id, full_name, email)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE(u.email, '')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
