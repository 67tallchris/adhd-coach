import { Hono } from 'hono'
import { eq, sql, desc } from 'drizzle-orm'
import { getDb } from '../db/index'
import { pomodoroSessions, devices } from '../db/schema'
import { sendPomodoroCompleteNotification } from '../services/fcm'

type Env = { Bindings: { DB: D1Database } }
const router = new Hono<Env>()

// List recent sessions
router.get('/sessions', async (c) => {
  const db = getDb(c.env.DB)
  const limit = parseInt(c.req.query('limit') ?? '20', 10)
  const rows = await db.select().from(pomodoroSessions)
    .orderBy(desc(pomodoroSessions.startedAt))
    .limit(limit)
  return c.json(rows)
})

// Create session
router.post('/sessions', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{ taskId?: string; durationMin?: number }>()

  const [row] = await db.insert(pomodoroSessions).values({
    taskId: body.taskId,
    durationMin: body.durationMin ?? 25,
    startedAt: new Date().toISOString(),
  }).returning()

  return c.json(row, 201)
})

// Complete/abandon session
router.patch('/sessions/:id', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{ 
    completedAt?: string
    abandonedAt?: string
    actualDurationMin?: number
    notes?: string 
  }>()

  const updates: Record<string, unknown> = {}
  if (body.completedAt !== undefined) updates.completedAt = body.completedAt
  if (body.abandonedAt !== undefined) updates.abandonedAt = body.abandonedAt
  if (body.actualDurationMin !== undefined) updates.actualDurationMin = body.actualDurationMin
  if (body.notes !== undefined) updates.notes = body.notes

  const [row] = await db.update(pomodoroSessions)
    .set(updates)
    .where(eq(pomodoroSessions.id, c.req.param('id')))
    .returning()

  if (!row) return c.json({ error: 'not found' }, 404)

  // Send push notification if session was completed
  if (body.completedAt) {
    // Get all registered devices (for single-user app, send to all)
    const allDevices = await db.select({ fcmToken: devices.fcmToken }).from(devices)

    // Send notifications in parallel
    await Promise.all(
      allDevices.map(device =>
        sendPomodoroCompleteNotification(device.fcmToken, {
          id: row.id,
          durationMin: row.durationMin,
          taskId: row.taskId,
          completedAt: row.completedAt,
        })
      )
    )
  }

  return c.json(row)
})

// Stats
router.get('/stats', async (c) => {
  const db = getDb(c.env.DB)
  const today = new Date().toISOString().slice(0, 10)
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)

  // Completed sessions
  const [todayRow] = await db.select({ count: sql<number>`count(*)` })
    .from(pomodoroSessions)
    .where(sql`started_at >= ${today} AND completed_at IS NOT NULL`)

  const [weekRow] = await db.select({ count: sql<number>`count(*)` })
    .from(pomodoroSessions)
    .where(sql`started_at >= ${weekAgo} AND completed_at IS NOT NULL`)

  const [totalRow] = await db.select({ count: sql<number>`count(*)` })
    .from(pomodoroSessions)
    .where(sql`completed_at IS NOT NULL`)

  // Abandoned sessions
  const [todayAbandoned] = await db.select({ count: sql<number>`count(*)` })
    .from(pomodoroSessions)
    .where(sql`started_at >= ${today} AND abandoned_at IS NOT NULL`)

  const [weekAbandoned] = await db.select({ count: sql<number>`count(*)` })
    .from(pomodoroSessions)
    .where(sql`started_at >= ${weekAgo} AND abandoned_at IS NOT NULL`)

  const [totalAbandoned] = await db.select({ count: sql<number>`count(*)` })
    .from(pomodoroSessions)
    .where(sql`abandoned_at IS NOT NULL`)

  return c.json({
    today: todayRow.count,
    week: weekRow.count,
    total: totalRow.count,
    abandonedToday: todayAbandoned.count,
    abandonedWeek: weekAbandoned.count,
    abandonedTotal: totalAbandoned.count,
  })
})

export default router
