// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwyI5iBFtambwaxkImQYxFXNX8Bq9yT6g",
  authDomain: "duaii-app.firebaseapp.com",
  projectId: "duaii-app",
  storageBucket: "duaii-app.firebasestorage.app",
  messagingSenderId: "150679354206",
  appId: "1:150679354206:web:16ddb55aff9102de02adcf",
  measurementId: "G-2987X873BL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging: any = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase messaging not available:', error);
  }
}

export { messaging };
export default app;

// Function to get FCM token
export async function getFCMToken(): Promise<string | null> {
  if (!messaging) return null;

  try {
    const token = await getToken(messaging, {
      vapidKey: 'a1Vl0DSjjVyVgtiN42WPmuZ-XMhT_AX4f4wB98b4Qt8'
    });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// Function to listen for foreground messages
export function onMessageListener(callback: (payload: any) => void) {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    callback(payload);
  });
}
