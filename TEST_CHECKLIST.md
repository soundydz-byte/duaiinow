# ✅ Checklist الاختبار الشامل

## 🔧 الإعدادات الأولية

- [ ] تثبيت جميع الـ packages: `npm install`
- [ ] نسخ ملف البيئة: `cp .env.example .env.local`
- [ ] ملء متغيرات البيئة الصحيحة
- [ ] تشغيل الـ dev server: `npm run dev`

---

## 🗄️ Database Setup

- [ ] تشغيل SQL Migration: `scripts/021_add_pwa_analytics.sql`
- [ ] التحقق من جداول جديدة:
  - [ ] `analytics_events` table exists
  - [ ] `push_subscriptions` table exists
- [ ] التحقق من الـ Indexes:
  - [ ] Index on `created_at`
  - [ ] Index on `user_id, event_type`
- [ ] التحقق من RLS Policies:
  - [ ] Policies applied to both tables
  - [ ] Service role can access all

---

## 📱 PWA Testing

### Manifest Validation:
- [ ] افتح DevTools (F12)
- [ ] اذهب إلى Application → Manifest
- [ ] تحقق من:
  - [ ] `name`: "Duaiii"
  - [ ] `display`: "standalone"
  - [ ] `icons` موجودة (192x192, 512x512, maskable)
  - [ ] `start_url`: "/"

### Service Worker:
- [ ] اذهب إلى Application → Service Workers
- [ ] تحقق من:
  - [ ] Service Worker "registered"
  - [ ] الحالة "activated"
  - [ ] Update on reload: enabled

### Installation:
- [ ] افتح التطبيق في http://localhost:3000
- [ ] انقر على أيقونة التطبيق في شريط العناوين
- [ ] اختر "Install app"
- [ ] تحقق من:
  - [ ] التطبيق مثبت على الشاشة الرئيسية
  - [ ] يفتح بدون عنوان المتصفح
  - [ ] شاشة البدء تعرض الأيقونة

### Offline Testing:
- [ ] افتح DevTools (F12)
- [ ] اذهب إلى Network
- [ ] اختر "Offline"
- [ ] حدّث الصفحة (F5)
- [ ] تحقق من:
  - [ ] الصفحات تحمل من Cache
  - [ ] الأيقونات تظهر
  - [ ] لا توجد أخطاء شديدة

### Cache Storage:
- [ ] اذهب إلى Application → Cache Storage
- [ ] تحقق من:
  - [ ] `v1` cache موجود
  - [ ] يحتوي على الملفات الأساسية
  - [ ] الحجم معقول (~100KB)

---

## 🔔 Push Notifications Testing

### Permissions:
- [ ] اذهب إلى التطبيق
- [ ] تحقق من طلب الإذن
- [ ] امنح الإذن للإشعارات
- [ ] تحقق من التخزين في localStorage:
```javascript
// في Console
localStorage.getItem('notification-permission')
```

### Local Notifications:
- [ ] شغّل في Console:
```javascript
new Notification('Test Notification', {
  body: 'This is a test',
  icon: '/icon-192.png'
})
```
- [ ] تحقق من:
  - [ ] الإشعار يظهر
  - [ ] الأيقونة صحيحة
  - [ ] يمكن الضغط عليه

### Subscription:
- [ ] شغّل في Console:
```javascript
navigator.serviceWorker.ready.then(registration => {
  registration.pushManager.getSubscription().then(sub => {
    console.log('Subscription:', sub)
  })
})
```
- [ ] تحقق من:
  - [ ] endpoint موجود
  - [ ] keys موجودة (auth, p256dh)

---

## 📊 Analytics Testing

### Event Logging:
- [ ] شغّل في Console:
```javascript
const { trackEvent } = await import('@/hooks/use-analytics')
trackEvent({
  event_type: 'prescription_upload',
  user_id: 'test-user',
  metadata: { test: true }
})
```
- [ ] تحقق من:
  - [ ] لا توجد أخطاء في Console
  - [ ] الحدث مسجل في Database

### Page Views:
- [ ] أضف `usePageView()` إلى صفحة:
```typescript
import { usePageView } from '@/hooks/use-analytics'

export default function Page() {
  usePageView()
  return <div>Test</div>
}
```
- [ ] زر الصفحة
- [ ] تحقق من تسجيل الحدث

### Admin Dashboard:
- [ ] اذهب إلى `/app/admin`
- [ ] ابحث عن قسم Analytics
- [ ] تحقق من:
  - [ ] بطاقة "Total Events"
  - [ ] بطاقة "This Week"
  - [ ] بطاقة "Active Users"
  - [ ] بطاقة "Event Types"
- [ ] تحقق من الأرقام معقولة

### Database Verification:
- [ ] في Supabase Console، شغّل:
```sql
SELECT COUNT(*) FROM analytics_events;
SELECT DISTINCT event_type FROM analytics_events;
SELECT DATE(created_at), COUNT(*) FROM analytics_events GROUP BY DATE(created_at);
```
- [ ] تحقق من:
  - [ ] الأحداث مسجلة
  - [ ] التنوع في الأنواع
  - [ ] التواريخ صحيحة

---

## 🚀 Prescriptions & Pharmacies Testing

