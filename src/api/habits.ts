import { apiFetch } from './client'
import type { Habit, HabitStreak } from '../types'

export const habitsApi = {
  list: () => apiFetch<Habit[]>('/habits'),

  create: (data: { title: string; description?: string; goalId?: string }) =>
    apiFetch<Habit>('/habits', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<{ title: string; description: string; goalId: string | null; isActive: boolean }>) =>
    apiFetch<Habit>(`/habits/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/habits/${id}`, { method: 'DELETE' }),

  check: (id: string, date?: string) =>
    apiFetch<{ ok: boolean; date: string }>(`/habits/${id}/check`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    }),

  uncheck: (id: string, date?: string) => {
    const q = date ? `?date=${date}` : ''
    return apiFetch<{ ok: boolean }>(`/habits/${id}/check${q}`, { method: 'DELETE' })
  },

  streak: (id: string) => apiFetch<HabitStreak>(`/habits/${id}/streak`),
}
