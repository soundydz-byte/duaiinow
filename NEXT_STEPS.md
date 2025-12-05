# 📋 الخطوات التالية - خارطة الطريق

## ✅ ما تم إنجازه

### Phase 1: إصلاح Admin Dashboard ✅
- ✅ إصلاح عرض الأصفار في لوحة التحكم
- ✅ استخدام SERVICE_ROLE_KEY للوصول الكامل
- ✅ جميع إحصائيات Admin تعمل

### Phase 2: نظام المسافة والوصفات ✅
- ✅ حساب المسافة باستخدام Haversine Formula
- ✅ دعم 50 كم للصيدليات القريبة
- ✅ API للحصول على الصيدليات القريبة: `/api/prescriptions/nearby-pharmacies`
- ✅ صفحة اختيار الصيدليات: `/app/prescriptions/select-pharmacies`

### Phase 3: PWA + Notifications + Analytics ✅
- ✅ Progressive Web App كامل (manifest + Service Worker)
- ✅ نظام Push Notifications (Subscription + Send APIs)
- ✅ نظام Analytics شامل (Event logging + Statistics)
- ✅ لوحة تحكم Analytics في Admin Dashboard

---

## 🚀 الخطوات المتبقية (الأولويات)

### 1️⃣ تشغيل Database Migration
**الملف:** `scripts/021_add_pwa_analytics.sql`
**الخطوات:**
```bash
# 1. افتح Supabase Console
# 2. اذهب إلى SQL Editor
# 3. انسخ محتوى scripts/021_add_pwa_analytics.sql
# 4. شغّل الـ SQL
```

**النتائج:**
- ✅ جدول `analytics_events` سينشأ
- ✅ جدول `push_subscriptions` سينشأ
- ✅ Indexes للأداء السريعة
- ✅ RLS Policies للأمان

---

### 2️⃣ تثبيت مكتبة web-push
**الأمر:**
```bash
npm install web-push
```

**السبب:**
- مكتبة مطلوبة لإرسال Push Notifications من الـ Server

---

### 3️⃣ إضافة VAPID Keys للبيئة

**الخطوات:**
```bash
# 1. شغّل الأمر لإنشاء keys:
npx web-push generate-vapid-keys

# 2. انسخ المفاتيح
# 3. أضفها إلى .env.local:
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

---

### 4️⃣ تحديث API لإرسال الإشعارات
**الملف:** `app/api/notifications/send/route.ts`
**التعديل:**
```typescript
import webpush from 'web-push'

// في البداية
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// في handleSendNotification
await webpush.sendNotification(subscription, JSON.stringify(payload))
```

---

### 5️⃣ تفعيل Analytics Tracking

#### في صفحات الوصفات:
```typescript
// app/prescriptions/page.tsx
import { usePageView } from '@/hooks/use-analytics'

export default function PrescriptionsPage() {
  usePageView() // تتبع تلقائي
  return (...)
}
```

#### عند رفع وصفة:
```typescript
// في handlers
trackEvent({
  event_type: 'prescription_upload',
  user_id: currentUserId,
  metadata: { 
    file_size: fileSize,
    medicine_count: medicines.length 
  }
})
```

#### عند عرض صيدلية:
```typescript
trackEvent({
  event_type: 'pharmacy_view',
  user_id: currentUserId,
  metadata: { pharmacy_id: pharmacyId }
})
```

---

### 6️⃣ اختبار PWA

**على الويب:**
```bash
npm run dev
# افتح http://localhost:3000
# انقر على أيقونة التطبيق في شريط العناوين
# اختر "تثبيت التطبيق"
```

**على الهاتف:**
```
1. افتح التطبيق في Chrome
2. اضغط القائمة (3 نقاط)
3. اختر "تثبيت التطبيق" أو "التطبيق"
4. أنشئ اختصار على الصفحة الرئيسية
```

---

### 7️⃣ اختبار الإشعارات

**في Console:**
```javascript
// اطلب إذن الإشعارات
if ('Notification' in window) {
  Notification.requestPermission().then(permission => {
    console.log('Permission:', permission)
  })
}

// اختبر إشعار محلي
new Notification('Hello!', { body: 'Test notification' })
```

---

### 8️⃣ التحقق من Analytics

**في Admin Dashboard:**
```
1. اذهب إلى /app/admin
2. ابحث عن قسم "Analytics"
3. يجب أن ترى البطاقات:
   - Total Events
   - This Week
   - Active Users
   - Event Types
```

---

## 📊 ملخص الحالة

| المميزة | الحالة | متطلبات |
|---------|--------|---------|
| PWA | ✅ كامل | تشغيل app |
| Push Notifications | 🔜 Framework | web-push library + VAPID keys |
| Analytics | ✅ كامل | Database migration |
| Admin Dashboard | ✅ كامل | بدون متطلبات |

---

## 🎯 الأولويات

### الآن (Critical):
1. ✅ تشغيل SQL Migration
2. ✅ تثبيت web-push
3. ✅ إضافة VAPID Keys

### اليوم (High):
4. ✅ تحديث API لإرسال إشعارات
5. ✅ اختبار PWA
6. ✅ اختبار الإشعارات

### هذا الأسبوع (Medium):
7. ✅ إضافة tracking للأحداث المهمة
8. ✅ اختبار Analytics
9. ✅ التحقق من أداء التطبيق

---

## 🔗 الملفات الرئيسية

### PWA:
- `public/manifest.json` - تكوين التطبيق
- `public/sw.js` - Service Worker
- `hooks/use-pwa.ts` - تسجيل PWA

### Notifications:
- `app/api/notifications/subscribe/route.ts` - اشتراك
- `app/api/notifications/send/route.ts` - إرسال
- `scripts/021_add_pwa_analytics.sql` - Database

### Analytics:
- `lib/analytics.ts` - core logic
- `hooks/use-analytics.ts` - React hook
- `app/api/analytics/route.ts` - API
- `app/admin/page.tsx` - Dashboard

---

## 💡 نصائح

### لتسريع التطوير:
```bash
# تطوير محلي سريع
npm run dev

# بناء الإنتاج
npm run build

# بدء الإنتاج
npm start
```

### للاختبار:
```bash
# فتح DevTools
F12

# الذهاب إلى Application
# تحقق من:
# - Service Workers
# - Manifest
# - Cache Storage
# - Local Storage
```

---

**🎉 أنت قريب جداً من النهاية!** فقط بعض تحديثات صغيرة وسيكون التطبيق احترافياً بالكامل!
