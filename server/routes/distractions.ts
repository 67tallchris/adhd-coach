import { Hono } from 'hono'
import { eq, sql, desc } from 'drizzle-orm'
import { getDb } from '../db/index'
import { distractionLogs } from '../db/schema'

type Env = { Bindings: { DB: D1Database } }
const router = new Hono<Env>()

// Log a distraction
router.post('/', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{
    sessionId: string
    distractionType: 'internal' | 'external' | 'urgent' | 'overwhelm' | 'boredom' | 'rabbit-hole'
    notes?: string
    action: 'resumed' | 'restarted' | 'abandoned' | 'took_break'
    timeElapsed: number
  }>()

  if (!body.sessionId || !body.distractionType || !body.action) {
    return c.json({ error: 'sessionId, distractionType, and action are required' }, 400)
  }

  const [log] = await db.insert(distractionLogs).values({
    sessionId: body.sessionId,
    distractionType: body.distractionType,
    notes: body.notes,
    action: body.action,
    timeElapsed: body.timeElapsed,
  }).returning()

  return c.json(log, 201)
})

// Get distraction logs for a session
router.get('/session/:sessionId', async (c) => {
  const db = getDb(c.env.DB)
  const logs = await db.select()
    .from(distractionLogs)
    .where(eq(distractionLogs.sessionId, c.req.param('sessionId')))
    .orderBy(desc(distractionLogs.timestamp))

  return c.json(logs)
})

// Get distraction insights/stats
router.get('/insights', async (c) => {
  const db = getDb(c.env.DB)
  const limit = parseInt(c.req.query('limit') || '50')

  // Get recent distractions
  const recentLogs = await db.select()
    .from(distractionLogs)
    .orderBy(desc(distractionLogs.timestamp))
    .limit(limit)

  // Get distraction type counts
  const typeCounts = await db.select({
    type: distractionLogs.distractionType,
    count: sql<number>`count(*)`
  })
    .from(distractionLogs)
    .groupBy(distractionLogs.distractionType)

  // Get action counts
  const actionCounts = await db.select({
    action: distractionLogs.action,
    count: sql<number>`count(*)`
  })
    .from(distractionLogs)
    .groupBy(distractionLogs.action)

  // Get average time to distraction
  const avgTimeResult = await db.select({
    avgTime: sql<number>`AVG(time_elapsed)`
  })
    .from(distractionLogs)

  // Get distractions by hour of day (to find patterns)
  const hourDistribution = await db.select({
    hour: sql<string>`strftime('%H', timestamp)`
  })
    .from(distractionLogs)

  // Count distractions per hour
  const hourCounts: Record<string, number> = {}
  hourDistribution.forEach(row => {
    const hour = row.hour as string
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })

  // Find peak distraction hour
  let peakHour = null
  let peakCount = 0
  Object.entries(hourCounts).forEach(([hour, count]) => {
    if (count > peakCount) {
      peakHour = hour
      peakCount = count
    }
  })

  // Get total count
  const [totalResult] = await db.select({
    count: sql<number>`count(*)`
  })
    .from(distractionLogs)

  return c.json({
    total: totalResult?.count ?? 0,
    recentLogs,
    byType: typeCounts.reduce((acc, row) => {
      acc[row.type as string] = row.count
      return acc
    }, {} as Record<string, number>),
    byAction: actionCounts.reduce((acc, row) => {
      acc[row.action as string] = row.count
      return acc
    }, {} as Record<string, number>),
    averageTimeToDistraction: Math.round(avgTimeResult[0]?.avgTime as number ?? 0),
    peakDistractionHour: peakHour ? `${peakHour}:00` : null,
    peakDistractionCount: peakCount,
  })
})

// Delete a distraction log
router.delete('/:id', async (c) => {
  const db = getDb(c.env.DB)
  await db.delete(distractionLogs).where(eq(distractionLogs.id, c.req.param('id')))
  return c.json({ ok: true })
})

export default router
