import { Hono } from 'hono'
import { eq, sql, desc } from 'drizzle-orm'
import { getDb } from '../db/index'
import { nudges } from '../db/schema'
import { generateNudge as generateClaudeNudge } from '../services/claude'
import { generateNudge as generateQwenNudge } from '../services/qwen'

type Env = { Bindings: { DB: D1Database; ANTHROPIC_API_KEY: string; QWEN_API_KEY: string; QWEN_BASE_URL?: string } }
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

// Generate a nudge via Claude or Qwen
router.post('/generate', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{ type?: 'app_open' | 'manual_refresh'; provider?: 'claude' | 'qwen' }>().catch(() => ({ type: undefined, provider: undefined }))
  const type = body.type ?? 'app_open'
  const provider = body.provider ?? 'qwen' // Default to Qwen

  let content: string

  if (provider === 'claude') {
    const apiKey = c.env.ANTHROPIC_API_KEY
    if (!apiKey) return c.json({ error: 'ANTHROPIC_API_KEY not configured' }, 500)
    content = await generateClaudeNudge(db, apiKey)
  } else {
    const apiKey = c.env.QWEN_API_KEY
    if (!apiKey) return c.json({ error: 'QWEN_API_KEY not configured' }, 500)
    content = await generateQwenNudge(db, apiKey, c.env.QWEN_BASE_URL)
  }

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
