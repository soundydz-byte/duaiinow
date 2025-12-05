# 🏗️ معمارية النظام الشاملة

## 📊 نظرة عامة على التطبيق

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface (Next.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  User App    │  │ Pharmacy App │  │Admin Panel   │      │
│  │  (Patients)  │  │(Pharmacies)  │  │(Statistics)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Features                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    PWA       │  │ Geolocation  │  │  Analytics   │      │
│  │(Offline)    │  │(50km Range)  │  │  Tracking    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (Next.js Routes)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /api/prescriptions/nearby-pharmacies    (Distance)  │   │
│  │  /api/notifications/subscribe           (PWA)       │   │
│  │  /api/notifications/send                (PWA)       │   │
│  │  /api/analytics                        (Stats)      │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend Services (Supabase/Node.js)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Database    │  │   Auth       │  │   Storage    │      │
│  │  (Postgres)  │  │  (Supabase)  │  │  (Bucket)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 سير العمل الرئيسية

### 1️⃣ مسار رفع الوصفة (User)

```
Patient Upload Prescription
         ↓
   [/app/upload]
         ↓
  Upload File + Photos
         ↓
  Save to Database
         ↓
  Trigger Event: prescription_upload
         ↓
  Log to analytics_events
         ↓
  Redirect to /prescriptions
         ↓
  Show "Send to Nearby Pharmacies" button
```

### 2️⃣ مسار الصيدليات القريبة

```
Patient Clicks "Send to Nearby Pharmacies"
         ↓
  [/app/prescriptions/select-pharmacies]
         ↓
  Get User Location (Geolocation API)
         ↓
  Call /api/prescriptions/nearby-pharmacies
         ↓
  Calculate Distance (Haversine + 1.2x factor)
         ↓
  Filter: Only 50km radius
         ↓
  Display Pharmacies with Checkboxes
         ↓
  User Selects Pharmacies
         ↓
  Create prescription_responses
         ↓
  Send Notifications to Pharmacies
         ↓
  Track in Analytics
```

### 3️⃣ مسار Notifications

```
Pharmacy Receives New Prescription
         ↓
  Save prescription_response
         ↓
  Get User's Push Subscription
         ↓
  Prepare Notification Payload
         ↓
  Send via Web Push API
         ↓
  Service Worker Receives Push Event
         ↓
  Display Notification to User
         ↓
  User Clicks → Opens App
```

### 4️⃣ مسار Analytics

```
Any User Action
         ↓
  trackEvent() called
         ↓
  POST to /api/analytics
         ↓
  Log to analytics_events table
         ↓
  
  (Separately) Admin Views Stats
         ↓
  GET /api/analytics
         ↓
  Query analytics_events
         ↓
  Aggregate by:
    - Total events
    - Last 7 days
    - Unique users
    - Event types
         ↓
  Display in Admin Dashboard
```

---

## 💾 شرح قاعدة البيانات

### جدول `analytics_events`
```sql
id (UUID, Primary Key)
event_type (page_view, prescription_upload, pharmacy_view, ...)
user_id (UUID, Foreign Key → users)
user_role (patient, pharmacy, admin)
page_path (/prescriptions, /pharmacies, ...)
metadata (JSON, أي بيانات إضافية)
created_at (Timestamp)

-- Indexes لتحسين الأداء
Index on: (created_at DESC)
Index on: (user_id, event_type)
Index on: (event_type)
```

### جدول `push_subscriptions`
```sql
id (UUID, Primary Key)
user_id (UUID, Unique, Foreign Key)
endpoint (URL for push service)
auth_key (Authentication key)
p256dh_key (Encryption key)
is_active (Boolean, true/false)
created_at (Timestamp)
updated_at (Timestamp)

-- RLS Policy: Users can only see their own subscription
-- RLS Policy: Service role can access all for sending
```

---

## 🔐 نظام الأمان (RLS Policies)

### PWA & Analytics:
```typescript
// Service Role (Server) - Full Access ✅
// Used in: /api routes
// Access: analytics_events, push_subscriptions (All)

// Authenticated Users - Limited Access ✅
// Used in: Client components
// Access: Only their own data
```

### Database Policies:
```sql
-- analytics_events
-- Policy: "Users can view their own events"
SELECT: uid = auth.uid()

-- push_subscriptions
-- Policy: "Users can view their own subscription"
SELECT: user_id = auth.uid()

-- Policy: "Service role can send notifications"
SELECT: role() = 'service_role'
```

---

## 📱 مسار PWA Installation

```
User Opens App
         ↓
  [Browser → localhost:3000]
         ↓
  Service Worker Registers
         ↓
  manifest.json Loaded
         ↓
  Install Prompt Appears
         ↓
  User Clicks "Install"
         ↓
  App Added to Home Screen
         ↓
  PWA Cache Downloaded (~100KB)
         ↓
  User Can Open App Offline
```

### Cache Strategy:
```
Network First:
  1. Try to fetch from network
  2. If offline, use cache
  3. For images: Always cache after first load

Critical Files Cached:
  - manifest.json
  - CSS files
  - JavaScript bundles
  - Key images
```

---

## 🔔 مسار Push Notification

### Subscription Phase:
```
User Opens App
         ↓
  Request Notification Permission
         ↓
  User Grants Permission
         ↓
  Generate Push Subscription
         ↓
  Send to /api/notifications/subscribe
         ↓
  Save in Database
         ↓
  ✅ Ready to Receive Notifications
```

### Push Phase:
```
Server Event Triggered
  (e.g., Pharmacy adds prescription)
         ↓
  Get User's Subscription from DB
         ↓
  Create Notification Payload:
    {
      title: "New Prescription",
      body: "Paracetamol - 500mg",
      icon: "icon-192.png",
      url: "/prescriptions/123"
    }
         ↓
  Send via Web Push API
         ↓
  OS Receives Push
         ↓
  Display Notification
         ↓
  Service Worker Handles Click
         ↓
  Open App to Specific URL
```

---

## 📊 مسار Analytics

### Event Logging:
```
trackEvent({
  event_type: 'prescription_upload',
  user_id: 'user-123',
  user_role: 'patient',
  page_path: '/upload',
  metadata: {
    file_size: 2048,
    medicine_count: 3
  }
})
         ↓
POST /api/analytics
         ↓
Insert into analytics_events
         ↓
Stored in Database
```

### Stats Query:
```
GET /api/analytics/stats
         ↓
SELECT * FROM analytics_events
  WHERE created_at > NOW() - INTERVAL '7 days'
         ↓
GROUP BY event_type
         ↓
COUNT(*) for total events
COUNT(DISTINCT user_id) for active users
         ↓
Return Statistics
         ↓
Admin Dashboard Displays
```

---

## 🌐 مسار الصيدليات القريبة

### Distance Calculation:
```
Patient Location: (36.7372, 3.0869) - Algiers
Pharmacy 1 Location: (36.7400, 3.0500) - 5.7 km away
Pharmacy 2 Location: (36.5000, 3.5000) - 45 km away

Using Haversine Formula:
  Straight line = calculated distance
  Road distance = Haversine * 1.2 (correction factor)
  
  Pharmacy 1: 5.7 * 1.2 = 6.84 km ✅ Within 50km
  Pharmacy 2: 45 * 1.2 = 54 km ❌ Outside 50km
```

### API Response:
```javascript
GET /api/prescriptions/nearby-pharmacies
  ?userLat=36.7372&userLng=3.0869&prescriptionId=rx-123

Response:
{
  pharmacies: [
    {
      id: "pharmacy-1",
      name: "Pharmacy A",
      address: "...",
      phone: "...",
      latitude: 36.7400,
      longitude: 3.0500,
      distance: 6.84 // km
    },
    ...
  ]
}
```

---

## 🎯 استخدام Metadata

### في Analytics:
```typescript
trackEvent({
  event_type: 'prescription_upload',
  metadata: {
    file_size: 2048,
    file_type: 'image/png',
    medicine_count: 3,
    upload_duration: 2500 // ms
  }
})

// يتم حفظه كـ JSON في Database
// يمكن الاستعلام عنه لاحقاً
```

### في Notifications:
```typescript
showNotification({
  title: 'New Prescription',
  body: 'Paracetamol - 500mg',
  tag: 'prescription-123', // Merge similar notifications
  data: {
    url: '/prescriptions/123',
    pharmacy_id: 'pharm-456'
  }
})
```

---

## ⚙️ متغيرات البيئة المطلوبة

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Service Role (الخادم فقط)
SUPABASE_SERVICE_ROLE_KEY=...

# PWA - VAPID Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...

# Optional: Firebase (إذا كان في الاستخدام)
NEXT_PUBLIC_FIREBASE_API_KEY=...
```

---

## 🚀 تسلسل البدء (للمستخدم الجديد)

```
1. التثبيت والتشغيل
   npm install
   npm run dev

2. افتح http://localhost:3000

3. قم بتثبيت التطبيق كـ PWA
   (أيقونة التطبيق في شريط العناوين)

4. افتح الإشعارات
   (Browser سيطلب الإذن)

5. شاهد Analytics في Admin
   (قم بعمل بعض الأحداث أولاً)
```

---

## 🔍 Debugging Tips

### PWA Issues:
```javascript
// في Console
navigator.serviceWorker.getRegistrations()
  .then(registrations => console.log(registrations))

// تحقق من Service Worker
chrome://serviceworker-internals/

// تحقق من Manifest
chrome://manifest/
```

### Notifications Issues:
```javascript
// تحقق من الإذن
Notification.permission

// اختبر إشعار محلي
new Notification('Test')

// تحقق من الاشتراك
navigator.serviceWorker.controller
  .postMessage({type: 'GET_SUBSCRIPTION'})
```

### Analytics Issues:
```javascript
// تحقق من الأحداث المسجلة
// في Admin Dashboard → Analytics

// أو مباشرة من Supabase Console
SELECT * FROM analytics_events LIMIT 10
```

---

## 📈 مؤشرات الأداء

### Expected Performance:
- Page Load: < 2 seconds
- PWA Installation: < 5 seconds
- Notification Display: < 1 second
- Analytics Query: < 500ms

### Optimization Tips:
- Image compression for PWA cache
- Lazy load analytics for admin
- Use database indexes for queries
- Implement pagination for large datasets

---

## 🎓 الملخص

**التطبيق الآن يتضمن:**
✅ User authentication (Supabase)
✅ Prescription management
✅ Pharmacy system
✅ Distance-based filtering (50km)
✅ PWA support (Offline + Install)
✅ Push Notifications
✅ Comprehensive Analytics
✅ Admin Dashboard with stats

**يعتبر الآن تطبيق احترافي ومتكامل!** 🎉
