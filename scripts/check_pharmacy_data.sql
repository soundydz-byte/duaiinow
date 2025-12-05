-- الاستعلام للتحقق من بيانات الصيدليات في قاعدة البيانات

-- 1. تحقق من الصيدليات الموثقة
SELECT 
  id,
  pharmacy_name,
  latitude,
  longitude,
  is_verified,
  created_at
FROM pharmacy_profiles
WHERE is_verified = true
  AND latitude IS NOT NULL 
  AND longitude IS NOT NULL
ORDER BY created_at DESC;

-- 2. تحقق من الاشتراكات النشطة
SELECT 
  sub.id,
  sub.pharmacy_id,
  pp.pharmacy_name,
  sub.status,
  sub.expires_at,
  sub.created_at
FROM subscriptions sub
JOIN pharmacy_profiles pp ON sub.pharmacy_id = pp.id
WHERE sub.status = 'active'
  AND sub.expires_at > NOW()
ORDER BY sub.created_at DESC;

-- 3. عدد الصيدليات بحسب الحالة
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN is_verified = true THEN 1 ELSE 0 END) as verified,
  SUM(CASE WHEN latitude IS NOT NULL THEN 1 ELSE 0 END) as with_coords
FROM pharmacy_profiles;

-- 4. الإحداثيات التي قد تكون معاكوسة
SELECT 
  pharmacy_name,
  latitude,
  longitude,
  CASE 
    WHEN latitude < -90 OR latitude > 90 THEN '❌ Invalid Latitude'
    WHEN longitude < -180 OR longitude > 180 THEN '❌ Invalid Longitude'
    ELSE '✅ Valid'
  END as validation
FROM pharmacy_profiles
WHERE is_verified = true
  AND (latitude IS NOT NULL OR longitude IS NOT NULL);

-- 5. الصيدليات التي لا تملك اشتراكات نشطة
SELECT 
  pp.id,
  pp.pharmacy_name,
  pp.latitude,
  pp.longitude,
  pp.is_verified,
  COUNT(sub.id) as subscription_count,
  SUM(CASE WHEN sub.status = 'active' THEN 1 ELSE 0 END) as active_count
FROM pharmacy_profiles pp
LEFT JOIN subscriptions sub ON pp.id = sub.pharmacy_id
WHERE pp.is_verified = true
GROUP BY pp.id, pp.pharmacy_name, pp.latitude, pp.longitude, pp.is_verified
ORDER BY active_count DESC;
