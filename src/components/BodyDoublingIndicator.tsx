import { Users, LogOut, LogIn, Coffee, Briefcase, Video } from 'lucide-react'
import clsx from 'clsx'
import { useBodyDoublingStore } from '../stores/bodyDoublingStore'
import { useQuery } from '@tanstack/react-query'
import { bodyDoublingApi } from '../api/bodyDoubling'
import { useNavigate } from 'react-router-dom'

interface BodyDoublingIndicatorProps {
  currentTaskType?: 'work' | 'break'
  onTaskTypeChange?: (type: 'work' | 'break') => void
}

export function BodyDoublingIndicator({
  onTaskTypeChange,
}: BodyDoublingIndicatorProps) {
  const navigate = useNavigate()
  const {
    isEnabled,
    sessionId,
    currentTaskType,
    currentCount,
    workingCount,
    onBreakCount,
    isCheckingIn,
    enable,
    disable,
    updateTaskType,
  } = useBodyDoublingStore()

  // Poll for count updates every 10 seconds when enabled
  const { data: peerData } = useQuery({
    queryKey: ['body-doubling', 'peers'],
    queryFn: () => bodyDoublingApi.getPeers(),
    enabled: isEnabled,
    refetchInterval: 10000,
  })

  const handleToggle = () => {
    if (isEnabled) {
      disable()
    } else {
      enable()
    }
  }

  const handleTaskTypeChange = (type: 'work' | 'break') => {
    updateTaskType(type)
    onTaskTypeChange?.(type)
  }

  if (!isEnabled) {
    return (
      <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-700/50">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">Body Doubling</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Focus alongside others anonymously
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            disabled={isCheckingIn}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {isCheckingIn ? 'Joining...' : 'Join'}
          </button>
        </div>
        
        {/* Video Body Doubling Link */}
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <button
            onClick={() => navigate('/app/video-body-doubling')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-700/30 text-purple-300 hover:text-purple-200 text-sm font-medium transition-all"
          >
            <Video className="w-4 h-4" />
            Try Video Body Doubling
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Focus together via video call
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-900/30 border border-green-700/30">
            <Users className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Body Doubling Active</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {sessionId ? 'Anonymous session' : 'Focusing together'}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
          title="Leave session"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Count display */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-800/40 rounded-lg p-3 text-center border border-gray-700/40">
          <p className="text-2xl font-bold text-white">{currentCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total</p>
        </div>
        <div className="bg-blue-900/20 rounded-lg p-3 text-center border border-blue-700/30">
          <p className="text-2xl font-bold text-blue-400">{workingCount}</p>
          <p className="text-xs text-blue-500 mt-0.5">Focusing</p>
        </div>
        <div className="bg-green-900/20 rounded-lg p-3 text-center border border-green-700/30">
          <p className="text-2xl font-bold text-green-400">{onBreakCount}</p>
          <p className="text-xs text-green-500 mt-0.5">On Break</p>
        </div>
      </div>

      {/* Task type selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 mr-2">You're:</span>
        <button
          onClick={() => handleTaskTypeChange('work')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors',
            currentTaskType === 'work'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700/50 text-gray-400 hover:text-gray-300'
          )}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Focusing
        </button>
        <button
          onClick={() => handleTaskTypeChange('break')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors',
            currentTaskType === 'break'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700/50 text-gray-400 hover:text-gray-300'
          )}
        >
          <Coffee className="w-3.5 h-3.5" />
          On Break
        </button>
      </div>

      {/* Ambient messages */}
      {peerData && peerData.messages.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-700/50">
          <div className="space-y-1">
            {peerData.messages.slice(0, 2).map((msg, i) => (
              <p key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
                <span className={clsx(
                  'w-1.5 h-1.5 rounded-full',
                  msg.taskType === 'work' ? 'bg-blue-400' : 'bg-green-400'
                )} />
                {msg.text}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Privacy notice */}
      <p className="text-xs text-gray-600 mt-3 text-center">
        🔒 Your identity is anonymous — we don't track who you are
      </p>

      {/* Video Body Doubling Link */}
      <div className="mt-4 pt-3 border-t border-gray-700/50">
        <button
          onClick={() => navigate('/app/video-body-doubling')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-700/30 text-purple-300 hover:text-purple-200 text-sm font-medium transition-all"
        >
          <Video className="w-4 h-4" />
          Try Video Body Doubling
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Focus together via video call
        </p>
      </div>
    </div>
  )
}
