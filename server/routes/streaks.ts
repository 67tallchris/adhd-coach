import { Hono } from 'hono'
import { eq, sql, and, gte } from 'drizzle-orm'
import { getDb } from '../db/index'
import { pomodoroSessions, habitCompletions, tasks, streakConfig } from '../db/schema'

type Env = { Bindings: { DB: D1Database } }
const router = new Hono<Env>()

// Helper: get start of current week (Monday)
function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = (day === 0 ? -6 : 1) - day // Adjust to Monday
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + diff)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart.toISOString().slice(0, 10)
}

// Helper: get start of last week
function getLastWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = (day === 0 ? -6 : 1) - day - 7
  const lastWeekStart = new Date(now)
  lastWeekStart.setDate(now.getDate() + diff)
  lastWeekStart.setHours(0, 0, 0, 0)
  return lastWeekStart.toISOString().slice(0, 10)
}

// Get streak stats for pomodoro
router.get('/pomodoro', async (c) => {
  const db = getDb(c.env.DB)
  const weekStart = getWeekStart()
  const lastWeekStart = getLastWeekStart()

  // Get config
  const [config] = await db.select().from(streakConfig).where(eq(streakConfig.type, 'pomodoro'))
  const weeklyGoal = config?.weeklyGoal ?? 5

  // Current week sessions
  const [currentWeekResult] = await db.select({ count: sql<number>`count(*)` })
    .from(pomodoroSessions)
    .where(and(
      gte(pomodoroSessions.startedAt, weekStart),
      sql`${pomodoroSessions.completedAt} IS NOT NULL`
    ))

  // Last week sessions (for "last week" summary)
  const [lastWeekResult] = await db.select({ count: sql<number>`count(*)` })
    .from(pomodoroSessions)
    .where(and(
      gte(pomodoroSessions.startedAt, lastWeekStart),
      sql`${pomodoroSessions.startedAt} < ${weekStart}`,
      sql`${pomodoroSessions.completedAt} IS NOT NULL`
    ))

  // All-time sessions
  const [totalResult] = await db.select({ count: sql<number>`count(*)` })
    .from(pomodoroSessions)
    .where(sql`${pomodoroSessions.completedAt} IS NOT NULL`)

  // Best week (personal best)
  const [bestWeekResult] = await db.select({ 
    count: sql<number>`count(*)`,
    week: sql<string>`strftime('%Y-%W', startedAt)`
  })
    .from(pomodoroSessions)
    .where(sql`${pomodoroSessions.completedAt} IS NOT NULL`)
    .groupBy(sql`week`)
    .orderBy(sql`count(*) DESC`)
    .limit(1)

  const currentCount = currentWeekResult?.count ?? 0
  const lastWeekCount = lastWeekResult?.count ?? 0
  const totalCount = totalResult?.count ?? 0
  const bestWeekCount = bestWeekResult?.count ?? 0

  const progress = weeklyGoal > 0 ? Math.min((currentCount / weeklyGoal) * 100, 100) : 0
  const isOnTrack = currentCount >= weeklyGoal

  // Milestones
  const milestones = [5, 10, 25, 50, 100].map((sessions) => ({
    sessions,
    unlocked: totalCount >= sessions,
  }))

  return c.json({
    currentStreak: currentCount,
    weeklyGoal,
    progress,
    isOnTrack,
    bestStreak: bestWeekCount,
    totalSessions: totalCount,
    lastWeekCount,
    milestones,
  })
})

