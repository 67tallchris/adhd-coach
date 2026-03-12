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
  const body = await c.req.json<{ completedAt?: string; notes?: string }>()

  const [row] = await db.update(pomodoroSessions)
    .set({
      completedAt: body.completedAt ?? new Date().toISOString(),
      notes: body.notes,
    })
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

  const [todayRow] = await db.select({ count: sql<number>`count(*)` })
    .from(pomodoroSessions)
    .where(sql`started_at >= ${today} AND completed_at IS NOT NULL`)

  const [weekRow] = await db.select({ count: sql<number>`count(*)` })
    .from(pomodoroSessions)
    .where(sql`started_at >= ${weekAgo} AND completed_at IS NOT NULL`)

  const [totalRow] = await db.select({ count: sql<number>`count(*)` })
    .from(pomodoroSessions)
    .where(sql`completed_at IS NOT NULL`)

  return c.json({
    today: todayRow.count,
    week: weekRow.count,
    total: totalRow.count,
  })
})

export default router
