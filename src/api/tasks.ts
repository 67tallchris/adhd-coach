import { apiFetch } from './client'
import type { Task, TaskStatus, Priority } from '../types'

export const tasksApi = {
  list: (params?: { status?: TaskStatus; goalId?: string; tag?: string }) => {
    const q = new URLSearchParams()
    if (params?.status) q.set('status', params.status)
    if (params?.goalId) q.set('goal_id', params.goalId)
    if (params?.tag) q.set('tag', params.tag)
    return apiFetch<Task[]>(`/tasks?${q}`)
  },

  create: (data: { title: string; notes?: string; priority?: Priority; goalId?: string; tags?: string[] }) =>
    apiFetch<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<{ title: string; notes: string; status: TaskStatus; priority: Priority; goalId: string | null; tags: string[]; snoozeUntil: string | null }>) =>
    apiFetch<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),

  snooze: (id: string, until: string) =>
    apiFetch<Task>(`/tasks/${id}/snooze`, { method: 'POST', body: JSON.stringify({ until }) }),

  complete: (id: string) =>
    apiFetch<Task>(`/tasks/${id}/complete`, { method: 'POST', body: JSON.stringify({}) }),
}
