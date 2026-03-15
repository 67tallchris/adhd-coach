import { Trophy, Star, Zap, Flame, Target, Award } from 'lucide-react'
import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
import { streaksApi } from '../api/streaks'
import type { StreakStats, HabitStreakStats } from '../types'

type AnyStreakStats = StreakStats | HabitStreakStats

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  progress?: number
  type: 'pomodoro' | 'habits' | 'tasks'
}

export function AchievementsPanel() {
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

  const achievements: Achievement[] = [
    // Pomodoro achievements
    {
      id: 'pomo-5',
      title: 'Getting Started',
      description: 'Complete 5 focus sessions',
      icon: <Zap className="w-5 h-5" />,
      unlocked: (pomodoroStats?.totalSessions ?? 0) >= 5,
      progress: pomodoroStats?.totalSessions && pomodoroStats.totalSessions < 5 ? pomodoroStats.totalSessions : undefined,
      type: 'pomodoro',
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
    },
    {
      id: 'pomo-week',
      title: 'Weekly Warrior',
      description: 'Hit your weekly goal',
      icon: <Target className="w-5 h-5" />,
      unlocked: pomodoroStats?.isOnTrack ?? false,
      type: 'pomodoro',
    },
    // Habits achievements
    {
      id: 'habit-5',
      title: 'Habit Builder',
      description: 'Complete habits on 5 different days',
      icon: <Star className="w-5 h-5" />,
      unlocked: (habitsStats?.totalSessions ?? 0) >= 5,
      progress: habitsStats?.totalSessions && habitsStats.totalSessions < 5 ? habitsStats.totalSessions : undefined,
      type: 'habits',
    },
    {
      id: 'habit-25',
      title: 'Consistency King',
      description: 'Complete habits on 25 different days',
      icon: <Award className="w-5 h-5" />,
      unlocked: (habitsStats?.totalSessions ?? 0) >= 25,
      type: 'habits',
    },
    {
      id: 'habit-streak-7',
      title: 'On a Roll',
      description: '7 day habit streak',
      icon: <Flame className="w-5 h-5" />,
      unlocked: (habitsStats?.currentStreak ?? 0) >= 7,
      type: 'habits',
    },
    // Tasks achievements
    {
      id: 'task-10',
      title: 'Task Crusher',
      description: 'Complete 10 tasks',
      icon: <Target className="w-5 h-5" />,
      unlocked: (tasksStats?.totalSessions ?? 0) >= 10,
      progress: tasksStats?.totalSessions && tasksStats.totalSessions < 10 ? tasksStats.totalSessions : undefined,
      type: 'tasks',
    },
    {
      id: 'task-50',
      title: 'Productivity Pro',
      description: 'Complete 50 tasks',
      icon: <Trophy className="w-5 h-5" />,
      unlocked: (tasksStats?.totalSessions ?? 0) >= 50,
      type: 'tasks',
    },
    {
      id: 'task-week',
      title: 'Weekly Winner',
      description: 'Complete 10+ tasks in a week',
      icon: <Star className="w-5 h-5" />,
      unlocked: (tasksStats?.currentStreak ?? 0) >= 10,
      type: 'tasks',
    },
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Achievements</h3>
        <span className="text-sm text-gray-400">
          {unlockedCount} / {totalCount} unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {achievements.map((achievement) => (
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
                    style={{ width: `${Math.min((achievement.progress / 25) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
