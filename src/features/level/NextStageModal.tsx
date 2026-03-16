import { useState } from 'react'
import { X, Trophy, Sparkles, ArrowRight } from 'lucide-react'
import { useLevelStore } from '../../stores/levelStore'
import { TIER_INFO, TIER_ORDER, type TierType } from '../../types/levels'
import { TierBadge } from './TierBadge'

interface NextStageModalProps {
  onClose?: () => void
}

interface StageInfo {
  tier: TierType
  name: string
  xpRequired: number
  emoji: string
  description: string
}

export function NextStageModal({ onClose }: NextStageModalProps) {
  const { level, setShowLevelUpModal } = useLevelStore()
  const [isVisible, setIsVisible] = useState(true)

  if (!level) return null

  const currentTierIndex = TIER_ORDER.indexOf(level.tier as TierType)
  
  // Get next 2 stages
  const nextStages: StageInfo[] = []
  for (let i = 1; i <= 2; i++) {
    const nextTierIndex = currentTierIndex + i
    if (nextTierIndex < TIER_ORDER.length) {
      const nextTier = TIER_ORDER[nextTierIndex]
      const info = TIER_INFO[nextTier as keyof typeof TIER_INFO]
      nextStages.push({
        tier: nextTier,
        name: info.name,
        xpRequired: info.xpRequired,
        emoji: info.emoji,
        description: info.description,
      })
    }
  }

  const xpToNext = nextStages[0]?.xpRequired ? nextStages[0].xpRequired - level.currentXp : 0
  const xpToFollowing = nextStages[1]?.xpRequired ? nextStages[1].xpRequired - level.currentXp : 0

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      setShowLevelUpModal(false)
      onClose?.()
    }, 200)
  }

  if (!isVisible || nextStages.length === 0) return null

  const currentStageInfo = TIER_INFO[level.tier as keyof typeof TIER_INFO]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl border border-brand-700/50 w-full max-w-lg p-8 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-brand-600/20 to-purple-600/20" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-600/20 border border-brand-700/40 text-brand-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Next Stages
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Your Journey Ahead 🚀
            </h2>
            <p className="text-gray-400">
              You're now <span className="text-brand-400 font-medium">{currentStageInfo.name}</span>!
              Here's what's next:
            </p>
          </div>

          {/* Next 2 Stages */}
          <div className="space-y-4 mb-8">
            {nextStages.map((stage, index) => {
              const isFirst = index === 0
              const xpNeeded = isFirst ? xpToNext : xpToFollowing

              return (
                <div
                  key={stage.tier}
                  className={clsx(
                    'rounded-2xl border p-5 transition-all',
                    isFirst
                      ? 'border-brand-600/50 bg-brand-900/20'
                      : 'border-gray-700/40 bg-gray-800/30'
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Stage Badge */}
                    <div className="shrink-0">
                      <TierBadge tier={stage.tier} size="lg" />
                    </div>

                    {/* Stage Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-white">
                          {stage.name}
                        </span>
                        {isFirst && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-700/40 text-brand-300 font-medium">
                            Next
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        {stage.description}
                      </p>

                      {/* XP Progress */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className={isFirst ? 'text-brand-400' : 'text-gray-500'}>
                              {level.currentXp.toLocaleString()} / {stage.xpRequired.toLocaleString()} XP
                            </span>
                            <span className={clsx(
                              'font-bold',
                              isFirst ? 'text-green-400' : 'text-gray-400'
                            )}>
                              {xpNeeded > 0 ? `${xpNeeded.toLocaleString()} XP needed` : 'Reached!'}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={clsx(
                                'h-full rounded-full transition-all duration-500',
                                isFirst ? 'bg-gradient-to-r from-brand-500 to-brand-400' : 'bg-gray-500'
                              )}
                              style={{
                                width: `${Math.min((level.currentXp / stage.xpRequired) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Current Stage Summary */}
          <div className="bg-gray-800/40 rounded-xl p-4 mb-6 border border-gray-700/40">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  Current: <span className="font-medium text-white">{currentStageInfo.name}</span> (Level {level.level})
                </p>
                <p className="text-xs text-gray-500">
                  {currentStageInfo.description}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">{level.currentXp.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total XP</p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleClose}
            className="w-full py-3.5 rounded-xl font-medium bg-brand-600 hover:bg-brand-500 text-white transition-colors flex items-center justify-center gap-2"
          >
            Keep Going! 💪
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function clsx(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}
