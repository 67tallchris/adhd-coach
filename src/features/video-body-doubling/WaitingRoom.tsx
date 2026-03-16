import { useState, useEffect } from 'react'
import { Clock, Users, Play, X, Bell, Zap } from 'lucide-react'
import clsx from 'clsx'
import { videoBodyDoublingApi, type VideoAnnouncement } from '../../api/videoBodyDoubling'

interface WaitingRoomProps {
  announcement: VideoAnnouncement & {
    session: { roomName: string; jitsiRoomId: string; description?: string }
  }
  isCreator: boolean
  onJoin: (jitsiRoomId: string) => void
  onCancel: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function WaitingRoom({
  announcement,
  isCreator,
  onJoin,
  onCancel,
}: WaitingRoomProps) {
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [interestedCount, setInterestedCount] = useState(announcement.interestedCount)
  const [isExpressingInterest, setIsExpressingInterest] = useState(false)
  const [hasExpressedInterest, setHasExpressedInterest] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate time remaining
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const waitUntil = new Date(announcement.waitUntil).getTime()
      const remaining = Math.max(0, waitUntil - now)
      setTimeRemaining(remaining)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [announcement.waitUntil])

  // Auto-join when session starts
  useEffect(() => {
    if (timeRemaining === 0 && announcement.status === 'waiting') {
      // Session should start automatically
      handleStart()
    }
  }, [timeRemaining])

  // Poll for updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const data = await videoBodyDoublingApi.getAnnouncement(announcement.id)
        setInterestedCount(data.announcement.interestedCount)
        if (data.announcement.status === 'active') {
          onJoin(data.announcement.session.jitsiRoomId)
        }
      } catch (err) {
        console.error('Failed to poll announcement:', err)
      }
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [announcement.id, onJoin])

  const handleExpressInterest = async () => {
    if (hasExpressedInterest) return
    setIsExpressingInterest(true)
    try {
      const response = await videoBodyDoublingApi.expressInterest(announcement.id)
      setInterestedCount(response.interestedCount)
      setHasExpressedInterest(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to express interest')
    } finally {
      setIsExpressingInterest(false)
    }
  }

  const handleStart = async () => {
    setIsStarting(true)
    setError(null)
    try {
      const response = await videoBodyDoublingApi.startAnnouncement(announcement.id)
      if (response.announcement.status === 'active') {
        onJoin(announcement.session.jitsiRoomId)
      }
    } catch (err: any) {
      if (err.waitRemaining) {
        setError(`Session starts in ${formatTime(err.waitRemaining)}`)
      } else {
        setError(err.message || 'Failed to start session')
      }
    } finally {
      setIsStarting(false)
    }
  }

  const canStartEarly = isCreator && timeRemaining > 0

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl border border-purple-700/30 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Waiting Room
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {announcement.session.roomName}
          </p>
          {announcement.session.description && (
            <p className="text-xs text-gray-500 mt-2">
              {announcement.session.description}
            </p>
          )}
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Timer */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">
            {timeRemaining > 0 ? 'Session starts in' : 'Starting now...'}
          </span>
          {canStartEarly && (
            <span className="text-xs text-purple-400">
              You can start early
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className={clsx(
            'text-4xl font-mono font-bold tabular-nums',
            timeRemaining > 0 ? 'text-white' : 'text-green-400 animate-pulse'
          )}>
            {formatTime(Math.floor(timeRemaining / 1000))}
          </div>
          {canStartEarly && (
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {isStarting ? 'Starting...' : 'Start Now'}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {timeRemaining > 0
            ? 'Waiting for others to join...'
            : 'Session is starting!'}
        </p>
      </div>

      {/* Interested count */}
      <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-900/30 border border-blue-700/30">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {interestedCount}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {interestedCount === 1 ? 'person interested' : 'people interested'}
              </p>
            </div>
          </div>
          {!hasExpressedInterest && (
            <button
              onClick={handleExpressInterest}
              disabled={isExpressingInterest}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Bell className="w-4 h-4" />
              {isExpressingInterest ? 'Sending...' : "I'm Interested"}
            </button>
          )}
          {hasExpressedInterest && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-900/30 border border-green-700/30 text-green-400 text-sm font-medium">
              <Zap className="w-4 h-4" />
              Interest Recorded
            </div>
          )}
        </div>
      </div>

      {/* Session info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
          <p className="text-xs text-gray-500 mb-1">Session Duration</p>
          <p className="text-lg font-semibold text-white">
            {announcement.sessionDurationMin} min
          </p>
        </div>
        <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
          <p className="text-xs text-gray-500 mb-1">Late Join Until</p>
          <p className="text-lg font-semibold text-white">
            {new Date(announcement.lateJoinUntil).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-900/10 rounded-lg border border-blue-700/20 p-3">
        <p className="text-xs text-blue-300 font-medium mb-1">
          📋 What to expect:
        </p>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Session will start in {Math.ceil(timeRemaining / 60000) || 0} minutes</li>
          <li>• You can join up to 5 minutes after start</li>
          <li>• Video is optional, audio recommended muted</li>
          <li>• This is a silent co-working session</li>
        </ul>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-900/20 border border-red-700/30 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
