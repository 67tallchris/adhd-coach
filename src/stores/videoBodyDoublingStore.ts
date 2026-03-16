import { create } from 'zustand'
import { videoBodyDoublingApi } from '../api/videoBodyDoubling'
import type { VideoSession } from '../types/jitsi'

interface VideoBodyDoublingState {
  currentSession: VideoSession | null
  jitsiRoomId: string | null
  isInMeeting: boolean
  isLoading: boolean
  error: string | null

  // Actions
  createSession: (roomName?: string, description?: string) => Promise<VideoSession>
  joinSession: (sessionId: string) => Promise<void>
  leaveSession: () => Promise<void>
  setCurrentSession: (session: VideoSession | null) => void
  setInMeeting: (inMeeting: boolean) => void
}

export const useVideoBodyDoublingStore = create<VideoBodyDoublingState>((set, get) => ({
  currentSession: null,
  jitsiRoomId: null,
  isInMeeting: false,
  isLoading: false,
  error: null,

  createSession: async (roomName?: string, description?: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await videoBodyDoublingApi.create({
        roomName,
        description,
      })
      set({
        currentSession: response.session,
        jitsiRoomId: response.jitsiRoomId,
        isLoading: false,
      })
      return response.session
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create session'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  joinSession: async (sessionId: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await videoBodyDoublingApi.join(sessionId)
      set({
        currentSession: response.session,
        jitsiRoomId: response.jitsiRoomId,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join session'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  leaveSession: async () => {
    const { currentSession } = get()
    if (!currentSession) return

    try {
      await videoBodyDoublingApi.leave(currentSession.id)
    } catch (error) {
      console.error('Failed to leave session:', error)
    } finally {
      set({ currentSession: null, jitsiRoomId: null, isInMeeting: false })
    }
  },

  setCurrentSession: (session: VideoSession | null) => {
    set({ currentSession: session })
  },

  setInMeeting: (inMeeting: boolean) => {
    set({ isInMeeting: inMeeting })
  },
}))
