# طلب الأذونات عند أول دخول 🔐

## ما تم إنجازه

تم إضافة نظام يطلب من المستخدمين الموافقة على الأذونات عند أول دخول للتطبيق:

### 1️⃣ **الأذونات المطلوبة:**
- **🗺️ الموقع (Location)**: للعثور على أقرب صيدليات
- **🔔 الإشعارات (Notifications)**: لإرسال تنبيهات للمستخدمين

---

## المكونات المضافة

### 1. **مكون `PermissionsRequest` الجديد**
📄 الملف: `components/permissions-request.tsx`

```typescript
// مثال للاستخدام:
<PermissionsRequest />
```

**الميزات:**
- ✅ يعرض نافذة محاورة احترافية
- ✅ يطلب الموقع أولاً ثم الإشعارات
- ✅ يتذكر طلب الأذونات باستخدام localStorage
- ✅ يعرض تنبيهات توضيحية لكل أذونة
- ✅ واجهة ثنائية اللغة (عربي/إنجليزي)

### 2. **التحديثات على `layout.tsx`**
```typescript
import { PermissionsRequest } from "@/components/permissions-request"

// داخل الـ RootLayout:
<PermissionsRequest />
<PWARegister />
{children}
<Toaster />
```

### 3. **أذونات Android**
📄 الملف: `android/app/src/main/AndroidManifest.xml`

تم إضافة الأذونات:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

---

## كيفية العمل

### رحلة المستخدم:
1. **أول دخول** → يرى نافذة "🗺️ الوصول إلى الموقع"
2. **عند النقر "السماح"** → يتم طلب أذونات الموقع
3. **بعد الموافقة** → تظهر نافذة "🔔 تفعيل الإشعارات"
4. **عند النقر "السماح"** → يتم طلب أذونات الإشعارات
5. **النهاية** → يتم حفظ في localStorage وعدم إظهار الطلب مجدداً

### الخيارات عند الرفض:
- ❌ **تخطي الآن (أول نافذة)** → سينتقل لطلب الإشعارات مباشرة
- ❌ **تخطي (ثاني نافذة)** → سيغلق النافذة ويكمل المستخدم

---

## الحزم المثبتة ✨

```bash
✅ @capacitor/geolocation - للوصول إلى الموقع
✅ @capacitor/local-notifications - للإشعارات
```

---

## أمثلة الاستخدام المتقدم

### إذا أردت مسح ذاكرة الأذونات والبدء من جديد:
```typescript
// في أي مكان في التطبيق:
localStorage.removeItem('permissionsRequested')
window.location.reload() // أو أعد تحميل الصفحة
```

### الحصول على الموقع الحالي:
```typescript
import { Geolocation } from '@capacitor/geolocation'

const coordinates = await Geolocation.getCurrentPosition()
console.log('Latitude:', coordinates.coords.latitude)
console.log('Longitude:', coordinates.coords.longitude)
```

### إرسال إشعار محلي:
```typescript
import { LocalNotifications } from '@capacitor/local-notifications'

await LocalNotifications.schedule({
  notifications: [
    {
      title: 'دوائي',
      body: 'هناك صيدلية قريبة منك!',
      id: 1,
      schedule: { at: new Date(Date.now() + 1000 * 5) },
    }
  ]
})
```

---

## ملاحظات مهمة ⚠️

1. **على الويب**: Capacitor plugins قد لا تعمل بنفس الطريقة - تأكد من الاختبار على الجهاز الفعلي أو محاكي Android
2. **على iOS**: ستحتاج لإضافة أذونات في `Info.plist` (إن استخدمت iOS)
3. **الخصوصية**: تأكد من سياسة الخصوصية تشرح استخدام الموقع والإشعارات

---

## التحقق من الأذونات يدوياً

```typescript
import { Geolocation } from '@capacitor/geolocation'
import { LocalNotifications } from '@capacitor/local-notifications'

// فحص أذونات الموقع
const geoPerms = await Geolocation.checkPermissions()
console.log('Geo:', geoPerms) // { location: 'granted' | 'denied' | 'prompt' }

// فحص أذونات الإشعارات
const notifPerms = await LocalNotifications.checkPermissions()
console.log('Notifications:', notifPerms) // { display: 'granted' | 'denied' | 'prompt' }
```

---

## الخطوات التالية 🚀

1. اختبر على جهاز Android الفعلي أو المحاكي
2. تأكد من أن الموقع الفعلي يعمل مع `pharmacies-nearby` action
3. ربط الإشعارات بـ API الإشعارات الحقيقية
4. اختبر على أجهزة مختلفة والتحقق من سلوك الأذونات
