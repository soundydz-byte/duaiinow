-- Add insert policy for notifications to allow pharmacies to create notifications for patients
create policy "notifications_insert_pharmacy"
  on public.notifications for insert
  with check (
    exists (
      select 1 from public.pharmacy_profiles
      where pharmacy_profiles.id = auth.uid()
    )
  );
