import { Hono } from 'hono'
import { eq, sql, desc } from 'drizzle-orm'
import { getDb } from '../db/index'
import { userLevels, xpLogs } from '../db/schema'
import { TIER_INFO, FEATURE_UNLOCKS, getTierForXp, XP_REWARDS } from '../../src/types/levels'

type Env = { Bindings: { DB: D1Database } }
const router = new Hono<Env>()

// For single-user app, we use a fixed ID
const USER_ID = 'default-user'

// Get or create user level
async function getOrCreateUserLevel(db: any) {
  let level = await db.select().from(userLevels).where(eq(userLevels.id, USER_ID)).get()
  
  if (!level) {
    const [created] = await db.insert(userLevels).values({
      id: USER_ID,
      currentXp: 0,
      level: 1,
      tier: 'wood',
      tierProgress: 0,
      focusMode: null,
      nextUnlockLevel: 2,
      hasSeenOnboarding: false,
    }).returning()
    level = created
  }
  
  return level
}

// Get current user level
router.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const level = await getOrCreateUserLevel(db)
  
  const tierInfo = TIER_INFO[level.tier as keyof typeof TIER_INFO]
  const xpInTier = level.currentXp - tierInfo.xpRequired
  const xpToNextLevel = tierInfo.xpPerLevel - (xpInTier % tierInfo.xpPerLevel)
  
  // Get next unlock info
  const nextUnlock = FEATURE_UNLOCKS.find(f => f.level === level.nextUnlockLevel)
  
  return c.json({
    ...level,
    xpToNextLevel,
    nextUnlock: nextUnlock || null,
  })
}

// Award XP
router.post('/xp', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{
    amount: number
    source: string
    description: string
    metadata?: Record<string, any>
  }>()
  
  if (!body.amount || !body.source || !body.description) {
    return c.json({ error: 'amount, source, and description are required' }, 400)
  }
  
  const level = await getOrCreateUserLevel(db)
  const oldXp = level.currentXp
  const oldLevel = level.level
  const oldTier = level.tier
  
  // Calculate new XP and level
  const newXp = oldXp + body.amount
  const tierData = getTierForXp(newXp)
  const newLevel = Math.floor(newXp / 100) + 1 // Simple level calculation
  
  // Determine if tier changed
  const tierChanged = oldTier !== tierData.tier
  const levelUp = newLevel > oldLevel
  
  // Update user level
  const updates: Record<string, any> = {
    currentXp: newXp,
    level: newLevel,
    tier: tierData.tier,
    tierProgress: Math.round(tierData.progress),
    updatedAt: sql`(datetime('now'))`,
  }
  
  if (levelUp) {
    updates.lastLevelUpAt = sql`(datetime('now'))`
    // Update next unlock level
    const currentUnlockIndex = FEATURE_UNLOCKS.findIndex(f => f.level === level.nextUnlockLevel)
    if (currentUnlockIndex >= 0 && currentUnlockIndex < FEATURE_UNLOCKS.length - 1) {
      updates.nextUnlockLevel = FEATURE_UNLOCKS[currentUnlockIndex + 1].level
    }
  }
  
  const [updatedLevel] = await db.update(userLevels)
    .set(updates)
    .where(eq(userLevels.id, USER_ID))
    .returning()
  
  // Log XP
  await db.insert(xpLogs).values({
    id: crypto.randomUUID().slice(0, 8),
    xpAmount: body.amount,
    source: body.source as any,
    description: body.description,
    metadata: body.metadata ? JSON.stringify(body.metadata) : null,
  })
  
  const tierInfo = TIER_INFO[updatedLevel.tier as keyof typeof TIER_INFO]
  const xpInTier = updatedLevel.currentXp - tierInfo.xpRequired
  const xpToNextLevel = tierInfo.xpPerLevel - (xpInTier % tierInfo.xpPerLevel)
  const nextUnlock = FEATURE_UNLOCKS.find(f => f.level === updatedLevel.nextUnlockLevel)
  
  return c.json({
    ...updatedLevel,
    xpToNextLevel,
    nextUnlock: nextUnlock || null,
    levelUp,
    tierChanged,
    oldTier,
    newTier: tierData.tier,
  })
})

// Set focus mode (one-time until level 3)
router.post('/mode', async (c) => {
  const db = getDb(c.env.DB)
  const body = await c.req.json<{ mode: 'pomodoro' | 'focus' }>()
  
  if (!body.mode || !['pomodoro', 'focus'].includes(body.mode)) {
    return c.json({ error: 'mode must be "pomodoro" or "focus"' }, 400)
  }
  
  const level = await getOrCreateUserLevel(db)
  
  // Check if already set and level < 3
  if (level.focusMode && level.level < 3) {
    return c.json({ 
      error: 'Focus mode is locked until level 3',
      currentMode: level.focusMode,
    }, 400)
  }
  
  const [updated] = await db.update(userLevels)
    .set({
      focusMode: body.mode,
      hasSeenOnboarding: true,
      updatedAt: sql`(datetime('now'))`,
    })
    .where(eq(userLevels.id, USER_ID))
    .returning()
  
  // Award onboarding XP if first time
  if (!level.focusMode) {
    await db.insert(xpLogs).values({
      id: crypto.randomUUID().slice(0, 8),
      xpAmount: XP_REWARDS.onboarding,
      source: 'onboarding',
      description: 'Completed onboarding and selected focus mode',
      metadata: JSON.stringify({ mode: body.mode }),
    })
    
    updated.currentXp += XP_REWARDS.onboarding
    const tierData = getTierForXp(updated.currentXp)
    updated.level = Math.floor(updated.currentXp / 100) + 1
    updated.tier = tierData.tier
    updated.tierProgress = Math.round(tierData.progress)
  }
  
  return c.json(updated)
})

// Get XP history
router.get('/history', async (c) => {
  const db = getDb(c.env.DB)
  const limit = parseInt(c.req.query('limit') || '20')
  
  const logs = await db.select()
    .from(xpLogs)
    .orderBy(desc(xpLogs.createdAt))
    .limit(limit)
  
  return c.json(logs)
})

// Get next unlock info
router.get('/next-unlock', async (c) => {
  const db = getDb(c.env.DB)
  const level = await getOrCreateUserLevel(db)
  
  const nextUnlock = FEATURE_UNLOCKS.find(f => f.level === level.nextUnlockLevel)
  
  if (!nextUnlock) {
    return c.json({ message: 'All features unlocked!' })
  }
  
  return c.json({
    ...nextUnlock,
    currentLevel: level.level,
    xpRequired: TIER_INFO[getTierForXp(level.currentXp).tier].xpRequired,
  })
})

// Check if feature is unlocked
router.get('/unlocks/:feature', async (c) => {
  const db = getDb(c.env.DB)
  const level = await getOrCreateUserLevel(db)
  const feature = c.req.param('feature')
  
  // Find which level unlocks this feature
  const unlockInfo = FEATURE_UNLOCKS.find(f => f.feature.toLowerCase() === feature.toLowerCase())
  
  if (!unlockInfo) {
    return c.json({ unlocked: true, message: 'Unknown feature' })
  }
  
  const isUnlocked = level.level >= unlockInfo.level
  
  return c.json({
    unlocked: isUnlocked,
    requiredLevel: unlockInfo.level,
    currentLevel: level.level,
    feature: unlockInfo.feature,
    description: unlockInfo.description,
  })
})

export default router
