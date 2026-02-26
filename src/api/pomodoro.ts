import { apiFetch } from './client'
import type { PomodoroSession, PomodoroStats } from '../types'

export const pomodoroApi = {
  list: (limit = 20) => apiFetch<PomodoroSession[]>(`/pomodoro/sessions?limit=${limit}`),

  create: (data: { taskId?: string; durationMin?: number }) =>
    apiFetch<PomodoroSession>('/pomodoro/sessions', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: { completedAt?: string; notes?: string }) =>
    apiFetch<PomodoroSession>(`/pomodoro/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  stats: () => apiFetch<PomodoroStats>('/pomodoro/stats'),
}
