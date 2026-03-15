import { create } from 'zustand'
import { levelsApi } from '../api/levels'
import type { UserLevelResponse } from '../api/levels'

interface LevelState {
  level: UserLevelResponse | null
  isLoading: boolean
  error: string | null
  showLevelUpModal: boolean
  lastLevelUp: { oldTier: string; newTier: string } | null
  fetchLevel: () => Promise<void>
  awardXp: (amount: number, source: string, description: string, metadata?: Record<string, any>) => Promise<UserLevelResponse | null>
  setFocusMode: (mode: 'pomodoro' | 'focus') => Promise<void>
  setShowLevelUpModal: (show: boolean) => void
}

export const useLevelStore = create<LevelState>((set) => ({
  level: null,
  isLoading: false,
  error: null,
  showLevelUpModal: false,
  lastLevelUp: null,

  setShowLevelUpModal: (show) => {
    set({ showLevelUpModal: show })
  },

  fetchLevel: async () => {
    set({ isLoading: true, error: null })
    try {
      const level = await levelsApi.getLevel()
      set({ level, isLoading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch level', isLoading: false })
    }
  },

  awardXp: async (amount, source, description, metadata) => {
    try {
      const result = await levelsApi.awardXp(amount, source, description, metadata)
      
      // Check if level up occurred
      if (result.levelUp) {
        set({
          level: result,
          showLevelUpModal: true,
          lastLevelUp: {
            oldTier: result.oldTier || 'unknown',
            newTier: result.newTier || result.tier,
          },
        })
      } else {
        set({ level: result })
      }
      
      return result
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to award XP' })
      return null
    }
  },

  setFocusMode: async (mode) => {
    try {
      const result = await levelsApi.setFocusMode(mode)
      set((state) => ({
        level: state.level ? { ...state.level, ...result } : null,
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to set focus mode' })
      throw error
    }
  },
}))

// Auto-fetch on initialization (for non-SSR)
if (typeof window !== 'undefined') {
  // Small delay to ensure app is ready
  setTimeout(() => {
    useLevelStore.getState().fetchLevel()
  }, 100)
}
