import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TrendingUp, Zap, CheckSquare, AlertCircle, RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import { focusApi } from '../../api/focus'

interface FocusCorrelationsProps {
  days?: number
}

export function FocusCorrelations({ days = 30 }: FocusCorrelationsProps) {
  const qc = useQueryClient()

  const { data: insights, isLoading: isLoadingInsights } = useQuery({
    queryKey: ['focus-insights', days],
    queryFn: () => focusApi.getInsights(days),
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  const computeMutation = useMutation({
    mutationFn: () => focusApi.computeCorrelations(days),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['focus-insights'] })
    },
  })

  const handleComputeCorrelations = () => {
    computeMutation.mutate()
  }

  const getCorrelationIcon = (type: string) => {
    switch (type) {
      case 'habit':
        return <CheckSquare className="w-4 h-4" />
      case 'pomodoro':
        return <Zap className="w-4 h-4" />
      case 'tasks':
        return <TrendingUp className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getCorrelationColor = (score: number) => {
    if (score > 0.3) return 'text-green-400 bg-green-900/30 border-green-700/40'
    if (score > 0.1) return 'text-green-300 bg-green-900/20 border-green-700/30'
    if (score < -0.3) return 'text-red-400 bg-red-900/30 border-red-700/40'
    if (score < -0.1) return 'text-red-300 bg-red-900/20 border-red-700/30'
    return 'text-gray-400 bg-gray-800/40 border-gray-700/40'
  }

  const getCorrelationStrength = (score: number) => {
    const absScore = Math.abs(score)
    if (absScore > 0.5) return 'Very Strong'
    if (absScore > 0.3) return 'Strong'
    if (absScore > 0.1) return 'Moderate'
    return 'Weak'
  }

  if (isLoadingInsights) {
    return (
      <div className="bg-gray-800/40 rounded-2xl border border-gray-700/40 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700/50 rounded w-1/3"></div>
          <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
          <div className="h-20 bg-gray-700/50 rounded"></div>
        </div>
      </div>
    )
  }

  if (!insights || insights.topCorrelations.length === 0) {
    return (
      <div className="bg-gradient-to-br from-brand-900/20 to-purple-900/20 rounded-2xl border border-brand-700/30 p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-brand-600/20 text-brand-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-2">Focus Insights</h3>
            <p className="text-sm text-gray-400 mb-4">
              {insights
                ? `You've logged ${insights.highFocusDays + insights.lowFocusDays} days of focus data.`
                : 'Start logging your focus to discover patterns!'}
            </p>

            {!insights || insights.topCorrelations.length === 0 ? (
              <div className="space-y-3">
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/40">
                  <p className="text-sm text-gray-400 mb-2">📊 Keep logging your focus!</p>
                  <p className="text-xs text-gray-500">
                    After a few days of logging, we'll show you which habits and activities
                    correlate with your high-focus days.
                  </p>
                </div>

                {insights && (
                  <button
                    onClick={handleComputeCorrelations}
                    disabled={computeMutation.isPending}
                    className={clsx(
                      'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      computeMutation.isPending
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-brand-600 text-white hover:bg-brand-500'
                    )}
                  >
                    <RefreshCw className={clsx('w-4 h-4', computeMutation.isPending && 'animate-spin')} />
                    {computeMutation.isPending ? 'Computing...' : 'Compute Correlations Now'}
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-brand-900/20 to-purple-900/20 rounded-2xl border border-brand-700/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-brand-600/20 text-brand-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Focus Patterns</h3>
            <p className="text-xs text-gray-400">
              On high-focus days, you tend to...
            </p>
          </div>
        </div>

        <button
          onClick={handleComputeCorrelations}
          disabled={computeMutation.isPending}
          className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
          title="Refresh correlations"
        >
          <RefreshCw className={clsx('w-4 h-4', computeMutation.isPending && 'animate-spin')} />
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/40">
          <p className="text-xs text-gray-500 mb-1">High-focus days</p>
          <p className="text-xl font-bold text-green-400">{insights.highFocusDays}</p>
        </div>
        <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/40">
          <p className="text-xs text-gray-500 mb-1">Low-focus days</p>
          <p className="text-xl font-bold text-orange-400">{insights.lowFocusDays}</p>
        </div>
      </div>

      {/* Correlations List */}
      <div className="space-y-2">
        {insights.topCorrelations.map((corr) => (
          <div
            key={corr.id}
            className={clsx(
              'rounded-xl border p-3 transition-colors',
              getCorrelationColor(corr.score)
            )}
          >
            <div className="flex items-start gap-3">
              <div className={clsx(
                'p-1.5 rounded-lg',
                corr.score > 0 ? 'bg-green-700/30' : 'bg-red-700/30'
              )}>
                {getCorrelationIcon(corr.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{corr.label}</span>
                  <span className={clsx(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    corr.score > 0 ? 'bg-green-700/40 text-green-300' : 'bg-red-700/40 text-red-300'
                  )}>
                    {corr.score > 0 ? '+' : ''}{Math.round(corr.score * 100)}%
                  </span>
                </div>
                <p className="text-xs opacity-80">{corr.description}</p>
                <p className="text-xs mt-1 opacity-60">
                  {getCorrelationStrength(corr.score)} correlation
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Note */}
      <div className="mt-4 p-3 bg-gray-800/40 rounded-lg border border-gray-700/40">
        <p className="text-xs text-gray-400">
          💡 <strong>Correlation ≠ Causation:</strong> These patterns show associations,
          not guarantees. Use them as hints for what might work for you!
        </p>
      </div>
    </div>
  )
}
