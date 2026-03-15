import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, BarChart3, Bell } from 'lucide-react'
import clsx from 'clsx'
import { focusApi } from '../../api/focus'
import { FocusInput } from './FocusInput'
import { FocusChart } from './FocusChart'
import { FocusCorrelations } from './FocusCorrelations'
import { FocusReminderSettings } from './FocusReminderSettings'
import { useFocusReminders } from '../../hooks/useFocusReminders'
import { FOCUS_LEVELS } from '../../types'

type TimeRange = 'week' | 'month'

export function FocusDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [showReminderSettings, setShowReminderSettings] = useState(false)
  const { config } = useFocusReminders()

  const { data: dashboard, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['focus-dashboard'],
    queryFn: () => focusApi.getDashboard(),
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  })

  const { data: dailyData } = useQuery({
    queryKey: ['focus-daily', timeRange],
    queryFn: () => focusApi.getDaily(timeRange === 'week' ? 7 : 30),
  })

  const getTimeRangeLabel = () => {
    return timeRange === 'week' ? 'Past 7 Days' : 'Past 30 Days'
  }

  const getCurrentFocusEmoji = () => {
    if (!dashboard?.today.avgFocus) return null
    const level = Math.round(dashboard.today.avgFocus)
    return FOCUS_LEVELS.find(f => f.level === level) || FOCUS_LEVELS[2]
  }

  const currentFocus = getCurrentFocusEmoji()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Focus Tracking</h1>
          <p className="text-sm text-gray-400 mt-1">
            Track your focus and discover what helps you thrive
          </p>
        </div>
        <button
          onClick={() => setShowReminderSettings(true)}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            config.enabled
              ? 'bg-brand-900/60 text-brand-300 border border-brand-800/50'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
          )}
        >
          <Bell className="w-4 h-4" />
          Reminders
          {config.enabled && (
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Top Section: Input + Today's Status */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Focus Input */}
        <FocusInput showHeader={false} />

        {/* Today's Summary */}
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl border border-green-700/30 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-green-600/20 text-green-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Today</h3>
              <p className="text-xs text-gray-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {isLoadingDashboard ? (
            <div className="animate-pulse space-y-3">
              <div className="h-12 bg-gray-700/50 rounded-lg"></div>
              <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
            </div>
          ) : dashboard?.today.avgFocus ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-6xl">{currentFocus?.emoji}</div>
                <div>
                  <p className="text-3xl font-bold text-white">{Math.round(dashboard.today.avgFocus * 10) / 10}</p>
                  <p className="text-sm text-gray-400">{currentFocus?.label}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Logs today</span>
                  <span className="text-white font-medium">{dashboard.today.logs.length}</span>
                </div>
                {dashboard.yesterday && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Yesterday</span>
                    <span className="text-white font-medium">{Math.round(dashboard.yesterday * 10) / 10}</span>
                  </div>
                )}
              </div>

              {/* Individual log entries */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {dashboard.today.logs.map((log) => {
                  const focusInfo = FOCUS_LEVELS.find(f => f.level === log.focusLevel)
                  return (
                    <div key={log.id} className="flex items-start gap-2 bg-black/20 rounded-lg px-2.5 py-2">
                      <span className="text-base leading-none mt-0.5">{focusInfo?.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-gray-300">{focusInfo?.label}</span>
                          <span className="text-xs text-gray-500 shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-xs text-gray-400 mt-0.5 break-words">{log.notes}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-2">No focus logged yet</p>
              <p className="text-sm text-gray-500">Use the form to log your focus</p>
            </div>
          )}
        </div>
      </div>

      {/* Chart Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-semibold text-white">Focus Trend</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('week')}
              className={clsx(
                'text-xs px-3 py-1.5 rounded-lg transition-colors',
                timeRange === 'week'
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              )}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={clsx(
                'text-xs px-3 py-1.5 rounded-lg transition-colors',
                timeRange === 'month'
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              )}
            >
              Month
            </button>
          </div>
        </div>
        <FocusChart
          data={dailyData || []}
          days={timeRange === 'week' ? 7 : 30}
          title={getTimeRangeLabel()}
        />
      </div>

      {/* Correlations Section */}
      <FocusCorrelations days={timeRange === 'week' ? 7 : 30} />

      {/* Reminder Settings Modal */}
      {showReminderSettings && (
        <FocusReminderSettings onClose={() => setShowReminderSettings(false)} />
      )}
    </div>
  )
}
