import { apiFetch } from './client'
import type { Goal, GoalDetail, GoalStatus } from '../types'

export const goalsApi = {
  list: (status?: GoalStatus) => {
    const q = status ? `?status=${status}` : ''
    return apiFetch<Goal[]>(`/goals${q}`)
  },

  create: (data: { title: string; description?: string; targetDate?: string }) =>
    apiFetch<Goal>('/goals', { method: 'POST', body: JSON.stringify(data) }),

  get: (id: string) => apiFetch<GoalDetail>(`/goals/${id}`),

  update: (id: string, data: Partial<{ title: string; description: string; status: GoalStatus; targetDate: string | null }>) =>
    apiFetch<Goal>(`/goals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
}
