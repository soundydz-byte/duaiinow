# 🔧 Debug Distance Calculation Issues

## الخطوات للتحقق من المشكلة:

### 1. تحقق من Console عند تحميل الصفحة
```
F12 → Console
```

ابحث عن الـ logs التالية:

```
🔷 [fetchPharmaciesWithLocation] START
📍 User Location: (36.7538, 3.0588)
📊 [Query Result] X verified pharmacies found
🔍 [Processing] Starting distance calculation
  📱 Processing: Pharmacy Name
    ✅ Coordinates valid: (lat, lng)
    ✅ OSRM Result: XXX.XX km
        أو
    ⚠️ OSRM failed, using Haversine...
    ✅ Haversine Result: XXX.XX km × 1.2 = YYY.YY km
✅ [Result] X pharmacies with distances calculated
  • Pharmacy 1: XXX.XX km
  • Pharmacy 2: YYY.YY km
🎯 [Final] X valid pharmacies returned
```

### 2. ماذا تتوقع أن ترى؟

#### الحالة الصحيحة ✅
```
✅ OSRM Result: 520.45 km
أو
⚠️ OSRM failed, using Haversine...
✅ Haversine Result: 433.71 km × 1.2 = 520.45 km
```

#### المشاكل المحتملة ❌

**المشكلة 1: لا توجد صيدليات**
```
📊 [Query Result] 0 verified pharmacies found
```
**الحل:** تأكد من وجود صيدليات موثقة (is_verified = true) وفعالة (active subscription)

**المشكلة 2: إحداثيات غير صحيحة**
```
❌ Invalid coordinates: (null, null)
```
**الحل:** تحقق من البيانات في قاعدة البيانات

**المشكلة 3: لا توجد مسافات**
```
  • Pharmacy 1: 0 km
```
**الحل:** قد تكون OSRM معطلة أو الإحداثيات غير صحيحة

### 3. الخطوات التي نفذناها

✅ تحسين `lib/utils.ts`:
  - تغيير OSRM من HTTP إلى HTTPS
  - إضافة معالجة أفضل للأخطاء
  - التحقق من صحة البيانات

✅ تحسين `app/actions/pharmacies.ts`:
  - logging تفصيلي شامل
  - معالجة أفضل للأخطاء
  - التحقق من الإحداثيات

✅ تحسين العرض:
  - تنسيق برقمين عشريين دائماً
  - إضافة تسمية واضحة

### 4. إذا لم تحل المشكلة

اتبع هذه الخطوات:

1. افتح DevTools (F12)
2. اذهب إلى Network tab
3. ابحث عن طلبات `router.project-osrm.org`
4. تحقق من الـ Response:
   ```json
   {
     "code": "Ok",
     "routes": [{
       "distance": 520450,
       "duration": 28800
     }]
   }
   ```

5. اذا كانت الاستجابة مختلفة، قد تكون الإحداثيات معاكوسة
   - تحقق من ترتيب: [latitude, longitude]

### 5. المعادلة الصحيحة

```
OSRM URL Format:
/route/v1/driving/{longitude1},{latitude1};{longitude2},{latitude2}

مثال صحيح:
/route/v1/driving/3.0588,36.7538;7.9732,36.2868
          ^^^^^^^ ^^^^^^^ ^^^^^^^ ^^^^^^^
          lng1   lat1   lng2    lat2
```

---

## ✅ تم التحديث!

جميع الملفات تم تحديثها بـ logging شامل. 

**الخطوة التالية:**
1. اعد تشغيل الخادم: `npm run dev`
2. افتح http://localhost:3002/home
3. فتح Console (F12)
4. اطلب المساعدة إذا رأيت أي أخطاء
