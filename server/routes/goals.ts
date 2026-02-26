import { Hono } from 'hono'
import { eq, count, sql } from 'drizzle-orm'
import { getDb } from '../db/index'
import { goals, tasks, habits } from '../db/schema'

type Env = { Bindings: { DB: D1Database } }
const router = new Hono<Env>()

// List goals
router.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const status = c.req.query('status') as 'active' | 'completed' | 'archived' | undefined
  const rows = await db.select().from(goals)
    .where(status ? eq(goals.status, status) : undefined)
    .orderBy(sql`created_at ASC`)
  return c.json(rows)
})

// Create goal
router.post('/', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{
    title: string
    description?: string
    targetDate?: string
  }>()

  if (!body.title?.trim()) return c.json({ error: 'title is required' }, 400)

  const [row] = await db.insert(goals).values({
    title: body.title.trim(),
    description: body.description,
    targetDate: body.targetDate,
  }).returning()

  return c.json(row, 201)
})

// Get goal with linked counts
router.get('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const [goal] = await db.select().from(goals).where(eq(goals.id, c.req.param('id')))
  if (!goal) return c.json({ error: 'not found' }, 404)

  const [taskCount] = await db.select({ count: count() }).from(tasks)
    .where(eq(tasks.goalId, goal.id))
  const [habitCount] = await db.select({ count: count() }).from(habits)
    .where(eq(habits.goalId, goal.id))

  return c.json({ ...goal, taskCount: taskCount.count, habitCount: habitCount.count })
})

// Update goal
router.patch('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<Partial<{
    title: string
    description: string
    status: 'active' | 'completed' | 'archived'
    targetDate: string | null
  }>>()

  const updates: Record<string, unknown> = { updatedAt: sql`(datetime('now'))` }
  if (body.title !== undefined) updates.title = body.title.trim()
  if (body.description !== undefined) updates.description = body.description
  if (body.status !== undefined) updates.status = body.status
  if (body.targetDate !== undefined) updates.targetDate = body.targetDate

  const [row] = await db.update(goals).set(updates)
    .where(eq(goals.id, c.req.param('id')))
    .returning()

  if (!row) return c.json({ error: 'not found' }, 404)
  return c.json(row)
})

export default router
