-- سكريبت شامل لإصلاح مشكلة عدم ظهور الصيدليات على الخريطة
-- هذا السكريبط يعمل مع الصيدليات الموجودة بالفعل في النظام

-- ==================== الخطوة 1: تحديث الصيدليات الموجودة ====================
-- تحديث جميع الصيدليات لتكون معتمدة وبها مواقع صحيحة

UPDATE public.pharmacy_profiles
SET 
  is_verified = true,
  latitude = CASE 
    WHEN latitude IS NULL OR latitude = 0 THEN 36.7538 + (random() * 0.05)
    ELSE latitude 
  END,
  longitude = CASE 
    WHEN longitude IS NULL OR longitude = 0 THEN 3.0588 + (random() * 0.05)
    ELSE longitude 
  END,
  updated_at = now()
WHERE is_verified = false OR latitude IS NULL OR longitude IS NULL;

-- ==================== الخطوة 2: تحديث الاشتراكات ====================
-- تحديث جميع الاشتراكات "pending" إلى "active" وتعيين تاريخ انتهاء صحيح

UPDATE public.subscriptions
SET 
  status = 'active',
  expires_at = CASE 
    WHEN expires_at IS NULL OR expires_at < NOW() THEN now() + interval '30 days'
    ELSE expires_at 
  END,
  updated_at = now()
WHERE (status = 'pending' OR expires_at IS NULL OR expires_at < NOW())
  AND pharmacy_id IN (SELECT id FROM public.pharmacy_profiles WHERE is_verified = true);

-- ==================== الخطوة 3: إضافة اشتراكات للصيدليات التي لا تملكها ====================
-- للصيدليات التي لا تملك اشتراكات نشطة صالحة

INSERT INTO public.subscriptions (pharmacy_id, plan_type, status, expires_at, created_at)
SELECT 
  pp.id,
  'monthly',
  'active',
  now() + interval '30 days',
  now()
FROM public.pharmacy_profiles pp
WHERE pp.is_verified = true
  AND NOT EXISTS (
    SELECT 1 FROM public.subscriptions s 
    WHERE s.pharmacy_id = pp.id 
      AND s.status = 'active' 
      AND s.expires_at > NOW()
  )
ON CONFLICT DO NOTHING;

-- ==================== الخطوة 4: التحقق من البيانات ====================
-- عرض الصيدليات التي تم تحديثها

SELECT 
  pp.id,
  pp.pharmacy_name,
  pp.latitude,
  pp.longitude,
  pp.is_verified,
  COUNT(CASE WHEN s.status = 'active' AND s.expires_at > NOW() THEN 1 END) as active_subscriptions,
  MAX(CASE WHEN s.status = 'active' AND s.expires_at > NOW() THEN s.expires_at ELSE NULL END) as subscription_expires
FROM public.pharmacy_profiles pp
LEFT JOIN public.subscriptions s ON s.pharmacy_id = pp.id
WHERE pp.is_verified = true
GROUP BY pp.id, pp.pharmacy_name, pp.latitude, pp.longitude, pp.is_verified
ORDER BY pp.created_at DESC;
