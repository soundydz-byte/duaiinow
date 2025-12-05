-- Fix subscription insert policy to allow admins to create subscriptions for pharmacies

-- Drop the existing insert policy
DROP POLICY IF EXISTS "subscriptions_insert_own" ON subscriptions;

-- Create new insert policy that allows both pharmacy owners and admins
CREATE POLICY "subscriptions_insert_own_or_admin"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    pharmacy_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
