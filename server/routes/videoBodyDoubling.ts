import { Hono } from 'hono'
import { eq, and, desc, sql, gt, lt, or } from 'drizzle-orm'
import { getDb } from '../db/index'
import {
  videoBodyDoublingSessions,
  videoBodyDoublingParticipants,
  videoBodyDoublingAnnouncements,
} from '../db/schema'

type Env = { Bindings: { DB: D1Database } }
const router = new Hono<Env>()

// Constants
const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000 // 2 hours - sessions inactive for this long are archived
const ANNOUNCEMENT_WAIT_MS = 2 * 60 * 1000 // 2 minutes - wait for interested participants
const ANNOUNCEMENT_LATE_JOIN_MS = 5 * 60 * 1000 // 5 minutes - allow late joiners after start
const SESSION_DURATION_MS = 25 * 60 * 1000 // 25 minutes - default session duration

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

// ============ Announcement Endpoints ============

// Create an announcement for a new session
router.post('/announcements', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{
    roomName?: string
    description?: string
    sessionDurationMin?: number
    tags?: string[]
    createdBy?: string
  }>()

  const now = new Date()
  const waitUntil = new Date(now.getTime() + ANNOUNCEMENT_WAIT_MS)
  const lateJoinUntil = new Date(now.getTime() + ANNOUNCEMENT_WAIT_MS + ANNOUNCEMENT_LATE_JOIN_MS)

  // Create the session first
  const roomName = body.roomName || generateRoomName()
  const jitsiRoomId = generateJitsiRoomId()
  const nowStr = now.toISOString()

  const [session] = await db.insert(videoBodyDoublingSessions).values({
    roomName,
    jitsiRoomId,
    description: body.description,
    tags: JSON.stringify(body.tags || []),
    createdAt: nowStr,
    lastActivityAt: nowStr,
    isActive: true,
    participantCount: 0,
  }).returning()

  // Create the announcement
  const [announcement] = await db.insert(videoBodyDoublingAnnouncements).values({
    sessionId: session.id,
    createdBy: body.createdBy,
    createdAt: nowStr,
    status: 'waiting',
    waitUntil: waitUntil.toISOString(),
    lateJoinUntil: lateJoinUntil.toISOString(),
    sessionDurationMin: body.sessionDurationMin || 25,
    interestedCount: 0,
    joinedCount: 0,
  }).returning()

  // Get count of active users for notification
  const activeDevices = await db.select({
    id: sql<string>`id`,
  })
    .from(videoBodyDoublingSessions)
    .where(
      and(
        eq(videoBodyDoublingSessions.isActive, true),
        gt(videoBodyDoublingSessions.lastActivityAt, new Date(Date.now() - SESSION_TIMEOUT_MS).toISOString())
      )
    )
    .limit(100)

  return c.json({
    announcement: {
      ...announcement,
      session,
      jitsiRoomId,
    },
    potentialParticipants: activeDevices.length,
  }, 201)
})

// Express interest in an announced session
router.post('/announcements/:announcementId/interest', async (c) => {
  const db = getDb(c.env.DB)
  const announcementId = c.req.param('announcementId')

  const [announcement] = await db.select()
    .from(videoBodyDoublingAnnouncements)
    .where(eq(videoBodyDoublingAnnouncements.id, announcementId))
    .limit(1)

  if (!announcement) {
    return c.json({ error: 'Announcement not found' }, 404)
  }

  if (announcement.status !== 'waiting') {
    return c.json({ error: 'Announcement is no longer accepting interest' }, 400)
  }

  // Increment interested count
  const [updated] = await db.update(videoBodyDoublingAnnouncements)
    .set({
      interestedCount: sql`${videoBodyDoublingAnnouncements.interestedCount} + 1`,
    })
    .where(eq(videoBodyDoublingAnnouncements.id, announcementId))
    .returning()

  return c.json({
    announcement: updated,
    interestedCount: updated.interestedCount,
  })
})

// Start the session (after waiting period or early start)
router.post('/announcements/:announcementId/start', async (c) => {
  const db = getDb(c.env.DB)
  const announcementId = c.req.param('announcementId')
  const body = await c.req.json<{
    startedBy?: string
  }>()

  const [announcement] = await db.select()
    .from(videoBodyDoublingAnnouncements)
    .where(eq(videoBodyDoublingAnnouncements.id, announcementId))
    .limit(1)

  if (!announcement) {
    return c.json({ error: 'Announcement not found' }, 404)
  }

  const now = new Date()
  const waitUntil = new Date(announcement.waitUntil)

  // Allow early start if creator wants to start, or auto-start after wait period
  const canStart = now >= waitUntil || body.startedBy === announcement.createdBy

  if (!canStart && announcement.status === 'waiting') {
    const waitRemaining = Math.ceil((waitUntil.getTime() - now.getTime()) / 1000)
    return c.json({
      error: `Waiting period not over. ${waitRemaining} seconds remaining.`,
      waitRemaining,
    }, 400)
  }

  // Update announcement status
  const [updatedAnnouncement] = await db.update(videoBodyDoublingAnnouncements)
    .set({
      status: 'active',
      joinedCount: 1, // Creator is joining
    })
    .where(eq(videoBodyDoublingAnnouncements.id, announcementId))
    .returning()

  // Update session to active
  const [updatedSession] = await db.update(videoBodyDoublingSessions)
    .set({
      participantCount: 1,
      lastActivityAt: now.toISOString(),
    })
    .where(eq(videoBodyDoublingSessions.id, announcement.sessionId))
    .returning()

  return c.json({
    announcement: updatedAnnouncement,
    session: updatedSession,
  })
})

