import { apiFetch } from './client'
import type { Habit, HabitHistoryEntry, HabitStreak } from '../types'

// Mock data for local development when backend is unavailable
const MOCK_HISTORY: HabitHistoryEntry[] = []

// Load habits from localStorage or initialize empty array
function loadHabitsFromStorage(): Habit[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('mock_habits')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // Reset completedToday for new day
      const today = new Date().toISOString().slice(0, 10)
      const lastDate = localStorage.getItem('mock_habits_date')
      if (lastDate !== today) {
        // New day, reset all completions
        parsed.forEach((h: Habit) => h.completedToday = false)
        localStorage.setItem('mock_habits_date', today)
      }
      return parsed
    } catch {
      return []
    }
  }
  return []
}

let MOCK_HABITS: Habit[] = loadHabitsFromStorage()

// Save habits to localStorage
function saveHabitsToStorage() {
  if (typeof window === 'undefined') return
  localStorage.setItem('mock_habits', JSON.stringify(MOCK_HABITS))
  localStorage.setItem('mock_habits_date', new Date().toISOString().slice(0, 10))
}

// Helper to update mock habit completion
function updateMockHabitCompletion(habitId: string, completed: boolean) {
  const habit = MOCK_HABITS.find(h => h.id === habitId)
  if (habit) {
    habit.completedToday = completed
    MOCK_HABITS = [...MOCK_HABITS]
    saveHabitsToStorage()
  }
}

export const habitsApi = {
  list: () => {
    // Try real API first, fall back to mock (always fresh from storage)
    return apiFetch<Habit[]>('/habits').catch(() => {
      const fresh = loadHabitsFromStorage()
      MOCK_HABITS = fresh
      return Promise.resolve(fresh)
    })
  },

  create: (data: { title: string; description?: string; goalId?: string }) => {
    // Try real API first, fall back to mock
    return apiFetch<Habit>('/habits', { method: 'POST', body: JSON.stringify(data) })
      .catch(() => {
        const newHabit: Habit = {
          id: crypto.randomUUID().slice(0, 8),
          title: data.title,
          description: data.description || null,
          goalId: data.goalId || null,
          isActive: true,
          createdAt: new Date().toISOString(),
          completedToday: false,
        }
        MOCK_HABITS.push(newHabit)
        saveHabitsToStorage()
        return Promise.resolve(newHabit)
      })
  },

  update: (id: string, data: Partial<{ title: string; description: string; goalId: string | null; isActive: boolean }>) =>
    apiFetch<Habit>(`/habits/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/habits/${id}`, { method: 'DELETE' }),

  check: (id: string, date?: string) => {
    return apiFetch<{ ok: boolean; date: string }>(`/habits/${id}/check`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    }).catch(() => {
      updateMockHabitCompletion(id, true)
      return Promise.resolve({ ok: true, date: date || new Date().toISOString().slice(0, 10) })
    })
  },

  uncheck: (id: string, date?: string) => {
    const q = date ? `?date=${date}` : ''
    return apiFetch<{ ok: boolean }>(`/habits/${id}/check${q}`, { method: 'DELETE' })
      .catch(() => {
        updateMockHabitCompletion(id, false)
        return Promise.resolve({ ok: true })
      })
  },

  streak: (id: string) => apiFetch<HabitStreak>(`/habits/${id}/streak`),

  history: () => apiFetch<HabitHistoryEntry[]>('/habits/history').catch(() => Promise.resolve(MOCK_HISTORY)),
}
