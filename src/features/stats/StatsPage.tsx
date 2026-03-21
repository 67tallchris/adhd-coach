import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Timer, CheckSquare, Target, Flame, Trophy, Zap, Award, BarChart3 } from 'lucide-react'
import clsx from 'clsx'
import { pomodoroApi } from '../../api/pomodoro'
import { streaksApi } from '../../api/streaks'
import { StreakCard } from '../../components/StreakCard'
import { TierProgressCard } from '../../features/level/TierProgressCard'
import type { StreakStats, HabitStreakStats } from '../../types'

function Star({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

type Tab = 'overview' | 'pomodoro' | 'habits' | 'tasks'

type AnyStreakStats = StreakStats | HabitStreakStats

function PomodoroStats() {
  const { data: sessions = [] } = useQuery({
    queryKey: ['pomodoro', 'sessions'],
    queryFn: () => pomodoroApi.list(20),
  })

  const { data: stats } = useQuery({
    queryKey: ['pomodoro', 'stats'],
    queryFn: pomodoroApi.stats,
  })

  const { data: streakStats } = useQuery({
    queryKey: ['streaks', 'pomodoro'],
    queryFn: streaksApi.getPomodoroStreak,
  })

  return (
    <div className="space-y-6">
      {/* Streak Card */}
      {streakStats && (
        <StreakCard
          stats={streakStats}
          title="Focus Streak"
          subtitle="Complete pomodoro sessions this week"
          icon={<Flame className="w-5 h-5" />}
        />
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
            <p className="text-sm text-gray-400 mb-1">Today</p>
            <p className="text-3xl font-bold text-white">{stats.today}</p>
            {stats.abandonedToday ? (
              <p className="text-xs text-orange-400 mt-1">{stats.abandonedToday} abandoned</p>
            ) : (
              <p className="text-xs text-green-400 mt-1">✓ All completed</p>
            )}
          </div>
          <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
            <p className="text-sm text-gray-400 mb-1">This Week</p>
            <p className="text-3xl font-bold text-white">{stats.week}</p>
            {stats.abandonedWeek ? (
              <p className="text-xs text-orange-400 mt-1">{stats.abandonedWeek} abandoned</p>
            ) : (
              <p className="text-xs text-green-400 mt-1">✓ All completed</p>
            )}
          </div>
          <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
            <p className="text-sm text-gray-400 mb-1">All Time</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Total sessions</p>
          </div>
          <div className="bg-orange-900/20 rounded-xl p-4 border border-orange-700/30">
            <p className="text-sm text-orange-400 mb-1">Abandoned</p>
            <p className="text-3xl font-bold text-orange-400">{stats.abandonedTotal ?? 0}</p>
            <p className="text-xs text-orange-500 mt-1">Lifetime total</p>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Timer className="w-5 h-5 text-brand-400" />
          Recent Sessions
        </h3>
        {sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.map(session => {
              const isCompleted = session.completedAt !== null
              const isAbandoned = session.abandonedAt !== null
              const actualMin = session.actualDurationMin || (isCompleted ? session.durationMin : 0)

              return (
                <div key={session.id} className={clsx(
                  'flex items-center justify-between p-3 rounded-lg border',
                  isCompleted
                    ? 'bg-green-900/10 border-green-800/30'
                    : isAbandoned
                      ? 'bg-orange-900/10 border-orange-800/30'
                      : 'bg-gray-800/30 border-gray-700/40'
                )}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        'text-sm font-medium',
                        isCompleted ? 'text-green-300' : isAbandoned ? 'text-orange-300' : 'text-gray-300'
                      )}>
                        {session.durationMin} min planned
                      </span>
                      {isAbandoned && actualMin < session.durationMin && (
                        <span className="text-xs text-orange-400">({actualMin} min actual)</span>
                      )}
                    </div>
                    {session.notes && (
                      <span className="text-xs text-gray-500 ml-1">— {session.notes}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        ✓ Completed
                      </span>
                    ) : isAbandoned ? (
                      <span className="text-xs text-orange-400 flex items-center gap-1">
                        ✕ Abandoned
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Incomplete</span>
                    )}
                    <span className="text-xs text-gray-600">
                      {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No sessions yet. Start your first pomodoro!</p>
        )}
      </div>
    </div>
  )
}

function HabitsStats() {
  const { data: stats } = useQuery({
    queryKey: ['streaks', 'habits'],
    queryFn: streaksApi.getHabitsStreak,
  })

  return (
    <div className="space-y-6">
      {stats && (
        <StreakCard
          stats={stats}
          title="Habit Streak"
          subtitle="Complete habits on different days"
          icon={<CheckSquare className="w-5 h-5" />}
        />
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
            <p className="text-sm text-gray-400 mb-1">This Week</p>
            <p className="text-3xl font-bold text-white">{stats.currentStreak}</p>
            <p className="text-xs text-gray-500 mt-1">of {stats.weeklyGoal} goal</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
            <p className="text-sm text-gray-400 mb-1">Best Week</p>
            <p className="text-3xl font-bold text-white">{stats.bestStreak}</p>
            <p className="text-xs text-gray-500 mt-1">Personal record</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
            <p className="text-sm text-gray-400 mb-1">All Time</p>
            <p className="text-3xl font-bold text-white">{stats.totalSessions}</p>
            <p className="text-xs text-gray-500 mt-1">Days with completions</p>
          </div>
        </div>
      )}
    </div>
  )
}

function TasksStats() {
  const { data: stats } = useQuery({
    queryKey: ['streaks', 'tasks'],
    queryFn: streaksApi.getTasksStreak,
  })

  return (
    <div className="space-y-6">
      {stats && (
        <StreakCard
          stats={stats}
          title="Task Completion"
          subtitle="Complete tasks each week"
          icon={<Target className="w-5 h-5" />}
        />
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
            <p className="text-sm text-gray-400 mb-1">This Week</p>
            <p className="text-3xl font-bold text-white">{stats.currentStreak}</p>
            <p className="text-xs text-gray-500 mt-1">of {stats.weeklyGoal} goal</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
            <p className="text-sm text-gray-400 mb-1">Best Week</p>
            <p className="text-3xl font-bold text-white">{stats.bestStreak}</p>
            <p className="text-xs text-gray-500 mt-1">Personal record</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
            <p className="text-sm text-gray-400 mb-1">All Time</p>
            <p className="text-3xl font-bold text-white">{stats.totalSessions}</p>
            <p className="text-xs text-gray-500 mt-1">Total tasks completed</p>
          </div>
        </div>
      )}
    </div>
  )
}

function AchievementsPanel() {
  const pomodoroStats = (useQuery({
    queryKey: ['streaks', 'pomodoro'],
    queryFn: streaksApi.getPomodoroStreak,
  }).data ?? {}) as AnyStreakStats

  const habitsStats = (useQuery({
    queryKey: ['streaks', 'habits'],
    queryFn: streaksApi.getHabitsStreak,
  }).data ?? {}) as AnyStreakStats

  const tasksStats = (useQuery({
    queryKey: ['streaks', 'tasks'],
    queryFn: streaksApi.getTasksStreak,
  }).data ?? {}) as AnyStreakStats

  // Helper to check if achievement is close to being unlocked
  const isCloseToUnlock = (current: number, threshold: number, percentage: number = 0.5) => {
    return current >= threshold * percentage
  }

  const achievements = [
    // Pomodoro achievements
    {
      id: 'pomo-5',
      title: 'Getting Started',
      description: 'Complete 5 focus sessions',
      icon: <Zap className="w-5 h-5" />,
      unlocked: (pomodoroStats?.totalSessions ?? 0) >= 5,
      progress: pomodoroStats?.totalSessions && pomodoroStats.totalSessions < 5 ? pomodoroStats.totalSessions : undefined,
      type: 'pomodoro',
      threshold: 5,
    },
    {
      id: 'pomo-25',
      title: 'Focus Champion',
      description: 'Complete 25 focus sessions',
      icon: <Flame className="w-5 h-5" />,
      unlocked: (pomodoroStats?.totalSessions ?? 0) >= 25,
      progress: pomodoroStats?.totalSessions && pomodoroStats.totalSessions >= 5 && pomodoroStats.totalSessions < 25
        ? pomodoroStats.totalSessions - 5
        : undefined,
      type: 'pomodoro',
      threshold: 25,
    },
    {
      id: 'pomo-100',
      title: 'Focus Master',
      description: 'Complete 100 focus sessions',
      icon: <Trophy className="w-5 h-5" />,
      unlocked: (pomodoroStats?.totalSessions ?? 0) >= 100,
      progress: pomodoroStats?.totalSessions && pomodoroStats.totalSessions >= 25 && pomodoroStats.totalSessions < 100
        ? pomodoroStats.totalSessions - 25
        : undefined,
      type: 'pomodoro',
      threshold: 100,
    },
    {
      id: 'pomo-week',
      title: 'Weekly Warrior',
      description: 'Hit your weekly goal',
      icon: <Target className="w-5 h-5" />,
      unlocked: pomodoroStats?.isOnTrack ?? false,
      type: 'pomodoro',
      threshold: 0, // Always show (goal-based)
    },
    // Habits achievements
    {
      id: 'habit-5',
      title: 'Habit Builder',
      description: 'Complete habits on 5 different days',
      icon: <Award className="w-5 h-5" />,
      unlocked: (habitsStats?.totalSessions ?? 0) >= 5,
      progress: habitsStats?.totalSessions && habitsStats.totalSessions < 5 ? habitsStats.totalSessions : undefined,
      type: 'habits',
      threshold: 5,
    },
    {
      id: 'habit-25',
      title: 'Consistency King',
      description: 'Complete habits on 25 different days',
      icon: <Trophy className="w-5 h-5" />,
      unlocked: (habitsStats?.totalSessions ?? 0) >= 25,
      type: 'habits',
      threshold: 25,
    },
    {
      id: 'habit-streak-7',
      title: 'On a Roll',
      description: '7 day habit streak',
      icon: <Flame className="w-5 h-5" />,
      unlocked: (habitsStats?.currentStreak ?? 0) >= 7,
      type: 'habits',
      threshold: 7,
    },
    // Tasks achievements
    {
      id: 'task-10',
      title: 'Task Crusher',
      description: 'Complete 10 tasks',
      icon: <CheckSquare className="w-5 h-5" />,
      unlocked: (tasksStats?.totalSessions ?? 0) >= 10,
      progress: tasksStats?.totalSessions && tasksStats.totalSessions < 10 ? tasksStats.totalSessions : undefined,
      type: 'tasks',
      threshold: 10,
    },
    {
      id: 'task-50',
      title: 'Productivity Pro',
      description: 'Complete 50 tasks',
      icon: <Award className="w-5 h-5" />,
      unlocked: (tasksStats?.totalSessions ?? 0) >= 50,
      type: 'tasks',
      threshold: 50,
    },
    {
      id: 'task-week',
      title: 'Weekly Winner',
      description: 'Complete 10+ tasks in a week',
      icon: <Star className="w-5 h-5" />,
      unlocked: (tasksStats?.currentStreak ?? 0) >= 10,
      type: 'tasks',
      threshold: 10,
    },
  ]

  // Filter achievements: show only unlocked or close to unlocking
  const visibleAchievements = achievements.filter(a => {
    if (a.unlocked) return true
    if (a.threshold === 0) return true // Goal-based achievements always show
    
    // Check if close to unlocking (50% threshold)
    const current = a.type === 'pomodoro' ? pomodoroStats?.totalSessions ?? 0
      : a.type === 'habits' 
        ? a.id === 'habit-streak-7' ? habitsStats?.currentStreak ?? 0 : habitsStats?.totalSessions ?? 0
        : a.id === 'task-week' ? tasksStats?.currentStreak ?? 0 : tasksStats?.totalSessions ?? 0
    
    return isCloseToUnlock(current, a.threshold, 0.5)
  })

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length
  const hiddenCount = totalCount - visibleAchievements.length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Achievements</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {unlockedCount} / {totalCount} unlocked
            {hiddenCount > 0 && (
              <span className="ml-2 text-gray-600">
                · {hiddenCount} hidden (keep going to discover more!)
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visibleAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={clsx(
              'flex items-center gap-4 p-4 rounded-xl border transition-all',
              achievement.unlocked
                ? 'bg-gradient-to-r from-brand-900/20 to-brand-800/10 border-brand-700/30'
                : 'bg-gray-800/40 border-gray-700/50 opacity-60'
            )}
          >
            <div className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              achievement.unlocked
                ? 'bg-brand-600/20 text-brand-400'
                : 'bg-gray-700/50 text-gray-500'
            )}>
              {achievement.icon}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className={clsx(
                  'font-medium text-sm',
                  achievement.unlocked ? 'text-white' : 'text-gray-400'
                )}>
                  {achievement.title}
                </h4>
                {achievement.unlocked && (
                  <span className="text-xs text-green-400 flex items-center gap-0.5">
                    ✓ Unlocked
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{achievement.description}</p>

              {achievement.progress !== undefined && !achievement.unlocked && (
                <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 transition-all duration-500"
                    style={{ width: `${Math.min((achievement.progress / (achievement.threshold || 25)) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {hiddenCount > 0 && (
          <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-gray-700/50 bg-gray-800/20 opacity-40">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-800/50">
              <span className="text-2xl">🔒</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm text-gray-500">
                {hiddenCount} Hidden Achievement{hiddenCount > 1 ? 's' : ''}
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                Keep making progress to discover more achievements...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: BarChart3 },
    { id: 'pomodoro' as Tab, label: 'Pomodoro', icon: Timer },
    { id: 'habits' as Tab, label: 'Habits', icon: CheckSquare },
    { id: 'tasks' as Tab, label: 'Tasks', icon: Target },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Tier Progress Card */}
            <TierProgressCard />

            {/* Quick Stats Summary */}
            <OverviewSummary />

            {/* Achievements */}
            <AchievementsPanel />
          </div>
        )
      case 'pomodoro':
        return <PomodoroStats />
      case 'habits':
        return <HabitsStats />
      case 'tasks':
        return <TasksStats />
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Statistics</h1>
        <p className="text-sm text-gray-400">
          Track your progress across all activities
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === id
                ? 'bg-brand-900/60 text-brand-300 border border-brand-800/50'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  )
}

function OverviewSummary() {
  const { data: habitsStats } = useQuery({
    queryKey: ['streaks', 'habits'],
    queryFn: streaksApi.getHabitsStreak,
  })

  const { data: tasksStats } = useQuery({
    queryKey: ['streaks', 'tasks'],
    queryFn: streaksApi.getTasksStreak,
  })

  const { data: pomoStats } = useQuery({
    queryKey: ['pomodoro', 'stats'],
    queryFn: pomodoroApi.stats,
  })

  const cards = [
    {
      title: 'Pomodoro Sessions',
      icon: <Timer className="w-5 h-5" />,
      color: 'brand',
      stats: [
        { label: 'Today', value: pomoStats?.today ?? 0 },
        { label: 'This Week', value: pomoStats?.week ?? 0 },
        { label: 'All Time', value: pomoStats?.total ?? 0 },
      ],
    },
    {
      title: 'Habit Completions',
      icon: <CheckSquare className="w-5 h-5" />,
      color: 'green',
      stats: [
        { label: 'This Week', value: habitsStats?.currentStreak ?? 0 },
        { label: 'Best Week', value: habitsStats?.bestStreak ?? 0 },
        { label: 'All Time', value: habitsStats?.totalSessions ?? 0 },
      ],
    },
    {
      title: 'Tasks Completed',
      icon: <Target className="w-5 h-5" />,
      color: 'blue',
      stats: [
        { label: 'This Week', value: tasksStats?.currentStreak ?? 0 },
        { label: 'Best Week', value: tasksStats?.bestStreak ?? 0 },
        { label: 'All Time', value: tasksStats?.totalSessions ?? 0 },
      ],
    },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      brand: 'bg-brand-600/20 text-brand-400',
      green: 'bg-green-600/20 text-green-400',
      blue: 'bg-blue-600/20 text-blue-400',
    }
    return colors[color] || colors.brand
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {cards.map(({ title, icon, color, stats }) => (
        <div key={title} className="bg-gray-800/40 rounded-2xl border border-gray-700/40 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className={clsx('p-2 rounded-lg', getColorClasses(color))}>
              {icon}
            </div>
            <h3 className="font-semibold text-white">{title}</h3>
          </div>
          <div className="space-y-3">
            {stats.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{label}</span>
                <span className="text-lg font-bold text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
