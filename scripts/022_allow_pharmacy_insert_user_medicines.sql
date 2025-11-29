-- Allow pharmacies to insert medicines into user_medicines table for patients
create policy "user_medicines_insert_pharmacy"
  on public.user_medicines for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'pharmacy'
    )
  );
