export interface BreakActivity {
  id: string
  title: string
  description: string
  duration: 1 | 5 | 10 | 15  // minutes
  category: 'physical' | 'mental' | 'restful' | 'social' | 'nourish'
  energyLevel: 'low' | 'medium' | 'high'
  tags: string[]
  icon: string
}

export const BREAK_ACTIVITIES: BreakActivity[] = [
  // 1-minute activities
  {
    id: 'stretch-reach',
    title: 'Reach for the Sky',
    description: 'Stand up, reach your arms overhead, stretch your whole body',
    duration: 1,
    category: 'physical',
    energyLevel: 'low',
    tags: ['stretch', 'body'],
    icon: '🧘',
  },
  {
    id: 'water',
    title: 'Drink Water',
    description: 'Hydrate! Your brain works better when you\'re hydrated',
    duration: 1,
    category: 'nourish',
    energyLevel: 'low',
    tags: ['health', 'hydration'],
    icon: '💧',
  },
  {
    id: 'breathe-box',
    title: 'Box Breathing',
    description: 'Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat.',
    duration: 1,
    category: 'restful',
    energyLevel: 'low',
    tags: ['calm', 'breathing'],
    icon: '🌬️',
  },
  {
    id: 'eye-rest',
    title: '20-20-20 Eye Rest',
    description: 'Look at something 20 feet away for 20 seconds',
    duration: 1,
    category: 'restful',
    energyLevel: 'low',
    tags: ['eyes', 'screen'],
    icon: '👀',
  },
  {
    id: 'neck-rolls',
    title: 'Neck & Shoulder Release',
    description: 'Gently roll your shoulders and tilt your head side to side',
    duration: 1,
    category: 'physical',
    energyLevel: 'low',
    tags: ['stretch', 'tension'],
    icon: '💆',
  },

  // 5-minute activities
  {
    id: 'walk-around',
    title: 'Mini Walk',
    description: 'Walk around the block, up/down stairs, or through your space',
    duration: 5,
    category: 'physical',
    energyLevel: 'medium',
    tags: ['movement', 'cardio'],
    icon: '🚶',
  },
  {
    id: 'sunlight',
    title: 'Get Sunlight',
    description: 'Step outside, feel the sun, look at the sky (not directly!)',
    duration: 5,
    category: 'physical',
    energyLevel: 'low',
    tags: ['nature', 'eyes', 'mood'],
    icon: '☀️',
  },
  {
    id: 'tidy-one-thing',
    title: 'Tidy One Small Thing',
    description: 'Pick up one area - your desk, a drawer, one surface',
    duration: 5,
    category: 'mental',
    energyLevel: 'medium',
    tags: ['organize', 'accomplishment'],
    icon: '🧹',
  },
  {
    id: 'music-dance',
    title: 'Dance to One Song',
    description: 'Put on your favorite song and move however feels good',
    duration: 5,
    category: 'physical',
    energyLevel: 'high',
    tags: ['fun', 'dopamine', 'movement'],
    icon: '🎵',
  },
  {
    id: 'pet-someone',
    title: 'Pet Your Pet (or Plant)',
    description: 'Spend quality time with a living thing. Plants count!',
    duration: 5,
    category: 'social',
    energyLevel: 'low',
    tags: ['connection', 'calm'],
    icon: '🐱',
  },
  {
    id: 'healthy-snack',
    title: 'Grab a Healthy Snack',
    description: 'Something with protein or fruit. Fuel your brain.',
    duration: 5,
    category: 'nourish',
    energyLevel: 'low',
    tags: ['food', 'energy'],
    icon: '🍎',
  },
  {
    id: 'text-friend',
    title: 'Send a Quick Hello',
    description: 'Text a friend something nice. Connection boosts mood.',
    duration: 5,
    category: 'social',
    energyLevel: 'low',
    tags: ['connection', 'dopamine'],
    icon: '💬',
  },

  // 10-minute activities
  {
    id: 'power-pose',
    title: 'Power Pose & Affirmations',
    description: 'Stand tall, hands on hips. Say 3 things you\'re proud of',
    duration: 10,
    category: 'mental',
    energyLevel: 'medium',
    tags: ['confidence', 'mindset'],
    icon: '💪',
  },
  {
    id: 'quick-shower',
    title: 'Splash Face / Quick Refresh',
    description: 'Cold water on your face. Wake up your nervous system.',
    duration: 10,
    category: 'physical',
    energyLevel: 'medium',
    tags: ['refresh', 'alert'],
    icon: '🚿',
  },
  {
    id: 'meditate-short',
    title: 'Short Meditation',
    description: 'Sit quietly, focus on breath. When mind wanders, gently return.',
    duration: 10,
    category: 'restful',
    energyLevel: 'low',
    tags: ['calm', 'focus'],
    icon: '🧘',
  },
  {
    id: 'journal-dump',
    title: 'Brain Dump Journal',
    description: 'Write down everything in your head. No filter, no judgment.',
    duration: 10,
    category: 'mental',
    energyLevel: 'low',
    tags: ['clarity', 'processing'],
    icon: '📝',
  },

  // 15-minute activities
  {
    id: 'yoga-flow',
    title: 'Quick Yoga Flow',
    description: 'Follow a short yoga video or do your favorite stretches',
    duration: 15,
    category: 'physical',
    energyLevel: 'medium',
    tags: ['stretch', 'strength', 'calm'],
    icon: '🧘‍♀️',
  },
  {
    id: 'nature-walk',
    title: 'Nature Walk',
    description: 'Walk somewhere green. Notice 5 things you see, hear, feel.',
    duration: 15,
    category: 'physical',
    energyLevel: 'medium',
    tags: ['nature', 'grounding', 'movement'],
    icon: '🌳',
  },
  {
    id: 'read-fiction',
    title: 'Read Something Fun',
    description: 'A few pages of fiction. Let your brain escape somewhere else.',
    duration: 15,
    category: 'restful',
    energyLevel: 'low',
    tags: ['escape', 'enjoyment'],
    icon: '📚',
  },
  {
    id: 'creative-doodle',
    title: 'Doodle or Color',
    description: 'No goal, no skill needed. Just make marks on paper.',
    duration: 15,
    category: 'mental',
    energyLevel: 'low',
    tags: ['creative', 'calm'],
    icon: '🎨',
  },
]

export const CATEGORY_FILTERS = [
  { id: 'all', label: 'All', icon: '🎲' },
  { id: 'physical', label: 'Physical', icon: '💪' },
  { id: 'mental', label: 'Mental', icon: '🧠' },
  { id: 'restful', label: 'Restful', icon: '😌' },
  { id: 'social', label: 'Social', icon: '👋' },
  { id: 'nourish', label: 'Nourish', icon: '🍎' },
] as const

export function getActivityById(id: string): BreakActivity | undefined {
  return BREAK_ACTIVITIES.find(a => a.id === id)
}

export function getActivitiesByDuration(duration: number): BreakActivity[] {
  // Find activities that match or are shorter than the break duration
  return BREAK_ACTIVITIES.filter(a => a.duration <= duration)
}

export function getActivitiesByCategory(
  activities: BreakActivity[],
  category: string
): BreakActivity[] {
  if (category === 'all') return activities
  return activities.filter(a => a.category === category)
}

export function getActivitiesByEnergy(
  activities: BreakActivity[],
  energy: 'low' | 'medium' | 'high' | null
): BreakActivity[] {
  if (!energy) return activities
  return activities.filter(a => a.energyLevel === energy)
}
