export type TierType = 'wood' | 'iron' | 'steel' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster'
export type FocusModeType = 'pomodoro' | 'focus' | null
export type XpSource = 'pomodoro_session' | 'focus_checkin' | 'habit_completion' | 'task_completion' | 'daily_streak' | 'first_win' | 'level_up' | 'onboarding'

export const TIER_ORDER: TierType[] = ['wood', 'iron', 'steel', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster']

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

// XP calculations based on sustainable progression:
// Level 1: 2 weeks (~150 XP/day * 14 days = 2100 XP)
// Level 2: 3 weeks (~150 XP/day * 21 days = 3150 XP)
// Level 3: 4 weeks (~150 XP/day * 28 days = 4200 XP)
// Each subsequent level adds 1 week (+1050 XP per level)
// Each tier has 3 sub-levels

export const TIER_INFO: Record<TierType, TierInfo> = {
  wood: {
    tier: 'wood',
    name: 'Wood',
    emoji: '🌲',
    color: '#8B4513',
    gradient: 'linear-gradient(135deg, #8B4513, #A0522D)',
    description: 'Just starting your focus journey',
    xpRequired: 0,
    xpPerLevel: 700, // Levels 1-3: 700, 1400, 2100 XP
  },
  iron: {
    tier: 'iron',
    name: 'Iron',
    emoji: '⚙️',
    color: '#4A4A4A',
    gradient: 'linear-gradient(135deg, #4A4A4A, #6B6B6B)',
    description: 'Building mental strength',
    xpRequired: 2100,
    xpPerLevel: 1050, // Levels 4-6: 3150, 4200, 5250 XP
  },
  steel: {
    tier: 'steel',
    name: 'Steel',
    emoji: '🔩',
    color: '#71797E',
    gradient: 'linear-gradient(135deg, #71797E, #939C9F)',
    description: 'Forging strong habits',
    xpRequired: 5250,
    xpPerLevel: 1400, // Levels 7-9: 6650, 8050, 9450 XP
  },
  bronze: {
    tier: 'bronze',
    name: 'Bronze',
    emoji: '🥉',
    color: '#CD7F32',
    gradient: 'linear-gradient(135deg, #CD7F32, #E5A56A)',
    description: 'Earning your stripes',
    xpRequired: 9450,
    xpPerLevel: 2100, // Levels 10-12: 11550, 13650, 15750 XP
  },
  silver: {
    tier: 'silver',
    name: 'Silver',
    emoji: '🥈',
    color: '#C0C0C0',
    gradient: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)',
    description: 'Shining with consistency',
    xpRequired: 15750,
    xpPerLevel: 2800, // Levels 13-15: 18550, 21350, 24150 XP
  },
  gold: {
    tier: 'gold',
    name: 'Gold',
    emoji: '🥇',
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700, #FFF8DC)',
    description: 'Peak performance',
    xpRequired: 24150,
    xpPerLevel: 3500, // Levels 16-18: 27650, 31150, 34650 XP
  },
  platinum: {
    tier: 'platinum',
    name: 'Platinum',
    emoji: '💎',
    color: '#E5E4E2',
    gradient: 'linear-gradient(135deg, #E5E4E2, #F5F5F5)',
    description: 'Elite focus master',
    xpRequired: 34650,
    xpPerLevel: 4200, // Levels 19-21: 38850, 43050, 47250 XP
  },
  diamond: {
    tier: 'diamond',
    name: 'Diamond',
    emoji: '💠',
    color: '#B9F2FF',
    gradient: 'linear-gradient(135deg, #B9F2FF, #00BFFF)',
    description: 'Brilliant dedication',
    xpRequired: 47250,
    xpPerLevel: 4900, // Levels 22-24: 52150, 57050, 61950 XP
  },
  master: {
    tier: 'master',
    name: 'Master',
    emoji: '👑',
    color: '#9333EA',
    gradient: 'linear-gradient(135deg, #9333EA, #C084FC)',
    description: 'True mastery achieved',
    xpRequired: 61950,
    xpPerLevel: 5600, // Levels 25-27: 67550, 73150, 78750 XP
  },
  grandmaster: {
    tier: 'grandmaster',
    name: 'Grandmaster',
    emoji: '🌟',
    color: '#FF6B6B',
    gradient: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)',
    description: 'Legendary focus champion',
    xpRequired: 78750,
    xpPerLevel: 7000, // Levels 28+: progressive
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