// Get streak stats for habits
router.get('/habits', async (c) => {
  const db = getDb(c.env.DB)
  const weekStart = getWeekStart()
  const lastWeekStart = getLastWeekStart()
  const today = new Date().toISOString().slice(0, 10)

  // Get config
  const [config] = await db.select().from(streakConfig).where(eq(streakConfig.type, 'habits'))
  const weeklyGoal = config?.weeklyGoal ?? 5

  // Current week completions (unique dates)
  const currentWeekCompletions = await db.select({ date: habitCompletions.date })
    .from(habitCompletions)
    .where(gte(habitCompletions.date, weekStart))
  
  const uniqueDates = new Set(currentWeekCompletions.map(c => c.date))
  const currentCount = uniqueDates.size

  // Last week completions
  const lastWeekCompletions = await db.select({ date: habitCompletions.date })
    .from(habitCompletions)
    .where(and(
      gte(habitCompletions.date, lastWeekStart),
      sql`${habitCompletions.date} < ${weekStart}`
    ))
  
  const lastWeekUniqueDates = new Set(lastWeekCompletions.map(c => c.date))
  const lastWeekCount = lastWeekUniqueDates.size

  // All-time completions (unique dates)
  const allCompletions = await db.select({ date: habitCompletions.date }).from(habitCompletions)
  const totalCount = new Set(allCompletions.map(c => c.date)).size

  // Best week
  const bestWeekResult = await db.select({
    count: sql<number>`count(distinct date)`,
  })
    .from(habitCompletions)
    .groupBy(sql`strftime('%Y-%W', date)`)
    .orderBy(sql`count(distinct date) DESC`)
    .limit(1)

  const bestWeekCount = bestWeekResult[0] ? (bestWeekResult[0].count as unknown as number) ?? 0 : 0

  // Current day streak (consecutive days including today)
  const allDates = [...new Set(allCompletions.map(c => c.date))].sort().reverse()
  let currentDayStreak = 0
  const checkDate = new Date(today)
  
  for (const dateStr of allDates) {
    const expectedStr = checkDate.toISOString().slice(0, 10)
    if (dateStr === expectedStr) {
      currentDayStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (dateStr < expectedStr) {
      break
    }
  }

  const progress = weeklyGoal > 0 ? Math.min((currentCount / weeklyGoal) * 100, 100) : 0

  // Milestones
  const milestones = [5, 10, 25, 50, 100].map(sessions => ({
    sessions,
    unlocked: totalCount >= sessions,
  }))

  return c.json({
    currentStreak: currentDayStreak,
    weeklyGoal,
    progress,
    isOnTrack: currentCount >= weeklyGoal,
    bestStreak: bestWeekCount,
    totalSessions: totalCount,
    lastWeekCount,
    milestones,
    completionsThisWeek: currentCount,
  })
})

// Get streak stats for tasks
router.get('/tasks', async (c) => {
  const db = getDb(c.env.DB)
  const weekStart = getWeekStart()
  const lastWeekStart = getLastWeekStart()

  // Get config
  const [config] = await db.select().from(streakConfig).where(eq(streakConfig.type, 'tasks'))
  const weeklyGoal = config?.weeklyGoal ?? 10

  // Current week completed tasks
  const [currentWeekResult] = await db.select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(and(
      gte(tasks.completedAt, weekStart),
      eq(tasks.status, 'done')
    ))

  // Last week completed tasks
  const [lastWeekResult] = await db.select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(and(
      gte(tasks.completedAt, lastWeekStart),
      sql`${tasks.completedAt} < ${weekStart}`,
      eq(tasks.status, 'done')
    ))

  // All-time completed tasks
  const [totalResult] = await db.select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(eq(tasks.status, 'done'))

  // Best week
  const [bestWeekResult] = await db.select({ 
    count: sql<number>`count(*)`,
  })
    .from(tasks)
    .where(eq(tasks.status, 'done'))
    .groupBy(sql`strftime('%Y-%W', completed_at)`)
    .orderBy(sql`count(*) DESC`)
    .limit(1)

  const currentCount = currentWeekResult?.count ?? 0
  const lastWeekCount = lastWeekResult?.count ?? 0
  const totalCount = totalResult?.count ?? 0
  const bestWeekCount = bestWeekResult?.count ?? 0

  const progress = weeklyGoal > 0 ? Math.min((currentCount / weeklyGoal) * 100, 100) : 0

  // Milestones
  const milestones = [10, 25, 50, 100, 250].map(sessions => ({
    sessions,
    unlocked: totalCount >= sessions,
  }))

  return c.json({
    currentStreak: currentCount,
    weeklyGoal,
    progress,
    isOnTrack: currentCount >= weeklyGoal,
    bestStreak: bestWeekCount,
    totalSessions: totalCount,
    lastWeekCount,
    milestones,
  })
})

// Update weekly goal
router.patch('/goal', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{ type: 'pomodoro' | 'habits' | 'tasks'; weeklyGoal: number }>()

  if (!body.type || !body.weeklyGoal) {
    return c.json({ error: 'type and weeklyGoal are required' }, 400)
  }

  const [updated] = await db.update(streakConfig)
    .set({ 
      weeklyGoal: body.weeklyGoal,
      updatedAt: sql`(datetime('now'))`
    })
    .where(eq(streakConfig.type, body.type))
    .returning()

  if (!updated) {
    // Create if doesn't exist
    const [created] = await db.insert(streakConfig).values({
      type: body.type,
      weeklyGoal: body.weeklyGoal,
    }).returning()
    return c.json(created)
  }

  return c.json(updated)
})

// Get all streak configs
router.get('/config', async (c) => {
  const db = getDb(c.env.DB)
  const configs = await db.select().from(streakConfig)
  return c.json(configs)
})

export default router
