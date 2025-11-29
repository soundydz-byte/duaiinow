-- إصلاح جدول الاشتراكات ليشير إلى pharmacy_profiles بدلاً من profiles
-- أولاً نحذف الـ foreign key القديم
alter table if exists public.subscriptions 
  drop constraint if exists subscriptions_pharmacy_id_fkey;

-- نضيف foreign key جديد يشير إلى pharmacy_profiles
alter table if exists public.subscriptions
  add constraint subscriptions_pharmacy_id_fkey 
  foreign key (pharmacy_id) 
  references public.pharmacy_profiles(id) 
  on delete cascade;

-- تحديث RLS policies لتسمح بقراءة الاشتراكات للأدمن بشكل أفضل
drop policy if exists "subscriptions_select_admin" on public.subscriptions;

create policy "subscriptions_select_all_authenticated"
  on public.subscriptions for select
  to authenticated
  using (true);
