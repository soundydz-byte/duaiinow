-- إصلاح سريع: تصحيح موقع الصيدلية test
-- الموقع الحالي بعيد جداً (في منطقة Skikda)
-- نقل الصيدلية إلى الجزائر العاصمة

UPDATE public.pharmacy_profiles
SET 
  latitude = 36.7538,
  longitude = 3.0588,
  address = 'الجزائر العاصمة',
  updated_at = now()
WHERE pharmacy_name = 'test' OR pharmacy_name LIKE '%test%';

-- التحقق
SELECT 
  id,
  pharmacy_name,
  latitude,
  longitude,
  is_verified,
  address
FROM public.pharmacy_profiles
WHERE pharmacy_name = 'test' OR pharmacy_name LIKE '%test%'
LIMIT 5;
