import { create } from 'zustand'
import { bodyDoublingApi } from '../api/bodyDoubling'

interface BodyDoublingState {
  isEnabled: boolean
  sessionId: string | null
  currentTaskType: 'work' | 'break'
  currentCount: number
  workingCount: number
  onBreakCount: number
  isCheckingIn: boolean
  lastHeartbeat: number | null

  // Actions
  enable: () => void
  disable: () => void
  checkIn: (taskType?: 'work' | 'break') => Promise<void>
  checkOut: () => Promise<void>
  updateTaskType: (taskType: 'work' | 'break') => void
  refreshCount: () => Promise<void>
  startHeartbeat: () => void
  stopHeartbeat: () => void
}

const HEARTBEAT_INTERVAL_MS = 30 * 1000 // 30 seconds

let heartbeatInterval: number | null = null

export const useBodyDoublingStore = create<BodyDoublingState>((set, get) => ({
  isEnabled: false,
  sessionId: null,
  currentTaskType: 'work',
  currentCount: 0,
  workingCount: 0,
  onBreakCount: 0,
  isCheckingIn: false,
  lastHeartbeat: null,

  enable: () => {
    set({ isEnabled: true })
    get().checkIn()
  },

  disable: async () => {
    await get().checkOut()
    set({ isEnabled: false })
  },

  checkIn: async (taskType = 'work') => {
    if (get().isCheckingIn) return

    set({ isCheckingIn: true })
    try {
      const response = await bodyDoublingApi.checkIn(taskType)
      set({
        sessionId: response.sessionId,
        currentTaskType: response.taskType,
        isCheckingIn: false,
        lastHeartbeat: Date.now(),
      })
      get().refreshCount()
    } catch (error) {
      console.error('Failed to check in:', error)
      set({ isCheckingIn: false })
    }
  },

  checkOut: async () => {
    const { sessionId } = get()
    if (!sessionId) return

    try {
      await bodyDoublingApi.checkOut(sessionId)
      set({ sessionId: null, lastHeartbeat: null })
      get().refreshCount()
    } catch (error) {
      console.error('Failed to check out:', error)
    }
  },

  updateTaskType: async (taskType: 'work' | 'break') => {
    const { sessionId } = get()
    if (!sessionId) return

    try {
      await bodyDoublingApi.heartbeat(sessionId, taskType)
      set({ currentTaskType: taskType })
      get().refreshCount()
    } catch (error) {
      console.error('Failed to update task type:', error)
    }
  },

  refreshCount: async () => {
    try {
      const count = await bodyDoublingApi.getCount()
      set({
        currentCount: count.total,
        workingCount: count.working,
        onBreakCount: count.onBreak,
      })
    } catch (error) {
      console.error('Failed to refresh count:', error)
    }
  },

  startHeartbeat: () => {
    if (heartbeatInterval) return

    heartbeatInterval = window.setInterval(() => {
      const { sessionId, isEnabled } = get()
      if (!sessionId || !isEnabled) return

      // Send heartbeat
      bodyDoublingApi.heartbeat(sessionId)
        .then(() => {
          set({ lastHeartbeat: Date.now() })
          get().refreshCount()
        })
        .catch(console.error)
    }, HEARTBEAT_INTERVAL_MS)
  },

  stopHeartbeat: () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
    }
  },
}))

// Cleanup on unmount (for SPA navigation)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const store = useBodyDoublingStore.getState()
    store.stopHeartbeat()
    store.checkOut().catch(console.error)
  })
}
