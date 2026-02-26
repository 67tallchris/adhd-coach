import { Sparkles } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { useNudges } from './useNudges'

export default function NudgesPage() {
  const { data: nudges = [], isLoading } = useNudges(50)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-400" />
          Nudge History
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">What your coach has said to you</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-800/40 rounded-xl animate-pulse" />)}
        </div>
      ) : nudges.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">No nudges yet.</p>
          <p className="text-sm mt-1">Your coach will speak up when you open the app.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {nudges.map(nudge => (
            <div key={nudge.id} className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-4">
              <p className="text-sm text-gray-200 leading-relaxed">{nudge.content}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-gray-600">
                  {formatDistanceToNow(parseISO(nudge.createdAt), { addSuffix: true })}
                </span>
                <span className="text-xs text-gray-700 capitalize">{nudge.type.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
