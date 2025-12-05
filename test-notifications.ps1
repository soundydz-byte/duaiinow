#!/usr/bin/env powershell
<#
    .SYNOPSIS
    دوائي - اختبر الإشعارات
    
    .DESCRIPTION
    هذا السكريبت يختبر إرسال إشعار فعلي عبر web-push
    
    .USAGE
    .\test-notifications.ps1 -UserId "YOUR_USER_ID"
#>

param(
    [string]$UserId = "test-user-123"
)

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         دوائي - اختبار الإشعارات الفورية              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# 1. تحقق من أن التطبيق يعمل
Write-Host "1️⃣  التحقق من اتصال الخادم..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction Stop
    if ($health.StatusCode -eq 200) {
        Write-Host "   ✅ الخادم يعمل على http://localhost:3000`n" -ForegroundColor Green
    }
}
catch {
    Write-Host "   ❌ الخادم لا يعمل!" -ForegroundColor Red
    Write-Host "   شغّل أولاً: npm run dev`n" -ForegroundColor Yellow
    exit 1
}

# 2. بناء payload الإشعار
Write-Host "2️⃣  إنشاء payload الإشعار..." -ForegroundColor Yellow
$payload = @{
    userId = $UserId
    title = "اختبار الإشعار 🎉"
    body = "الإشعارات تعمل الآن على تطبيق دوائي!"
    icon = "/images/logo-192.png"
    url = "/"
    role = "patient"
    actionType = "test"
    tag = "test-notification"
} | ConvertTo-Json

Write-Host "   Payload: $($payload | ConvertFrom-Json | ConvertTo-Json -Compress)`n" -ForegroundColor Cyan

# 3. إرسال الإشعار
Write-Host "3️⃣  إرسال الإشعار إلى الخادم..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/notifications/send" `
        -Method Post `
        -Headers @{"Content-Type"="application/json"} `
        -Body $payload `
        -UseBasicParsing

    $result = $response.Content | ConvertFrom-Json

    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ الإشعار أرسل بنجاح!" -ForegroundColor Green
        Write-Host "   Response: $($result | ConvertTo-Json -Compress)`n" -ForegroundColor Cyan
    }
    else {
        Write-Host "   ⚠️ الخادم رد برمز: $($response.StatusCode)" -ForegroundColor Yellow
        Write-Host "   Response: $($response.Content)`n" -ForegroundColor Yellow
    }
}
catch {
    $errorDetails = $_.Exception.Message
    if ($_.Exception.Response -ne $null) {
        try {
            $errorContent = $_.Exception.Response.Content.ReadAsStream() | ForEach-Object { [char]$_ } | Join-String
            $errorDetails = $errorContent
        }
        catch {}
    }
    
    Write-Host "   ❌ خطأ في الإرسال:" -ForegroundColor Red
    Write-Host "   $errorDetails`n" -ForegroundColor Red
}

# 4. ملاحظات
Write-Host "═" * 56 -ForegroundColor Cyan
Write-Host "💡 ملاحظات مهمة:" -ForegroundColor Cyan
Write-Host "═" * 56 -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ تأكد من أن المتصفح يعرض إشعار في الزاوية العلوية اليمنى" -ForegroundColor Green
Write-Host "✓ إذا لم تراه، افتح الـ Console (F12) وابحث عن الأخطاء" -ForegroundColor Green
Write-Host "✓ البيانات تُحفظ في جدول analytics_events في Supabase" -ForegroundColor Green
Write-Host ""
Write-Host "📊 للتحقق من البيانات المحفوظة:" -ForegroundColor Cyan
Write-Host "   1. افتح Supabase Console" -ForegroundColor Gray
Write-Host "   2. اذهب إلى جدول: analytics_events" -ForegroundColor Gray
Write-Host "   3. ابحث عن: event_type = 'notification_sent'" -ForegroundColor Gray
Write-Host ""
