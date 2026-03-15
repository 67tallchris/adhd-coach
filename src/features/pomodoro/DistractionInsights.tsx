import { useQuery } from '@tanstack/react-query'
import { BarChart3, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { distractionsApi } from '../../api/distractions'
import { DISTRACTION_TYPES } from '../../types'

export function DistractionInsights() {
  const { data: insights } = useQuery({
    queryKey: ['distractions', 'insights'],
    queryFn: () => distractionsApi.getInsights(100),
  })

  if (!insights || insights.total === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No distractions logged yet.</p>
        <p className="text-xs mt-1">When you get distracted, use the "Got Distracted?" button to track patterns.</p>
      </div>
    )
  }

  // Find most common distraction type
  const topDistraction = Object.entries(insights.byType)
    .sort(([, a], [, b]) => b - a)[0]

  const topDistractionInfo = topDistraction 
    ? DISTRACTION_TYPES.find(t => t.id === topDistraction[0])
    : null

  // Format hour for display
  const formatHour = (hour: string | null) => {
    if (!hour) return null
    const h = parseInt(hour.split(':')[0])
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayHour = h % 12 || 12
    return `${displayHour} ${ampm}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-brand-400" />
        <h3 className="text-lg font-semibold text-white">Distraction Patterns</h3>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Avg. Time to Distraction</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {Math.round(insights.averageTimeToDistraction / 60)}<span className="text-sm text-gray-500 ml-1">min</span>
          </p>
        </div>

        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Peak Distraction Time</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatHour(insights.peakDistractionHour) ?? 'N/A'}
          </p>
          {insights.peakDistractionCount > 0 && (
            <p className="text-xs text-gray-500 mt-1">{insights.peakDistractionCount} distractions</p>
          )}
        </div>
      </div>

      {/* Top distraction type */}
      {topDistractionInfo && (
        <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700/30 rounded-xl p-4">
          <p className="text-xs text-amber-400 font-medium mb-2">Most Common Distraction</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{topDistractionInfo.icon}</span>
            <div>
              <p className="font-semibold text-amber-200">{topDistractionInfo.label}</p>
              <p className="text-xs text-amber-400/60">{topDistractionInfo.description}</p>
            </div>
            <span className="ml-auto text-2xl font-bold text-amber-400">
              {topDistraction[1]}
            </span>
          </div>
        </div>
      )}

      {/* Breakdown by type */}
      <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
        <h4 className="text-sm font-medium text-gray-300 mb-3">By Type</h4>
        <div className="space-y-2">
          {DISTRACTION_TYPES.map((type) => {
            const count = insights.byType[type.id] || 0
            const percentage = insights.total > 0 ? (count / insights.total) * 100 : 0
            return (
              <div key={type.id} className="flex items-center gap-3">
                <span className="text-lg w-6">{type.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">{type.label}</span>
                    <span className="text-xs text-gray-500">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Breakdown by action */}
      <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Recovery Actions</h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(insights.byAction).map(([action, count]) => (
            <div key={action} className="text-center p-3 bg-gray-900/50 rounded-lg">
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-xs text-gray-500 capitalize mt-1">
                {action.replace('_', ' ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Compassionate message */}
      <div className="bg-gradient-to-r from-brand-900/20 to-purple-900/20 border border-brand-700/30 rounded-xl p-4">
        <p className="text-sm text-brand-200">
          💡 <strong>Remember:</strong> Tracking distractions helps you understand your brain better. 
          Each time you notice and log a distraction, you're building self-awareness. 
          That's progress!
        </p>
      </div>
    </div>
  )
}
