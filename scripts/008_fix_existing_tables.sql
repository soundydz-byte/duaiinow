-- Fix SQL errors by using DROP IF EXISTS and CREATE IF NOT EXISTS properly

-- Drop existing policies first
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "subscriptions_select_own" on public.subscriptions;

-- Recreate them
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = pharmacy_id);

-- Add expiry date to subscriptions if not exists
alter table public.subscriptions add column if not exists expires_at timestamp with time zone;

-- Add function to check subscription status
create or replace function check_subscription_expiry()
returns trigger as $$
begin
  if new.status = 'active' and new.expires_at < now() then
    new.status = 'expired';
  end if;
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically expire subscriptions
drop trigger if exists subscription_expiry_check on public.subscriptions;
create trigger subscription_expiry_check
  before update on public.subscriptions
  for each row
  execute function check_subscription_expiry();
