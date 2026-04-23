-- ============================================
-- Quotations table
-- ============================================

CREATE TABLE IF NOT EXISTS quotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  serial TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  client TEXT NOT NULL DEFAULT '',
  project TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  amount NUMERIC(12,3) NOT NULL DEFAULT 0,
  discount NUMERIC(12,3) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,3) DEFAULT 0,
  total NUMERIC(12,3) DEFAULT 0,
  currency_code TEXT REFERENCES currencies(code) DEFAULT 'KWD',
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Sent','Accepted','Rejected','Expired')),
  converted_invoice_id UUID REFERENCES invoices(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON quotations(user_id);

-- RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quotations"
  ON quotations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotations"
  ON quotations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotations"
  ON quotations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotations"
  ON quotations FOR DELETE
  USING (auth.uid() = user_id);
