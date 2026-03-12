import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  BreakActivity,
  BREAK_ACTIVITIES,
  getActivitiesByDuration,
  getActivitiesByCategory,
  getActivitiesByEnergy,
} from './breakActivities'

interface BreakActivitiesState {
  // Preferences
  preferredCategories: string[]
  completedActivities: string[]
  energyPreference: 'low' | 'medium' | 'high' | null
  
  // Current suggestion
  currentSuggestion: BreakActivity | null
  lastSuggestionTime: number | null
  
  // Actions
  setPreferredCategories: (categories: string[]) => void
  setEnergyPreference: (energy: 'low' | 'medium' | 'high' | null) => void
  getSuggestion: (duration: number) => BreakActivity
  refreshSuggestion: (duration: number) => void
  markCompleted: (activityId: string) => void
  resetHistory: () => void
}

function getRandomActivity(activities: BreakActivity[], excludeIds: string[] = []): BreakActivity | null {
  const available = activities.filter(a => !excludeIds.includes(a.id))
  if (available.length === 0) return null
  
  const randomIndex = Math.floor(Math.random() * available.length)
  return available[randomIndex]
}

export const useBreakActivitiesStore = create<BreakActivitiesState>()(
  persist(
    (set, get) => ({
      // Defaults
      preferredCategories: [],
      completedActivities: [],
      energyPreference: null,
      currentSuggestion: null,
      lastSuggestionTime: null,
      
      setPreferredCategories: (categories) => set({ preferredCategories: categories }),
      
      setEnergyPreference: (energy) => set({ energyPreference: energy }),
      
      getSuggestion: (duration) => {
        const { preferredCategories, energyPreference, completedActivities } = get()
        
        // Get activities that fit the time
        let candidates = getActivitiesByDuration(duration)
        
        // Filter by preferred categories if set
        if (preferredCategories.length > 0) {
          const preferred = getActivitiesByCategory(candidates, preferredCategories[0])
          if (preferred.length > 0) candidates = preferred
        }
        
        // Filter by energy preference if set
        if (energyPreference) {
          const byEnergy = getActivitiesByEnergy(candidates, energyPreference)
          if (byEnergy.length > 0) candidates = byEnergy
        }
        
        // Try to get an uncompleted activity
        const suggestion = getRandomActivity(candidates, completedActivities.slice(-10))
        
        // If all activities completed recently, just pick randomly
        const finalSuggestion = suggestion || getRandomActivity(candidates) || BREAK_ACTIVITIES[0]
        
        set({
          currentSuggestion: finalSuggestion,
          lastSuggestionTime: Date.now(),
        })
        
        return finalSuggestion
      },
      
      refreshSuggestion: (duration) => {
        get().getSuggestion(duration)
      },
      
      markCompleted: (activityId) => {
        set((state) => ({
          completedActivities: [...state.completedActivities, activityId].slice(-50),
        }))
      },
      
      resetHistory: () => {
        set({ completedActivities: [] })
      },
    }),
    {
      name: 'break-activities-store',
      partialize: (state) => ({
        preferredCategories: state.preferredCategories,
        completedActivities: state.completedActivities,
        energyPreference: state.energyPreference,
      }),
    }
  )
)
