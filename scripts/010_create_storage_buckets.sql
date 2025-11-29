-- Create storage buckets for prescriptions and subscription receipts
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('prescriptions', 'prescriptions', true),
  ('subscriptions', 'subscriptions', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for prescriptions bucket
CREATE POLICY "Users can upload their own prescriptions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view prescriptions"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'prescriptions');

-- Set up storage policies for subscriptions bucket
CREATE POLICY "Pharmacies can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'subscriptions');

CREATE POLICY "Public can view receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'subscriptions');
