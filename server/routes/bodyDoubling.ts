import { Hono } from 'hono'
import { eq, sql, and, gte, lt } from 'drizzle-orm'
import { getDb } from '../db/index'
import { bodyDoublingSessions } from '../db/schema'

type Env = { Bindings: { DB: D1Database } }
const router = new Hono<Env>()

// Constants
const HEARTBEAT_TIMEOUT_MS = 2 * 60 * 1000 // 2 minutes - sessions stale after this

// Helper: get current hour-based session ID prefix
function getSessionIdPrefix(): string {
  const now = new Date()
  const hour = now.getUTCHours()
  const date = now.toISOString().slice(0, 10)
  return `session_${date}_${hour.toString().padStart(2, '0')}`
}

// Helper: generate anonymous session ID
function generateSessionId(): string {
  const prefix = getSessionIdPrefix()
  const random = crypto.randomUUID().slice(0, 8)
  return `${prefix}_${random}`
}

// Helper: get coarse region from request (simplified)
function getCoarseRegion(c: any): string | undefined {
  // In production, use CF-IPCountry header from Cloudflare
  const country = c.req.header('CF-IPCountry')
  if (country) return country
  
  // Fallback to generic region
  return 'UNKNOWN'
}

// Helper: clean up stale sessions
async function cleanupStaleSessions(db: ReturnType<typeof getDb>) {
  const staleThreshold = new Date(Date.now() - HEARTBEAT_TIMEOUT_MS).toISOString()
  await db.delete(bodyDoublingSessions)
    .where(lt(bodyDoublingSessions.lastHeartbeat, staleThreshold))
}

// Check in - announce presence
router.post('/checkin', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{
    sessionId?: string
    taskType?: 'work' | 'break'
  }>()

  // Clean up stale sessions first
  await cleanupStaleSessions(db)

  const sessionId = body.sessionId || generateSessionId()
  const taskType = body.taskType || 'work'
  const region = getCoarseRegion(c)
  const now = new Date().toISOString()

  // Check if this session already exists
  const [existing] = await db.select()
    .from(bodyDoublingSessions)
    .where(eq(bodyDoublingSessions.sessionId, sessionId))
    .limit(1)

  if (existing) {
    // Update existing session
    const [updated] = await db.update(bodyDoublingSessions)
      .set({
        lastHeartbeat: now,
        taskType,
      })
      .where(eq(bodyDoublingSessions.sessionId, sessionId))
      .returning()
    
    return c.json({
      sessionId: updated.sessionId,
      startedAt: updated.startedAt,
      taskType: updated.taskType,
    })
  } else {
    // Create new session
    const [created] = await db.insert(bodyDoublingSessions).values({
      sessionId,
      startedAt: now,
      lastHeartbeat: now,
      taskType,
      region,
    }).returning()

    return c.json({
      sessionId: created.sessionId,
      startedAt: created.startedAt,
      taskType: created.taskType,
      isNew: true,
    }, 201)
  }
})

// Check out - leave session
router.delete('/checkin/:sessionId', async (c) => {
  const db = getDb(c.env.DB)
  const sessionId = c.req.param('sessionId')

  await db.delete(bodyDoublingSessions)
    .where(eq(bodyDoublingSessions.sessionId, sessionId))

  return c.json({ ok: true })
})

// Get current count of active sessions
router.get('/count', async (c) => {
  const db = getDb(c.env.DB)
  
  // Clean up stale sessions first
  await cleanupStaleSessions(db)

  const staleThreshold = new Date(Date.now() - HEARTBEAT_TIMEOUT_MS).toISOString()

  // Count total active sessions
  const [totalResult] = await db.select({ count: sql<number>`count(*)` })
    .from(bodyDoublingSessions)
    .where(gte(bodyDoublingSessions.lastHeartbeat, staleThreshold))

  // Count by task type
  const [workResult] = await db.select({ count: sql<number>`count(*)` })
    .from(bodyDoublingSessions)
    .where(and(
      gte(bodyDoublingSessions.lastHeartbeat, staleThreshold),
      eq(bodyDoublingSessions.taskType, 'work')
    ))

  const [breakResult] = await db.select({ count: sql<number>`count(*)` })
    .from(bodyDoublingSessions)
    .where(and(
      gte(bodyDoublingSessions.lastHeartbeat, staleThreshold),
      eq(bodyDoublingSessions.taskType, 'break')
    ))

  return c.json({
    total: totalResult?.count ?? 0,
    working: workResult?.count ?? 0,
    onBreak: breakResult?.count ?? 0,
    timestamp: new Date().toISOString(),
  })
})

// Get anonymized peer list (optional, for ambient awareness)
router.get('/peers', async (c) => {
  const db = getDb(c.env.DB)
  
  // Clean up stale sessions first
  await cleanupStaleSessions(db)

  const staleThreshold = new Date(Date.now() - HEARTBEAT_TIMEOUT_MS).toISOString()

  // Get anonymized sessions (no identifying info)
  const sessions = await db.select({
    taskType: bodyDoublingSessions.taskType,
    region: bodyDoublingSessions.region,
    startedAt: bodyDoublingSessions.startedAt,
  })
    .from(bodyDoublingSessions)
    .where(gte(bodyDoublingSessions.lastHeartbeat, staleThreshold))
    .limit(50) // Cap at 50 for performance

  // Anonymize and aggregate
  const regionCounts: Record<string, number> = {}
  sessions.forEach(s => {
    const region = s.region || 'Unknown'
    regionCounts[region] = (regionCounts[region] || 0) + 1
  })

  // Create ambient messages
  const messages = sessions.slice(0, 5).map(s => {
    const regionText = s.region && s.region !== 'UNKNOWN' 
      ? `in ${s.region}` 
      : 'somewhere'
    return {
      text: `Someone ${regionText} is ${s.taskType === 'work' ? 'focusing' : 'on a break'}`,
      taskType: s.taskType,
    }
  })

  return c.json({
    total: sessions.length,
    regions: regionCounts,
    messages,
  })
})

// Heartbeat - update presence
router.post('/heartbeat/:sessionId', async (c) => {
  const db = getDb(c.env.DB)
  const sessionId = c.req.param('sessionId')
  const body = await c.req.json<{ taskType?: 'work' | 'break' }>()

  const taskType = body.taskType || 'work'
  const now = new Date().toISOString()

  const [updated] = await db.update(bodyDoublingSessions)
    .set({
      lastHeartbeat: now,
      taskType,
    })
    .where(eq(bodyDoublingSessions.sessionId, sessionId))
    .returning()

  if (!updated) {
    return c.json({ error: 'Session not found' }, 404)
  }

  return c.json({
    sessionId: updated.sessionId,
    taskType: updated.taskType,
    ok: true,
  })
})

export default router
