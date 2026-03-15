import { Hono } from 'hono'
import { eq, and, sql } from 'drizzle-orm'
import { getDb } from '../db/index'
import { tasks, devices } from '../db/schema'
import { sendTaskReminderNotification } from '../services/fcm'

type Env = { Bindings: { DB: D1Database } }

const router = new Hono<Env>()

// List tasks
router.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const status = c.req.query('status')
  const goalId = c.req.query('goal_id')
  const tag = c.req.query('tag')

  const conditions = []
  if (status) conditions.push(eq(tasks.status, status as 'inbox' | 'snoozed' | 'done'))
  if (goalId) conditions.push(eq(tasks.goalId, goalId))

  let rows = await db.select().from(tasks)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(sql`CASE status WHEN 'inbox' THEN 0 WHEN 'snoozed' THEN 1 ELSE 2 END, created_at ASC`)

  // Filter by tag in JS (JSON array in SQLite)
  if (tag) {
    rows = rows.filter(t => {
      try { return (JSON.parse(t.tags) as string[]).includes(tag) }
      catch { return false }
    })
  }

  return c.json(rows)
})

// Create task
router.post('/', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{
    title: string
    notes?: string
    priority?: 'low' | 'medium' | 'high'
    goalId?: string
    tags?: string[]
    dueDate?: string
    dueTime?: string
  }>()

  if (!body.title?.trim()) return c.json({ error: 'title is required' }, 400)

  const [row] = await db.insert(tasks).values({
    title: body.title.trim(),
    notes: body.notes,
    priority: body.priority ?? 'medium',
    goalId: body.goalId,
    tags: JSON.stringify(body.tags ?? []),
    dueDate: body.dueDate,
    dueTime: body.dueTime,
  }).returning()

  return c.json(row, 201)
})

// Get single task
router.get('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const [row] = await db.select().from(tasks).where(eq(tasks.id, c.req.param('id')))
  if (!row) return c.json({ error: 'not found' }, 404)
  return c.json(row)
})

// Update task
router.patch('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<Partial<{
    title: string
    notes: string
    status: 'inbox' | 'snoozed' | 'done'
    priority: 'low' | 'medium' | 'high'
    goalId: string | null
    tags: string[]
    snoozeUntil: string | null
    dueDate: string | null
    dueTime: string | null
  }>>()

  const updates: Record<string, unknown> = {
    updatedAt: sql`(datetime('now'))`,
  }
  if (body.title !== undefined) updates.title = body.title.trim()
  if (body.notes !== undefined) updates.notes = body.notes
  if (body.status !== undefined) updates.status = body.status
  if (body.priority !== undefined) updates.priority = body.priority
  if (body.goalId !== undefined) updates.goalId = body.goalId
  if (body.tags !== undefined) updates.tags = JSON.stringify(body.tags)
  if (body.snoozeUntil !== undefined) updates.snoozeUntil = body.snoozeUntil
  if (body.dueDate !== undefined) updates.dueDate = body.dueDate
  if (body.dueTime !== undefined) updates.dueTime = body.dueTime

  const [row] = await db.update(tasks)
    .set(updates)
    .where(eq(tasks.id, c.req.param('id')))
    .returning()

  if (!row) return c.json({ error: 'not found' }, 404)
  return c.json(row)
})

// Delete task
router.delete('/:id', async (c) => {
  const db = getDb(c.env.DB)
  await db.delete(tasks).where(eq(tasks.id, c.req.param('id')))
  return c.json({ ok: true })
})

// Snooze task
router.post('/:id/snooze', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{ until: string }>()
  if (!body.until) return c.json({ error: 'until is required' }, 400)

  const [row] = await db.update(tasks)
    .set({ status: 'snoozed', snoozeUntil: body.until, updatedAt: sql`(datetime('now'))` })
    .where(eq(tasks.id, c.req.param('id')))
    .returning()

  if (!row) return c.json({ error: 'not found' }, 404)
  return c.json(row)
})

// Complete task
router.post('/:id/complete', async (c) => {
  const db = getDb(c.env.DB)
  const [row] = await db.update(tasks)
    .set({
      status: 'done',
      completedAt: sql`(datetime('now'))`,
      updatedAt: sql`(datetime('now'))`,
    })
    .where(eq(tasks.id, c.req.param('id')))
    .returning()

  if (!row) return c.json({ error: 'not found' }, 404)
  return c.json(row)
})

// Send task reminder (manual trigger)
router.post('/:id/remind', async (c) => {
  const db = getDb(c.env.DB)
  const [task] = await db.select().from(tasks).where(eq(tasks.id, c.req.param('id')))
  
  if (!task) return c.json({ error: 'not found' }, 404)

  // Get all registered devices
  const allDevices = await db.select({ fcmToken: devices.fcmToken }).from(devices)
  
  // Send notifications
  await Promise.all(
    allDevices.map(device =>
      sendTaskReminderNotification(device.fcmToken, {
        id: task.id,
        title: task.title,
        description: task.notes,
        dueDate: null,
      })
    )
  )

  return c.json({ ok: true, sent: allDevices.length })
})

export default router
