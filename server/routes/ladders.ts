import { Hono } from 'hono'
import { eq, and, sql, desc } from 'drizzle-orm'
import { getDb } from '../db/index'
import { ladderGoals, ladderSteps } from '../db/schema'

type Env = { Bindings: { DB: D1Database } }

const router = new Hono<Env>()

// List all ladders
router.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const status = c.req.query('status')

  const conditions = []
  if (status) conditions.push(eq(ladderGoals.status, status as 'active' | 'completed' | 'archived'))

  const ladders = await db.select()
    .from(ladderGoals)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(ladderGoals.createdAt))

  // Get steps for each ladder
  const laddersWithSteps = await Promise.all(
    ladders.map(async (ladder) => {
      const steps = await db.select()
        .from(ladderSteps)
        .where(eq(ladderSteps.ladderId, ladder.id))
        .orderBy(ladderSteps.stepNumber)
      return { ...ladder, steps }
    })
  )

  return c.json(laddersWithSteps)
})

// Get single ladder with steps
router.get('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const [ladder] = await db.select()
    .from(ladderGoals)
    .where(eq(ladderGoals.id, c.req.param('id')))

  if (!ladder) return c.json({ error: 'not found' }, 404)

  const steps = await db.select()
    .from(ladderSteps)
    .where(eq(ladderSteps.ladderId, ladder.id))
    .orderBy(ladderSteps.stepNumber)

  return c.json({ ...ladder, steps })
})

// Create new ladder
router.post('/', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{
    title: string
    description?: string
    taskId?: string
    goalId?: string
    steps?: Array<{
      stepNumber: number
      title: string
      notes?: string
    }>
  }>()

  if (!body.title?.trim()) return c.json({ error: 'title is required' }, 400)

  // Create ladder goal
  const [ladder] = await db.insert(ladderGoals).values({
    title: body.title.trim(),
    description: body.description,
    taskId: body.taskId,
    goalId: body.goalId,
  }).returning()

  // Create initial steps if provided
  if (body.steps && body.steps.length > 0) {
    const stepsToInsert = body.steps.map((step) => ({
      ladderId: ladder.id,
      stepNumber: step.stepNumber,
      title: step.title.trim(),
      notes: step.notes,
    }))
    await db.insert(ladderSteps).values(stepsToInsert)
  }

  // Fetch ladder with steps
  const steps = await db.select()
    .from(ladderSteps)
    .where(eq(ladderSteps.ladderId, ladder.id))
    .orderBy(ladderSteps.stepNumber)

  return c.json({ ...ladder, steps }, 201)
})

// Update ladder
router.patch('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<Partial<{
    title: string
    description: string
    status: 'active' | 'completed' | 'archived'
    taskId: string | null
    goalId: string | null
  }>>()

  const updates: Record<string, unknown> = {
    updatedAt: sql`(datetime('now'))`,
  }
  if (body.title !== undefined) updates.title = body.title.trim()
  if (body.description !== undefined) updates.description = body.description
  if (body.status !== undefined) updates.status = body.status
  if (body.taskId !== undefined) updates.taskId = body.taskId
  if (body.goalId !== undefined) updates.goalId = body.goalId

  // If marking as completed, set completedAt
  if (body.status === 'completed') {
    updates.completedAt = sql`(datetime('now'))`
  } else if (body.status === 'active') {
    updates.completedAt = null
  }

  const [ladder] = await db.update(ladderGoals)
    .set(updates)
    .where(eq(ladderGoals.id, c.req.param('id')))
    .returning()

  if (!ladder) return c.json({ error: 'not found' }, 404)

  const steps = await db.select()
    .from(ladderSteps)
    .where(eq(ladderSteps.ladderId, ladder.id))
    .orderBy(ladderSteps.stepNumber)

  return c.json({ ...ladder, steps })
})

// Delete ladder
router.delete('/:id', async (c) => {
  const db = getDb(c.env.DB)
  await db.delete(ladderGoals).where(eq(ladderGoals.id, c.req.param('id')))
  return c.json({ ok: true })
})

// Add step to ladder
router.post('/:id/steps', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{
    stepNumber: number
    title: string
    notes?: string
  }>()

  if (!body.title?.trim()) return c.json({ error: 'title is required' }, 400)
  if (body.stepNumber === undefined || body.stepNumber < 1) {
    return c.json({ error: 'stepNumber must be >= 1' }, 400)
  }

  // Verify ladder exists
  const [ladder] = await db.select()
    .from(ladderGoals)
    .where(eq(ladderGoals.id, c.req.param('id')))

  if (!ladder) return c.json({ error: 'not found' }, 404)

  // Insert step
  const [step] = await db.insert(ladderSteps).values({
    ladderId: ladder.id,
    stepNumber: body.stepNumber,
    title: body.title.trim(),
    notes: body.notes,
  }).returning()

  return c.json(step, 201)
})

// Update step
router.patch('/:id/steps/:stepId', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<Partial<{
    stepNumber: number
    title: string
    notes: string
    isCompleted: boolean
  }>>()

  const updates: Record<string, unknown> = {}
  if (body.stepNumber !== undefined) updates.stepNumber = body.stepNumber
  if (body.title !== undefined) updates.title = body.title.trim()
  if (body.notes !== undefined) updates.notes = body.notes
  if (body.isCompleted !== undefined) {
    updates.isCompleted = body.isCompleted
    updates.completedAt = body.isCompleted ? sql`(datetime('now'))` : null
  }

  const [step] = await db.update(ladderSteps)
    .set(updates)
    .where(
      and(
        eq(ladderSteps.ladderId, c.req.param('id')),
        eq(ladderSteps.id, c.req.param('stepId'))
      )
    )
    .returning()

  if (!step) return c.json({ error: 'not found' }, 404)
  return c.json(step)
})

// Delete step
router.delete('/:id/steps/:stepId', async (c) => {
  const db = getDb(c.env.DB)
  await db.delete(ladderSteps)
    .where(
      and(
        eq(ladderSteps.ladderId, c.req.param('id')),
        eq(ladderSteps.id, c.req.param('stepId'))
      )
    )
  return c.json({ ok: true })
})

// Reorder steps (batch update)
router.post('/:id/steps/reorder', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{
    steps: Array<{ id: string; stepNumber: number }>
  }>()

  if (!body.steps || !Array.isArray(body.steps)) {
    return c.json({ error: 'steps array is required' }, 400)
  }

  // Update all steps in a transaction
  await db.transaction(async (tx) => {
    for (const step of body.steps) {
      await tx.update(ladderSteps)
        .set({ stepNumber: step.stepNumber })
        .where(
          and(
            eq(ladderSteps.ladderId, c.req.param('id')),
            eq(ladderSteps.id, step.id)
          )
        )
    }
  })

  // Return updated steps
  const steps = await db.select()
    .from(ladderSteps)
    .where(eq(ladderSteps.ladderId, c.req.param('id')))
    .orderBy(ladderSteps.stepNumber)

  return c.json(steps)
})

export default router
