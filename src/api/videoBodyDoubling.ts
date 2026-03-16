import { apiFetch } from './client'
import type {
  VideoSession,
  CreateVideoSessionRequest,
  CreateVideoSessionResponse,
} from '../types/jitsi'

export interface JoinSessionResponse {
  session: VideoSession
  jitsiRoomId: string
}

export interface ActiveSessionSummary {
  id: string
  roomName: string
  participantCount: number
  tags?: string[]
  description?: string
}

export const videoBodyDoublingApi = {
  create: (data: CreateVideoSessionRequest) =>
    apiFetch<CreateVideoSessionResponse>('/video-body-doubling/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  join: (sessionId: string) =>
    apiFetch<JoinSessionResponse>(`/video-body-doubling/sessions/${sessionId}/join`, {
      method: 'POST',
    }),

  leave: (sessionId: string) =>
    apiFetch<{ ok: boolean }>(`/video-body-doubling/sessions/${sessionId}/leave`, {
      method: 'POST',
    }),

  getActive: () =>
    apiFetch<{
      activeSessions: number
      totalParticipants: number
      sessions: ActiveSessionSummary[]
    }>('/video-body-doubling/sessions/active'),

  get: (sessionId: string) =>
    apiFetch<{ session: VideoSession }>(`/video-body-doubling/sessions/${sessionId}`),

  update: (sessionId: string, data: Partial<CreateVideoSessionRequest>) =>
    apiFetch<{ session: VideoSession }>(`/video-body-doubling/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
}
