-- Create subscriptions table if not exists
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  pharmacy_id uuid not null references public.profiles(id) on delete cascade,
  plan_type text not null check (plan_type in ('monthly', 'yearly')),
  receipt_url text not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'expired', 'rejected')),
  start_date timestamp with time zone not null default now(),
  end_date timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on subscriptions
alter table public.subscriptions enable row level security;

-- Create subscriptions policies
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = pharmacy_id);

create policy "subscriptions_select_admin"
  on public.subscriptions for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "subscriptions_insert_own"
  on public.subscriptions for insert
  with check (auth.uid() = pharmacy_id);

create policy "subscriptions_update_admin"
  on public.subscriptions for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create navigation_records table for tracking arrivals
create table if not exists public.navigation_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pharmacy_id uuid not null references public.pharmacy_profiles(id) on delete cascade,
  prescription_id uuid not null references public.prescriptions(id) on delete cascade,
  arrived_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS on navigation_records
alter table public.navigation_records enable row level security;

-- Create navigation_records policies
create policy "navigation_records_select_user"
  on public.navigation_records for select
  using (auth.uid() = user_id);

create policy "navigation_records_select_pharmacy"
  on public.navigation_records for select
  using (auth.uid() = pharmacy_id);

create policy "navigation_records_insert_user"
  on public.navigation_records for insert
  with check (auth.uid() = user_id);