### Nearby Pharmacies API:
- [ ] افتح في Console:
```javascript
const response = await fetch('/api/prescriptions/nearby-pharmacies?userLat=36.7372&userLng=3.0869&prescriptionId=test-123')
const data = await response.json()
console.log(data)
```
- [ ] تحقق من:
  - [ ] الصيدليات المرجعة
  - [ ] المسافات محسوبة صحيح
  - [ ] جميعها ضمن 50 كم

### Pharmacy Selection Page:
- [ ] اذهب إلى صفحة وصفة
- [ ] انقر على "Send to Nearby Pharmacies"
- [ ] تحقق من:
  - [ ] الموقع مطلوب
  - [ ] الصيدليات تحميل
  - [ ] يمكن اختيار متعددة
  - [ ] الأمسافات تعرض صحيح

---

## 🔐 Security Testing

### RLS Policies:
- [ ] حاول الوصول كمستخدم عادي:
```javascript
// في Client
const supabase = createBrowserClient(...)
const { data } = await supabase.from('analytics_events').select()
// يجب أن تكون فارغة
```

- [ ] حاول الوصول كـ Admin (Service Role):
```javascript
// في Server (API route)
const supabase = createClient(..., { auth: { persistSession: false } }, { headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` } })
const { data } = await supabase.from('analytics_events').select()
// يجب أن تحتوي على البيانات
```

### Environment Variables:
- [ ] تحقق من `.env.local`:
  - [ ] لا توجد مفاتيح في git
  - [ ] `VAPID_PRIVATE_KEY` محلي فقط
  - [ ] جميع المفاتيح المطلوبة موجودة

---

## 🎨 UI/UX Testing

### Responsive Design:
- [ ] اختبر على أحجام مختلفة:
  - [ ] Desktop (1920x1080)
  - [ ] Tablet (768x1024)
  - [ ] Mobile (375x667)
- [ ] تحقق من:
  - [ ] جميع العناصر تظهر صحيح
  - [ ] لا توجد تمرير أفقي
  - [ ] الأزرار قابلة للضغط

### Navigation:
- [ ] تحقق من:
  - [ ] جميع الروابط تعمل
  - [ ] لا توجد روابط معطلة
  - [ ] الملاحة سريعة

### Loading States:
- [ ] تحقق من:
  - [ ] عرض loaders عند التحميل
  - [ ] عرض error states عند الفشل
  - [ ] عرض empty states عندما لا توجد بيانات

---

## 📈 Performance Testing

### Lighthouse:
- [ ] اذهب إلى DevTools → Lighthouse
- [ ] شغّل "Generate report"
- [ ] تحقق من:
  - [ ] Performance: > 70
  - [ ] Accessibility: > 80
  - [ ] Best Practices: > 80
  - [ ] SEO: > 80

### Network Performance:
- [ ] اذهب إلى DevTools → Network
- [ ] حمّل الصفحة الرئيسية
- [ ] تحقق من:
  - [ ] Bundle size معقول
  - [ ] لا توجد طلبات بطيئة
  - [ ] Images محسنة

### Database Queries:
- [ ] تحقق من سرعة الاستعلام:
```sql
EXPLAIN ANALYZE
SELECT * FROM analytics_events
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```
- [ ] يجب أن تكون سريعة (< 500ms)

---

## 🐛 Bug Verification

### Known Issues to Check:
- [ ] ✅ Admin dashboard يعرض الأصفار → Fixed with SERVICE_ROLE
- [ ] ✅ Distance calculation → Fixed with Haversine formula
- [ ] ✅ PWA caching → Verified
- [ ] ✅ Notifications permission → Tested

### Regression Testing:
- [ ] ✅ Authentication still works
- [ ] ✅ Prescriptions CRUD operations
- [ ] ✅ Pharmacy profiles
- [ ] ✅ File uploads
- [ ] ✅ Admin operations

---

## ✅ Final Verification

**قبل الإطلاق:**
- [ ] جميع الـ Tests تمرّ
- [ ] لا توجد أخطاء في Console
- [ ] جميع الوظائف تعمل
- [ ] الأداء مقبول
- [ ] الأمان معيّن
- [ ] الـ UI يبدو احترافي

**بعد الإطلاق:**
- [ ] مراقبة Analytics
- [ ] تتبع الأخطاء
- [ ] الاستجابة للمستخدمين
- [ ] التحديثات المنتظمة

---

## 🎉 النتيجة

إذا مرّت جميع هذه الـ Checks، **التطبيق جاهز للإنتاج!** 🚀

---

## 📝 ملاحظات إضافية

### للاختبار السريع:
```bash
# 1. تشغيل التطبيق
npm run dev

# 2. افتح في 3 نوافذ:
# - Window 1: Patient
# - Window 2: Pharmacy
# - Window 3: Admin

# 3. جرّب:
# - Upload prescription
# - Check nearby pharmacies
# - Send notifications
# - View analytics in admin
```

### للتصحيح:
```javascript
// إذا حدثت مشكلة، شغّل:

// 1. Clear cache
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister())
})

// 2. Clear localStorage
localStorage.clear()

// 3. Hard refresh
Ctrl + Shift + R
```

---

**بالتوفيق! 🍀**
