-- Invoicaty: Add company_name + invoice_display to profiles
-- Safe to run multiple times (idempotent)

-- 1) Add company_name column
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='company_name') THEN
    ALTER TABLE profiles ADD COLUMN company_name TEXT DEFAULT NULL;
  END IF;
END $$;

-- 2) Add invoice_display column ('name', 'company', 'both')
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='invoice_display') THEN
    ALTER TABLE profiles ADD COLUMN invoice_display TEXT DEFAULT 'name'
      CHECK (invoice_display IN ('name', 'company', 'both'));
  END IF;
END $$;
