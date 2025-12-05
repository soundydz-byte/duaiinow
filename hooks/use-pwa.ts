import { useEffect } from 'react'

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePWARegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration)
          
          // Request notification permission
          if ('Notification' in window) {
            if (Notification.permission === 'default') {
              Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                  console.log('📢 Notification permission granted')
                  // Subscribe to push notifications
                  subscribeToPushNotifications(registration)
                }
              })
            } else if (Notification.permission === 'granted') {
              // Already granted, subscribe
              subscribeToPushNotifications(registration)
            }
          }
        })
        .catch((err) => {
          console.error('❌ Service Worker registration failed:', err)
        })
    }
  }, [])
}

// Subscribe to push notifications
async function subscribeToPushNotifications(registration: ServiceWorkerRegistration) {
  try {
    // Check if push messaging is supported
    if (!('pushManager' in registration)) {
      console.warn('⚠️ Push messaging not supported')
      return
    }

    // Get existing subscription first
    const existingSubscription = await registration.pushManager.getSubscription()
    if (existingSubscription) {
      console.log('📲 Push subscription already exists')
      return
    }

    // Get VAPID key
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) {
      console.warn('⚠️ NEXT_PUBLIC_VAPID_PUBLIC_KEY not configured')
      console.warn('⚠️ Add to .env.local: NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_key')
      return
    }

    try {
      // Convert VAPID key to Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidKey)

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as BufferSource,
      })

      console.log('📲 Push subscription created:', subscription.endpoint)

      // Send subscription to backend
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save subscription')
      }

      console.log('✅ Push subscription saved to server')
    } catch (subscribeError: any) {
      if (subscribeError.name === 'NotAllowedError') {
        console.warn('⚠️ User denied notification permission')
      } else if (subscribeError.name === 'AbortError') {
        console.warn('⚠️ Push subscription aborted - check VAPID key and manifest')
      } else {
        console.error('❌ Push subscription error:', subscribeError.message)
      }
    }
  } catch (error) {
    console.error('❌ Failed to subscribe to push notifications:', error)
  }
}

// Request notification permission
export function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('⚠️ Notifications not supported')
    return false
  }

  if (Notification.permission === 'granted') {
    console.log('✅ Notification permission already granted')
    return true
  }

  if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('✅ Notification permission granted')
        return true
      }
    })
  }

  return false
}

// Show local notification
export function showLocalNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options,
      })
    }
  }
}
