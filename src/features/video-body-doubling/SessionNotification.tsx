import { useState, useEffect } from 'react'
import { Bell, Video, Users, X, Check, Clock } from 'lucide-react'
import clsx from 'clsx'
import { videoBodyDoublingApi, type VideoAnnouncement } from '../../api/videoBodyDoubling'

interface SessionNotificationProps {
  announcement: VideoAnnouncement & {
    session: { roomName: string; description?: string }
  }
  onJoin: () => void
  onDismiss: () => void
}

export function SessionNotification({
  announcement,
  onJoin,
  onDismiss,
}: SessionNotificationProps) {
  const [interestedCount, setInterestedCount] = useState(announcement.interestedCount)
  const [isExpressingInterest, setIsExpressingInterest] = useState(false)
  const [hasExpressedInterest, setHasExpressedInterest] = useState(false)

  // Poll for updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const data = await videoBodyDoublingApi.getAnnouncement(announcement.id)
        setInterestedCount(data.announcement.interestedCount)
        
        // Auto-join if session started and user expressed interest
        if (data.announcement.status === 'active' && hasExpressedInterest) {
          onJoin()
        }
      } catch (err) {
        console.error('Failed to poll notification:', err)
      }
    }, 5000)

    return () => clearInterval(pollInterval)
  }, [announcement.id, hasExpressedInterest, onJoin])

  const handleExpressInterest = async () => {
    setIsExpressingInterest(true)
    try {
      await videoBodyDoublingApi.expressInterest(announcement.id)
      setHasExpressedInterest(true)
      setInterestedCount((prev: number) => prev + 1)
    } catch (err) {
      console.error('Failed to express interest:', err)
    } finally {
      setIsExpressingInterest(false)
    }
  }

  const handleJoinNow = async () => {
    if (!hasExpressedInterest) {
      await handleExpressInterest()
    }
    try {
      await videoBodyDoublingApi.joinAnnouncement(announcement.id)
      onJoin()
    } catch (err) {
      console.error('Failed to join:', err)
    }
  }

  const waitUntil = new Date(announcement.waitUntil)
  const now = new Date()
  const isWaiting = now < waitUntil
  const waitMinutes = Math.ceil((waitUntil.getTime() - now.getTime()) / 60000)

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm animate-slide-up">
      <div className={clsx(
        'rounded-xl border p-4 shadow-lg',
        'bg-gradient-to-br from-gray-900 to-gray-800',
        'border-purple-700/50 shadow-purple-900/20'
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-900/30 border border-purple-700/30">
              <Bell className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                New Focus Session Starting
              </p>
              <p className="text-xs text-gray-400">
                {announcement.session.roomName}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {announcement.session.description && (
            <p className="text-xs text-gray-500">
              {announcement.session.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{interestedCount} interested</span>
            </div>
            <div className="flex items-center gap-1">
              <Video className="w-3.5 h-3.5" />
              <span>{announcement.sessionDurationMin} min</span>
            </div>
            {isWaiting && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Starts in ~{waitMinutes}m</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {!hasExpressedInterest ? (
              <>
                <button
                  onClick={handleExpressInterest}
                  disabled={isExpressingInterest}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isExpressingInterest ? 'Sending...' : "I'm Interested"}
                </button>
                <button
                  onClick={onDismiss}
                  className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium transition-colors"
                >
                  Maybe Later
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleJoinNow}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-medium transition-colors"
                >
                  <Video className="w-3.5 h-3.5" />
                  Join Session
                </button>
                <button
                  onClick={onDismiss}
                  className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium transition-colors"
                >
                  Dismiss
                </button>
              </>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            {hasExpressedInterest
              ? "You'll be notified when the session starts"
              : isWaiting
                ? `Session starts in ${waitMinutes} minutes`
                : 'Session is starting now!'}
          </p>
        </div>
      </div>
    </div>
  )
}
