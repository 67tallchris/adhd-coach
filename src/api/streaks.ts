import { apiFetch } from './client'
import type { StreakStats, HabitStreakStats } from '../types'

export interface StreakConfig {
  id: string
  type: 'pomodoro' | 'habits' | 'tasks'
  weeklyGoal: number
  timezone: string
  createdAt: string
  updatedAt: string
}

export const streaksApi = {
  getPomodoroStreak: () => apiFetch<StreakStats>('/streaks/pomodoro'),
  getHabitsStreak: () => apiFetch<HabitStreakStats>('/streaks/habits'),
  getTasksStreak: () => apiFetch<StreakStats>('/streaks/tasks'),
  updateGoal: (type: 'pomodoro' | 'habits' | 'tasks', weeklyGoal: number) =>
    apiFetch<StreakConfig>('/streaks/goal', {
      method: 'PATCH',
      body: JSON.stringify({ type, weeklyGoal }),
    }),
  getConfig: () => apiFetch<StreakConfig[]>('/streaks/config'),
}
