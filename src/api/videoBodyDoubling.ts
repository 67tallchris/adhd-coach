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
  createdAt: string
}

export interface VideoAnnouncement {
  id: string
  sessionId: string
  status: 'waiting' | 'starting' | 'active' | 'cancelled' | 'expired'
  interestedCount: number
  joinedCount: number
  waitUntil: string
  lateJoinUntil: string
  sessionDurationMin: number
  createdAt: string
  roomName?: string
  description?: string
}

export interface CreateAnnouncementResponse {
  announcement: VideoAnnouncement & {
    session: VideoSession
    jitsiRoomId: string
  }
  potentialParticipants: number
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

  // Announcement endpoints
  createAnnouncement: (data?: {
    roomName?: string
    description?: string
    sessionDurationMin?: number
    tags?: string[]
  }) =>
    apiFetch<CreateAnnouncementResponse>('/video-body-doubling/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  expressInterest: (announcementId: string) =>
    apiFetch<{ announcement: VideoAnnouncement; interestedCount: number }>(
      `/video-body-doubling/announcements/${announcementId}/interest`,
      { method: 'POST' }
    ),

  startAnnouncement: (announcementId: string) =>
    apiFetch<{ announcement: VideoAnnouncement; session: VideoSession }>(
      `/video-body-doubling/announcements/${announcementId}/start`,
      { method: 'POST' }
    ),

  joinAnnouncement: (announcementId: string, data?: { displayName?: string }) =>
    apiFetch<JoinSessionResponse>(
      `/video-body-doubling/announcements/${announcementId}/join`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  getAnnouncement: (announcementId: string) =>
    apiFetch<{ announcement: VideoAnnouncement & { session: VideoSession; participants: any[] } }>(
      `/video-body-doubling/announcements/${announcementId}`
    ),

  getActiveAnnouncements: () =>
    apiFetch<{ announcements: VideoAnnouncement[] }>(
      '/video-body-doubling/announcements/active'
    ),

  cancelAnnouncement: (announcementId: string) =>
    apiFetch<{ ok: boolean }>(
      `/video-body-doubling/announcements/${announcementId}`,
      { method: 'DELETE' }
    ),
}
