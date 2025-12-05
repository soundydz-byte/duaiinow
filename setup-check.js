#!/usr/bin/env node

/**
 * تطبيق دوائي - سكريبت اختبار الإشعارات والإعدادات
 * Run: node setup-check.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 دوائي - فحص الإعدادات\n');
console.log('='.repeat(60));

// 1. تحقق من ملف .env.local
console.log('\n1️⃣ فحص ملف .env.local...');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasVAPID_PUBLIC = envContent.includes('NEXT_PUBLIC_VAPID_PUBLIC_KEY');
  const hasVAPID_PRIVATE = envContent.includes('VAPID_PRIVATE_KEY');
  const hasSUPABASE = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');

  console.log(`   ✅ ملف .env.local موجود`);
  console.log(`   ${hasVAPID_PUBLIC ? '✅' : '❌'} NEXT_PUBLIC_VAPID_PUBLIC_KEY`);
  console.log(`   ${hasVAPID_PRIVATE ? '✅' : '❌'} VAPID_PRIVATE_KEY`);
  console.log(`   ${hasSUPABASE ? '✅' : '❌'} NEXT_PUBLIC_SUPABASE_URL`);

  if (!hasVAPID_PUBLIC || !hasVAPID_PRIVATE) {
    console.log('\n⚠️ مفاتيح VAPID مفقودة! شغّل:');
    console.log('   node -e "const webpush=require(\'web-push\');console.log(JSON.stringify(webpush.generateVAPIDKeys(), null, 2))"');
  }
} else {
  console.log('   ❌ ملف .env.local غير موجود!');
  console.log('   أنشئ الملف وأضف:');
  console.log('   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...');
  console.log('   VAPID_PRIVATE_KEY=...');
}

// 2. تحقق من الملفات الأساسية
console.log('\n2️⃣ فحص الملفات الأساسية...');
const requiredFiles = [
  'public/manifest.json',
  'public/sw.js',
  'hooks/use-pwa.ts',
  'app/api/notifications/subscribe/route.ts',
  'app/api/notifications/send/route.ts',
  'components/pwa-register.tsx'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// 3. تحقق من package.json
console.log('\n3️⃣ فحص المكتبات المطلوبة...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
  const deps = packageJson.dependencies || {};

  console.log(`   ${deps['web-push'] ? '✅' : '❌'} web-push (${deps['web-push'] || 'غير مثبت'})`);
  console.log(`   ${deps['@supabase/supabase-js'] ? '✅' : '❌'} @supabase/supabase-js`);
  console.log(`   ${deps['next'] ? '✅' : '❌'} next (${deps['next'] || 'غير موجود'})`);
} catch (err) {
  console.log('   ❌ خطأ في قراءة package.json');
}

// 4. الخطوات التالية
console.log('\n' + '='.repeat(60));
console.log('\n✅ خطوات سريعة:');
console.log('1. اختبر الإشعارات محلياً:');
console.log('   npm run dev');
console.log('   ثم افتح http://localhost:3000 واسمح بالإشعارات\n');
console.log('2. أخذ لقطات الشاشة (3-5 صور بدقة 1080x1920)\n');
console.log('3. كتابة سياسة الخصوصية\n');
console.log('4. إنشاء حساب Google Play Developer\n');
console.log('5. بناء APK مع Capacitor\n');

console.log('='.repeat(60) + '\n');
