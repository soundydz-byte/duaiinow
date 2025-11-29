-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers for updated_at
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_pharmacies
  before update on public.pharmacies
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_prescriptions
  before update on public.prescriptions
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_prescription_responses
  before update on public.prescription_responses
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_medicines
  before update on public.medicines
  for each row
  execute function public.handle_updated_at();

-- Function to create notification when pharmacy responds
create or replace function public.notify_user_on_response()
returns trigger
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_pharmacy_name text;
begin
  -- Get user_id from prescription
  select user_id into v_user_id
  from public.prescriptions
  where id = new.prescription_id;

  -- Get pharmacy name
  select pharmacy_name into v_pharmacy_name
  from public.pharmacies
  where id = new.pharmacy_id;

  -- Create notification
  insert into public.notifications (user_id, title, message, type, related_id)
  values (
    v_user_id,
    'رد جديد من صيدلية',
    'صيدلية ' || v_pharmacy_name || ' ردت على وصفتك الطبية',
    'prescription_response',
    new.prescription_id
  );

  return new;
end;
$$;

-- Trigger for prescription responses
create trigger notify_on_prescription_response
  after insert on public.prescription_responses
  for each row
  execute function public.notify_user_on_response();
