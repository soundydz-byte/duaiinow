-- إضافة عمود google_maps_url إلى جدول pharmacy_profiles
alter table if exists public.pharmacy_profiles
  add column if not exists google_maps_url text;

-- تحديث RLS policy للسماح بتحديث google_maps_url
drop policy if exists "pharmacy_profiles_update_own" on public.pharmacy_profiles;

create policy "pharmacy_profiles_update_own"
  on public.pharmacy_profiles for update
  using (auth.uid() = id);
