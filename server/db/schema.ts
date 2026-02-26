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
  snoozeUntil: text('snooze_until'),
  goalId: text('goal_id').references(() => goals.id),
  tags: text('tags').notNull().default('[]'),
  createdAt: text('created_at').notNull().default(now()),
  updatedAt: text('updated_at').notNull().default(now()),
  completedAt: text('completed_at'),
}, (t) => [
  index('idx_tasks_status').on(t.status),
  index('idx_tasks_snooze').on(t.snoozeUntil),
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
  notes: text('notes'),
}, (t) => [
  index('idx_pomo_started').on(t.startedAt),
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

// TypeScript types inferred from schema
export type Goal = typeof goals.$inferSelect
export type NewGoal = typeof goals.$inferInsert
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
export type Habit = typeof habits.$inferSelect
export type NewHabit = typeof habits.$inferInsert
export type HabitCompletion = typeof habitCompletions.$inferSelect
export type PomodoroSession = typeof pomodoroSessions.$inferSelect
export type Nudge = typeof nudges.$inferSelect
