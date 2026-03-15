import { apiFetch } from './client'
import type { UserLevel, XpLog, FeatureUnlock } from '../types/levels'

export interface UserLevelResponse extends UserLevel {
  xpToNextLevel: number
  nextUnlock: FeatureUnlock | null
  levelUp?: boolean
  tierChanged?: boolean
  oldTier?: string
  newTier?: string
}

export const levelsApi = {
  getLevel: () => apiFetch<UserLevelResponse>('/levels'),

  awardXp: (amount: number, source: string, description: string, metadata?: Record<string, any>) =>
    apiFetch<UserLevelResponse>('/levels/xp', {
      method: 'POST',
      body: JSON.stringify({ amount, source, description, metadata }),
    }),

  setFocusMode: (mode: 'pomodoro' | 'focus') =>
    apiFetch<UserLevel>('/levels/mode', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    }),

  getHistory: (limit: number = 20) => apiFetch<XpLog[]>(`/levels/history?limit=${limit}`),

  getNextUnlock: () => apiFetch<FeatureUnlock & { currentLevel: number; xpRequired: number }>('/levels/next-unlock'),

  checkUnlock: (feature: string) => apiFetch<{
    unlocked: boolean
    requiredLevel: number
    currentLevel: number
    feature: string
    description: string
  }>(`/levels/unlocks/${feature}`),
}
