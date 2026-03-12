import { apiFetch } from './client'
import type { Nudge, NudgeType } from '../types'

export const nudgesApi = {
  list: (params?: { limit?: number; unreadOnly?: boolean }) => {
    const q = new URLSearchParams()
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.unreadOnly) q.set('unread_only', 'true')
    return apiFetch<Nudge[]>(`/nudges?${q}`)
  },

  generate: (type: NudgeType = 'app_open', provider: 'claude' | 'qwen' = 'qwen') =>
    apiFetch<Nudge>('/nudges/generate', {
      method: 'POST',
      body: JSON.stringify({ type, provider }),
    }),

  markRead: (id: string) =>
    apiFetch<{ ok: boolean }>(`/nudges/${id}/read`, { method: 'POST', body: JSON.stringify({}) }),
}
