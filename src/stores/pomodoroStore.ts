import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PomodoroSettings {
  workDurationMin: number
  breakDurationMin: number
  autoStartBreaks: boolean
  notificationsEnabled: boolean
}

interface PomodoroState {
  sessionId: string | null
  durationSec: number
  remainingSec: number
  isRunning: boolean
  linkedTaskId: string | null
  isBreak: boolean
  settings: PomodoroSettings
  startTimer: (sessionId: string, durationMin: number, taskId?: string) => void
  startBreak: (durationMin: number) => void
  tick: () => void
  stop: () => void
  reset: () => void
  updateSettings: (settings: Partial<PomodoroSettings>) => void
  requestNotificationPermission: () => Promise<void>
  showNotification: (title: string, body?: string) => void
}

const defaultSettings: PomodoroSettings = {
  workDurationMin: 25,
  breakDurationMin: 5,
  autoStartBreaks: false,
  notificationsEnabled: true,
}

function loadSettings(): PomodoroSettings {
  const stored = localStorage.getItem('pomodoro-settings')
  if (stored) {
    try {
      return { ...defaultSettings, ...JSON.parse(stored) }
    } catch {
      return defaultSettings
    }
  }
  return defaultSettings
}

function saveSettings(settings: PomodoroSettings) {
  localStorage.setItem('pomodoro-settings', JSON.stringify(settings))
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      durationSec: 25 * 60,
      remainingSec: 25 * 60,
      isRunning: false,
      linkedTaskId: null,
      isBreak: false,
      settings: loadSettings(),

      requestNotificationPermission: async () => {
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission()
        }
      },

      showNotification: (title, body) => {
        const { settings } = get()
        if (!settings.notificationsEnabled) return
        if (!('Notification' in window)) return
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body: body || 'Timer complete!',
            icon: '/favicon.ico',
            requireInteraction: false,
          })
        }
      },

      startTimer: (sessionId, durationMin, taskId) => {
        const seconds = durationMin * 60
        set({
          sessionId,
          durationSec: seconds,
          remainingSec: seconds,
          isRunning: true,
          linkedTaskId: taskId ?? null,
          isBreak: false,
        })
      },

      startBreak: (durationMin) => {
        const seconds = durationMin * 60
        set({
          sessionId: null,
          durationSec: seconds,
          remainingSec: seconds,
          isRunning: true,
          linkedTaskId: null,
          isBreak: true,
        })
      },

      tick: () => {
        const { remainingSec, settings, isBreak, showNotification, startBreak } = get()
        if (remainingSec <= 1) {
          set({ isRunning: false, remainingSec: 0 })
          // Timer completed
          showNotification(
            isBreak ? 'Break Complete!' : 'Pomodoro Complete!',
            isBreak ? 'Time to focus!' : 'Great work! Take a break?'
          )
          // Auto-start break if enabled and this was a work session
          if (!isBreak && settings.autoStartBreaks) {
            setTimeout(() => {
              const currentSettings = get().settings
              startBreak(currentSettings.breakDurationMin)
            }, 100)
          }
        } else {
          set({ remainingSec: remainingSec - 1 })
        }
      },

      stop: () => set({ isRunning: false }),

      reset: () => {
        const { settings, isBreak } = get()
        const duration = isBreak ? settings.breakDurationMin : settings.workDurationMin
        set({
          sessionId: null,
          isRunning: false,
          remainingSec: duration * 60,
          durationSec: duration * 60,
          linkedTaskId: null,
        })
      },

      updateSettings: (newSettings) => {
        const updated = { ...get().settings, ...newSettings }
        saveSettings(updated)
        set({ settings: updated })
        // Update current timer if not running
        const { isRunning } = get()
        if (!isRunning) {
          const { isBreak } = get()
          const duration = isBreak ? updated.breakDurationMin : updated.workDurationMin
          set({ durationSec: duration * 60, remainingSec: duration * 60 })
        }
      },
    }),
    {
      name: 'pomodoro-store',
      partialize: (state) => ({
        settings: state.settings,
        linkedTaskId: state.linkedTaskId,
      }),
    }
  )
)
