import { Hono } from 'hono'
import { eq, and, desc, sql, gt } from 'drizzle-orm'
import { getDb } from '../db/index'
import {
  videoBodyDoublingSessions,
  videoBodyDoublingParticipants,
} from '../db/schema'

type Env = { Bindings: { DB: D1Database } }
const router = new Hono<Env>()

// Constants
const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000 // 2 hours - sessions inactive for this long are archived

// Helper: generate unique Jitsi room ID
function generateJitsiRoomId(): string {
  const timestamp = Date.now().toString(36)
  const random = crypto.randomUUID().slice(0, 8)
  return `adhd-focus-${timestamp}-${random}`
}

// Helper: generate human-readable room name
function generateRoomName(): string {
  const adjectives = ['focused', 'calm', 'productive', 'quiet', 'peaceful', 'energetic', 'creative', 'mindful']
  const nouns = ['space', 'room', 'zone', 'corner', 'studio', 'haven', 'spot', 'place']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${adj}-${noun}-${num}`
}

// Helper: clean up stale sessions
async function cleanupStaleSessions(db: ReturnType<typeof getDb>) {
  const staleThreshold = new Date(Date.now() - SESSION_TIMEOUT_MS).toISOString()
  await db.update(videoBodyDoublingSessions)
    .set({ isActive: false })
    .where(
      and(
        gt(videoBodyDoublingSessions.lastActivityAt, staleThreshold),
        eq(videoBodyDoublingSessions.isActive, true)
      )
    )
}

// Create a new video body doubling session
router.post('/sessions', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{
    roomName?: string
    description?: string
    maxParticipants?: number
    tags?: string[]
  }>()

  // Clean up stale sessions first
  await cleanupStaleSessions(db)

  const roomName = body.roomName || generateRoomName()
  const jitsiRoomId = generateJitsiRoomId()
  const now = new Date().toISOString()

  // Create the session
  const [created] = await db.insert(videoBodyDoublingSessions).values({
    roomName,
    jitsiRoomId,
    description: body.description,
    maxParticipants: body.maxParticipants,
    tags: JSON.stringify(body.tags || []),
    createdAt: now,
    lastActivityAt: now,
    isActive: true,
    participantCount: 0,
  }).returning()

  return c.json({
    session: created,
    jitsiRoomId: created.jitsiRoomId,
  }, 201)
})

// Join an existing session
router.post('/sessions/:sessionId/join', async (c) => {
  const db = getDb(c.env.DB)
  const sessionId = c.req.param('sessionId')
  const body = await c.req.json<{
    displayName?: string
    jitsiParticipantId?: string
  }>()

  const now = new Date().toISOString()

  // Get the session
  const [session] = await db.select()
    .from(videoBodyDoublingSessions)
    .where(eq(videoBodyDoublingSessions.id, sessionId))
    .limit(1)

  if (!session) {
    return c.json({ error: 'Session not found' }, 404)
  }

  if (!session.isActive) {
    return c.json({ error: 'Session is no longer active' }, 400)
  }

  if (session.maxParticipants && session.participantCount >= session.maxParticipants) {
    return c.json({ error: 'Session is full' }, 400)
  }

  // Create participant record
  const [participant] = await db.insert(videoBodyDoublingParticipants).values({
    sessionId,
    jitsiParticipantId: body.jitsiParticipantId,
    displayName: body.displayName,
    joinedAt: now,
    isActive: true,
  }).returning()

  // Update session participant count and last activity
  const [updatedSession] = await db.update(videoBodyDoublingSessions)
    .set({
      participantCount: sql`${videoBodyDoublingSessions.participantCount} + 1`,
      lastActivityAt: now,
    })
    .where(eq(videoBodyDoublingSessions.id, sessionId))
    .returning()

  return c.json({
    session: updatedSession,
    jitsiRoomId: session.jitsiRoomId,
    participant,
  })
})

// Leave a session
router.post('/sessions/:sessionId/leave', async (c) => {
  const db = getDb(c.env.DB)
  const sessionId = c.req.param('sessionId')
  const body = await c.req.json<{
    jitsiParticipantId?: string
  }>()

  const now = new Date().toISOString()

  // Mark participant as left
  if (body.jitsiParticipantId) {
    await db.update(videoBodyDoublingParticipants)
      .set({
        leftAt: now,
        isActive: false,
      })
      .where(
        and(
          eq(videoBodyDoublingParticipants.sessionId, sessionId),
          eq(videoBodyDoublingParticipants.jitsiParticipantId, body.jitsiParticipantId)
        )
      )
  }

  // Update session participant count
  const [updatedSession] = await db.update(videoBodyDoublingSessions)
    .set({
      participantCount: sql`MAX(0, ${videoBodyDoublingSessions.participantCount} - 1)`,
      lastActivityAt: now,
    })
    .where(eq(videoBodyDoublingSessions.id, sessionId))
    .returning()

  return c.json({
    ok: true,
    session: updatedSession,
  })
})

// Get active sessions
router.get('/sessions/active', async (c) => {
  const db = getDb(c.env.DB)

  // Clean up stale sessions first
  await cleanupStaleSessions(db)

  const staleThreshold = new Date(Date.now() - SESSION_TIMEOUT_MS).toISOString()

  // Get active sessions
  const sessions = await db.select()
    .from(videoBodyDoublingSessions)
    .where(
      and(
        eq(videoBodyDoublingSessions.isActive, true),
        gt(videoBodyDoublingSessions.lastActivityAt, staleThreshold)
      )
    )
    .orderBy(desc(videoBodyDoublingSessions.participantCount))
    .limit(20)

  const totalParticipants = sessions.reduce((sum, s) => sum + s.participantCount, 0)

  return c.json({
    activeSessions: sessions.length,
    totalParticipants,
    sessions: sessions.map(s => ({
      id: s.id,
      roomName: s.roomName,
      participantCount: s.participantCount,
      tags: JSON.parse(s.tags || '[]'),
      description: s.description,
    })),
  })
})

// Get a specific session
router.get('/sessions/:sessionId', async (c) => {
  const db = getDb(c.env.DB)
  const sessionId = c.req.param('sessionId')

  const [session] = await db.select()
    .from(videoBodyDoublingSessions)
    .where(eq(videoBodyDoublingSessions.id, sessionId))
    .limit(1)

  if (!session) {
    return c.json({ error: 'Session not found' }, 404)
  }

  // Get active participants
  const participants = await db.select({
    id: videoBodyDoublingParticipants.id,
    displayName: videoBodyDoublingParticipants.displayName,
    joinedAt: videoBodyDoublingParticipants.joinedAt,
  })
    .from(videoBodyDoublingParticipants)
    .where(
      and(
        eq(videoBodyDoublingParticipants.sessionId, sessionId),
        eq(videoBodyDoublingParticipants.isActive, true)
      )
    )
    .limit(50)

  return c.json({
    session: {
      ...session,
      tags: JSON.parse(session.tags || '[]'),
      participants,
    },
  })
})

// Update a session
router.patch('/sessions/:sessionId', async (c) => {
  const db = getDb(c.env.DB)
  const sessionId = c.req.param('sessionId')
  const body = await c.req.json<{
    roomName?: string
    description?: string
    maxParticipants?: number
    tags?: string[]
    isActive?: boolean
  }>()

  const updateData: any = {
    lastActivityAt: new Date().toISOString(),
  }

  if (body.roomName !== undefined) updateData.roomName = body.roomName
  if (body.description !== undefined) updateData.description = body.description
  if (body.maxParticipants !== undefined) updateData.maxParticipants = body.maxParticipants
  if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags)
  if (body.isActive !== undefined) updateData.isActive = body.isActive

  const [updated] = await db.update(videoBodyDoublingSessions)
    .set(updateData)
    .where(eq(videoBodyDoublingSessions.id, sessionId))
    .returning()

  if (!updated) {
    return c.json({ error: 'Session not found' }, 404)
  }

  return c.json({
    session: {
      ...updated,
      tags: JSON.parse(updated.tags || '[]'),
    },
  })
})

// Delete a session (soft delete by marking inactive)
router.delete('/sessions/:sessionId', async (c) => {
  const db = getDb(c.env.DB)
  const sessionId = c.req.param('sessionId')

  await db.update(videoBodyDoublingSessions)
    .set({
      isActive: false,
      lastActivityAt: new Date().toISOString(),
    })
    .where(eq(videoBodyDoublingSessions.id, sessionId))

  return c.json({ ok: true })
})

export default router
