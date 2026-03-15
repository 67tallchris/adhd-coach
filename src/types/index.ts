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

export interface LadderStep {
  id: string
  ladderId: string
  stepNumber: number
  title: string
  notes: string | null
  isCompleted: boolean
  completedAt: string | null
  createdAt: string
}

export interface LadderGoal {
  id: string
  title: string
  description: string | null
  taskId: string | null
  goalId: string | null
  status: 'active' | 'completed' | 'archived'
  createdAt: string
  updatedAt: string
  completedAt: string | null
  steps?: LadderStep[]
}

export interface StreakConfig {
  id: string
  type: 'pomodoro' | 'habits' | 'tasks'
  weeklyGoal: number
  timezone: string
  createdAt: string
  updatedAt: string
}

export type DistractionType = 'internal' | 'external' | 'urgent' | 'overwhelm' | 'boredom' | 'rabbit-hole'
export type DistractionAction = 'resumed' | 'restarted' | 'abandoned' | 'took_break'

export interface DistractionLog {
  id: string
  sessionId: string | null
  timestamp: string
  distractionType: DistractionType
  notes: string | null
  action: DistractionAction
  timeElapsed: number
}

export interface DistractionInsights {
  total: number
  recentLogs: DistractionLog[]
  byType: Record<string, number>
  byAction: Record<string, number>
  averageTimeToDistraction: number
  peakDistractionHour: string | null
  peakDistractionCount: number
}

export const DISTRACTION_TYPES: { id: DistractionType; label: string; icon: string; description: string }[] = [
  { id: 'internal', label: 'Intrusive thought', icon: '💭', description: 'Random thought or idea popped up' },
  { id: 'external', label: 'External interruption', icon: '🔔', description: 'Someone or something interrupted' },
  { id: 'urgent', label: 'Something urgent', icon: '🚨', description: 'Felt like I needed to do something else' },
  { id: 'overwhelm', label: 'Feeling overwhelmed', icon: '😰', description: 'Task felt too big or difficult' },
  { id: 'boredom', label: 'Boredom/Resistance', icon: '😴', description: 'This feels boring or hard' },
  { id: 'rabbit-hole', label: 'Went down rabbit hole', icon: '🐰', description: 'Got sidetracked researching something' },
]

export interface FocusLog {
  id: string
  timestamp: string
  focusLevel: number // 1-5 scale
  notes: string | null
  context: string | null // JSON: { energy, sleep, mood }
}

export interface FocusContext {
  energy: 'low' | 'medium' | 'high'
  sleep: 'poor' | 'normal' | 'good'
  mood: string[]
}

export interface FocusCorrelation {
  id: string
  date: string
  avgFocusLevel: number
  habitsCompleted: string[] // habit IDs
  pomodoroSessions: number
  tasksCompleted: number
  correlationScores: Record<string, number>
  computedAt: string
}

export interface FocusInsights {
  avgFocusLevel: number
  highFocusDays: number
  lowFocusDays: number
  topCorrelations: FocusCorrelationItem[]
  dailyLogs: DailyFocusLog[]
}

export interface FocusCorrelationItem {
  id: string
  label: string
  score: number
  type: 'habit' | 'pomodoro' | 'tasks'
  description: string
}

export interface DailyFocusLog {
  date: string
  avgFocus: number
  logCount: number
  pomodoroCount: number
  tasksCompleted: number
  habitsCompleted: number
}

export const FOCUS_LEVELS = [
  { level: 1, label: 'Very Low', emoji: '😫', color: '#ef4444', description: 'Could barely focus' },
  { level: 2, label: 'Low', emoji: '😕', color: '#f97316', description: 'Struggled to concentrate' },
  { level: 3, label: 'Medium', emoji: '😐', color: '#eab308', description: 'Average focus' },
  { level: 4, label: 'Good', emoji: '🙂', color: '#22c55e', description: 'Pretty focused' },
  { level: 5, label: 'Excellent', emoji: '🤩', color: '#3b82f6', description: 'Super focused!' },
]