// Join an announced session
router.post('/announcements/:announcementId/join', async (c) => {
  const db = getDb(c.env.DB)
  const announcementId = c.req.param('announcementId')
  const body = await c.req.json<{
    displayName?: string
    jitsiParticipantId?: string
  }>()

  const now = new Date()

  const [announcement] = await db.select()
    .from(videoBodyDoublingAnnouncements)
    .where(eq(videoBodyDoublingAnnouncements.id, announcementId))
    .limit(1)

  if (!announcement) {
    return c.json({ error: 'Announcement not found' }, 404)
  }

  // Check if session has started
  if (announcement.status === 'waiting') {
    // Express interest instead
    return c.json({
      error: 'Session has not started yet. Express interest instead.',
      status: 'waiting',
      waitUntil: announcement.waitUntil,
    }, 400)
  }

  if (announcement.status !== 'active') {
    return c.json({ error: 'Session is not active' }, 400)
  }

  // Check if late join period is over
  if (announcement.lateJoinUntil) {
    const lateJoinUntil = new Date(announcement.lateJoinUntil)
    if (now > lateJoinUntil) {
      return c.json({
        error: 'Late join period has ended',
        status: 'active',
      }, 400)
    }
  }

  // Get session details
  const [session] = await db.select()
    .from(videoBodyDoublingSessions)
    .where(eq(videoBodyDoublingSessions.id, announcement.sessionId))
    .limit(1)

  if (!session) {
    return c.json({ error: 'Session not found' }, 404)
  }

  // Create participant record
  const [participant] = await db.insert(videoBodyDoublingParticipants).values({
    sessionId: session.id,
    jitsiParticipantId: body.jitsiParticipantId,
    displayName: body.displayName,
    joinedAt: now.toISOString(),
    isActive: true,
  }).returning()

  // Update counts
  await db.update(videoBodyDoublingAnnouncements)
    .set({
      joinedCount: sql`${videoBodyDoublingAnnouncements.joinedCount} + 1`,
    })
    .where(eq(videoBodyDoublingAnnouncements.id, announcementId))

  const [updatedSession] = await db.update(videoBodyDoublingSessions)
    .set({
      participantCount: sql`${videoBodyDoublingSessions.participantCount} + 1`,
      lastActivityAt: now.toISOString(),
    })
    .where(eq(videoBodyDoublingSessions.id, announcement.sessionId))
    .returning()

  return c.json({
    session: updatedSession,
    jitsiRoomId: session.jitsiRoomId,
    participant,
    announcement,
  })
})

// Get announcement details
router.get('/announcements/:announcementId', async (c) => {
  const db = getDb(c.env.DB)
  const announcementId = c.req.param('announcementId')

  const [announcement] = await db.select()
    .from(videoBodyDoublingAnnouncements)
    .where(eq(videoBodyDoublingAnnouncements.id, announcementId))
    .limit(1)

  if (!announcement) {
    return c.json({ error: 'Announcement not found' }, 404)
  }

  // Get session details
  const [session] = await db.select()
    .from(videoBodyDoublingSessions)
    .where(eq(videoBodyDoublingSessions.id, announcement.sessionId))
    .limit(1)

  // Get active participants
  const participants = await db.select({
    id: videoBodyDoublingParticipants.id,
    displayName: videoBodyDoublingParticipants.displayName,
    joinedAt: videoBodyDoublingParticipants.joinedAt,
  })
    .from(videoBodyDoublingParticipants)
    .where(
      and(
        eq(videoBodyDoublingParticipants.sessionId, announcement.sessionId),
        eq(videoBodyDoublingParticipants.isActive, true)
      )
    )
    .limit(50)

  return c.json({
    announcement: {
      ...announcement,
      session,
      participants,
    },
  })
})

// Get active announcements (waiting or active)
router.get('/announcements/active', async (c) => {
  const db = getDb(c.env.DB)
  const now = new Date().toISOString()

  // Clean up expired waiting announcements
  await db.update(videoBodyDoublingAnnouncements)
    .set({ status: 'expired' })
    .where(
      and(
        eq(videoBodyDoublingAnnouncements.status, 'waiting'),
        lt(videoBodyDoublingAnnouncements.waitUntil, now)
      )
    )

  // Get active announcements
  const announcements = await db.select()
    .from(videoBodyDoublingAnnouncements)
    .where(
      or(
        eq(videoBodyDoublingAnnouncements.status, 'waiting'),
        eq(videoBodyDoublingAnnouncements.status, 'active')
      )
    )
    .orderBy(desc(videoBodyDoublingAnnouncements.createdAt))
    .limit(20)

  return c.json({
    announcements: announcements.map(a => ({
      id: a.id,
      sessionId: a.sessionId,
      status: a.status,
      interestedCount: a.interestedCount,
      joinedCount: a.joinedCount,
      waitUntil: a.waitUntil,
      lateJoinUntil: a.lateJoinUntil,
      sessionDurationMin: a.sessionDurationMin,
      createdAt: a.createdAt,
    })),
  })
})

// Cancel an announcement
router.delete('/announcements/:announcementId', async (c) => {
  const db = getDb(c.env.DB)
  const announcementId = c.req.param('announcementId')

  await db.update(videoBodyDoublingAnnouncements)
    .set({ status: 'cancelled' })
    .where(eq(videoBodyDoublingAnnouncements.id, announcementId))

  return c.json({ ok: true })
})

export default router
