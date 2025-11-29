-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum for user roles
create type user_role as enum ('user', 'pharmacy', 'admin');

-- Create enum for prescription status
create type prescription_status as enum ('pending', 'responded', 'accepted', 'rejected', 'completed');

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role user_role not null default 'user',
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Pharmacy profiles (additional info for pharmacy accounts)
create table if not exists public.pharmacy_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  pharmacy_name text not null,
  license_number text not null unique,
  address text not null,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  working_hours jsonb,
  is_verified boolean default false,
  created_at timestamp with time zone default now()
);

-- Prescriptions table
create table if not exists public.prescriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,
  notes text,
  status prescription_status not null default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Prescription responses from pharmacies
create table if not exists public.prescription_responses (
  id uuid primary key default uuid_generate_v4(),
  prescription_id uuid not null references public.prescriptions(id) on delete cascade,
  pharmacy_id uuid not null references public.pharmacy_profiles(id) on delete cascade,
  available_medicines jsonb not null,
  total_price decimal(10, 2) not null,
  notes text,
  estimated_ready_time text,
  created_at timestamp with time zone default now()
);

-- User medicines (personal medicine cabinet)
create table if not exists public.user_medicines (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  medicine_name text not null,
  dosage text,
  frequency text,
  start_date date,
  end_date date,
  notes text,
  reminder_enabled boolean default false,
  reminder_times jsonb,
  created_at timestamp with time zone default now()
);

-- Notifications table
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  read boolean default false,
  data jsonb,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.pharmacy_profiles enable row level security;
alter table public.prescriptions enable row level security;
alter table public.prescription_responses enable row level security;
alter table public.user_medicines enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Pharmacy profiles policies
create policy "pharmacy_profiles_select_all"
  on public.pharmacy_profiles for select
  to authenticated
  using (true);

create policy "pharmacy_profiles_insert_own"
  on public.pharmacy_profiles for insert
  with check (auth.uid() = id);

create policy "pharmacy_profiles_update_own"
  on public.pharmacy_profiles for update
  using (auth.uid() = id);

-- Prescriptions policies
create policy "prescriptions_select_own"
  on public.prescriptions for select
  using (auth.uid() = user_id);

create policy "prescriptions_select_pharmacy"
  on public.prescriptions for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'pharmacy'
    )
  );

create policy "prescriptions_insert_own"
  on public.prescriptions for insert
  with check (auth.uid() = user_id);

create policy "prescriptions_update_own"
  on public.prescriptions for update
  using (auth.uid() = user_id);

-- Prescription responses policies
create policy "prescription_responses_select_user"
  on public.prescription_responses for select
  using (
    exists (
      select 1 from public.prescriptions
      where prescriptions.id = prescription_responses.prescription_id
      and prescriptions.user_id = auth.uid()
    )
  );

create policy "prescription_responses_select_pharmacy"
  on public.prescription_responses for select
  using (auth.uid() = pharmacy_id);

create policy "prescription_responses_insert_pharmacy"
  on public.prescription_responses for insert
  with check (auth.uid() = pharmacy_id);

create policy "prescription_responses_update_pharmacy"
  on public.prescription_responses for update
  using (auth.uid() = pharmacy_id);

-- User medicines policies
create policy "user_medicines_select_own"
  on public.user_medicines for select
  using (auth.uid() = user_id);

create policy "user_medicines_insert_own"
  on public.user_medicines for insert
  with check (auth.uid() = user_id);

create policy "user_medicines_update_own"
  on public.user_medicines for update
  using (auth.uid() = user_id);

create policy "user_medicines_delete_own"
  on public.user_medicines for delete
  using (auth.uid() = user_id);

-- Notifications policies
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "notifications_delete_own"
  on public.notifications for delete
  using (auth.uid() = user_id);
