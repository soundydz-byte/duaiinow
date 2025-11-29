-- إصلاح جذري لمشكلة تحديث حالة الاشتراكات والصيدليات

-- 1. إعادة إنشاء جدول الاشتراكات بالكامل
DROP TABLE IF EXISTS subscriptions CASCADE;

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'expired')),
  receipt_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. إنشاء فهرس للأداء
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_pharmacy ON subscriptions(pharmacy_id);
CREATE INDEX idx_subscriptions_created_at ON subscriptions(created_at DESC);

-- 3. تفعيل RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. حذف السياسات القديمة
DROP POLICY IF EXISTS "subscriptions_select_all" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_all" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_all_authenticated" ON subscriptions;

-- 5. إنشاء سياسات جديدة
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

-- 6. إنشاء trigger للتحديث التلقائي لحقل updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. إنشاء function لتحديث حالة الصيدلية عند تغيير الاشتراك
CREATE OR REPLACE FUNCTION update_pharmacy_verification_status()
RETURNS TRIGGER AS $$
BEGIN
    -- عند قبول الاشتراك
    IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
        UPDATE pharmacy_profiles
        SET is_verified = true, updated_at = NOW()
        WHERE id = NEW.pharmacy_id;

    -- عند رفض الاشتراك أو انتهائه
    ELSIF NEW.status IN ('rejected', 'expired') AND OLD.status = 'active' THEN
        -- تحقق إذا كان هناك اشتراك آخر نشط
        IF NOT EXISTS (
            SELECT 1 FROM subscriptions
            WHERE pharmacy_id = NEW.pharmacy_id
            AND status = 'active'
            AND expires_at > NOW()
        ) THEN
            UPDATE pharmacy_profiles
            SET is_verified = false, updated_at = NOW()
            WHERE id = NEW.pharmacy_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. إنشاء trigger للتحديث التلقائي لحالة الصيدلية
DROP TRIGGER IF EXISTS trigger_update_pharmacy_verification ON subscriptions;
CREATE TRIGGER trigger_update_pharmacy_verification
    AFTER INSERT OR UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacy_verification_status();

-- 9. إنشاء function للتحقق من انتهاء الاشتراكات
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS void AS $$
BEGIN
    -- تحديث الاشتراكات المنتهية
    UPDATE subscriptions
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active'
    AND expires_at < NOW();

    -- تحديث حالة الصيدليات التي انتهت اشتراكاتها
    UPDATE pharmacy_profiles
    SET is_verified = false, updated_at = NOW()
    WHERE is_verified = true
    AND NOT EXISTS (
        SELECT 1 FROM subscriptions
        WHERE pharmacy_id = pharmacy_profiles.id
        AND status = 'active'
        AND expires_at > NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- 10. إنشاء جدول للإحصائيات (اختياري)
CREATE TABLE IF NOT EXISTS subscription_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_subscriptions INTEGER DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  pending_subscriptions INTEGER DEFAULT 0,
  rejected_subscriptions INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إدراج إحصائية أولية
INSERT INTO subscription_stats (id, total_subscriptions, active_subscriptions, pending_subscriptions, rejected_subscriptions, total_revenue)
VALUES (gen_random_uuid(), 0, 0, 0, 0, 0)
ON CONFLICT DO NOTHING;
