import { apiFetch } from './client'
import type { DistractionLog, DistractionInsights } from '../types'

export const distractionsApi = {
  log: (data: {
    sessionId: string
    distractionType: string
    notes?: string
    action: string
    timeElapsed: number
  }) =>
    apiFetch<DistractionLog>('/distractions', { method: 'POST', body: JSON.stringify(data) }),

  getSessionLogs: (sessionId: string) =>
    apiFetch<DistractionLog[]>(`/distractions/session/${sessionId}`),

  getInsights: (limit?: number) => {
    const q = limit ? `?limit=${limit}` : ''
    return apiFetch<DistractionInsights>(`/distractions/insights${q}`)
  },

  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/distractions/${id}`, { method: 'DELETE' }),
}
