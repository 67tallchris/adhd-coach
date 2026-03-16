/// <reference lib="webworker" />

// Service Worker for ADHD Coach PWA
// Handles push notifications and background focus reminders

const CACHE_NAME = 'adhd-coach-v1'
const FOCUS_REMINDER_TAG = 'focus-reminder'

// Assets to cache
const ASSETS = [
  '/',
  '/manifest.json',
  '/brain.svg',
]

// Install event - cache assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS)
    })
  )
  // Skip waiting to activate immediately
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    })
  )
  // Claim all clients immediately
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event: FetchEvent) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request)
    })
  )
})

// Push notification event
self.addEventListener('push', (event: PushEvent) => {
  let data: { title: string; body: string; icon?: string; focusReminder?: boolean } = {
    title: 'ADHD Coach',
    body: 'Time to check in!',
  }

  if (event.data) {
    try {
      data = event.data.json()
    } catch {
      data.body = event.data.text()
    }
  }

  const options: NotificationOptions = {
    body: data.body,
    icon: data.icon || '/brain.svg',
    badge: '/brain.svg',
    vibrate: [100, 50, 100],
    data: {
      focusReminder: data.focusReminder ?? true,
      url: '/app/focus',
    },
    actions: [
      { action: 'focus-1', title: '😫 1 - Distracted' },
      { action: 'focus-2', title: '😕 2 - Low' },
      { action: 'focus-3', title: '😐 3 - Okay' },
      { action: 'focus-4', title: '😊 4 - Good' },
      { action: 'focus-5', title: '🎯 5 - Deep Focus' },
      { action: 'open-app', title: 'Open App' },
    ],
    tag: FOCUS_REMINDER_TAG,
    requireInteraction: false,
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Notification click event
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  const action = event.action
  const notificationData = event.notification.data as { focusReminder?: boolean; url?: string }

  // Handle quick actions for focus logging
  if (action && action.startsWith('focus-')) {
    const focusLevel = parseInt(action.split('-')[1])
    
    // Log the focus level via API
    event.waitUntil(
      fetch('/api/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focusLevel,
          notes: `Logged from notification - ${new Date().toLocaleString()}`,
        }),
      }).then(() => {
        // Show confirmation notification
        return self.registration.showNotification('Focus Logged!', {
          body: `You rated your focus as ${focusLevel}/5`,
          icon: '/brain.svg',
          badge: '/brain.svg',
          vibrate: [50],
          tag: 'focus-logged',
          requireInteraction: false,
        })
      }).catch(() => {
        // If fetch fails, open the app for manual logging
        return clients.openWindow(notificationData.url || '/app/focus')
      })
    )
    return
  }

  // Open the app for other actions
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('/app') && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open new window
      return clients.openWindow(notificationData.url || '/app/focus')
    })
  )
})

// Message event - for communication from main app
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  // Handle focus logging from notification actions
  if (event.data && event.data.type === 'LOG_FOCUS') {
    const { focusLevel, notes } = event.data
    
    event.waitUntil(
      fetch('/api/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focusLevel, notes }),
      })
    )
  }
})

// Periodic background sync for focus reminders (if supported)
self.addEventListener('periodicsync', (event: PeriodicSyncEvent) => {
  if (event.tag === 'focus-reminder-sync') {
    event.waitUntil(
      // Check if we should show a reminder
      self.registration.showNotification('Focus Check-in', {
        body: 'How\'s your focus level right now? Tap to log it! 🎯',
        icon: '/brain.svg',
        badge: '/brain.svg',
        vibrate: [100, 50, 100],
        data: { focusReminder: true, url: '/app/focus' },
        actions: [
          { action: 'focus-1', title: '😫 1' },
          { action: 'focus-2', title: '😕 2' },
          { action: 'focus-3', title: '😐 3' },
          { action: 'focus-4', title: '😊 4' },
          { action: 'focus-5', title: '🎯 5' },
        ],
        tag: FOCUS_REMINDER_TAG,
        requireInteraction: false,
      })
    )
  }
})

export {}
