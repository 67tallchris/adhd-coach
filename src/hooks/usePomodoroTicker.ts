import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePomodoroStore } from '../stores/pomodoroStore'
import { pomodoroApi } from '../api/pomodoro'
import { useLevelStore } from '../stores/levelStore'

/**
 * Drives the Pomodoro tick interval and handles session completion.
 * Must be called from a component that is always mounted (Layout),
 * so the timer keeps running during navigation.
 */
export function usePomodoroTicker() {
  const store = usePomodoroStore()
  const qc = useQueryClient()
  const intervalRef = useRef<number | null>(null)
  const isDone = store.isRunning && store.remainingSec === 0

  useEffect(() => {
    if (store.isRunning && store.remainingSec > 0) {
      intervalRef.current = window.setInterval(() => store.tick(), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [store.isRunning, store.remainingSec])

  useEffect(() => {
    if (isDone && store.sessionId && !store.isBreak) {
      // Stop immediately so the UI reflects completion and handleStop can't race this.
      const completedSessionId = store.sessionId
      const durationMin = store.settings.workDurationMin
      store.stop()
      pomodoroApi.update(completedSessionId, { completedAt: new Date().toISOString() })
        .then(() => {
          qc.invalidateQueries({ queryKey: ['pomodoro'] })
          useLevelStore.getState().awardXp(
            50,
            'pomodoro_session',
            `Completed ${durationMin}-minute Pomodoro session`,
            { sessionId: completedSessionId, durationMin }
          )
        })
        .catch(console.error)
    }
  }, [isDone, store.sessionId, store.isBreak])
}
