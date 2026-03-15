import { apiFetch } from './client'
import type { LadderGoal, LadderStep } from '../types'

export const laddersApi = {
  list: (params?: { status?: 'active' | 'completed' | 'archived' }) => {
    const q = new URLSearchParams()
    if (params?.status) q.set('status', params.status)
    return apiFetch<LadderGoal[]>(`/ladders?${q}`)
  },

  get: (id: string) =>
    apiFetch<LadderGoal>(`/ladders/${id}`),

  create: (data: {
    title: string
    description?: string
    taskId?: string
    goalId?: string
    steps?: Array<{
      stepNumber: number
      title: string
      notes?: string
    }>
  }) =>
    apiFetch<LadderGoal>('/ladders', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<{
    title: string
    description: string
    status: 'active' | 'completed' | 'archived'
    taskId: string | null
    goalId: string | null
  }>) =>
    apiFetch<LadderGoal>(`/ladders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/ladders/${id}`, { method: 'DELETE' }),

  addStep: (ladderId: string, data: {
    stepNumber: number
    title: string
    notes?: string
  }) =>
    apiFetch<LadderStep>(`/ladders/${ladderId}/steps`, { method: 'POST', body: JSON.stringify(data) }),

  updateStep: (ladderId: string, stepId: string, data: Partial<{
    stepNumber: number
    title: string
    notes: string
    isCompleted: boolean
  }>) =>
    apiFetch<LadderStep>(`/ladders/${ladderId}/steps/${stepId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteStep: (ladderId: string, stepId: string) =>
    apiFetch<{ ok: boolean }>(`/ladders/${ladderId}/steps/${stepId}`, { method: 'DELETE' }),

  reorderSteps: (ladderId: string, steps: Array<{ id: string; stepNumber: number }>) =>
    apiFetch<LadderStep[]>(`/ladders/${ladderId}/steps/reorder`, { method: 'POST', body: JSON.stringify({ steps }) }),
}
