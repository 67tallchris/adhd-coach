export type TierType = 'wood' | 'iron' | 'steel' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster'
export type FocusModeType = 'pomodoro' | 'focus' | null
export type XpSource = 'pomodoro_session' | 'focus_checkin' | 'habit_completion' | 'task_completion' | 'daily_streak' | 'first_win' | 'level_up' | 'onboarding'

export interface UserLevel {
  id: string
  currentXp: number
  level: number
  tier: TierType
  tierProgress: number
  focusMode: FocusModeType
  nextUnlockLevel: number
  hasSeenOnboarding: boolean
  lastLevelUpAt: string | null
  createdAt: string
  updatedAt: string
}

export interface XpLog {
  id: string
  xpAmount: number
  source: XpSource
  description: string
  metadata: string | null
  createdAt: string
}

export interface TierInfo {
  tier: TierType
  name: string
  emoji: string
  color: string
  gradient: string
  description: string
  xpRequired: number // Total XP to reach this tier
  xpPerLevel: number // XP needed for each sub-level within tier
}

export interface FeatureUnlock {
  level: number
  feature: string
  description: string
  icon: string
}

export interface LevelProgress {
  currentXp: number
  level: number
  tier: TierType
  tierProgress: number
  xpToNextLevel: number
  nextUnlock?: FeatureUnlock
}

export const TIER_INFO: Record<TierType, TierInfo> = {
  wood: {
    tier: 'wood',
    name: 'Wood',
    emoji: '🌲',
    color: '#8B4513',
    gradient: 'linear-gradient(135deg, #8B4513, #A0522D)',
    description: 'Just starting your focus journey',
    xpRequired: 0,
    xpPerLevel: 100,
  },
  iron: {
    tier: 'iron',
    name: 'Iron',
    emoji: '⚙️',
    color: '#4A4A4A',
    gradient: 'linear-gradient(135deg, #4A4A4A, #6B6B6B)',
    description: 'Building mental strength',
    xpRequired: 300,
    xpPerLevel: 167,
  },
  steel: {
    tier: 'steel',
    name: 'Steel',
    emoji: '🔩',
    color: '#71797E',
    gradient: 'linear-gradient(135deg, #71797E, #939C9F)',
    description: 'Forging strong habits',
    xpRequired: 800,
    xpPerLevel: 233,
  },
  bronze: {
    tier: 'bronze',
    name: 'Bronze',
    emoji: '🥉',
    color: '#CD7F32',
    gradient: 'linear-gradient(135deg, #CD7F32, #E5A56A)',
    description: 'Earning your stripes',
    xpRequired: 1500,
    xpPerLevel: 333,
  },
  silver: {
    tier: 'silver',
    name: 'Silver',
    emoji: '🥈',
    color: '#C0C0C0',
    gradient: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)',
    description: 'Shining with consistency',
    xpRequired: 2500,
    xpPerLevel: 500,
  },
  gold: {
    tier: 'gold',
    name: 'Gold',
    emoji: '🥇',
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700, #FFF8DC)',
    description: 'Peak performance',
    xpRequired: 4000,
    xpPerLevel: 667,
  },
  platinum: {
    tier: 'platinum',
    name: 'Platinum',
    emoji: '💎',
    color: '#E5E4E2',
    gradient: 'linear-gradient(135deg, #E5E4E2, #F5F5F5)',
    description: 'Elite focus master',
    xpRequired: 6000,
    xpPerLevel: 1000,
  },
  diamond: {
    tier: 'diamond',
    name: 'Diamond',
    emoji: '💠',
    color: '#B9F2FF',
    gradient: 'linear-gradient(135deg, #B9F2FF, #00BFFF)',
    description: 'Brilliant dedication',
    xpRequired: 9000,
    xpPerLevel: 1333,
  },
  master: {
    tier: 'master',
    name: 'Master',
    emoji: '👑',
    color: '#9333EA',
    gradient: 'linear-gradient(135deg, #9333EA, #C084FC)',
    description: 'True mastery achieved',
    xpRequired: 13000,
    xpPerLevel: 1667,
  },
  grandmaster: {
    tier: 'grandmaster',
    name: 'Grandmaster',
    emoji: '🌟',
    color: '#FF6B6B',
    gradient: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)',
    description: 'Legendary focus champion',
    xpRequired: 18000,
    xpPerLevel: 2000,
  },
}

export const FEATURE_UNLOCKS: FeatureUnlock[] = [
  {
    level: 2,
    feature: 'Habits',
    description: 'Track daily habits and build consistency',
    icon: '✅',
  },
  {
    level: 3,
    feature: 'Goals',
    description: 'Set and track long-term objectives',
    icon: '🎯',
  },
  {
    level: 4,
    feature: 'Ladders',
    description: 'Break big goals into small steps',
    icon: '🪜',
  },
  {
    level: 5,
    feature: 'Body Doubling',
    description: 'Focus alongside others virtually',
    icon: '👥',
  },
  {
    level: 6,
    feature: 'AI Nudges',
    description: 'Get personalized coaching messages',
    icon: '✨',
  },
  {
    level: 7,
    feature: 'Advanced Stats',
    description: 'Deep dive into your productivity patterns',
    icon: '📊',
  },
]

export const XP_REWARDS = {
  pomodoro_session: 50,
  pomodoro_per_minute: 2,
  focus_checkin: 20,
  focus_checkin_with_notes: 30,
  habit_completion: 15,
  task_completion: 10,
  daily_streak: 50,
  first_win: 25,
  onboarding: 50,
}

export function getTierForXp(xp: number): { tier: TierType; subLevel: number; progress: number } {
  const tiers: TierType[] = ['wood', 'iron', 'steel', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster']
  
  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i]
    const info = TIER_INFO[tier]
    const nextTier = tiers[i + 1]
    const nextTierXp = nextTier ? TIER_INFO[nextTier].xpRequired : Infinity
    
    if (xp < nextTierXp) {
      const xpInTier = xp - info.xpRequired
      const subLevel = Math.floor(xpInTier / info.xpPerLevel)
      const progress = (xpInTier % info.xpPerLevel) / info.xpPerLevel * 100
      
      return {
        tier,
        subLevel: Math.min(subLevel + 1, 3), // Cap at 3 (I, II, III)
        progress: Math.min(progress, 100),
      }
    }
  }
  
  // Grandmaster+
  const gmInfo = TIER_INFO.grandmaster
  const xpInTier = xp - gmInfo.xpRequired
  const subLevel = Math.floor(xpInTier / gmInfo.xpPerLevel) + 1
  const progress = (xpInTier % gmInfo.xpPerLevel) / gmInfo.xpPerLevel * 100
  
  return {
    tier: 'grandmaster',
    subLevel: Math.min(subLevel, 10),
    progress: Math.min(progress, 100),
  }
}

export function getXpForNextLevel(currentXp: number): number {
  const { tier, subLevel } = getTierForXp(currentXp)
  const info = TIER_INFO[tier]
  
  if (tier === 'grandmaster' && subLevel >= 10) {
    return currentXp + info.xpPerLevel // Keep going
  }
  
  if (subLevel >= 3) {
    // Next tier
    const tiers: TierType[] = ['wood', 'iron', 'steel', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster']
    const currentIndex = tiers.indexOf(tier)
    if (currentIndex < tiers.length - 1) {
      return TIER_INFO[tiers[currentIndex + 1]].xpRequired
    }
  }
  
  return currentXp + info.xpPerLevel - (currentXp % info.xpPerLevel)
}
