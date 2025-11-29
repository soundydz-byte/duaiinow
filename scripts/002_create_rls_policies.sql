-- Profiles RLS Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Pharmacies RLS Policies
create policy "Anyone can view active pharmacies"
  on public.pharmacies for select
  using (is_active = true);

create policy "Pharmacies can update their own data"
  on public.pharmacies for update
  using (auth.uid() = id);

create policy "Pharmacies can insert their own data"
  on public.pharmacies for insert
  with check (auth.uid() = id);

-- Prescriptions RLS Policies
create policy "Users can view their own prescriptions"
  on public.prescriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own prescriptions"
  on public.prescriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own prescriptions"
  on public.prescriptions for update
  using (auth.uid() = user_id);

create policy "Pharmacies can view pending prescriptions"
  on public.prescriptions for select
  using (
    status = 'pending' 
    and exists (
      select 1 from public.pharmacies 
      where id = auth.uid()
    )
  );

-- Prescription Responses RLS Policies
create policy "Users can view responses to their prescriptions"
  on public.prescription_responses for select
  using (
    exists (
      select 1 from public.prescriptions 
      where id = prescription_id 
      and user_id = auth.uid()
    )
  );

create policy "Pharmacies can view their own responses"
  on public.prescription_responses for select
  using (auth.uid() = pharmacy_id);

create policy "Pharmacies can insert their own responses"
  on public.prescription_responses for insert
  with check (auth.uid() = pharmacy_id);

create policy "Pharmacies can update their own responses"
  on public.prescription_responses for update
  using (auth.uid() = pharmacy_id);

-- Medicines RLS Policies
create policy "Users can view their own medicines"
  on public.medicines for select
  using (auth.uid() = user_id);

create policy "Users can insert their own medicines"
  on public.medicines for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own medicines"
  on public.medicines for update
  using (auth.uid() = user_id);

create policy "Users can delete their own medicines"
  on public.medicines for delete
  using (auth.uid() = user_id);

-- Notifications RLS Policies
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);
