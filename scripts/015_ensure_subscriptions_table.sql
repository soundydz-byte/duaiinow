-- Ensure subscriptions table exists with all required fields
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'expired')),
  receipt_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop existing RLS policies safely
DROP POLICY IF EXISTS "subscriptions_select_all" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read subscriptions (admin needs this)
CREATE POLICY "subscriptions_select_all"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow pharmacies to insert their own subscriptions
CREATE POLICY "subscriptions_insert_own"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (pharmacy_id = auth.uid());

-- Allow authenticated users to update subscriptions
CREATE POLICY "subscriptions_update_all"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_pharmacy ON subscriptions(pharmacy_id);
