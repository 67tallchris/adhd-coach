import { useState } from 'react'
import { Brain, RefreshCw, X } from 'lucide-react'
import clsx from 'clsx'
import { useLatestNudge, useGenerateNudge, useMarkNudgeRead } from '../features/nudges/useNudges'

export default function NudgePanel() {
  const { data: nudge, isLoading } = useLatestNudge()
  const generateMutation = useGenerateNudge()
  const markReadMutation = useMarkNudgeRead()
  const [dismissed, setDismissed] = useState(false)

  const handleDismiss = () => {
    if (nudge) markReadMutation.mutate(nudge.id)
    setDismissed(true)
  }

  const handleRefresh = () => {
    const lastRefresh = localStorage.getItem('nudge_last_refresh')
    const now = Date.now()
    if (lastRefresh && now - parseInt(lastRefresh) < 5 * 60 * 1000) {
      alert('Please wait 5 minutes before refreshing the nudge.')
      return
    }
    localStorage.setItem('nudge_last_refresh', String(now))
    setDismissed(false)
    generateMutation.mutate()
  }

  if (dismissed) {
    return (
      <button
        onClick={handleRefresh}
        className="w-full mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-brand-400 transition-colors py-2"
      >
        <Brain className="w-4 h-4" />
        <span>Get a nudge from your coach</span>
      </button>
    )
  }

  return (
    <div className={clsx(
      'mb-4 sm:mb-6 rounded-xl border border-brand-800/50 bg-brand-950/40 p-3 sm:p-4',
      'relative overflow-hidden',
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-brand-900/20 to-transparent pointer-events-none" />
      <div className="relative flex items-start gap-2 sm:gap-3">
        <div className="mt-0.5 rounded-lg bg-brand-800/50 p-1.5 shrink-0">
          <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-brand-400 mb-1">Your coach says</p>
          {isLoading || generateMutation.isPending ? (
            <div className="space-y-1.5">
              <div className="h-3 bg-gray-700 rounded animate-pulse w-full" />
              <div className="h-3 bg-gray-700 rounded animate-pulse w-4/5" />
              <div className="h-3 bg-gray-700 rounded animate-pulse w-3/5" />
            </div>
          ) : nudge ? (
            <p className="text-sm text-gray-200 leading-relaxed">{nudge.content}</p>
          ) : (
            <p className="text-sm text-gray-500 italic">No nudge yet — add some tasks or habits to get started.</p>
          )}
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={generateMutation.isPending}
            className="p-1 rounded text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
            title="Get a new nudge"
          >
            <RefreshCw className={clsx('w-3.5 h-3.5', generateMutation.isPending && 'animate-spin')} />
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded text-gray-500 hover:text-gray-300 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
