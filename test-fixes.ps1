# 🧪 نص اختبار التحليلات والصور (PowerShell)
# تشغيل: .\test-fixes.ps1

Write-Host "🚀 بدء اختبار الإصلاحات..." -ForegroundColor Green
Write-Host ""

# 1. اختبار التحليلات
Write-Host "1️⃣ اختبار API التحليلات:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "👉 اختبر هذا الـ URL في المتصفح:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000/api/analytics"
Write-Host ""
Write-Host "✅ يجب أن تشاهد JSON يحتوي على:" -ForegroundColor Green
Write-Host "   - totalEvents: رقم"
Write-Host "   - eventsLastWeek: رقم"
Write-Host "   - uniqueUsers: رقم"
Write-Host "   - eventsByType: array"
Write-Host ""

# 2. اختبار الواجهة
Write-Host "2️⃣ اختبار واجهة لوحة الإدارة:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "👉 افتح هذا الـ URL في المتصفح:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000/admin"
Write-Host ""
Write-Host "✅ يجب أن تشاهد:" -ForegroundColor Green
Write-Host "   - قسم 'التحليلات' مع 4 بطاقات:"
Write-Host "     • إجمالي الأحداث (رقم > 0)"
Write-Host "     • هذا الأسبوع (رقم >= 0)"
Write-Host "     • المستخدمين النشطين (رقم >= 0)"
Write-Host "     • أنواع الأحداث (رقم)"
Write-Host ""

# 3. اختبار الصور
Write-Host "3️⃣ اختبار صور الوصفات:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "👉 افتح هذا الـ URL في المتصفح:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000/admin/prescriptions"
Write-Host ""
Write-Host "✅ يجب أن تشاهد:" -ForegroundColor Green
Write-Host "   - قائمة الوصفات"
Write-Host "   - صورة على اليسار (أو placeholder)"
Write-Host "   - بيانات على اليمين:"
Write-Host "     • ID"
Write-Host "     • الحالة (badge ملون)"
Write-Host "     • التاريخ"
Write-Host "     • الملاحظات (إن وجدت)"
Write-Host ""

# 4. فحص الأخطاء
Write-Host "4️⃣ فحص وحدة تحكم المتصفح:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "👉 اضغط F12 لفتح Developer Tools" -ForegroundColor Yellow
Write-Host "   ثم انتقل إلى Console tab"
Write-Host ""
Write-Host "✅ يجب أن تشاهد:" -ForegroundColor Green
Write-Host "   ❌ بدون أخطاء حمراء"
Write-Host "   ⚠️ قد تشاهد بعض التحذيرات (عادي)"
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "✨ هذا كل شيء! جميع الاختبارات جاهزة" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
