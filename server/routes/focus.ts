import { Hono } from 'hono'
import { eq, sql, desc, and, gte, lte, lt } from 'drizzle-orm'
import { getDb } from '../db/index'
import { focusLogs, focusCorrelations, habitCompletions, pomodoroSessions, tasks } from '../db/schema'

type Env = { Bindings: { DB: D1Database } }
const router = new Hono<Env>()

// Log focus level
router.post('/', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{
    focusLevel: number
    notes?: string
    context?: { energy: string; sleep: string; mood: string[] }
  }>()

  if (!body.focusLevel || body.focusLevel < 1 || body.focusLevel > 5) {
    return c.json({ error: 'focusLevel must be between 1 and 5' }, 400)
  }

  const [log] = await db.insert(focusLogs).values({
    focusLevel: body.focusLevel,
    notes: body.notes || null,
    context: body.context ? JSON.stringify(body.context) : null,
  }).returning()

  return c.json(log, 201)
})

// Get today's focus logs
router.get('/today', async (c) => {
  const db = getDb(c.env.DB)
  const today = new Date().toISOString().slice(0, 10)

  const logs = await db.select()
    .from(focusLogs)
    .where(gte(focusLogs.timestamp, today))
    .orderBy(desc(focusLogs.timestamp))

  return c.json(logs)
})

// Get focus history
router.get('/history', async (c) => {
  const db = getDb(c.env.DB)
  const days = parseInt(c.req.query('days') || '30')
  const startDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)

  const logs = await db.select()
    .from(focusLogs)
    .where(gte(focusLogs.timestamp, startDate))
    .orderBy(desc(focusLogs.timestamp))

  return c.json(logs)
})

// Get daily aggregated focus data
router.get('/daily', async (c) => {
  const db = getDb(c.env.DB)
  const days = parseInt(c.req.query('days') || '30')
  const startDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)

  // Get daily average focus levels
  const dailyFocus = await db.select({
    date: sql<string>`date(timestamp)`,
    avgFocus: sql<number>`AVG(focus_level)`,
    logCount: sql<number>`COUNT(*)`,
  })
    .from(focusLogs)
    .where(gte(focusLogs.timestamp, startDate))
    .groupBy(sql`date(timestamp)`)
    .orderBy(sql`date(timestamp) DESC`)

  return c.json(dailyFocus)
})

// Get dashboard data with correlations
router.get('/dashboard', async (c) => {
  const db = getDb(c.env.DB)
  const today = new Date().toISOString().slice(0, 10)
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)

  // Today's logs
  const todayLogs = await db.select()
    .from(focusLogs)
    .where(gte(focusLogs.timestamp, today))
    .orderBy(desc(focusLogs.timestamp))

  // Yesterday's average
  const yesterdayStart = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const [yesterdayData] = await db.select({
    avgFocus: sql<number>`AVG(focus_level)`,
    logCount: sql<number>`COUNT(*)`,
  })
    .from(focusLogs)
    .where(and(
      gte(focusLogs.timestamp, yesterdayStart),
      lt(focusLogs.timestamp, today)
    ))

  // Past week daily averages
  const weekDaily = await db.select({
    date: sql<string>`date(timestamp)`,
    avgFocus: sql<number>`AVG(focus_level)`,
    logCount: sql<number>`COUNT(*)`,
  })
    .from(focusLogs)
    .where(gte(focusLogs.timestamp, weekAgo))
    .groupBy(sql`date(timestamp)`)
    .orderBy(sql`date(timestamp) DESC`)

  // Past month daily averages
  const monthDaily = await db.select({
    date: sql<string>`date(timestamp)`,
    avgFocus: sql<number>`AVG(focus_level)`,
    logCount: sql<number>`COUNT(*)`,
  })
    .from(focusLogs)
    .where(gte(focusLogs.timestamp, monthAgo))
    .groupBy(sql`date(timestamp)`)
    .orderBy(sql`date(timestamp) DESC`)

  // Get correlations (most recent)
  const correlations = await db.select()
    .from(focusCorrelations)
    .orderBy(desc(focusCorrelations.date))
    .limit(7)

  return c.json({
    today: {
      logs: todayLogs,
      avgFocus: todayLogs.length > 0
        ? todayLogs.reduce((sum, log) => sum + log.focusLevel, 0) / todayLogs.length
        : null,
    },
    yesterday: yesterdayData.avgFocus || null,
    weekDaily,
    monthDaily,
    correlations,
  })
})

