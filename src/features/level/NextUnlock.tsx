import { Lock, Sparkles } from 'lucide-react'
import { useLevelStore } from '../../stores/levelStore'
import { TIER_INFO } from '../../types/levels'

export function NextUnlock() {
  const { level } = useLevelStore()

  if (!level || !level.nextUnlock) {
    return (
      <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl border border-green-700/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-600/20 text-green-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">All Features Unlocked!</h3>
        </div>
        <p className="text-sm text-gray-400">
          You've unlocked all available features. Keep earning XP to reach Grandmaster tier!
        </p>
      </div>
    )
  }

  const tierInfo = TIER_INFO[level.tier as keyof typeof TIER_INFO]
  const xpNeeded = level.xpToNextLevel || 0
  const progress = level.tierProgress

  return (
    <div className="bg-gradient-to-br from-brand-900/20 to-purple-900/20 rounded-2xl border border-brand-700/30 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gray-800/60 text-gray-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Next Unlock</h3>
            <p className="text-xs text-gray-400">
              Unlock at Level {level.nextUnlock.level}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{level.nextUnlock.icon}</p>
        </div>
      </div>

      {/* Feature Info */}
      <div className="bg-gray-800/40 rounded-xl p-4 mb-4 border border-gray-700/40">
        <h4 className="font-semibold text-white mb-1">{level.nextUnlock.feature}</h4>
        <p className="text-sm text-gray-400">{level.nextUnlock.description}</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Progress to Level {level.level + 1}</span>
          <span className="text-white font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: tierInfo.gradient,
            }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Level {level.level}</span>
          <span>{xpNeeded} XP to next level</span>
        </div>
      </div>

      {/* XP Tips */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-400 mb-2">💡 Quick XP tips:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-800/30 rounded-lg px-3 py-2">
            <span className="text-green-400 font-medium">+50 XP</span>
            <span className="text-gray-500 ml-1">Pomodoro session</span>
          </div>
          <div className="bg-gray-800/30 rounded-lg px-3 py-2">
            <span className="text-green-400 font-medium">+20 XP</span>
            <span className="text-gray-500 ml-1">Focus check-in</span>
          </div>
        </div>
      </div>
    </div>
  )
}
