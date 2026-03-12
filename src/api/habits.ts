import { apiFetch } from './client'
import type { Habit, HabitHistoryEntry, HabitStreak } from '../types'

// Mock data for local development when backend is unavailable
let MOCK_HABITS: Habit[] = []
const MOCK_HISTORY: HabitHistoryEntry[] = []

// Helper to update mock habit completion
function updateMockHabitCompletion(habitId: string, completed: boolean) {
  const habit = MOCK_HABITS.find(h => h.id === habitId)
  if (habit) {
    habit.completedToday = completed
    // Trigger reactivity by creating a new array
    MOCK_HABITS = [...MOCK_HABITS]
  }
}

export const habitsApi = {
  list: () => {
    // Try real API first, fall back to mock
    return apiFetch<Habit[]>('/habits').catch(() => Promise.resolve(MOCK_HABITS))
  },

  create: (data: { title: string; description?: string; goalId?: string }) => {
    // Try real API first, fall back to mock
    return apiFetch<Habit>('/habits', { method: 'POST', body: JSON.stringify(data) })
      .catch(() => {
        // Mock creation for local dev
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
        return Promise.resolve(newHabit)
      })
  },

  update: (id: string, data: Partial<{ title: string; description: string; goalId: string | null; isActive: boolean }>) =>
    apiFetch<Habit>(`/habits/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/habits/${id}`, { method: 'DELETE' }),

  check: (id: string, date?: string) => {
    // Try real API first, fall back to mock
    return apiFetch<{ ok: boolean; date: string }>(`/habits/${id}/check`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    }).catch(() => {
      // Mock check for local dev
      updateMockHabitCompletion(id, true)
      return Promise.resolve({ ok: true, date: date || new Date().toISOString().slice(0, 10) })
    })
  },

  uncheck: (id: string, date?: string) => {
    const q = date ? `?date=${date}` : ''
    return apiFetch<{ ok: boolean }>(`/habits/${id}/check${q}`, { method: 'DELETE' })
      .catch(() => {
        // Mock uncheck for local dev
        updateMockHabitCompletion(id, false)
        return Promise.resolve({ ok: true })
      })
  },

  streak: (id: string) => apiFetch<HabitStreak>(`/habits/${id}/streak`),

  history: () => apiFetch<HabitHistoryEntry[]>('/habits/history').catch(() => Promise.resolve(MOCK_HISTORY)),
}
