import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Trophy, ChevronRight } from 'lucide-react'
import { levelsApi } from '../../api/levels'
import { TierBadge } from './TierBadge'
import { TierRoadmapModal } from './TierRoadmapModal'
import { TIER_INFO } from '../../types/levels'

export function TierProgressCard() {
  const [showRoadmap, setShowRoadmap] = useState(false)
  const { data: level, isLoading } = useQuery({
    queryKey: ['user-level'],
    queryFn: () => levelsApi.getLevel(),
  })

  if (isLoading || !level) {
    return (
      <div className="animate-pulse bg-gray-800/40 rounded-2xl border border-gray-700/40 p-5 h-32" />
    )
  }

  const tierInfo = TIER_INFO[level.tier as keyof typeof TIER_INFO]
  const subLevel = level.level % 3 || 3

  return (
    <>
      <div
        className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-2xl border border-gray-700/40 p-5 cursor-pointer hover:border-brand-700/50 transition-all group"
        onClick={() => setShowRoadmap(true)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TierBadge tier={level.tier as keyof typeof TIER_INFO} size="sm" />
            <div>
              <h3 className="font-semibold text-white">{tierInfo.name} {subLevel}</h3>
              <p className="text-xs text-gray-500">Level {level.level}</p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-xs text-brand-400 group-hover:text-brand-300 transition-colors">
            View Roadmap
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${level.tierProgress}%`,
                background: tierInfo.gradient,
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-gray-400">{level.currentXp.toLocaleString()} XP earned</span>
          </div>
          <span className="text-gray-500">
            {level.xpToNextLevel.toLocaleString()} XP to next
          </span>
        </div>
      </div>

      {/* Roadmap Modal */}
      {showRoadmap && <TierRoadmapModal onClose={() => setShowRoadmap(false)} />}
    </>
  )
}
