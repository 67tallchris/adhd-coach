import { Hono } from 'hono'
import { eq, and, sql } from 'drizzle-orm'
import { getDb } from '../db/index'
import { habits, habitCompletions } from '../db/schema'

type Env = { Bindings: { DB: D1Database } }
const router = new Hono<Env>()

// List habits with today's completion status
router.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const today = new Date().toISOString().slice(0, 10)

  const rows = await db.select().from(habits).where(eq(habits.isActive, true))
  const completions = await db.select()
    .from(habitCompletions)
    .where(eq(habitCompletions.date, today))

  const completedIds = new Set(completions.map(c => c.habitId))
  return c.json(rows.map(h => ({ ...h, completedToday: completedIds.has(h.id) })))
})

// Create habit
router.post('/', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{ title: string; description?: string; goalId?: string }>()
  if (!body.title?.trim()) return c.json({ error: 'title is required' }, 400)

  const [row] = await db.insert(habits).values({
    title: body.title.trim(),
    description: body.description,
    goalId: body.goalId,
  }).returning()

  return c.json(row, 201)
})

// Update habit
router.patch('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<Partial<{
    title: string
    description: string
    goalId: string | null
    isActive: boolean
  }>>()

  const updates: Record<string, unknown> = {}
  if (body.title !== undefined) updates.title = body.title.trim()
  if (body.description !== undefined) updates.description = body.description
  if (body.goalId !== undefined) updates.goalId = body.goalId
  if (body.isActive !== undefined) updates.isActive = body.isActive

  const [row] = await db.update(habits).set(updates)
    .where(eq(habits.id, c.req.param('id')))
    .returning()

  if (!row) return c.json({ error: 'not found' }, 404)
  return c.json(row)
})

// Deactivate habit
router.delete('/:id', async (c) => {
  const db = getDb(c.env.DB)
  await db.update(habits).set({ isActive: false }).where(eq(habits.id, c.req.param('id')))
  return c.json({ ok: true })
})

// Check habit for a date
router.post('/:id/check', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{ date?: string }>()
  const date = body.date ?? new Date().toISOString().slice(0, 10)

  await db.insert(habitCompletions).values({
    habitId: c.req.param('id'),
    date,
  }).onConflictDoNothing()

  return c.json({ ok: true, date })
})

// Uncheck habit for a date
router.delete('/:id/check', async (c) => {
  const db = getDb(c.env.DB)
  const date = c.req.query('date') ?? new Date().toISOString().slice(0, 10)

  await db.delete(habitCompletions)
    .where(and(
      eq(habitCompletions.habitId, c.req.param('id')),
      eq(habitCompletions.date, date),
    ))

  return c.json({ ok: true })
})

// Get streak for a habit
router.get('/:id/streak', async (c) => {
  const db = getDb(c.env.DB)
  const rows = await db.select({ date: habitCompletions.date })
    .from(habitCompletions)
    .where(eq(habitCompletions.habitId, c.req.param('id')))
    .orderBy(sql`date DESC`)

  const dates = new Set(rows.map(r => r.date))
  const today = new Date()

  function toDateStr(d: Date) {
    return d.toISOString().slice(0, 10)
  }

  // Current streak: count consecutive days backward from today
  let currentStreak = 0
  const cursor = new Date(today)
  while (dates.has(toDateStr(cursor))) {
    currentStreak++
    cursor.setDate(cursor.getDate() - 1)
  }

  // Longest streak: iterate all dates sorted
  const sortedDates = [...dates].sort()
  let longest = 0
  let run = 0
  let prev: Date | null = null
  for (const d of sortedDates) {
    const curr = new Date(d)
    if (prev) {
      const diff = (curr.getTime() - prev.getTime()) / 86400000
      run = diff === 1 ? run + 1 : 1
    } else {
      run = 1
    }
    if (run > longest) longest = run
    prev = curr
  }

  return c.json({ currentStreak, longestStreak: longest, totalDays: dates.size })
})

export default router
