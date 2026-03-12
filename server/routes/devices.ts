import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { getDb } from '../db/index'
import { devices } from '../db/schema'

type Env = { Bindings: { DB: D1Database } }
const router = new Hono<Env>()

// Register device
router.post('/', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{
    token: string
    platform?: 'android' | 'ios' | 'web'
    userId?: string
  }>()

  // Check if token already exists
  const existing = await db.select()
    .from(devices)
    .where(eq(devices.fcmToken, body.token))
    .limit(1)

  if (existing.length > 0) {
    // Update last active time
    const [updated] = await db.update(devices)
      .set({
        lastActiveAt: new Date().toISOString(),
        platform: body.platform ?? 'android',
      })
      .where(eq(devices.fcmToken, body.token))
      .returning()

    return c.json({
      deviceId: updated.id,
      token: updated.fcmToken,
    })
  }

  // Insert new device
  const [row] = await db.insert(devices).values({
    fcmToken: body.token,
    platform: body.platform ?? 'android',
    userId: body.userId,
    lastActiveAt: new Date().toISOString(),
  }).returning()

  return c.json({
    deviceId: row.id,
    token: row.fcmToken,
  }, 201)
})

// Unregister device
router.delete('/:id', async (c) => {
  const db = getDb(c.env.DB)
  const deviceId = c.req.param('id')

  const result = await db.delete(devices)
    .where(eq(devices.id, deviceId))

  if (result.changes === 0) {
    return c.json({ error: 'Device not found' }, 404)
  }

  return c.json({ success: true })
})

// List devices for a user (optional, for debugging)
router.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const userId = c.req.query('userId')

  if (!userId) {
    return c.json({ error: 'userId required' }, 400)
  }

  const rows = await db.select()
    .from(devices)
    .where(eq(devices.userId, userId))
    .orderBy(desc(devices.createdAt))

  return c.json(rows)
})

export default router
