import { useLevelStore } from '../stores/levelStore'
import { levelsApi } from '../api/levels'

export function useLevelProgress() {
  const { level, fetchLevel, awardXp, setFocusMode, showLevelUpModal, setShowLevelUpModal } = useLevelStore()

  // Check if onboarding is needed
  const needsOnboarding = level?.hasSeenOnboarding === false

  // Check if a feature is unlocked
  const isFeatureUnlocked = async (feature: string) => {
    try {
      const result = await levelsApi.checkUnlock(feature)
      return result.unlocked
    } catch {
      return false
    }
  }

  // Get required level for a feature
  const getRequiredLevel = async (feature: string) => {
    try {
      const result = await levelsApi.checkUnlock(feature)
      return result.requiredLevel
    } catch {
      return 999
    }
  }

  return {
    level,
    isLoading: !level,
    needsOnboarding,
    showLevelUpModal,
    setShowLevelUpModal,
    fetchLevel,
    awardXp,
    setFocusMode,
    isFeatureUnlocked,
    getRequiredLevel,
  }
}
