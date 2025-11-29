-- إضافة صيدليات تجريبية
-- هذا السكريبت يضيف صيدليات تقريبية من الجزائر

-- أولاً: إنشاء مستخدمين صيادلة تجريبيين
-- صيدلية 1: صيدلية الأمل
INSERT INTO public.profiles (id, full_name, phone, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'صيدلية الأمل',
  '+213912345678',
  'pharmacy',
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- صيدلية 2: صيدلية النور
INSERT INTO public.profiles (id, full_name, phone, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'صيدلية النور',
  '+213912345679',
  'pharmacy',
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- صيدلية 3: صيدلية الشفاء
INSERT INTO public.profiles (id, full_name, phone, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'صيدلية الشفاء',
  '+213912345680',
  'pharmacy',
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- صيدلية 4: صيدلية الصحة
INSERT INTO public.profiles (id, full_name, phone, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'صيدلية الصحة',
  '+213912345681',
  'pharmacy',
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- صيدلية 5: صيدلية الزيتون
INSERT INTO public.profiles (id, full_name, phone, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'صيدلية الزيتون',
  '+213912345682',
  'pharmacy',
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- الآن: إضافة بيانات pharmacy_profiles مع مواقع حقيقية في الجزائر
INSERT INTO public.pharmacy_profiles (id, pharmacy_name, license_number, address, latitude, longitude, is_verified)
SELECT 
  p.id,
  p.full_name,
  'LIC-' || substr(p.id::text, 1, 8),
  'شارع رئيسي، الجزائر',
  36.76 + (random() * 0.05),
  3.06 + (random() * 0.05),
  true
FROM public.profiles p
WHERE p.role = 'pharmacy' AND NOT EXISTS (
  SELECT 1 FROM public.pharmacy_profiles pp WHERE pp.id = p.id
)
LIMIT 5;

-- إضافة اشتراكات نشطة
INSERT INTO public.subscriptions (pharmacy_id, plan_type, price, status, start_date, end_date)
SELECT 
  id,
  'monthly',
  500.00,
  'active',
  now() - interval '10 days',
  now() + interval '20 days'
FROM public.pharmacy_profiles
ON CONFLICT DO NOTHING;
