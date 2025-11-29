-- إضافة جداول الاشتراكات وتتبع الوصول
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  pharmacy_id uuid not null references public.pharmacy_profiles(id) on delete cascade,
  plan_type text not null check (plan_type in ('monthly', 'yearly')),
  price decimal(10, 2) not null,
  payment_receipt_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'active', 'expired')),
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- جدول تتبع وصول المريض للصيدلية
create table if not exists public.user_arrivals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pharmacy_id uuid not null references public.pharmacy_profiles(id) on delete cascade,
  prescription_id uuid references public.prescriptions(id) on delete set null,
  arrived_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

alter table public.subscriptions enable row level security;
alter table public.user_arrivals enable row level security;

-- سياسات الأمان
create policy "subscriptions_select_pharmacy"
  on public.subscriptions for select
  using (auth.uid() = pharmacy_id);

create policy "subscriptions_insert_pharmacy"
  on public.subscriptions for insert
  with check (auth.uid() = pharmacy_id);

create policy "user_arrivals_insert_user"
  on public.user_arrivals for insert
  with check (auth.uid() = user_id);

create policy "user_arrivals_select_pharmacy"
  on public.user_arrivals for select
  using (auth.uid() = pharmacy_id);
