// Onboarding types and data structures

export interface FeatureExperience {
  featureId: string
  featureName: string
  experienceLevel: number // 1-5 scale
}

export interface Challenge {
  id: string
  label: string
  description: string
  icon: string
  relatedFeatures: string[]
}

export interface SelectedChallenge {
  challengeId: string
  priority: number // 1-3, where 1 is highest priority
}

export interface FeatureRecommendation {
  featureId: string
  featureName: string
  description: string
  icon: string
  color: string
  reason: string
  usageGoal: string
  durationWeeks: number
  sessionsPerDay: number
  priority: number // 1 = highest
}

export interface OnboardingData {
  // Step 1: Experience Assessment
  featureExperiences: FeatureExperience[]
  
  // Step 2: Challenges
  selectedChallenges: SelectedChallenge[]
  
  // Step 3: Recommendations (generated)
  recommendations: FeatureRecommendation[]
  
  // Metadata
  completedAt?: string
  mode: 'pomodoro' | 'focus'
}

// Feature definitions for experience assessment
export const FEATURES_FOR_EXPERIENCE: { 
  id: string
  name: string
  description: string
  icon: string
}[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro Timer',
    description: 'Work in focused sprints with timed breaks',
    icon: '🍅',
  },
  {
    id: 'body-doubling',
    name: 'Body Doubling',
    description: 'Work alongside others for accountability',
    icon: '👥',
  },
  {
    id: 'goal-setting',
    name: 'Goal Setting',
    description: 'Set and track long-term objectives',
    icon: '🎯',
  },
  {
    id: 'task-lists',
    name: 'Task Lists',
    description: 'Organize and prioritize your tasks',
    icon: '📝',
  },
  {
    id: 'focus-tracking',
    name: 'Focus Tracking',
    description: 'Monitor your attention throughout the day',
    icon: '📊',
  },
]

// Challenge definitions
export const AVAILABLE_CHALLENGES: Challenge[] = [
  {
    id: 'sustained-attention',
    label: 'Staying focused for long periods',
    description: 'I struggle to maintain concentration on a single task for extended time',
    icon: '⏱️',
    relatedFeatures: ['pomodoro', 'focus-tracking', 'body-doubling'],
  },
  {
    id: 'task-initiation',
    label: 'Getting started on tasks',
    description: 'I find it hard to begin tasks, especially overwhelming ones',
    icon: '🚀',
    relatedFeatures: ['pomodoro', 'task-lists', 'body-doubling'],
  },
  {
    id: 'task-completion',
    label: 'Following through to completion',
    description: 'I start many things but struggle to finish them',
    icon: '✅',
    relatedFeatures: ['task-lists', 'goal-setting', 'pomodoro'],
  },
  {
    id: 'mental-clutter',
    label: 'Mental clutter and forgetfulness',
    description: 'Too many thoughts and ideas compete for my attention',
    icon: '🧠',
    relatedFeatures: ['task-lists', 'goal-setting', 'focus-tracking'],
  },
  {
    id: 'time-awareness',
    label: 'Time blindness',
    description: 'I lose track of time and underestimate how long things take',
    icon: '🕐',
    relatedFeatures: ['pomodoro', 'focus-tracking'],
  },
  {
    id: 'motivation',
    label: 'Inconsistent motivation',
    description: 'My motivation fluctuates wildly from day to day',
    icon: '⚡',
    relatedFeatures: ['goal-setting', 'focus-tracking', 'body-doubling'],
  },
  {
    id: 'overwhelm',
    label: 'Feeling overwhelmed',
    description: 'Big projects feel paralyzing and I don\'t know where to start',
    icon: '😰',
    relatedFeatures: ['task-lists', 'pomodoro', 'goal-setting'],
  },
  {
    id: 'accountability',
    label: 'Lack of accountability',
    description: 'I work better when others are watching or expecting results',
    icon: '👀',
    relatedFeatures: ['body-doubling', 'goal-setting', 'focus-tracking'],
  },
]

