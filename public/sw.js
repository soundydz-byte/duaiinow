// Service Worker for Duaiii App - PWA + Push Notifications
const CACHE_NAME = 'duaiii-v1'
const URLS_TO_CACHE = [
  '/',
  '/home',
  '/offline.html',
  '/images/logo.png',
]

// Install event - cache important files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching files...')
        return cache.addAll(URLS_TO_CACHE).catch((err) => {
          console.warn('⚠️ Cache addAll error:', err)
        })
      })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating.')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Message event - handle messages from client
self.addEventListener('message', (event) => {
  console.log('📨 Message received in SW:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_SUBSCRIPTION') {
    // Handle subscription request
    self.registration.pushManager.getSubscription().then((subscription) => {
      event.ports[0].postMessage({
        subscription: subscription ? subscription.toJSON() : null
      })
    }).catch((error) => {
      console.error('Error getting subscription:', error)
      event.ports[0].postMessage({ error: error.message })
    })
  }
})

// Push event - handle incoming push notifications for all roles
self.addEventListener('push', (event) => {
  console.log('🔔 Push received:', event)

  let data = {}

  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      console.warn('⚠️ Could not parse push data as JSON:', e)
      data = { body: event.data.text() }
    }
  }

  // Support all roles: patient, pharmacy, admin
  const title = data.title || 'دوائي - Duaiii'
  const options = {
    body: data.body || 'لديك إشعار جديد',
    icon: data.icon || '/icon.svg',
    badge: '/icon.svg',
    image: data.image,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1,
      url: data.url || '/',
      role: data.role || 'patient', // patient, pharmacy, admin
      userId: data.userId,
      actionType: data.actionType // prescription_received, response_received, etc.
    },
    actions: data.actions || [
      {
        action: 'view',
        title: 'عرض',
        icon: '/icon.svg'
      },
      {
        action: 'dismiss',
        title: 'تجاهل'
      }
    ],
    requireInteraction: true,
    silent: false,
    tag: data.tag || 'default-notification'
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('✅ Notification displayed'))
      .catch((error) => console.error('❌ Error showing notification:', error))
  )
})

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification click received:', event)

  event.notification.close()

  const url = event.notification.data?.url || '/'
  const role = event.notification.data?.role || 'patient'
  
  // Redirect based on action
  let finalUrl = url
  if (event.action === 'view') {
    finalUrl = url
  } else if (event.action === 'dismiss') {
    return
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let client of windowClients) {
          if (client.url === finalUrl && 'focus' in client) {
            return client.focus()
          }
        }

        // If not, open a new window/tab with the target URL
        if (clients.openWindow) {
          return clients.openWindow(finalUrl)
        }
      })
      .catch((error) => console.error('Error handling notification click:', error))
  )
})

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('🚫 Notification closed:', event)
})

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    console.log('⏳ Performing background sync...')
    // Implement background sync logic here
    // This could include syncing offline data, updating cache, etc.
  } catch (error) {
    console.error('❌ Background sync failed:', error)
  }
}

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((response) => {
            // Cache successful responses
            if (response.ok && event.request.method === 'GET') {
              const responseClone = response.clone()
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone)
              })
            }
            return response
          })
      })
      .catch(() => {
        // Return offline fallback page if available
        if (event.request.destination === 'document') {
          return caches.match('/offline.html')
            .catch(() => new Response('دوائي - تطبيقك غير متصل بالإنترنت', { status: 503 }))
        }
      })
  )
})
