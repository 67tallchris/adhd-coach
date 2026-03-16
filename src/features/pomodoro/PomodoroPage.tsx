import { useEffect, useState } from 'react'
import { Timer, Play, Square, RotateCcw, Settings, BellOff, Check, MessageCircle } from 'lucide-react'
import clsx from 'clsx'
import { useQueryClient } from '@tanstack/react-query'
import { usePomodoroStore } from '../../stores/pomodoroStore'
import { pomodoroApi } from '../../api/pomodoro'
import { useTasks } from '../brain-dump/useTasks'
import { BreakSuggestions } from './BreakSuggestions'
import { BodyDoublingIndicator } from '../../components/BodyDoublingIndicator'
import { useBodyDoublingStore } from '../../stores/bodyDoublingStore'
import { DistractionModal } from './DistractionModal'
import { distractionsApi } from '../../api/distractions'
import type { DistractionAction, DistractionType } from '../../types'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const store = usePomodoroStore()
  const { settings, updateSettings } = store

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Timer Settings
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <Check className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Work Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Work Session Duration: {settings.workDurationMin} min
            </label>
            <input
              type="range"
              min="1"
              max="60"
              value={settings.workDurationMin}
              onChange={e => updateSettings({ workDurationMin: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 min</span>
              <span>60 min</span>
            </div>
          </div>

          {/* Break Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Break Duration: {settings.breakDurationMin} min
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={settings.breakDurationMin}
              onChange={e => updateSettings({ breakDurationMin: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 min</span>
              <span>30 min</span>
            </div>
          </div>

          {/* Auto-start Breaks */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">Auto-start Breaks</label>
              <p className="text-xs text-gray-500 mt-0.5">Automatically start break timer after work session</p>
            </div>
            <button
              onClick={() => updateSettings({ autoStartBreaks: !settings.autoStartBreaks })}
              className={clsx(
                'relative w-12 h-6 rounded-full transition-colors',
                settings.autoStartBreaks ? 'bg-brand-600' : 'bg-gray-700'
              )}
            >
              <div
                className={clsx(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  settings.autoStartBreaks ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">Browser Notifications</label>
              <p className="text-xs text-gray-500 mt-0.5">Get notified when timer completes</p>
            </div>
            <button
              onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
              className={clsx(
                'relative w-12 h-6 rounded-full transition-colors',
                settings.notificationsEnabled ? 'bg-brand-600' : 'bg-gray-700'
              )}
            >
              <div
                className={clsx(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  settings.notificationsEnabled ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PomodoroPage() {
  const store = usePomodoroStore()
  const qc = useQueryClient()
  const { data: tasks = [] } = useTasks({ status: 'inbox' })
  const [showSettings, setShowSettings] = useState(false)
  const [showDistractionModal, setShowDistractionModal] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)

  const { settings, isBreak, sessionId } = store
  const bodyDoubling = useBodyDoublingStore()

  // Calculate time remaining for display
  const timeRemaining = store.isRunning && !isBreak
    ? formatTime(store.remainingSec)
    : undefined

  // Handle distraction logging
  const handleDistraction = async (data: {
    distractionType: DistractionType
    notes?: string
    action: DistractionAction
  }) => {
    if (!sessionId) return

    const timeElapsed = store.durationSec - store.remainingSec

    // Log the distraction
    await distractionsApi.log({
      sessionId,
      distractionType: data.distractionType,
      notes: data.notes,
      action: data.action,
      timeElapsed,
    })

    // Handle the selected action
    if (data.action === 'resumed') {
      // Just close modal and continue
      store.startTimer(sessionId, settings.workDurationMin, store.linkedTaskId ?? undefined)
    } else if (data.action === 'restarted') {
      // Stop current and start fresh
      store.reset()
      store.startTimer(sessionId, settings.workDurationMin, store.linkedTaskId ?? undefined)
    } else if (data.action === 'took_break') {
      // Switch to break mode
      store.stop()
      store.startBreak(settings.breakDurationMin)
    } else if (data.action === 'abandoned') {
      // End session
      await pomodoroApi.update(sessionId, {
        abandonedAt: new Date().toISOString(),
        actualDurationMin: Math.max(1, Math.round(timeElapsed / 60)),
      })
      qc.invalidateQueries({ queryKey: ['pomodoro'] })
      store.stop()
      store.reset()
    }
  }

  // Sync body doubling task type with pomodoro state
  useEffect(() => {
    if (bodyDoubling.isEnabled && bodyDoubling.sessionId) {
      const newTaskType = isBreak ? 'break' : 'work'
      if (bodyDoubling.currentTaskType !== newTaskType) {
        bodyDoubling.updateTaskType(newTaskType)
      }
    }
  }, [isBreak, bodyDoubling.isEnabled, bodyDoubling.sessionId])

  // Start/stop heartbeat based on body doubling enabled state
  useEffect(() => {
    if (bodyDoubling.isEnabled) {
      bodyDoubling.startHeartbeat()
    } else {
      bodyDoubling.stopHeartbeat()
    }
    return () => {
      bodyDoubling.stopHeartbeat()
    }
  }, [bodyDoubling.isEnabled])

  // Keyboard shortcut for distraction modal (D key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        // Don't trigger if typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return
        }
        if (!isBreak && store.isRunning) {
          setShowDistractionModal(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isBreak, store.isRunning])

  useEffect(() => {
    store.requestNotificationPermission()
  }, [])

  const progress = store.durationSec > 0
    ? (store.remainingSec / store.durationSec) * 100
    : 100

  const isDone = store.isRunning && store.remainingSec === 0


  async function handleStart() {
    if (isBreak) {
      store.startBreak(settings.breakDurationMin)
      return
    }
    setIsStarting(true)
    setStartError(null)
    try {
      const session = await pomodoroApi.create({
        taskId: store.linkedTaskId ?? undefined,
        durationMin: settings.workDurationMin,
      })
      store.startTimer(session.id, settings.workDurationMin, store.linkedTaskId ?? undefined)
    } catch (err) {
      setStartError(err instanceof Error ? err.message : 'Failed to start session')
    } finally {
      setIsStarting(false)
    }
  }

  async function handleStop() {
    if (sessionId && !isBreak) {
      const elapsedSec = store.durationSec - store.remainingSec
      const actualDurationMin = Math.max(1, Math.round(elapsedSec / 60))
      // Stop is only reachable while running — always an interrupted session.
      await pomodoroApi.update(sessionId, {
        abandonedAt: new Date().toISOString(),
        actualDurationMin,
      })
      qc.invalidateQueries({ queryKey: ['pomodoro'] })
    }
    store.stop()
    store.reset()
  }

  function handleSkipBreak() {
    store.reset()
  }

  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showDistractionModal && (
        <DistractionModal
          isOpen={showDistractionModal}
          onClose={() => setShowDistractionModal(false)}
          onSubmit={handleDistraction}
          timeRemaining={timeRemaining}
        />
      )}

      {/* Body Doubling */}
      <div className="mb-6">
        <BodyDoublingIndicator />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Timer className="w-5 h-5 text-brand-400" />
              Pomodoro
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isBreak ? 'Break time' : 'Focus in 25-minute blocks'}
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* Circular timer */}
        <div className="relative w-52 h-52 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#1f2937" strokeWidth="8" />
            <circle
              cx="100" cy="100" r="90" fill="none"
              stroke={isBreak ? '#22c55e' : store.remainingSec === 0 ? '#22c55e' : '#4f5bff'}
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
              {isBreak ? 'Break' : store.isRunning ? 'Focus time' : store.remainingSec < store.durationSec ? 'Paused' : 'Ready'}
            </span>
            {isBreak && (
              <span className="text-xs text-green-400 mt-1 font-medium">
                Break Time
              </span>
            )}
          </div>
        </div>

        {/* Task link - only show during work sessions */}
        {!store.isRunning && !isBreak && (
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
              disabled={isStarting}
              className={clsx(
                'flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-white transition-colors disabled:opacity-60',
                isBreak ? 'bg-green-600 hover:bg-green-500' : 'bg-brand-600 hover:bg-brand-500',
              )}
            >
              <Play className="w-5 h-5" />
              {isStarting ? 'Starting…' : isBreak ? 'Start Break' : store.remainingSec < store.durationSec ? 'Resume' : 'Start'}
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
          {isBreak && !store.isRunning && (
            <button
              onClick={handleSkipBreak}
              className="p-3 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
              title="Skip Break"
            >
              <BellOff className="w-5 h-5" />
            </button>
          )}
        </div>

        {isDone && (
          <div className="mt-4 text-green-400 font-medium animate-pulse">
            {isBreak ? 'Break complete! Ready to focus?' : "Time's up! Great focus session."}
          </div>
        )}

        {startError && (
          <p className="mt-3 text-sm text-red-400">{startError}</p>
        )}

        {/* Got Distracted button - only show during work sessions */}
        {!isBreak && store.isRunning && (
          <button
            onClick={() => setShowDistractionModal(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-900/20 border border-amber-700/30 transition-colors"
            title="Log a distraction (keyboard shortcut: D)"
          >
            <MessageCircle className="w-4 h-4" />
            Got Distracted?
          </button>
        )}

        {/* Break suggestions - show during breaks */}
        {isBreak && (
          <BreakSuggestions
            breakDurationMin={settings.breakDurationMin}
            onActivitySelect={(activity) => {
              console.log('Completed activity:', activity)
              // Could add tracking/analytics here
            }}
          />
        )}
      </div>
    </div>
  )
}
