"use server"

import { createClient } from "@/lib/supabase/server"

export async function fixSubscriptionApproval() {
  const supabase = await createClient()

  try {
    // 1. إعادة إنشاء جدول الاشتراكات بالكامل
    await supabase.rpc('exec_sql', {
      sql: `
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

        CREATE INDEX idx_subscriptions_status ON subscriptions(status);
        CREATE INDEX idx_subscriptions_pharmacy ON subscriptions(pharmacy_id);
        CREATE INDEX idx_subscriptions_created_at ON subscriptions(created_at DESC);

        ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "subscriptions_select_all" ON subscriptions;
        DROP POLICY IF EXISTS "subscriptions_insert_own" ON subscriptions;
        DROP POLICY IF EXISTS "subscriptions_update_all" ON subscriptions;

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
      `
    })

    // 2. إنشاء trigger للتحديث التلقائي
    await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    // 3. إنشاء function لتحديث حالة الصيدلية
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_pharmacy_verification_status()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
                UPDATE pharmacy_profiles
                SET is_verified = true, updated_at = NOW()
                WHERE id = NEW.pharmacy_id;
            ELSIF NEW.status IN ('rejected', 'expired') AND OLD.status = 'active' THEN
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

        DROP TRIGGER IF EXISTS trigger_update_pharmacy_verification ON subscriptions;
        CREATE TRIGGER trigger_update_pharmacy_verification
            AFTER INSERT OR UPDATE ON subscriptions
            FOR EACH ROW
            EXECUTE FUNCTION update_pharmacy_verification_status();
      `
    })

    return { success: true, message: "تم إصلاح نظام الاشتراكات بنجاح" }

  } catch (error) {
    console.error("Error fixing subscriptions:", error)
    return { success: false, message: "حدث خطأ أثناء إصلاح نظام الاشتراكات" }
  }
}
