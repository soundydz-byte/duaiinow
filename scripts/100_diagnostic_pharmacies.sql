-- سكريبت تشخيصي شامل لمشكلة عدم ظهور الصيدليات
-- هذا السكريبت يعرض جميع المعلومات المتعلقة بالصيدليات والاشتراكات

-- 1. عرض عدد الصيادلة في جدول profiles
SELECT COUNT(*) as pharmacy_profiles_count
FROM public.profiles
WHERE role = 'pharmacy';

-- 2. عرض تفاصيل الصيادلة في جدول profiles
SELECT id, full_name, phone, role, created_at
FROM public.profiles
WHERE role = 'pharmacy'
LIMIT 10;

-- 3. عرض عدد بيانات الصيدليات
SELECT COUNT(*) as pharmacy_data_count
FROM public.pharmacy_profiles;

-- 4. عرض تفاصيل بيانات الصيدليات
SELECT 
  id,
  pharmacy_name,
  license_number,
  address,
  latitude,
  longitude,
  is_verified,
  created_at,
  updated_at
FROM public.pharmacy_profiles
LIMIT 10;

-- 5. عرض الصيدليات المعتمدة (verified)
SELECT COUNT(*) as verified_pharmacies
FROM public.pharmacy_profiles
WHERE is_verified = true;

-- 6. عرض الصيدليات المعتمدة مع مواقع صحيحة
SELECT COUNT(*) as pharmacies_with_location
FROM public.pharmacy_profiles
WHERE is_verified = true
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL;

-- 7. عرض تفاصيل هذه الصيدليات
SELECT 
  id,
  pharmacy_name,
  latitude,
  longitude,
  is_verified
FROM public.pharmacy_profiles
WHERE is_verified = true
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
LIMIT 10;

-- 8. عرض عدد الاشتراكات الكلي
SELECT COUNT(*) as total_subscriptions
FROM public.subscriptions;

-- 9. عرض توزيع الاشتراكات حسب الحالة
SELECT status, COUNT(*) as count
FROM public.subscriptions
GROUP BY status;

-- 10. عرض الاشتراكات النشطة
SELECT COUNT(*) as active_subscriptions
FROM public.subscriptions
WHERE status = 'active';

-- 11. عرض الاشتراكات النشطة الصالحة (expires_at > now)
SELECT COUNT(*) as valid_active_subscriptions
FROM public.subscriptions
WHERE status = 'active'
  AND expires_at > NOW();

-- 12. عرض تفاصيل الاشتراكات النشطة الصالحة
SELECT 
  id,
  pharmacy_id,
  status,
  created_at,
  expires_at,
  NOW() as current_time,
  (expires_at > NOW()) as is_valid
FROM public.subscriptions
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10;

-- 13. عرض الصيدليات التي لها اشتراكات نشطة صالحة
SELECT DISTINCT sp.id, sp.pharmacy_name, sp.is_verified, sp.latitude, sp.longitude
FROM public.pharmacy_profiles sp
INNER JOIN public.subscriptions s ON s.pharmacy_id = sp.id
WHERE s.status = 'active'
  AND s.expires_at > NOW()
  AND sp.is_verified = true
  AND sp.latitude IS NOT NULL
  AND sp.longitude IS NOT NULL;

-- 14. عرض الصيدليات بدون اشتراكات نشطة صالحة
SELECT sp.id, sp.pharmacy_name, sp.is_verified, 
  (SELECT COUNT(*) FROM public.subscriptions WHERE pharmacy_id = sp.id) as subscription_count,
  (SELECT COUNT(*) FROM public.subscriptions WHERE pharmacy_id = sp.id AND status = 'active') as active_subscription_count,
  (SELECT COUNT(*) FROM public.subscriptions WHERE pharmacy_id = sp.id AND status = 'active' AND expires_at > NOW()) as valid_subscription_count
FROM public.pharmacy_profiles sp
LIMIT 10;

-- 15. عرض معلومات حول الاشتراكات المعطلة
SELECT 
  s.id,
  s.pharmacy_id,
  s.status,
  s.created_at,
  s.expires_at,
  NOW() as current_time,
  (expires_at > NOW()) as is_expired,
  sp.pharmacy_name
FROM public.subscriptions s
LEFT JOIN public.pharmacy_profiles sp ON sp.id = s.pharmacy_id
ORDER BY s.created_at DESC
LIMIT 20;
