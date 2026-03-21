import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Lock, Check, Sparkles } from 'lucide-react'
import { levelsApi } from '../../api/levels'
import { TierBadge } from './TierBadge'
import { TIER_INFO, TIER_ORDER, type TierType } from '../../types/levels'
import clsx from 'clsx'

interface TierRoadmapModalProps {
  onClose: () => void
}

export function TierRoadmapModal({ onClose }: TierRoadmapModalProps) {
  const { data: level } = useQuery({
    queryKey: ['user-level'],
    queryFn: () => levelsApi.getLevel(),
  })

  const currentTierIndex = level ? TIER_ORDER.indexOf(level.tier as TierType) : 0
  const currentLevel = level?.level || 1

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl border border-gray-700 w-full max-w-5xl p-6 sm:p-8 my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Focus Tier Roadmap</h2>
            <p className="text-sm text-gray-400 mt-1">
              Your journey from Wood to Grandmaster
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Tier Highlight */}
        {level && (
          <div className="mb-8 p-4 bg-gradient-to-r from-brand-900/30 to-purple-900/30 border border-brand-700/40 rounded-2xl">
            <div className="flex items-center gap-4">
              <TierBadge tier={level.tier as keyof typeof TIER_INFO} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">
                    {TIER_INFO[level.tier as keyof typeof TIER_INFO].name} {level.level % 3 || 3}
                  </h3>
                  <span className="text-xs text-brand-400 px-2 py-0.5 bg-brand-900/50 rounded-full">
                    Current
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {level.xpToNextLevel} XP to next stage · Level {level.level}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tier Roadmap */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {TIER_ORDER.map((tier, index) => {
            const info = TIER_INFO[tier]
            const isUnlocked = index <= currentTierIndex
            const isCurrentTier = index === currentTierIndex
            const isNextTier = index === currentTierIndex + 1

            return (
              <TierRow
                key={tier}
                tier={tier}
                info={info}
                index={index}
                isUnlocked={isUnlocked}
                isCurrentTier={isCurrentTier}
                isNextTier={isNextTier}
                currentLevel={currentLevel}
              />
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-800 flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-500" />
            <span>Current tier</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Unlocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-600" />
            <span>Locked</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Next milestone</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface TierRowProps {
  tier: TierType
  info: typeof TIER_INFO[TierType]
  index: number
  isUnlocked: boolean
  isCurrentTier: boolean
  isNextTier: boolean
  currentLevel: number
}

function TierRow({ tier, info, index, isUnlocked, isCurrentTier, isNextTier, currentLevel }: TierRowProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Calculate levels for this tier (each tier has 3 sub-levels)
  const tierStartLevel = index * 3 + 1
  const tierLevels = [tierStartLevel, tierStartLevel + 1, tierStartLevel + 2]

  return (
    <div
      className={clsx(
        'relative rounded-2xl border transition-all duration-200 overflow-hidden',
        isCurrentTier
          ? 'bg-gradient-to-r from-brand-900/30 to-brand-800/20 border-brand-600/50'
          : isUnlocked
            ? 'bg-gray-800/40 border-gray-700/50'
            : 'bg-gray-900/40 border-gray-800/50 opacity-60'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Next Tier Glow */}
      {isNextTier && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-pink-900/10 pointer-events-none" />
      )}

      <div className="relative z-10 p-4">
        <div className="flex items-center gap-4">
          {/* Tier Badge */}
          <div className="shrink-0">
            <TierBadge tier={tier} size="md" />
          </div>

          {/* Tier Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-white">{info.name}</h4>
              {isCurrentTier && (
                <span className="text-xs text-brand-400 px-2 py-0.5 bg-brand-900/50 rounded-full">
                  Current
                </span>
              )}
              {isNextTier && (
                <span className="text-xs text-purple-400 px-2 py-0.5 bg-purple-900/50 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Next
                </span>
              )}
              {!isUnlocked && (
                <Lock className="w-3.5 h-3.5 text-gray-600" />
              )}
              {isUnlocked && !isCurrentTier && (
                <Check className="w-3.5 h-3.5 text-green-400" />
              )}
            </div>
            <p className={clsx(
              'text-sm',
              isUnlocked ? 'text-gray-400' : 'text-gray-600'
            )}>
              {info.description}
            </p>
          </div>

          {/* XP Required */}
          <div className="text-right shrink-0">
            <p className={clsx(
              'text-sm font-medium',
              isUnlocked ? 'text-white' : 'text-gray-600'
            )}>
              {info.xpRequired.toLocaleString()} XP
            </p>
            <p className="text-xs text-gray-500">to unlock</p>
          </div>
        </div>

        {/* Hover Details */}
        {isHovered && isUnlocked && (
          <div className="mt-4 pt-4 border-t border-gray-700/50 grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-gray-500 mb-1">Sub-levels</p>
              <div className="flex gap-1">
                {tierLevels.map(lvl => (
                  <span
                    key={lvl}
                    className={clsx(
                      'px-2 py-1 rounded',
                      lvl <= currentLevel
                        ? 'bg-brand-600/20 text-brand-400'
                        : 'bg-gray-700/50 text-gray-500'
                    )}
                  >
                    {lvl}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-1">XP per level</p>
              <p className="text-white">{info.xpPerLevel.toLocaleString()} XP</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Gradient</p>
              <div
                className="h-6 rounded-lg"
                style={{ background: info.gradient }}
              />
            </div>
          </div>
        )}

        {/* Locked Overlay */}
        {!isUnlocked && (
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px] flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Complete previous tiers to unlock</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