// Helper function to compute correlations
function computeCorrelation(
  highFocusDays: Array<{ habits: string[]; pomodoro: number; tasks: number }>,
  lowFocusDays: Array<{ habits: string[]; pomodoro: number; tasks: number }>
): Record<string, number> {
  const scores: Record<string, number> = {}

  // Calculate P(habit | high focus) - P(habit | low focus)
  const highFocusCount = highFocusDays.length
  const lowFocusCount = lowFocusDays.length

  if (highFocusCount === 0 || lowFocusCount === 0) {
    return scores
  }

  // Collect all habit IDs
  const allHabitIds = new Set<string>()
  highFocusDays.forEach(d => d.habits.forEach(h => allHabitIds.add(h)))
  lowFocusDays.forEach(d => d.habits.forEach(h => allHabitIds.add(h)))

  // Calculate correlation for each habit
  allHabitIds.forEach(habitId => {
    const highFocusProb = highFocusDays.filter(d => d.habits.includes(habitId)).length / highFocusCount
    const lowFocusProb = lowFocusDays.filter(d => d.habits.includes(habitId)).length / lowFocusCount
    const score = highFocusProb - lowFocusProb
    if (Math.abs(score) > 0.1) {
      scores[habitId] = Math.round(score * 100) / 100
    }
  })

  // Calculate for pomodoro
  const highPomodoroAvg = highFocusDays.reduce((sum, d) => sum + d.pomodoro, 0) / highFocusCount
  const lowPomodoroAvg = lowFocusDays.reduce((sum, d) => sum + d.pomodoro, 0) / lowFocusCount
  const pomodoroScore = (highPomodoroAvg - lowPomodoroAvg) / Math.max(highPomodoroAvg, lowPomodoroAvg, 1)
  if (Math.abs(pomodoroScore) > 0.1) {
    scores['_pomodoro'] = Math.round(pomodoroScore * 100) / 100
  }

  // Calculate for tasks
  const highTasksAvg = highFocusDays.reduce((sum, d) => sum + d.tasks, 0) / highFocusCount
  const lowTasksAvg = lowFocusDays.reduce((sum, d) => sum + d.tasks, 0) / lowFocusCount
  const tasksScore = (highTasksAvg - lowTasksAvg) / Math.max(highTasksAvg, lowTasksAvg, 1)
  if (Math.abs(tasksScore) > 0.1) {
    scores['_tasks'] = Math.round(tasksScore * 100) / 100
  }

  return scores
}

// Compute and store correlations
router.post('/compute-correlations', async (c) => {
  const db = getDb(c.env.DB)
  const days = parseInt(c.req.query('days') || '30')
  const startDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)

  // Get all daily focus averages
  const dailyFocus = await db.select({
    date: sql<string>`date(timestamp)`,
    avgFocus: sql<number>`AVG(focus_level)`,
  })
    .from(focusLogs)
    .where(gte(focusLogs.timestamp, startDate))
    .groupBy(sql`date(timestamp)`)
    .orderBy(sql`date(timestamp)`)

  if (dailyFocus.length < 5) {
    return c.json({
      message: 'Not enough data yet. Need at least 5 days of focus logs.',
      daysCollected: dailyFocus.length,
    })
  }

  // Sort by focus level and get top 25% (high) and bottom 25% (low)
  const sortedByFocus = [...dailyFocus].sort((a, b) => (a.avgFocus as number) - (b.avgFocus as number))
  const threshold = Math.ceil(sortedByFocus.length * 0.25)
  const lowFocusDays = sortedByFocus.slice(0, threshold)
  const highFocusDays = sortedByFocus.slice(-threshold)

  // For each day, get habits completed, pomodoro sessions, tasks completed
  async function getDayData(date: string) {
    const [habitsResult] = await db.select({
      habits: sql<string[]>`COALESCE((
        SELECT JSON_GROUP_ARRAY(habit_id)
        FROM (
          SELECT DISTINCT habit_id
          FROM habit_completions
          WHERE date = ${date}
        )
      ), JSON('[]'))`,
    })

    const [pomodoroResult] = await db.select({
      count: sql<number>`COUNT(*)`,
    })
      .from(pomodoroSessions)
      .where(and(
        gte(pomodoroSessions.startedAt, date),
        lt(pomodoroSessions.startedAt, new Date(new Date(date).getTime() + 86400000).toISOString().slice(0, 10)),
        sql`${pomodoroSessions.completedAt} IS NOT NULL`
      ))

    const [tasksResult] = await db.select({
      count: sql<number>`COUNT(*)`,
    })
      .from(tasks)
      .where(and(
        gte(tasks.completedAt, date),
        lt(tasks.completedAt, new Date(new Date(date).getTime() + 86400000).toISOString().slice(0, 10)),
        eq(tasks.status, 'done')
      ))

    return {
      habits: JSON.parse(habitsResult.habits as string) || [],
      pomodoro: pomodoroResult?.count || 0,
      tasks: tasksResult?.count || 0,
    }
  }

  const highFocusData: Array<{ habits: string[]; pomodoro: number; tasks: number }> = []
  const lowFocusData: Array<{ habits: string[]; pomodoro: number; tasks: number }> = []

  for (const day of highFocusDays) {
    highFocusData.push(await getDayData(day.date as string))
  }

  for (const day of lowFocusDays) {
    lowFocusData.push(await getDayData(day.date as string))
  }

  const correlationScores = computeCorrelation(highFocusData, lowFocusData)

  // Store for each day
  for (const day of dailyFocus) {
    const dayData = await getDayData(day.date as string)
    await db.insert(focusCorrelations).values({
      date: day.date as string,
      avgFocusLevel: Math.round((day.avgFocus as number) * 10),
      habitsCompleted: JSON.stringify(dayData.habits),
      pomodoroSessions: dayData.pomodoro,
      tasksCompleted: dayData.tasks,
      correlationScores: JSON.stringify(correlationScores),
    }).onConflictDoUpdate({
      target: focusCorrelations.date,
      set: {
        avgFocusLevel: Math.round((day.avgFocus as number) * 10),
        habitsCompleted: JSON.stringify(dayData.habits),
        pomodoroSessions: dayData.pomodoro,
        tasksCompleted: dayData.tasks,
        correlationScores: JSON.stringify(correlationScores),
        computedAt: sql`(datetime('now'))`,
      },
    })
  }

  return c.json({
    message: 'Correlations computed successfully',
    daysAnalyzed: dailyFocus.length,
    highFocusDays: highFocusData.length,
    lowFocusDays: lowFocusData.length,
    correlationScores,
  })
})

