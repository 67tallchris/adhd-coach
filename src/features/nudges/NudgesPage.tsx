import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { useNudges, useGenerateNudge } from './useNudges'

export default function NudgesPage() {
  const { data: nudges = [], isLoading, error } = useNudges(50)
  const generateQwen = useGenerateNudge('qwen')
  const generateClaude = useGenerateNudge('claude')

  const getErrorMessage = (error: Error | null) => {
    if (!error) return null
    const message = error.message
    if (message.includes('ANTHROPIC_API_KEY')) {
      return 'Claude API key not configured. Ask the admin to add it.'
    }
    if (message.includes('QWEN_API_KEY')) {
      return 'Qwen API key not configured. Ask the admin to add it.'
    }
    return message
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-400" />
          Nudge History
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">What your coach has said to you</p>
      </div>

      <div className="mb-6 flex gap-3">
        <button
          onClick={() => generateQwen.mutate()}
          disabled={generateQwen.isPending}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {generateQwen.isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            'Ask Qwen'
          )}
        </button>
        <button
          onClick={() => generateClaude.mutate()}
          disabled={generateClaude.isPending}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {generateClaude.isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            'Ask Claude'
          )}
        </button>
      </div>

      {/* Success/Error Messages */}
      {(generateQwen.isSuccess || generateClaude.isSuccess) && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-700/30 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-sm text-green-300">Nudge generated! Scroll down to see it.</p>
        </div>
      )}

      {generateQwen.isError && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-300">Failed to generate nudge</p>
            <p className="text-xs text-red-400 mt-1">{getErrorMessage(generateQwen.error)}</p>
          </div>
        </div>
      )}

      {generateClaude.isError && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-300">Failed to generate nudge</p>
            <p className="text-xs text-red-400 mt-1">{getErrorMessage(generateClaude.error)}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-800/40 rounded-xl animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <p className="text-red-300 font-medium">Failed to load nudges</p>
          <p className="text-sm text-gray-500 mt-1">{error.message}</p>
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
