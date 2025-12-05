# 🖥️ الأوامر الدقيقة - انسخ والصق مباشرة

## الخطوة 1️⃣: بناء الويب

افتح PowerShell واشغّل:

```powershell
cd c:\Users\user\Downloads\duaiii-test
npm run build
```

**انتظر حتى تنتهي (5 دقائق)**

اذا رأيت في الآخر:
```
✅ Route (app)
✅ Generating static pages (47/47)
✅ Finalizing page optimization
```

يعني نجح! ✅

---

## الخطوة 2️⃣: تثبيت Capacitor

نفس الـ PowerShell:

```powershell
npm install @capacitor/core @capacitor/android @capacitor/ios
```

**انتظر (2-3 دقائق)**

---

## الخطوة 3️⃣: إنشاء مشروع Capacitor

```powershell
npx cap init
```

**سيطلب منك أسئلة، اكتب هذا بالضبط**:

```
App name: دوائي
[Enter]

App Package ID: com.duaiii.app
[Enter]

Web dir: .next
[Enter]

For other prompts: [اضغط Enter فقط]
```

---

## الخطوة 4️⃣: إضافة Android

```powershell
npx cap add android
```

**انتظر (1-2 دقيقة)**

ستر رسائل مثل:
```
✅ Adding native Kotlin files...
✅ Configuring Android project...
```

---

## الخطوة 5️⃣: فتح Android Studio

```powershell
npx cap open android
```

**ماذا يحدث**:
- يفتح Android Studio تلقائياً
- قد يطلب تثبيت حاجات إضافية - اضغط "OK"
- انتظر شريط التحميل ينتهي

**إذا لم يفتح**:
- افتح `C:\Users\user\Downloads\duaiii-test\android` يدويًا
- Right Click → Open with → Android Studio

---

## الخطوة 6️⃣: بناء APK

**في Android Studio**:

1. انتظر حتى يظهر الـ Project
2. من القائمة العلوية:
   ```
   Build → Generate Signed Bundle/APK
   ```

3. اختر:
   ```
   ☑ APK
   [Next]
   ```

4. اختر:
   ```
   ☑ Create new
   [أملأ البيانات]
   ```

**البيانات التي ستكتبها**:

```
Key store path: C:\Users\user\duaiii-key.keystore

Password: (أكتب كلمة مرور قوية مثل: DuaIII@2025)
Confirm: (نفس الكلمة)

Key alias: duaiii

Key password: (نفس كلمة المرور)
Confirm: (نفس الكلمة)

Common name: Your Name
Organization: Duaiii
Organization unit: App
Country code: SA

[Next]
```

5. اختر:
   ```
   ☑ release
   [Finish]
   ```

6. **انتظر البناء** (5-10 دقائق)

---

## الخطوة 7️⃣: أين الملف؟

بعد انتهاء البناء، ستر رسالة:
```
✅ APK successfully generated at:
C:\Users\user\Downloads\duaiii-test\android\app\release\app-release.apk
```

**هذا هو الملف الذي ستصعده على Google Play! 🎉**

---

## الخطوة 8️⃣: Google Play Console

1. اذهب إلى: https://play.google.com/console

2. Sign in بحسابك على Google (أو Create account)

3. ادفع $25 (مرة واحدة)

4. اضغط: **Create app**

5. ملء البيانات:
   ```
   App name: دوائي
   Default language: Arabic
   App or game: App
   Free or paid: Free
   Agree to terms: ☑
   ```

6. اضغط: **Create app**

---

## الخطوة 9️⃣: رفع APK

1. في Google Play Console، من اليسار:
   ```
   Release → Production
   ```

2. اضغط: **Create new release**

3. اضغط: **Upload APK**

4. اختر الملف:
   ```
   C:\Users\user\Downloads\duaiii-test\android\app\release\app-release.apk
   ```

5. اضغط: **Next**

6. اكتب ملاحظات:
   ```
   الإصدار الأول من تطبيق دوائي
   ```

7. اضغط: **Save release** (أو **Review release**)

---

## الخطوة 🔟: ملء البيانات الأساسية

**من اليسار في Google Play Console**:

اضغط على: **All apps → دوائي**

ستجد قسم **Store Listing** - ملأ:

```
Short description:
اربط مع أقرب صيدلية واحصل على أدويتك بسهولة

Full description:
تطبيق دوائي يساعدك على:
✓ البحث عن الأدوية
✓ إيجاد الصيدليات القريبة
✓ متابعة الوصفات الطبية
✓ الحصول على إشعارات فورية
✓ إدارة المفضلة

Category: Medical

Privacy policy URL:
https://yoursite.com/privacy (أو اتركه للآن)
```

---

## الخطوة 1️⃣1️⃣: صور البرنامج

**في Google Play Console**:

في **Store Listing**، اضغط: **App screenshots**

أضف 5 صور (1080x1920 بكسل):
1. الصفحة الرئيسية
2. الخريطة والصيدليات
3. الوصفات الطبية
4. البحث
5. الإشعارات

**كيفية أخذ الصور**:
- شغّل التطبيق محلياً: `npm run dev`
- استخدم Chrome DevTools (F12)
- اضغط على Device toolbar (الهاتف الصغير)
- خذ screenshot

---

## الخطوة 1️⃣2️⃣: إرسال للمراجعة

**في Google Play Console**:

1. تأكد من:
   ```
   ☑ APK مرفوع
   ☑ Store listing كامل
   ☑ Screenshots موجودة
   ☑ Category محدد
   ```

2. اضغط: **Submit**

3. الاختيار: **Production**

4. انتظر الموافقة (1-3 أيام)

---

## 📝 ملخص الأوامر

```powershell
# 1️⃣ Build
npm run build

# 2️⃣ Install Capacitor
npm install @capacitor/core @capacitor/android @capacitor/ios

# 3️⃣ Init
npx cap init

# 4️⃣ Add Android
npx cap add android

# 5️⃣ Open Android Studio
npx cap open android

# [6️⃣ In Android Studio: Build → Generate Signed Bundle/APK]

# 7️⃣ Upload to Google Play Console
# (عبر الموقع)
```

---

## ✅ عندما تنتهي

ستسمع:
```
✅ Your app has been submitted for review
✅ Expected review time: 1-3 days
✅ You'll receive an email when it's approved
```

**ثم يظهر في Google Play! 🎉**

---

## 🆘 إذا واجهت مشكلة

### Build failed?
```powershell
cd c:\Users\user\Downloads\duaiii-test
rm -r android
npx cap add android
```

### Java not found?
```
ركّب من: https://www.oracle.com/java/technologies/downloads/
```

### Android SDK not found?
```powershell
$env:ANDROID_SDK_ROOT = "C:\Users\[YOUR_NAME]\AppData\Local\Android\Sdk"
```

---

**الآن شغّل الأمر الأول وأخبرني كيف سار!**

```powershell
npm run build
```
