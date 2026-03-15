import { useEffect, useRef, useCallback } from 'react'
import { useFocusStore } from '../stores/focusStore'

interface FocusReminderConfig {
  enabled: boolean
  startTime: number // Hour (0-23)
  endTime: number // Hour (0-23)
  minIntervalMinutes: number
  maxIntervalMinutes: number
}

const DEFAULT_CONFIG: FocusReminderConfig = {
  enabled: true,
  startTime: 9, // 9 AM
  endTime: 21, // 9 PM
  minIntervalMinutes: 60,
  maxIntervalMinutes: 180,
}

const STORAGE_KEY = 'focus-reminder-config'
const LAST_REMINDER_KEY = 'focus-last-reminder'

function loadConfig(): FocusReminderConfig {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) }
    } catch {
      return DEFAULT_CONFIG
    }
  }
  return DEFAULT_CONFIG
}

function saveConfig(config: FocusReminderConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

function getRandomInterval(minMinutes: number, maxMinutes: number): number {
  const minMs = minMinutes * 60 * 1000
  const maxMs = maxMinutes * 60 * 1000
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
}

function isWithinActiveHours(startHour: number, endHour: number): boolean {
  const currentHour = new Date().getHours()
  return currentHour >= startHour && currentHour < endHour
}

function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return Promise.resolve('denied')
  }
  if (Notification.permission === 'granted') {
    return Promise.resolve('granted')
  }
  if (Notification.permission === 'denied') {
    return Promise.resolve('denied')
  }
  return Notification.requestPermission()
}

function showFocusReminderNotification() {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const reminders = [
    { title: 'Focus Check-in', body: 'How\'s your focus level right now? Take a moment to log it! 🎯' },
    { title: 'Quick Focus Log', body: 'Rate your current focus from 1-5. It only takes a second! 📊' },
    { title: 'Focus Awareness', body: 'Pause and notice your focus. Log it to track your patterns! 🧠' },
    { title: 'Focus Moment', body: 'What\'s your focus level now? Logging helps you learn! 💡' },
    { title: 'Check Your Focus', body: 'Take a breath and log your current focus level 🎯' },
  ]

  const randomReminder = reminders[Math.floor(Math.random() * reminders.length)]

  new Notification(randomReminder.title, {
    body: randomReminder.body,
    icon: '/favicon.ico',
    requireInteraction: false,
    tag: 'focus-reminder',
  })
}

export function useFocusReminders() {
  const config = useRef<FocusReminderConfig>(loadConfig())
  const timeoutId = useRef<NodeJS.Timeout | null>(null)
  const { fetchToday } = useFocusStore()

  const scheduleNextReminder = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
      timeoutId.current = null
    }

    if (!config.current.enabled) return

    // Check if within active hours
    if (!isWithinActiveHours(config.current.startTime, config.current.endTime)) {
      // Schedule check for when active hours start
      const now = new Date()
      const nextStart = new Date(now)
      nextStart.setHours(config.current.startTime, 0, 0, 0)
      if (now >= nextStart) {
        nextStart.setDate(nextStart.getDate() + 1)
      }
      const delay = nextStart.getTime() - now.getTime()
      timeoutId.current = setTimeout(scheduleNextReminder, delay)
      return
    }

    // Schedule random interval reminder
    const interval = getRandomInterval(
      config.current.minIntervalMinutes,
      config.current.maxIntervalMinutes
    )

    timeoutId.current = setTimeout(() => {
      // Double-check we're still within active hours
      if (isWithinActiveHours(config.current.startTime, config.current.endTime)) {
        showFocusReminderNotification()
        localStorage.setItem(LAST_REMINDER_KEY, new Date().toISOString())
        fetchToday()
        scheduleNextReminder()
      } else {
        scheduleNextReminder()
      }
    }, interval)
  }, [fetchToday])

  const updateConfig = useCallback((updates: Partial<FocusReminderConfig>) => {
    config.current = { ...config.current, ...updates }
    saveConfig(config.current)
    scheduleNextReminder()
  }, [scheduleNextReminder])

  const requestPermission = useCallback(async () => {
    const permission = await requestNotificationPermission()
    if (permission === 'granted') {
      scheduleNextReminder()
    }
    return permission
  }, [scheduleNextReminder])

  useEffect(() => {
    // Initialize on mount
    if (config.current.enabled) {
      requestNotificationPermission().then((permission) => {
        if (permission === 'granted') {
          scheduleNextReminder()
        }
      })
    }

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }
    }
  }, [scheduleNextReminder])

  return {
    config: config.current,
    updateConfig,
    requestPermission,
  }
}

export function getFocusReminderConfig(): FocusReminderConfig {
  return loadConfig()
}

export function getLastFocusReminder(): Date | null {
  const stored = localStorage.getItem(LAST_REMINDER_KEY)
  if (stored) {
    return new Date(stored)
  }
  return null
}
