import { useEffect, useRef } from 'react'
import { Timer, Play, Square, RotateCcw } from 'lucide-react'
import clsx from 'clsx'
import { useQueryClient } from '@tanstack/react-query'
import { usePomodoroStore } from '../../stores/pomodoroStore'
import { pomodoroApi } from '../../api/pomodoro'
import { useTasks } from '../brain-dump/useTasks'
import { useQuery } from '@tanstack/react-query'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function SessionHistory() {
  const { data: sessions = [] } = useQuery({
    queryKey: ['pomodoro', 'sessions'],
    queryFn: () => pomodoroApi.list(10),
  })
  const { data: stats } = useQuery({
    queryKey: ['pomodoro', 'stats'],
    queryFn: pomodoroApi.stats,
  })

  if (sessions.length === 0) return null

  return (
    <div className="mt-8">
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Today', value: stats.today },
            { label: 'This Week', value: stats.week },
            { label: 'All Time', value: stats.total },
          ].map(s => (
            <div key={s.label} className="bg-gray-800/40 rounded-xl p-3 text-center border border-gray-700/50">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Sessions</h3>
      <div className="space-y-2">
        {sessions.map(session => (
          <div key={session.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/40">
            <div>
              <span className="text-sm text-gray-300">{session.durationMin} min</span>
              {session.notes && <span className="text-xs text-gray-500 ml-2">— {session.notes}</span>}
            </div>
            <div className="flex items-center gap-2">
              {session.completedAt ? (
                <span className="text-xs text-green-400">Completed</span>
              ) : (
                <span className="text-xs text-gray-500">Abandoned</span>
              )}
              <span className="text-xs text-gray-600">
                {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PomodoroPage() {
  const store = usePomodoroStore()
  const qc = useQueryClient()
  const { data: tasks = [] } = useTasks({ status: 'inbox' })
  const intervalRef = useRef<number | null>(null)

  const progress = store.durationSec > 0
    ? (store.remainingSec / store.durationSec) * 100
    : 100

  const isDone = store.isRunning && store.remainingSec === 0

  // Tick interval
  useEffect(() => {
    if (store.isRunning && store.remainingSec > 0) {
      intervalRef.current = window.setInterval(() => store.tick(), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [store.isRunning, store.remainingSec])

  // Auto-complete when timer hits 0
  useEffect(() => {
    if (isDone && store.sessionId) {
      pomodoroApi.update(store.sessionId, { completedAt: new Date().toISOString() })
        .then(() => {
          qc.invalidateQueries({ queryKey: ['pomodoro'] })
          store.stop()
        })
        .catch(console.error)
    }
  }, [isDone])

  async function handleStart() {
    const session = await pomodoroApi.create({
      taskId: store.linkedTaskId ?? undefined,
      durationMin: 25,
    })
    store.startTimer(session.id, 25, store.linkedTaskId ?? undefined)
  }

  async function handleStop() {
    if (store.sessionId) {
      await pomodoroApi.update(store.sessionId, {})
      qc.invalidateQueries({ queryKey: ['pomodoro'] })
    }
    store.stop()
    store.reset()
  }

  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Timer className="w-5 h-5 text-brand-400" />
          Pomodoro
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Focus in 25-minute blocks</p>
      </div>

      <div className="flex flex-col items-center">
        {/* Circular timer */}
        <div className="relative w-52 h-52 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#1f2937" strokeWidth="8" />
            <circle
              cx="100" cy="100" r="90" fill="none"
              stroke={store.remainingSec === 0 ? '#22c55e' : '#4f5bff'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-mono font-bold text-white tabular-nums">
              {formatTime(store.remainingSec)}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {store.isRunning ? 'Focus time' : store.remainingSec < store.durationSec ? 'Paused' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Task link */}
        {!store.isRunning && (
          <div className="mb-4 w-full max-w-xs">
            <select
              value={store.linkedTaskId ?? ''}
              onChange={e => usePomodoroStore.setState({ linkedTaskId: e.target.value || null })}
              className="w-full text-sm bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-300 outline-none"
            >
              <option value="">No task linked</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          {!store.isRunning ? (
            <button
              onClick={handleStart}
              className={clsx(
                'flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-white transition-colors',
                store.remainingSec < store.durationSec
                  ? 'bg-brand-600 hover:bg-brand-500'
                  : 'bg-brand-600 hover:bg-brand-500',
              )}
            >
              <Play className="w-5 h-5" />
              {store.remainingSec < store.durationSec ? 'Resume' : 'Start'}
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-white bg-red-700 hover:bg-red-600 transition-colors"
            >
              <Square className="w-5 h-5" />
              Stop
            </button>
          )}
          {!store.isRunning && store.remainingSec < store.durationSec && (
            <button
              onClick={() => store.reset()}
              className="p-3 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>

        {isDone && (
          <div className="mt-4 text-green-400 font-medium animate-pulse">
            Time's up! Great focus session.
          </div>
        )}
      </div>

      <SessionHistory />
    </div>
  )
}