// Default recommendations based on challenges
export function generateRecommendations(
  challenges: SelectedChallenge[],
  mode: 'pomodoro' | 'focus'
): FeatureRecommendation[] {
  const challengeIds = challenges.map(c => c.challengeId)
  const recommendations: FeatureRecommendation[] = []
  
  // Count feature mentions from challenges
  const featureScores: Record<string, number> = {
    'pomodoro': 0,
    'body-doubling': 0,
    'goal-setting': 0,
    'task-lists': 0,
    'focus-tracking': 0,
  }
  
  challenges.forEach(challenge => {
    const ch = AVAILABLE_CHALLENGES.find(c => c.id === challenge.challengeId)
    if (ch) {
      ch.relatedFeatures.forEach(feature => {
        featureScores[feature] = (featureScores[feature] || 0) + 1
      })
    }
  })
  
  // Pomodoro recommendations
  if (featureScores['pomodoro'] > 0 || challengeIds.includes('task-initiation') || challengeIds.includes('time-awareness')) {
    recommendations.push({
      featureId: 'pomodoro',
      featureName: 'Pomodoro Timer',
      description: 'Work in 25-minute focused sprints with 5-minute breaks',
      icon: '🍅',
      color: 'from-red-500 to-orange-500',
      reason: 'Helps you build sustained attention and time awareness through structured intervals',
      usageGoal: 'Complete 4 Pomodoro sessions per day',
      durationWeeks: 2,
      sessionsPerDay: 4,
      priority: 1,
    })
  }
  
  // Body doubling recommendations
  if (featureScores['body-doubling'] > 0 || challengeIds.includes('accountability') || challengeIds.includes('task-initiation')) {
    recommendations.push({
      featureId: 'body-doubling',
      featureName: 'Body Doubling',
      description: 'Work alongside others in virtual focus sessions',
      icon: '👥',
      color: 'from-blue-500 to-purple-500',
      reason: 'Provides external accountability and reduces the pressure of working alone',
      usageGoal: 'Join 2 body doubling sessions per week',
      durationWeeks: 2,
      sessionsPerDay: 0,
      priority: 2,
    })
  }
  
  // Task lists recommendations
  if (featureScores['task-lists'] > 0 || challengeIds.includes('mental-clutter') || challengeIds.includes('overwhelm')) {
    recommendations.push({
      featureId: 'task-lists',
      featureName: 'Task Lists & Brain Dump',
      description: 'Capture every thought and organize your tasks',
      icon: '📝',
      color: 'from-violet-500 to-purple-500',
      reason: 'Clears mental clutter by externalizing your thoughts and priorities',
      usageGoal: 'Do a brain dump daily and review tasks each morning',
      durationWeeks: 1,
      sessionsPerDay: 2,
      priority: 1,
    })
  }
  
  // Goal setting recommendations
  if (featureScores['goal-setting'] > 0 || challengeIds.includes('motivation') || challengeIds.includes('task-completion')) {
    recommendations.push({
      featureId: 'goal-setting',
      featureName: 'Goal Setting',
      description: 'Set meaningful long-term objectives',
      icon: '🎯',
      color: 'from-orange-500 to-yellow-500',
      reason: 'Connects daily actions to meaningful outcomes for sustained motivation',
      usageGoal: 'Define 1-3 goals and review progress weekly',
      durationWeeks: 2,
      sessionsPerDay: 0,
      priority: 2,
    })
  }
  
  // Focus tracking recommendations
  if (featureScores['focus-tracking'] > 0 || challengeIds.includes('sustained-attention') || challengeIds.includes('time-awareness')) {
    recommendations.push({
      featureId: 'focus-tracking',
      featureName: 'Focus Tracking',
      description: 'Log your focus levels to discover patterns',
      icon: '📊',
      color: 'from-rose-500 to-pink-500',
      reason: 'Builds self-awareness about when and how you focus best',
      usageGoal: 'Log focus 3 times per day at random intervals',
      durationWeeks: 2,
      sessionsPerDay: 3,
      priority: mode === 'focus' ? 1 : 3,
    })
  }
  
  // Sort by priority
  recommendations.sort((a, b) => a.priority - b.priority)
  
  // Add priority numbers based on final order
  recommendations.forEach((rec, index) => {
    rec.priority = index + 1
  })
  
  return recommendations
}