// Get insights with correlations
router.get('/insights', async (c) => {
  const db = getDb(c.env.DB)
  const days = parseInt(c.req.query('days') || '30')
  const startDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)

  // Get overall average focus
  const [avgResult] = await db.select({
    avgFocus: sql<number>`AVG(focus_level)`,
  })
    .from(focusLogs)
    .where(gte(focusLogs.timestamp, startDate))

  // Get high focus days (above average) and low focus days (below average)
  const avgFocus = avgResult?.avgFocus || 3

  const [highFocusCount] = await db.select({
    count: sql<number>`COUNT(DISTINCT date(timestamp))`,
  })
    .from(focusLogs)
    .where(and(
      gte(focusLogs.timestamp, startDate),
      sql`focus_level > ${avgFocus}`
    ))

  const [lowFocusCount] = await db.select({
    count: sql<number>`COUNT(DISTINCT date(timestamp))`,
  })
    .from(focusLogs)
    .where(and(
      gte(focusLogs.timestamp, startDate),
      sql`focus_level < ${avgFocus}`
    ))

  // Get daily aggregated data
  const dailyLogs = await db.select({
    date: sql<string>`date(timestamp)`,
    avgFocus: sql<number>`AVG(focus_level)`,
    logCount: sql<number>`COUNT(*)`,
  })
    .from(focusLogs)
    .where(gte(focusLogs.timestamp, startDate))
    .groupBy(sql`date(timestamp)`)
    .orderBy(sql`date(timestamp) DESC`)

  // Get correlations
  const correlations = await db.select()
    .from(focusCorrelations)
    .orderBy(desc(focusCorrelations.computedAt))
    .limit(1)

  // Parse correlation scores and format
  let topCorrelations: Array<{ id: string; label: string; score: number; type: 'habit' | 'pomodoro' | 'tasks'; description: string }> = []

  if (correlations.length > 0) {
    const scores = JSON.parse(correlations[0].correlationScores || '{}') as Record<string, number>
    const habitIds = Object.keys(scores).filter(k => !k.startsWith('_'))

    // Get habit names
    if (habitIds.length > 0) {
      const habits = await db.select()
        .from(sql`habits`)
        .where(sql`id IN (${habitIds.map(id => `'${id}'`).join(',')})`)

      const habitMap = Object.fromEntries(habits.map((h: any) => [h.id, h.title]))

      topCorrelations = Object.entries(scores)
        .map(([key, score]) => {
          if (key === '_pomodoro') {
            return {
              id: '_pomodoro',
              label: 'Pomodoro sessions',
              score,
              type: 'pomodoro' as const,
              description: score > 0
                ? `More sessions on high-focus days (${score > 0.3 ? 'strong' : 'moderate'} correlation)`
                : 'Fewer sessions on high-focus days',
            }
          }
          if (key === '_tasks') {
            return {
              id: '_tasks',
              label: 'Tasks completed',
              score,
              type: 'tasks' as const,
              description: score > 0
                ? `More tasks checked off on high-focus days (${score > 0.3 ? 'strong' : 'moderate'} correlation)`
                : 'Fewer tasks on high-focus days',
            }
          }
          return {
            id: key,
            label: habitMap[key] || 'Unknown habit',
            score,
            type: 'habit' as const,
            description: score > 0
              ? `Associated with ${Math.abs(score) * 100}% higher chance of high focus`
              : `Associated with ${Math.abs(score) * 100}% lower chance of high focus`,
          }
        })
        .filter(c => c.score !== 0)
        .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
        .slice(0, 5)
    }
  }

  return c.json({
    avgFocusLevel: Math.round((avgFocus || 0) * 10) / 10,
    highFocusDays: highFocusCount?.count || 0,
    lowFocusDays: lowFocusCount?.count || 0,
    topCorrelations,
    dailyLogs: dailyLogs.map((d: any) => ({
      date: d.date,
      avgFocus: Math.round(d.avgFocus * 10) / 10,
      logCount: d.logCount,
    })),
  })
})

// Delete a focus log
router.delete('/:id', async (c) => {
  const db = getDb(c.env.DB)
  await db.delete(focusLogs).where(eq(focusLogs.id, c.req.param('id')))
  return c.json({ ok: true })
})

export default router
