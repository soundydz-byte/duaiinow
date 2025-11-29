-- إضافة حقول موقع المستخدم لجدول الوصفات
ALTER TABLE prescriptions
ADD COLUMN IF NOT EXISTS user_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS user_longitude DECIMAL(11, 8);

-- إضافة حقول الموقع والاشتراك لجدول الصيدليات
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- إضافة فهرس لتسريع البحث عن الصيدليات النشطة
CREATE INDEX IF NOT EXISTS idx_profiles_pharmacy_active
ON profiles(role, is_active, subscription_expires_at)
WHERE role = 'pharmacy';

-- إضافة فهرس لتسريع البحث عن الوصفات المعلقة
CREATE INDEX IF NOT EXISTS idx_prescriptions_status
ON prescriptions(status, created_at);
