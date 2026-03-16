import { useEffect, useState, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [browserInfo, setBrowserInfo] = useState<{ name: string; installInstructions: string } | null>(null)

  // Detect browser and provide installation instructions
  useEffect(() => {
    const userAgent = navigator.userAgent
    let browser = { name: 'Unknown', installInstructions: '' }

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browser = {
        name: 'Chrome',
        installInstructions: 'Click the install icon (⊕) in the address bar, or go to Chrome menu (⋮) → "Install ADHD Coach"',
      }
    } else if (userAgent.includes('Edg')) {
      browser = {
        name: 'Edge',
        installInstructions: 'Go to Edge menu (⋯) → Apps → "Install ADHD Coach"',
      }
    } else if (userAgent.includes('Firefox')) {
      browser = {
        name: 'Firefox',
        installInstructions: 'Firefox doesn\'t support PWA installation. Try Chrome or Edge for the best experience.',
      }
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = {
        name: 'Safari',
        installInstructions: 'Tap the Share button → "Add to Home Screen"',
      }
    } else if (userAgent.includes('Android')) {
      browser = {
        name: 'Chrome on Android',
        installInstructions: 'Tap the menu (⋮) → "Install app" or "Add to Home Screen"',
      }
    }

    setBrowserInfo(browser)
  }, [])

  // Check if app is running as standalone PWA
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isWindowControlsOverlay = window.matchMedia('(display-mode: window-controls-overlay)').matches
    setIsInstalled(isStandalone || isWindowControlsOverlay)
  }, [])

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
      console.log('BeforeInstallPrompt event fired')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('App installed successfully')
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    })

    // Debug: Check if service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        console.log('Service Worker registered:', !!reg)
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  // Prompt user to install
  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      console.log('Prompting installation...')
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }

      setDeferredPrompt(null)
      setIsInstallable(false)

      return outcome === 'accepted'
    } else {
      console.log('No install prompt available. User should install manually.')
      return false
    }
  }, [deferredPrompt])

  return {
    isInstallable,
    isInstalled,
    promptInstall,
    browserInfo,
    hasPrompt: !!deferredPrompt,
  }
}

export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  // Register service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers not supported')
      return
    }

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })
        setRegistration(reg)
        console.log('Service Worker registered:', reg.scope)

        // Check for updates periodically
        setInterval(() => {
          reg.update()
        }, 60 * 60 * 1000) // Every hour
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }

    registerSW()

    // Listen for service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker updated')
      // Optionally show update notification
    })

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', () => {})
    }
  }, [])

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'denied'
    }

    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)

    if (permission === 'granted' && registration) {
      // Subscribe to push notifications (for future use)
      try {
        // Note: This requires a VAPID key for production use
        // For now, we'll just use local notifications
        console.log('Notification permission granted')
      } catch (error) {
        console.error('Push subscription failed:', error)
      }
    }

    return permission
  }, [registration])

  // Schedule periodic focus reminders using Background Sync
  const scheduleFocusReminders = useCallback(async (enabled: boolean) => {
    if (!registration || !enabled) return

    try {
      // Try to register periodic sync (Chrome/Edge only)
      const periodicSync = (registration as any).periodicSync
      if (periodicSync) {
        await periodicSync.register('focus-reminder-sync', {
          minInterval: 60 * 60 * 1000, // 1 hour minimum
        })
        console.log('Periodic sync registered')
      } else {
        console.log('Periodic sync not supported, using fallback')
        // Fallback: Use the app's internal reminder system
        // This will only work when the app is open
      }
    } catch (error) {
      console.error('Failed to register periodic sync:', error)
    }
  }, [registration])

  // Send local notification (fallback when service worker can't)
  const sendLocalNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (notificationPermission !== 'granted') return

    new Notification(title, {
      ...options,
      icon: '/brain.svg',
      badge: '/brain.svg',
    })
  }, [notificationPermission])

  return {
    registration,
    notificationPermission,
    requestNotificationPermission,
    scheduleFocusReminders,
    sendLocalNotification,
  }
}
