import { apiFetch } from './client'

export interface BodyDoublingCount {
  total: number
  working: number
  onBreak: number
  timestamp: string
}

export interface BodyDoublingCheckInResponse {
  sessionId: string
  startedAt: string
  taskType: 'work' | 'break'
  isNew?: boolean
}

export interface BodyDoublingPeers {
  total: number
  regions: Record<string, number>
  messages: Array<{ text: string; taskType: 'work' | 'break' }>
}

export const bodyDoublingApi = {
  checkIn: (taskType?: 'work' | 'break') =>
    apiFetch<BodyDoublingCheckInResponse>('/body-doubling/checkin', {
      method: 'POST',
      body: JSON.stringify({ taskType }),
    }),

  checkOut: (sessionId: string) =>
    apiFetch<{ ok: boolean }>(`/body-doubling/checkin/${sessionId}`, {
      method: 'DELETE',
    }),

  getCount: () => apiFetch<BodyDoublingCount>('/body-doubling/count'),

  getPeers: () => apiFetch<BodyDoublingPeers>('/body-doubling/peers'),

  heartbeat: (sessionId: string, taskType?: 'work' | 'break') =>
    apiFetch<{ sessionId: string; taskType: 'work' | 'break'; ok: boolean }>(
      `/body-doubling/heartbeat/${sessionId}`,
      {
        method: 'POST',
        body: JSON.stringify({ taskType }),
      }
    ),
}
