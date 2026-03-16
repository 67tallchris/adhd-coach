import { Hono } from 'hono'
import { eq, sql } from 'drizzle-orm'
import { getDb } from '../db/index'
import { userProfiles } from '../db/schema'

type Env = { Bindings: { DB: D1Database } }
const router = new Hono<Env>()

// For single-user app, we use a fixed ID
const USER_ID = 'default-user'

// Get or create user profile
async function getOrCreateUserProfile(db: any) {
  let profile = await db.select().from(userProfiles).where(eq(userProfiles.id, USER_ID)).get()

  if (!profile) {
    const [created] = await db.insert(userProfiles).values({
      id: USER_ID,
      displayName: null,
      timezone: 'UTC',
    }).returning()
    profile = created
  }

  return profile
}

// Get current user profile
router.get('/profile', async (c) => {
  const db = getDb(c.env.DB)
  const profile = await getOrCreateUserProfile(db)

  return c.json(profile)
})

// Update user profile
router.post('/profile', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{
    displayName?: string | null
    timezone?: string
  }>()

  const updates: Record<string, any> = {
    updatedAt: sql`(datetime('now'))`,
  }

  if (body.displayName !== undefined) {
    updates.displayName = body.displayName
  }

  if (body.timezone !== undefined) {
    updates.timezone = body.timezone
  }

  const [updated] = await db.update(userProfiles)
    .set(updates)
    .where(eq(userProfiles.id, USER_ID))
    .returning()

  return c.json(updated)
})

// Get available timezones (simplified list of common timezones)
router.get('/timezones', async (c) => {
  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
    { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
    { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
    { value: 'America/Anchorage', label: 'Alaska' },
    { value: 'Pacific/Honolulu', label: 'Hawaii' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)' },
    { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Kolkata', label: 'Mumbai (IST)' },
    { value: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Seoul', label: 'Seoul (KST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
    { value: 'Australia/Melbourne', label: 'Melbourne (AEDT)' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZDT)' },
    { value: 'America/Sao_Paulo', label: 'Brasilia (BRT)' },
    { value: 'America/Mexico_City', label: 'Mexico City (CST)' },
    { value: 'Africa/Cairo', label: 'Cairo (EET)' },
    { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
  ]

  return c.json(timezones)
})

export default router
