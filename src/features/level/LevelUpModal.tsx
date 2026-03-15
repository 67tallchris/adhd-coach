import { useEffect, useState } from 'react'
import { X, Trophy, Sparkles } from 'lucide-react'
import { useLevelStore } from '../../stores/levelStore'
import { TIER_INFO } from '../../types/levels'
import { TierBadge } from './TierBadge'

export function LevelUpModal() {
  const { showLevelUpModal, setShowLevelUpModal, lastLevelUp, level } = useLevelStore()
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    if (showLevelUpModal) {
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showLevelUpModal])

  if (!showLevelUpModal || !lastLevelUp || !level) return null

  const oldInfo = TIER_INFO[lastLevelUp.oldTier as keyof typeof TIER_INFO]
  const newInfo = TIER_INFO[level.tier as keyof typeof TIER_INFO]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                background: ['#4f5bff', '#22c55e', '#fbbf24', '#f43f5e', '#a855f7'][i % 5],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl border border-brand-700/50 w-full max-w-md p-8 overflow-hidden">
        {/* Glow effect */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{ background: newInfo.gradient }}
        />

        {/* Close button */}
        <button
          onClick={() => setShowLevelUpModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Level Up Badge */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-600/20 border border-brand-700/40 text-brand-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Level Up!
            </div>
          </div>

          {/* Tier Transition */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Old Tier */}
            <div className="text-center opacity-50">
              <TierBadge tier={lastLevelUp.oldTier as keyof typeof TIER_INFO} size="lg" />
              <p className="text-xs text-gray-500 mt-2">{oldInfo.name}</p>
            </div>

            {/* Arrow */}
            <div className="text-2xl text-gray-600">→</div>

            {/* New Tier */}
            <div className="text-center">
              <TierBadge tier={level.tier as keyof typeof TIER_INFO} size="lg" />
              <p className="text-xs text-brand-400 font-medium mt-2">{newInfo.name}</p>
            </div>
          </div>

          {/* Congrats Message */}
          <h2 className="text-2xl font-bold text-white mb-2">
            Congratulations! 🎉
          </h2>
          <p className="text-gray-400 mb-6">
            You've reached <span className="text-brand-400 font-medium">{newInfo.name}</span> tier!
          </p>

          {/* Tier Description */}
          <div className="bg-gray-800/40 rounded-xl p-4 mb-6 border border-gray-700/40">
            <p className="text-sm text-gray-300">{newInfo.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/40">
              <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{level.level}</p>
              <p className="text-xs text-gray-500">Current Level</p>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/40">
              <Sparkles className="w-5 h-5 text-brand-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{level.currentXp}</p>
              <p className="text-xs text-gray-500">Total XP</p>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={() => setShowLevelUpModal(false)}
            className="w-full py-3 rounded-xl font-medium bg-brand-600 hover:bg-brand-500 text-white transition-colors"
          >
            Keep Going! 💪
          </button>
        </div>
      </div>
    </div>
  )
}
