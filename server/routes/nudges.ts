import { Hono } from 'hono'
import { eq, sql, desc } from 'drizzle-orm'
import { getDb } from '../db/index'
import { nudges } from '../db/schema'
import { generateNudge } from '../services/claude'

type Env = { Bindings: { DB: D1Database; ANTHROPIC_API_KEY: string } }
const router = new Hono<Env>()

// List nudges
router.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const limit = parseInt(c.req.query('limit') ?? '20', 10)
  const unreadOnly = c.req.query('unread_only') === 'true'

  const rows = await db.select().from(nudges)
    .where(unreadOnly ? eq(nudges.isRead, false) : undefined)
    .orderBy(desc(nudges.createdAt))
    .limit(limit)

  return c.json(rows)
})

// Generate a nudge via Claude
router.post('/generate', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{ type?: 'app_open' | 'manual_refresh' }>().catch(() => ({ type: undefined }))
  const type = body.type ?? 'app_open'

  const apiKey = c.env.ANTHROPIC_API_KEY
  if (!apiKey) return c.json({ error: 'ANTHROPIC_API_KEY not configured' }, 500)

  const content = await generateNudge(db, apiKey)

  const [row] = await db.insert(nudges).values({ content, type }).returning()

  // Clean up nudges older than 30 days (lazy cleanup)
  await db.delete(nudges).where(sql`created_at < datetime('now', '-30 days')`)

  return c.json(row, 201)
})

// Mark nudge as read
router.post('/:id/read', async (c) => {
  const db = getDb(c.env.DB)
  await db.update(nudges).set({ isRead: true }).where(eq(nudges.id, c.req.param('id')))
  return c.json({ ok: true })
})

export default router
