-- إصلاح أعمدة جدول الاشتراكات لتتطابق مع الكود

-- إضافة الأعمدة المفقودة
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- إزالة الأعمدة غير المستخدمة إذا كانت موجودة
ALTER TABLE subscriptions
DROP COLUMN IF EXISTS receipt_image;

-- التأكد من وجود الفهرس
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_pharmacy ON subscriptions(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at DESC);

-- التأكد من تفعيل RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "subscriptions_select_all" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_all" ON subscriptions;

-- إنشاء سياسات جديدة
CREATE POLICY "subscriptions_select_all"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "subscriptions_insert_own"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (pharmacy_id = auth.uid());

CREATE POLICY "subscriptions_update_all"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (true);
