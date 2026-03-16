import { sqliteTable, text, integer, index, unique } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

function now() {
  return sql`(datetime('now'))`
}

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: ['active', 'completed', 'archived'] }).notNull().default('active'),
  targetDate: text('target_date'),
  createdAt: text('created_at').notNull().default(now()),
  updatedAt: text('updated_at').notNull().default(now()),
})

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  title: text('title').notNull(),
  notes: text('notes'),
  status: text('status', { enum: ['inbox', 'snoozed', 'done'] }).notNull().default('inbox'),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).notNull().default('medium'),
  dueDate: text('due_date'),
  dueTime: text('due_time'),
  snoozeUntil: text('snooze_until'),
  goalId: text('goal_id').references(() => goals.id),
  tags: text('tags').notNull().default('[]'),
  createdAt: text('created_at').notNull().default(now()),
  updatedAt: text('updated_at').notNull().default(now()),
  completedAt: text('completed_at'),
}, (t) => [
  index('idx_tasks_status').on(t.status),
  index('idx_tasks_snooze').on(t.snoozeUntil),
  index('idx_tasks_due').on(t.dueDate),
])

export const habits = sqliteTable('habits', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  title: text('title').notNull(),
  description: text('description'),
  goalId: text('goal_id').references(() => goals.id),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(now()),
})

export const habitCompletions = sqliteTable('habit_completions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  habitId: text('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  createdAt: text('created_at').notNull().default(now()),
}, (t) => [
  unique('uniq_habit_date').on(t.habitId, t.date),
  index('idx_completions_date').on(t.date),
])

export const pomodoroSessions = sqliteTable('pomodoro_sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  taskId: text('task_id').references(() => tasks.id),
  durationMin: integer('duration_min').notNull().default(25),
  startedAt: text('started_at').notNull(),
  completedAt: text('completed_at'),
  abandonedAt: text('abandoned_at'),
  actualDurationMin: integer('actual_duration_min'),
  notes: text('notes'),
}, (t) => [
  index('idx_pomo_started').on(t.startedAt),
  index('idx_pomo_completed').on(t.completedAt),
  index('idx_pomo_abandoned').on(t.abandonedAt),
])

export const streakConfig = sqliteTable('streak_config', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  type: text('type', { enum: ['pomodoro', 'habits', 'tasks'] }).notNull(),
  weeklyGoal: integer('weekly_goal').notNull().default(5),
  timezone: text('timezone').notNull().default('UTC'),
  createdAt: text('created_at').notNull().default(now()),
  updatedAt: text('updated_at').notNull().default(now()),
}, (t) => [
  index('idx_streak_type').on(t.type),
])

export const nudges = sqliteTable('nudges', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  content: text('content').notNull(),
  type: text('type', { enum: ['app_open', 'manual_refresh'] }).notNull().default('app_open'),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(now()),
}, (t) => [
  index('idx_nudges_created').on(t.createdAt),
])

export const devices = sqliteTable('devices', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  userId: text('user_id'),
  fcmToken: text('fcm_token').notNull(),
  platform: text('platform', { enum: ['android', 'ios', 'web'] }).notNull().default('android'),
  createdAt: text('created_at').notNull().default(now()),
  lastActiveAt: text('last_active_at'),
}, (t) => [
  index('idx_devices_user').on(t.userId),
  index('idx_devices_token').on(t.fcmToken),
])

export const bodyDoublingSessions = sqliteTable('body_doubling_sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  sessionId: text('session_id').notNull(), // Anonymous session ID, rotated hourly
  startedAt: text('started_at').notNull(),
  lastHeartbeat: text('last_heartbeat').notNull(),
  taskType: text('task_type', { enum: ['work', 'break'] }).notNull().default('work'),
  region: text('region'), // Coarse region (e.g., "US", "EU") - optional
}, (t) => [
  index('idx_body_session').on(t.sessionId),
  index('idx_body_heartbeat').on(t.lastHeartbeat),
  index('idx_body_task_type').on(t.taskType),
])

