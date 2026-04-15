-- ============================================
-- Invoicaty Admin Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. Create admin-only RLS policies for profiles (read all, update all, delete)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Admin-only RLS policies for invoices (read all, delete all)
CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete all invoices" ON invoices
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Set your user as admin (replace with your actual user ID)
-- Find your user ID: SELECT id FROM auth.users WHERE email = 'your@email.com';
-- UPDATE profiles SET role = 'admin' WHERE email = 'Hello@Sn3s.com';

-- 5. Helper view for admin stats (optional, can also query directly)
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM auth.users) AS total_users,
  (SELECT COUNT(*) FROM invoices) AS total_invoices,
  (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE status = 'Paid') AS total_paid_amount,
  (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE status = 'Not Paid') AS total_unpaid_amount,
  (SELECT COUNT(*) FROM auth.users WHERE created_at > NOW() - INTERVAL '30 days') AS new_users_30d,
  (SELECT COUNT(*) FROM invoices WHERE created_at > NOW() - INTERVAL '30 days') AS new_invoices_30d;

-- Grant access to the view
GRANT SELECT ON admin_stats TO authenticated;
