-- ============================================
-- Invoicaty Migration v2: i18n + Multi-Currency
-- ============================================
-- Safe migration: all new columns have defaults
-- Existing users default to KW/KWD/Arabic to preserve current UX
-- ============================================

-- ============================================
-- 1. Currencies table
-- ============================================
CREATE TABLE IF NOT EXISTS currencies (
  code CHAR(3) PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimal_places SMALLINT NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed common currencies
INSERT INTO currencies (code, name_en, name_ar, symbol, decimal_places) VALUES
  ('KWD', 'Kuwaiti Dinar', 'دينار كويتي', 'د.ك', 3),
  ('SAR', 'Saudi Riyal', 'ريال سعودي', 'ر.س', 2),
  ('AED', 'UAE Dirham', 'درهم إماراتي', 'د.إ', 2),
  ('BHD', 'Bahraini Dinar', 'دينار بحريني', 'د.ب', 3),
  ('QAR', 'Qatari Riyal', 'ريال قطري', 'ر.ق', 2),
  ('OMR', 'Omani Rial', 'ريال عماني', 'ر.ع', 3),
  ('EGP', 'Egyptian Pound', 'جنيه مصري', 'ج.م', 2),
  ('JOD', 'Jordanian Dinar', 'دينار أردني', 'د.أ', 3),
  ('USD', 'US Dollar', 'دولار أمريكي', '$', 2),
  ('EUR', 'Euro', 'يورو', '€', 2),
  ('GBP', 'British Pound', 'جنيه إسترليني', '£', 2),
  ('TRY', 'Turkish Lira', 'ليرة تركية', '₺', 2),
  ('CAD', 'Canadian Dollar', 'دولار كندي', 'C$', 2),
  ('AUD', 'Australian Dollar', 'دولار أسترالي', 'A$', 2),
  ('JPY', 'Japanese Yen', 'ين ياباني', '¥', 0),
  ('CNY', 'Chinese Yuan', 'يوان صيني', '¥', 2),
  ('INR', 'Indian Rupee', 'روبية هندية', '₹', 2)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 2. Countries table
-- ============================================
CREATE TABLE IF NOT EXISTS countries (
  code CHAR(2) PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  default_currency CHAR(3) REFERENCES currencies(code),
  default_tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  phone_code TEXT,
  flag_emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed common countries (GCC + major markets)
INSERT INTO countries (code, name_en, name_ar, default_currency, default_tax_rate, phone_code, flag_emoji) VALUES
  ('KW', 'Kuwait', 'الكويت', 'KWD', 0.00, '+965', '🇰🇼'),
  ('SA', 'Saudi Arabia', 'السعودية', 'SAR', 15.00, '+966', '🇸🇦'),
  ('AE', 'United Arab Emirates', 'الإمارات', 'AED', 5.00, '+971', '🇦🇪'),
  ('BH', 'Bahrain', 'البحرين', 'BHD', 10.00, '+973', '🇧🇭'),
  ('QA', 'Qatar', 'قطر', 'QAR', 0.00, '+974', '🇶🇦'),
  ('OM', 'Oman', 'عمان', 'OMR', 5.00, '+968', '🇴🇲'),
  ('EG', 'Egypt', 'مصر', 'EGP', 14.00, '+20', '🇪🇬'),
  ('JO', 'Jordan', 'الأردن', 'JOD', 16.00, '+962', '🇯🇴'),
  ('US', 'United States', 'الولايات المتحدة', 'USD', 0.00, '+1', '🇺🇸'),
  ('GB', 'United Kingdom', 'المملكة المتحدة', 'GBP', 20.00, '+44', '🇬🇧'),
  ('DE', 'Germany', 'ألمانيا', 'EUR', 19.00, '+49', '🇩🇪'),
  ('FR', 'France', 'فرنسا', 'EUR', 20.00, '+33', '🇫🇷'),
  ('TR', 'Turkey', 'تركيا', 'TRY', 18.00, '+90', '🇹🇷'),
  ('CA', 'Canada', 'كندا', 'CAD', 5.00, '+1', '🇨🇦'),
  ('AU', 'Australia', 'أستراليا', 'AUD', 10.00, '+61', '🇦🇺'),
  ('JP', 'Japan', 'اليابان', 'JPY', 10.00, '+81', '🇯🇵'),
  ('CN', 'China', 'الصين', 'CNY', 13.00, '+86', '🇨🇳'),
  ('IN', 'India', 'الهند', 'INR', 18.00, '+91', '🇮🇳')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 3. Extend profiles table (regional preferences)
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country_code CHAR(2) REFERENCES countries(code);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_currency CHAR(3) REFERENCES currencies(code);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language CHAR(2) DEFAULT 'ar' CHECK (preferred_language IN ('ar','en'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_type TEXT CHECK (business_type IN ('freelancer','small_business','agency','enterprise') OR business_type IS NULL);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Backfill: existing users → Kuwait/KWD/Arabic (preserves current UX)
UPDATE profiles
SET
  country_code = COALESCE(country_code, 'KW'),
  default_currency = COALESCE(default_currency, 'KWD'),
  preferred_language = COALESCE(preferred_language, 'ar'),
  onboarding_completed = COALESCE(onboarding_completed, TRUE) -- existing users skip onboarding
WHERE country_code IS NULL OR default_currency IS NULL;

-- ============================================
-- 4. Extend invoices table (currency, tax, discount, notes)
-- ============================================
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency_code CHAR(3) REFERENCES currencies(code);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,3) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,3) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,3) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total DECIMAL(12,3) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- Backfill: copy old `currency` text into new `currency_code` FK + initialize totals
UPDATE invoices
SET
  currency_code = COALESCE(currency_code, UPPER(TRIM(currency)), 'KWD'),
  subtotal = COALESCE(subtotal, amount),
  total = COALESCE(total, amount)
WHERE currency_code IS NULL OR subtotal = 0;

-- Ensure any unrecognized currency falls back to KWD
UPDATE invoices
SET currency_code = 'KWD'
WHERE currency_code IS NOT NULL
  AND currency_code NOT IN (SELECT code FROM currencies);

-- ============================================
-- 5. Update auto-create profile trigger to set defaults
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, country_code, default_currency, preferred_language, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NULL,           -- new users will pick during onboarding
    NULL,
    'ar',           -- default language until they pick
    FALSE           -- new users go through onboarding wizard
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Public read access to lookup tables
-- ============================================
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read currencies" ON currencies;
CREATE POLICY "Anyone can read currencies" ON currencies
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can read countries" ON countries;
CREATE POLICY "Anyone can read countries" ON countries
  FOR SELECT USING (TRUE);

-- ============================================
-- 7. Verification queries (run these after migration to confirm)
-- ============================================
-- SELECT COUNT(*) AS currency_count FROM currencies;     -- expect 17
-- SELECT COUNT(*) AS country_count FROM countries;       -- expect 18
-- SELECT email, country_code, default_currency, preferred_language, onboarding_completed FROM profiles WHERE email = 'hello@sn3s.com';
-- SELECT COUNT(*) AS invoices_with_currency FROM invoices WHERE currency_code IS NOT NULL;