export const videoBodyDoublingSessions = sqliteTable('video_body_doubling_sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  roomName: text('room_name').notNull(), // Human-readable room name
  jitsiRoomId: text('jitsi_room_id').notNull(), // Unique Jitsi room identifier
  createdBy: text('created_by'), // Anonymous user ID (optional)
  createdAt: text('created_at').notNull().default(now()),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  participantCount: integer('participant_count').notNull().default(0),
  maxParticipants: integer('max_participants'), // Optional limit
  description: text('description'),
  tags: text('tags').notNull().default('[]'), // JSON array of tags
  lastActivityAt: text('last_activity_at').notNull().default(now()),
}, (t) => [
  index('idx_video_room_name').on(t.roomName),
  index('idx_video_jitsi_room').on(t.jitsiRoomId),
  index('idx_video_active').on(t.isActive),
  index('idx_video_created_at').on(t.createdAt),
])

export const videoBodyDoublingParticipants = sqliteTable('video_body_doubling_participants', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  sessionId: text('session_id').notNull().references(() => videoBodyDoublingSessions.id, { onDelete: 'cascade' }),
  jitsiParticipantId: text('jitsi_participant_id'), // ID from Jitsi
  displayName: text('display_name'),
  joinedAt: text('joined_at').notNull().default(now()),
  leftAt: text('left_at'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
}, (t) => [
  index('idx_video_participant_session').on(t.sessionId),
  index('idx_video_participant_active').on(t.isActive),
])

export const ladderGoals = sqliteTable('ladder_goals', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  title: text('title').notNull(), // The end goal (top of ladder)
  description: text('description'),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'set null' }), // Optional link to existing task
  goalId: text('goal_id').references(() => goals.id, { onDelete: 'set null' }), // Optional link to existing goal
  status: text('status', { enum: ['active', 'completed', 'archived'] }).notNull().default('active'),
  createdAt: text('created_at').notNull().default(now()),
  updatedAt: text('updated_at').notNull().default(now()),
  completedAt: text('completed_at'),
}, (t) => [
  index('idx_ladder_status').on(t.status),
  index('idx_ladder_task').on(t.taskId),
  index('idx_ladder_goal').on(t.goalId),
])

export const ladderSteps = sqliteTable('ladder_steps', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  ladderId: text('ladder_id').notNull().references(() => ladderGoals.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number').notNull(), // 1 = bottom (first action), higher = closer to goal
  title: text('title').notNull(), // What needs to be done
  notes: text('notes'), // Additional context
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull().default(now()),
}, (t) => [
  index('idx_step_ladder').on(t.ladderId),
  index('idx_step_number').on(t.stepNumber),
  index('idx_step_completed').on(t.isCompleted),
])

export const distractionLogs = sqliteTable('distraction_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  sessionId: text('session_id').references(() => pomodoroSessions.id, { onDelete: 'set null' }),
  timestamp: text('timestamp').notNull().default(now()),
  distractionType: text('distraction_type', {
    enum: ['internal', 'external', 'urgent', 'overwhelm', 'boredom', 'rabbit-hole']
  }).notNull(),
  notes: text('notes'),
  action: text('action', {
    enum: ['resumed', 'restarted', 'abandoned', 'took_break']
  }).notNull(),
  timeElapsed: integer('time_elapsed').notNull().default(0), // seconds into session
}, (t) => [
  index('idx_distraction_session').on(t.sessionId),
  index('idx_distraction_type').on(t.distractionType),
  index('idx_distraction_timestamp').on(t.timestamp),
])

export const focusLogs = sqliteTable('focus_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  timestamp: text('timestamp').notNull().default(now()),
  focusLevel: integer('focus_level').notNull(), // 1-5 scale
  notes: text('notes'),
  context: text('context'), // JSON: { energy: 'low'|'medium'|'high', sleep: 'poor'|'normal'|'good', mood: string[] }
}, (t) => [
  index('idx_focus_timestamp').on(t.timestamp),
  index('idx_focus_level').on(t.focusLevel),
])

export const focusCorrelations = sqliteTable('focus_correlations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  date: text('date').notNull(), // YYYY-MM-DD
  avgFocusLevel: integer('avg_focus_level').notNull(), // 1-5 (stored as integer * 10 for precision)
  habitsCompleted: text('habits_completed').notNull().default('[]'), // JSON array of habit IDs
  pomodoroSessions: integer('pomodoro_sessions').notNull().default(0),
  tasksCompleted: integer('tasks_completed').notNull().default(0),
  correlationScores: text('correlation_scores').notNull().default('{}'), // JSON: { habitId: score, '_pomodoro': score, '_tasks': score }
  computedAt: text('computed_at').notNull().default(now()),
}, (t) => [
  index('idx_focus_corr_date').on(t.date),
])

