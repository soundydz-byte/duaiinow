# 🔔 دليل الإشعارات للأدوار المختلفة

## ✅ المشاكل التي تم حلها

### ❌ مشكلة 1: `missing applicationServerKey`
**الحل:** 
- ✅ إضافة `gcm_sender_id` في `manifest.json`
- ✅ تحويل VAPID key من Base64 إلى Uint8Array في `use-pwa.ts`

### ❌ مشكلة 2: `AbortError: Registration failed`
**الحل:**
- ✅ التحقق من وجود VAPID_PUBLIC_KEY
- ✅ معالجة الأخطاء بشكل صحيح
- ✅ التحقق من الاشتراكات الموجودة

### ❌ مشكلة 3: `message channel closed`
**الحل:**
- ✅ إضافة `message` event listener في Service Worker
- ✅ معالجة async messages بشكل صحيح
- ✅ استخدام `ports[0].postMessage` للرد

---

## 🚀 كيفية إرسال الإشعارات

### للمريض (Patient):

```typescript
// في أي مكان في التطبيق
const response = await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: patientId,
    title: 'رد من الصيدلية',
    body: 'الدواء متوفر - رجاء تفقد تفاصيل الطلب',
    url: '/app/prescriptions/123',
    role: 'patient',
    actionType: 'response_received',
    tag: 'prescription-123'
  })
})
```

### للصيدلية (Pharmacy):

```typescript
const response = await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: pharmacyId,
    title: 'وصفة طبية جديدة',
    body: 'تم استقبال وصفة جديدة - Paracetamol 500mg',
    url: '/app/pharmacy/prescriptions/123',
    role: 'pharmacy',
    actionType: 'prescription_received',
    tag: 'prescription-123'
  })
})
```

### للمسؤول (Admin):

```typescript
const response = await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: adminId,
    title: 'نشاط جديد في النظام',
    body: '50 وصفة جديدة تم استقبالها اليوم',
    url: '/app/admin',
    role: 'admin',
    actionType: 'activity_summary',
    tag: 'admin-summary'
  })
})
```

---

## 📊 الأحداث المدعومة (Actions Types)

```
1. prescription_received      - للصيدلية
2. response_received          - للمريض
3. prescription_accepted      - للمريض
4. prescription_rejected      - للمريض
5. delivery_status            - للمريض
6. activity_summary           - للـ Admin
7. system_alert               - للـ Admin
8. subscription_approved      - للصيدلية
```

---

## ✅ المتطلبات

### 1. VAPID Keys في `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

### 2. Service Worker تسجيل:

```typescript
// يتم تلقائياً عند زيارة التطبيق
usePWARegistration()
```

### 3. طلب الإذن:

```typescript
if (Notification.permission === 'default') {
  Notification.requestPermission()
}
```

---

## 🔧 الملفات المحدثة

### 1. `public/manifest.json`
- ✅ إضافة `gcm_sender_id`
- ✅ إضافة `gcm_user_visible_only`

### 2. `hooks/use-pwa.ts`
- ✅ تحويل VAPID key بشكل صحيح
- ✅ التحقق من الاشتراكات الموجودة
- ✅ معالجة الأخطاء الشاملة

### 3. `public/sw.js`
- ✅ إضافة message event listener
- ✅ دعم الأدوار المختلفة (patient, pharmacy, admin)
- ✅ معالجة نقرات الإشعارات بشكل صحيح
- ✅ تخزين مؤقت ذكي للملفات

### 4. `app/api/notifications/send/route.ts`
- ✅ دعم roles مختلفة
- ✅ معالجة الأخطاء الشاملة
- ✅ تسجيل الأحداث في Analytics

---

## 📱 الاختبار

### اختبر إشعار للمريض:

```javascript
// في Console
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'patient-123',
    title: 'إشعار اختبار',
    body: 'هذا إشعار اختبار',
    role: 'patient',
    actionType: 'test'
  })
}).then(r => r.json()).then(console.log)
```

### اختبر إشعار للصيدلية:

```javascript
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'pharmacy-456',
    title: 'وصفة اختبار',
    body: 'هذه وصفة اختبار',
    role: 'pharmacy',
    actionType: 'test'
  })
}).then(r => r.json()).then(console.log)
```

---

## 🛠️ استكشاف الأخطاء

### إذا لم تظهر الإشعارات:

1. **تحقق من الإذن:**
   ```javascript
   console.log('Permission:', Notification.permission)
   // يجب أن يكون: granted
   ```

2. **تحقق من الاشتراك:**
   ```javascript
   navigator.serviceWorker.ready.then(reg => {
     reg.pushManager.getSubscription().then(sub => {
       console.log('Subscription:', sub ? 'Active' : 'None')
     })
   })
   ```

3. **تحقق من VAPID Key:**
   ```javascript
   console.log('VAPID Key:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
   // يجب ألا يكون فارغاً
   ```

4. **تحقق من Service Worker:**
   ```javascript
   navigator.serviceWorker.getRegistrations()
     .then(regs => console.log('SW Registered:', regs.length > 0))
   ```

---

## 📊 أمثلة عملية كاملة

### تطبيق كامل للإشعارات:

```typescript
// في أي action في التطبيق

import { createClient } from '@/lib/supabase/client'

async function sendNotificationToPatient(patientId: string, prescriptionId: string) {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: patientId,
        title: 'وصفتك جاهزة',
        body: 'يمكنك الآن استلام وصفتك من الصيدلية',
        url: `/app/prescriptions/${prescriptionId}`,
        role: 'patient',
        actionType: 'prescription_ready',
        tag: `prescription-${prescriptionId}`,
        icon: '/images/logo-192.png'
      })
    })

    if (!response.ok) {
      console.warn('Notification not sent:', response.status)
      return
    }

    const data = await response.json()
    console.log('✅ Notification prepared:', data.message)
  } catch (error) {
    console.error('❌ Error sending notification:', error)
  }
}
```

---

## 🎯 الخطوات التالية

### 1. تفعيل web-push Library:
```bash
npm install web-push
```

### 2. تحديث send API:
```typescript
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

await webpush.sendNotification(
  subscription,
  JSON.stringify(payload)
)
```

### 3. اختبر مع جميع الأدوار

---

## ✨ الميزات المدعومة الآن

✅ PWA Installation
✅ Service Worker Registration
✅ Push Notifications Framework
✅ Multi-Role Support (Patient, Pharmacy, Admin)
✅ Notification Analytics
✅ Offline Support
✅ Smart Caching
✅ Error Handling

---

**البارك الله فيك!** 🍀
