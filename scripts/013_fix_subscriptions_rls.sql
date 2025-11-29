-- Drop existing policies that conflict
drop policy if exists "subscriptions_select_own" on public.subscriptions;
drop policy if exists "subscriptions_select_admin" on public.subscriptions;

-- Create new policies that allow admins to view all subscriptions
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = pharmacy_id);

create policy "subscriptions_select_all_for_admin"
  on public.subscriptions for select
  using (true); -- Allow all authenticated users to select, admin check will be done in application layer

create policy "subscriptions_update_all"
  on public.subscriptions for update
  using (true); -- Allow updates from application layer with admin check

-- Ensure subscriptions table exists with all required fields
alter table public.subscriptions 
  add column if not exists expires_at timestamp with time zone;
