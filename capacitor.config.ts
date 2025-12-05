import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.duaiii.app',
  appName: 'duaii',
  webDir: 'public',
  server: {
    url: 'https://duaiinow.vercel.app', // 👈 رابط Vercel (بدون / في النهاية عادي)
    cleartext: false,                   // 👈 لأننا نستخدم https
  },
};

export default config;
