-- Create favorites table for users to favorite pharmacies
create table if not exists public.pharmacy_favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pharmacy_id uuid not null references public.pharmacy_profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, pharmacy_id)
);

-- Enable RLS
alter table public.pharmacy_favorites enable row level security;

-- Policies for favorites
create policy "pharmacy_favorites_select_own"
  on public.pharmacy_favorites for select
  using (auth.uid() = user_id);

create policy "pharmacy_favorites_insert_own"
  on public.pharmacy_favorites for insert
  with check (auth.uid() = user_id);

create policy "pharmacy_favorites_delete_own"
  on public.pharmacy_favorites for delete
  using (auth.uid() = user_id);

-- Add index for better performance
create index if not exists pharmacy_favorites_user_id_idx on public.pharmacy_favorites(user_id);
create index if not exists pharmacy_favorites_pharmacy_id_idx on public.pharmacy_favorites(pharmacy_id);
