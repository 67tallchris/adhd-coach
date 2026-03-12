// Re-exported types from Drizzle schema (must match exactly)
export type GoalStatus = 'active' | 'completed' | 'archived'
export type TaskStatus = 'inbox' | 'snoozed' | 'done'
export type Priority = 'low' | 'medium' | 'high'
export type NudgeType = 'app_open' | 'manual_refresh'

export interface Goal {
  id: string
  title: string
  description: string | null
  status: GoalStatus
  targetDate: string | null
  createdAt: string
  updatedAt: string
}

export interface GoalDetail extends Goal {
  taskCount: number
  habitCount: number
}

export interface Task {
  id: string
  title: string
  notes: string | null
  status: TaskStatus
  priority: Priority
  dueDate: string | null
  dueTime: string | null
  snoozeUntil: string | null
  goalId: string | null
  tags: string // JSON array string
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export interface Habit {
  id: string
  title: string
  description: string | null
  goalId: string | null
  isActive: boolean
  createdAt: string
  completedToday: boolean
}

export interface HabitStreak {
  currentStreak: number
  longestStreak: number
  totalDays: number
}

export interface HabitHistoryEntry {
  date: string
  count: number
}

export interface PomodoroSession {
  id: string
  taskId: string | null
  durationMin: number
  startedAt: string
  completedAt: string | null
  abandonedAt: string | null
  actualDurationMin: number | null
  notes: string | null
}

export interface PomodoroStats {
  today: number
  week: number
  total: number
  abandonedToday?: number
  abandonedWeek?: number
  abandonedTotal?: number
}

export interface Nudge {
  id: string
  content: string
  type: NudgeType
  isRead: boolean
  createdAt: string
}

export interface StreakMilestone {
  sessions: number
  unlocked: boolean
}

export interface StreakStats {
  currentStreak: number
  weeklyGoal: number
  progress: number
  isOnTrack: boolean
  bestStreak: number
  totalSessions: number
  lastWeekCount: number
  milestones: StreakMilestone[]
}

export interface HabitStreakStats extends StreakStats {
  completionsThisWeek: number
}
