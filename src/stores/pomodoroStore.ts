import { create } from 'zustand'

interface PomodoroState {
  sessionId: string | null
  durationSec: number
  remainingSec: number
  isRunning: boolean
  linkedTaskId: string | null
  startTimer: (sessionId: string, durationMin: number, taskId?: string) => void
  tick: () => void
  stop: () => void
  reset: () => void
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  sessionId: null,
  durationSec: 25 * 60,
  remainingSec: 25 * 60,
  isRunning: false,
  linkedTaskId: null,

  startTimer: (sessionId, durationMin, taskId) =>
    set({
      sessionId,
      durationSec: durationMin * 60,
      remainingSec: durationMin * 60,
      isRunning: true,
      linkedTaskId: taskId ?? null,
    }),

  tick: () => {
    const { remainingSec } = get()
    if (remainingSec <= 0) {
      set({ isRunning: false, remainingSec: 0 })
    } else {
      set({ remainingSec: remainingSec - 1 })
    }
  },

  stop: () => set({ isRunning: false }),

  reset: () => set({
    sessionId: null,
    isRunning: false,
    remainingSec: get().durationSec,
    linkedTaskId: null,
  }),
}))
