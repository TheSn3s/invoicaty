-- ============================================
-- Invoicaty — Multi-line Items Migration (v3)
-- Add JSONB `items` column to invoices and quotations
-- Each item: { description: string, quantity: number, unit_price: number }
-- line_total is computed on the client (qty * unit_price)
-- Backward compatible: NULL means use legacy single-line (project/description/amount)
-- ============================================

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS items JSONB;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS items JSONB;

-- Optional: GIN index for future querying inside items
CREATE INDEX IF NOT EXISTS idx_invoices_items ON invoices USING GIN (items);
CREATE INDEX IF NOT EXISTS idx_quotations_items ON quotations USING GIN (items);

-- Helpful comment
COMMENT ON COLUMN invoices.items IS 'JSON array of line items: [{description, quantity, unit_price}]. NULL = legacy single-line invoice.';
COMMENT ON COLUMN quotations.items IS 'JSON array of line items: [{description, quantity, unit_price}]. NULL = legacy single-line quotation.';
