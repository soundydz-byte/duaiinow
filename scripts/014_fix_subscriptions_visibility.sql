-- إصلاح سياسات RLS للاشتراكات

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_own" ON subscriptions;

-- سياسة للقراءة: يمكن للجميع قراءة الاشتراكات (سيتم التحقق من الصلاحيات في التطبيق)
CREATE POLICY "Anyone can view subscriptions"
ON subscriptions FOR SELECT
TO authenticated
USING (true);

-- سياسة للإدراج: الصيدليات فقط تستطيع إنشاء اشتراكات لنفسها
CREATE POLICY "Pharmacies can create their own subscriptions"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = pharmacy_id);

-- سياسة للتحديث: الصيدليات تستطيع تحديث اشتراكاتها الخاصة، والأدمن يستطيع تحديث أي اشتراك
CREATE POLICY "Pharmacies and admins can update subscriptions"
ON subscriptions FOR UPDATE
TO authenticated
USING (
  auth.uid() = pharmacy_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
