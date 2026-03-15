import { create } from 'zustand'
import { focusApi } from '../api/focus'
import type { FocusLog, FocusInsights, DailyFocusLog } from '../types'

interface FocusState {
  todayLogs: FocusLog[]
  dailyLogs: DailyFocusLog[]
  insights: FocusInsights | null
  isLoading: boolean
  error: string | null
  lastFocusLevel: number | null
  logFocus: (level: number, notes?: string, context?: { energy: string; sleep: string; mood: string[] }) => Promise<void>
  fetchToday: () => Promise<void>
  fetchHistory: (days: number) => Promise<void>
  fetchInsights: (days: number) => Promise<void>
  computeCorrelations: (days: number) => Promise<void>
  setLastFocusLevel: (level: number | null) => void
}

export const useFocusStore = create<FocusState>((set, get) => ({
  todayLogs: [],
  dailyLogs: [],
  insights: null,
  isLoading: false,
  error: null,
  lastFocusLevel: null,

  setLastFocusLevel: (level) => {
    set({ lastFocusLevel: level })
  },

  logFocus: async (level, notes, context) => {
    try {
      const log = await focusApi.logFocus(level, notes, context)
      set((state) => ({
        todayLogs: [log, ...state.todayLogs],
        lastFocusLevel: level,
        error: null,
      }))
      // Persist last focus level to localStorage
      localStorage.setItem('last-focus-level', String(level))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to log focus' })
    }
  },

  fetchToday: async () => {
    set({ isLoading: true, error: null })
    try {
      const logs = await focusApi.getToday()
      const lastLevel = localStorage.getItem('last-focus-level')
      set({
        todayLogs: logs,
        lastFocusLevel: lastLevel ? parseInt(lastLevel, 10) : null,
        isLoading: false,
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch today\'s logs', isLoading: false })
    }
  },

  fetchHistory: async (days: number) => {
    set({ isLoading: true, error: null })
    try {
      const logs = await focusApi.getDaily(days)
      set({
        dailyLogs: logs.map((d) => ({
          date: d.date,
          avgFocus: d.avgFocus,
          logCount: d.logCount,
          pomodoroCount: 0,
          tasksCompleted: 0,
          habitsCompleted: 0,
        })),
        isLoading: false,
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch history', isLoading: false })
    }
  },

  fetchInsights: async (days: number) => {
    set({ isLoading: true, error: null })
    try {
      const insights = await focusApi.getInsights(days)
      set({ insights, isLoading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch insights', isLoading: false })
    }
  },

  computeCorrelations: async (days: number) => {
    set({ isLoading: true, error: null })
    try {
      await focusApi.computeCorrelations(days)
      // Refresh insights after computing
      await get().fetchInsights(days)
      set({ isLoading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to compute correlations', isLoading: false })
    }
  },
}))

// Load last focus level from localStorage on initialization
if (typeof window !== 'undefined') {
  const lastLevel = localStorage.getItem('last-focus-level')
  if (lastLevel) {
    useFocusStore.setState({ lastFocusLevel: parseInt(lastLevel, 10) })
  }
}
