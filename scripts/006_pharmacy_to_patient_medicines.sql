-- Add table for medicines sent from pharmacy to patients
create table if not exists public.pharmacy_patient_medicines (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pharmacy_id uuid not null references public.pharmacy_profiles(id) on delete cascade,
  prescription_id uuid references public.prescriptions(id) on delete set null,
  medicine_name text not null,
  dosage text,
  frequency text,
  instructions text not null,
  start_date date,
  end_date date,
  reminder_times jsonb,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.pharmacy_patient_medicines enable row level security;

-- Policies for pharmacy_patient_medicines
create policy "pharmacy_patient_medicines_select_own"
  on public.pharmacy_patient_medicines for select
  using (auth.uid() = user_id);

create policy "pharmacy_patient_medicines_select_pharmacy"
  on public.pharmacy_patient_medicines for select
  using (auth.uid() = pharmacy_id);

create policy "pharmacy_patient_medicines_insert_pharmacy"
  on public.pharmacy_patient_medicines for insert
  with check (auth.uid() = pharmacy_id);

create policy "pharmacy_patient_medicines_update_pharmacy"
  on public.pharmacy_patient_medicines for update
  using (auth.uid() = pharmacy_id);

-- Add pharmacy_sent_by field to user_medicines to track if sent by pharmacy
alter table public.user_medicines add column if not exists pharmacy_id uuid references public.pharmacy_profiles(id) on delete set null;
alter table public.user_medicines add column if not exists pharmacy_name text;