export const userLevels = sqliteTable('user_levels', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  currentXp: integer('current_xp').notNull().default(0),
  level: integer('level').notNull().default(1),
  tier: text('tier', {
    enum: ['wood', 'iron', 'steel', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster']
  }).notNull().default('wood'),
  tierProgress: integer('tier_progress').notNull().default(0), // 0-100
  focusMode: text('focus_mode', { enum: ['pomodoro', 'focus'] }),
  nextUnlockLevel: integer('next_unlock_level').notNull().default(2),
  hasSeenOnboarding: integer('has_seen_onboarding', { mode: 'boolean' }).notNull().default(false),
  lastLevelUpAt: text('last_level_up_at'),
  createdAt: text('created_at').notNull().default(now()),
  updatedAt: text('updated_at').notNull().default(now()),
})

export const userProfiles = sqliteTable('user_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  displayName: text('display_name'),
  timezone: text('timezone').notNull().default('UTC'),
  createdAt: text('created_at').notNull().default(now()),
  updatedAt: text('updated_at').notNull().default(now()),
})

export const xpLogs = sqliteTable('xp_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().slice(0, 8)),
  xpAmount: integer('xp_amount').notNull(),
  source: text('source', {
    enum: ['pomodoro_session', 'focus_checkin', 'habit_completion', 'task_completion', 'daily_streak', 'first_win', 'level_up', 'onboarding']
  }).notNull(),
  description: text('description').notNull(),
  metadata: text('metadata'), // JSON: { sessionId, duration, etc. }
  createdAt: text('created_at').notNull().default(now()),
}, (t) => [
  index('idx_xp_source').on(t.source),
  index('idx_xp_created_at').on(t.createdAt),
])

// TypeScript types inferred from schema
export type Goal = typeof goals.$inferSelect
export type NewGoal = typeof goals.$inferInsert
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
export type Habit = typeof habits.$inferSelect
export type NewHabit = typeof habits.$inferInsert
export type HabitCompletion = typeof habitCompletions.$inferSelect
export type PomodoroSession = typeof pomodoroSessions.$inferSelect
export type StreakConfig = typeof streakConfig.$inferSelect
export type NewStreakConfig = typeof streakConfig.$inferInsert
export type Nudge = typeof nudges.$inferSelect
export type Device = typeof devices.$inferSelect
export type NewDevice = typeof devices.$inferInsert
export type BodyDoublingSession = typeof bodyDoublingSessions.$inferSelect
export type NewBodyDoublingSession = typeof bodyDoublingSessions.$inferInsert
export type VideoBodyDoublingSession = typeof videoBodyDoublingSessions.$inferSelect
export type NewVideoBodyDoublingSession = typeof videoBodyDoublingSessions.$inferInsert
export type VideoBodyDoublingParticipant = typeof videoBodyDoublingParticipants.$inferSelect
export type NewVideoBodyDoublingParticipant = typeof videoBodyDoublingParticipants.$inferInsert
export type LadderGoal = typeof ladderGoals.$inferSelect
export type NewLadderGoal = typeof ladderGoals.$inferInsert
export type LadderStep = typeof ladderSteps.$inferSelect
export type NewLadderStep = typeof ladderSteps.$inferInsert
export type DistractionLog = typeof distractionLogs.$inferSelect
export type NewDistractionLog = typeof distractionLogs.$inferInsert
export type FocusLog = typeof focusLogs.$inferSelect
export type NewFocusLog = typeof focusLogs.$inferInsert
export type FocusCorrelation = typeof focusCorrelations.$inferSelect
export type NewFocusCorrelation = typeof focusCorrelations.$inferInsert
export type UserLevel = typeof userLevels.$inferSelect
export type NewUserLevel = typeof userLevels.$inferInsert
export type UserProfile = typeof userProfiles.$inferSelect
export type NewUserProfile = typeof userProfiles.$inferInsert
export type XpLog = typeof xpLogs.$inferSelect
export type NewXpLog = typeof xpLogs.$inferInsert
