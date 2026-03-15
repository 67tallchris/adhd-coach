import { useState } from 'react'
import { Trophy, TrendingUp, Calendar, X } from 'lucide-react'
import clsx from 'clsx'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { streaksApi } from '../api/streaks'
import type { StreakConfig, StreakStats, HabitStreakStats } from '../types'

type AnyStreakStats = StreakStats | HabitStreakStats

export function WeeklyGoalEditor({
  type,
  currentGoal,
  onClose
}: {
  type: 'pomodoro' | 'habits' | 'tasks'
  currentGoal: number
  onClose: () => void
}) {
  const [goal, setGoal] = useState(currentGoal)
  const qc = useQueryClient()

  const updateGoal = useMutation({
    mutationFn: ({ type, weeklyGoal }: { type: string; weeklyGoal: number }) =>
      streaksApi.updateGoal(type as 'pomodoro' | 'habits' | 'tasks', weeklyGoal),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['streaks'] })
      onClose()
    }
  })

  const suggestions = type === 'pomodoro' ? [3, 5, 10, 15] : type === 'habits' ? [5, 10, 15, 20] : [5, 10, 20, 30]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Edit Weekly Goal</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Set a realistic weekly goal. Remember: it's better to start small and build momentum!
          </p>

          <div className="grid grid-cols-4 gap-2">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => setGoal(s)}
                className={clsx(
                  'py-3 rounded-xl text-sm font-medium transition-colors',
                  goal === s
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setGoal(Math.max(1, goal - 1))}
              className="w-10 h-10 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-xl font-bold"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-bold text-white">{goal}</span>
              <span className="text-sm text-gray-500 ml-2">per week</span>
            </div>
            <button
              onClick={() => setGoal(goal + 1)}
              className="w-10 h-10 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-xl font-bold"
            >
              +
            </button>
          </div>

          <button
            onClick={() => updateGoal.mutate({ type, weeklyGoal: goal })}
            disabled={updateGoal.isPending}
            className="w-full py-3 rounded-xl font-medium bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-50"
          >
            {updateGoal.isPending ? 'Saving...' : 'Save Goal'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function WeeklySummary() {
  const [showGoalEditor, setShowGoalEditor] = useState<{ type: 'pomodoro' | 'habits' | 'tasks'; goal: number } | null>(null)

  const { data: pomodoroStats } = useQuery({
    queryKey: ['streaks', 'pomodoro'],
    queryFn: streaksApi.getPomodoroStreak,
  })

  const { data: habitsStats } = useQuery({
    queryKey: ['streaks', 'habits'],
    queryFn: streaksApi.getHabitsStreak,
  })

  const { data: tasksStats } = useQuery({
    queryKey: ['streaks', 'tasks'],
    queryFn: streaksApi.getTasksStreak,
  })

  const { data: configs = [] } = useQuery<StreakConfig[]>({
    queryKey: ['streaks', 'config'],
    queryFn: streaksApi.getConfig,
  })

  const getConfig = (type: string) => configs.find((c: StreakConfig) => c.type === type)

  const summaries = [
    {
      type: 'pomodoro' as const,
      title: 'Focus Sessions',
      icon: <TrendingUp className="w-4 h-4" />,
      stats: pomodoroStats as AnyStreakStats | undefined,
      config: getConfig('pomodoro'),
      color: 'brand',
    },
    {
      type: 'habits' as const,
      title: 'Habit Completions',
      icon: <Calendar className="w-4 h-4" />,
      stats: habitsStats as AnyStreakStats | undefined,
      config: getConfig('habits'),
      color: 'green',
    },
    {
      type: 'tasks' as const,
      title: 'Tasks Completed',
      icon: <Trophy className="w-4 h-4" />,
      stats: tasksStats as AnyStreakStats | undefined,
      config: getConfig('tasks'),
      color: 'blue',
    },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      brand: 'bg-brand-600/20 text-brand-400 border-brand-700/30',
      green: 'bg-green-600/20 text-green-400 border-green-700/30',
      blue: 'bg-blue-600/20 text-blue-400 border-blue-700/30',
    }
    return colors[color] || colors.brand
  }

  const getProgressColor = (stats: any) => {
    if (!stats) return 'bg-gray-600'
    if (stats.isOnTrack) return 'bg-green-500'
    if (stats.progress >= 50) return 'bg-yellow-500'
    return 'bg-brand-500'
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Weekly Summary</h3>
          <span className="text-xs text-gray-500">
            Week starts Monday
          </span>
        </div>

        {summaries.map(({ type, title, icon, stats, config, color }) => (
          <div
            key={type}
            className={clsx(
              'rounded-xl border p-4 transition-colors hover:border-gray-600',
              getColorClasses(color)
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={clsx('p-2 rounded-lg', `bg-${color}-600/20`)}>
                  {icon}
                </div>
                <span className="font-medium">{title}</span>
              </div>
              <button
                onClick={() => setShowGoalEditor({ type, goal: config?.weeklyGoal || 5 })}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Edit goal
              </button>
            </div>

            {stats && (
              <>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-2xl font-bold">{stats.currentStreak}</span>
                    <span className="text-sm text-gray-400 ml-1">/ {stats.weeklyGoal}</span>
                  </div>
                  <span className={clsx(
                    'text-xs font-medium px-2 py-1 rounded-full',
                    stats.isOnTrack
                      ? 'bg-green-900/30 text-green-400'
                      : stats.progress >= 50
                        ? 'bg-yellow-900/30 text-yellow-400'
                        : 'bg-gray-700 text-gray-400'
                  )}>
                    {stats.isOnTrack ? '✓ On track' : `${Math.round(stats.progress)}% complete`}
                  </span>
                </div>

                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full transition-all duration-500', getProgressColor(stats))}
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <span>Best week: {stats.bestStreak}</span>
                  <span>Last week: {stats.lastWeekCount}</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {showGoalEditor && (
        <WeeklyGoalEditor
          type={showGoalEditor.type}
          currentGoal={showGoalEditor.goal}
          onClose={() => setShowGoalEditor(null)}
        />
      )}
    </>
  )
}
