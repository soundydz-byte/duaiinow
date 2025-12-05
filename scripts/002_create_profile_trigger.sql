values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'مستخدم جديد'),
    user_role
  )
  on conflict (id) do nothing;
=======
  insert into public.profiles (id, full_name, role, state)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'مستخدم جديد'),
    user_role,
    coalesce(new.raw_user_meta_data ->> 'state', null)
  )
  on conflict (id) do nothing;
