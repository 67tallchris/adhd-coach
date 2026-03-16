import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Trophy, Sparkles, Info } from 'lucide-react'
import { levelsApi } from '../../api/levels'
import { TierBadge } from './TierBadge'
import { NextUnlock } from './NextUnlock'
import { TIER_INFO, XP_REWARDS } from '../../types/levels'

function Tooltip({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg border border-gray-700 shadow-xl whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
}

export function LevelDashboard() {
  const { data: level, isLoading } = useQuery({
    queryKey: ['user-level'],
    queryFn: () => levelsApi.getLevel(),
    refetchInterval: 1000 * 60, // Refresh every minute
  })

  if (isLoading || !level) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-48 bg-gray-800/40 rounded-2xl"></div>
        <div className="h-64 bg-gray-800/40 rounded-2xl"></div>
      </div>
    )
  }

  const tierInfo = TIER_INFO[level.tier as keyof typeof TIER_INFO]
  const subLevel = level.level % 3 || 3

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Your Progress</h1>
          <p className="text-sm text-gray-400">
            Track your level and earn XP to unlock new features
          </p>
        </div>
        <Tooltip
          content={
            <div className="space-y-1.5 text-left">
              <div>🎯 Pomodoro: +{XP_REWARDS.pomodoro_session} XP</div>
              <div>📝 Focus check-in: +{XP_REWARDS.focus_checkin} XP</div>
              <div>✅ Habit: +{XP_REWARDS.habit_completion} XP</div>
              <div>🧠 Task: +{XP_REWARDS.task_completion} XP</div>
              <div>🔥 Daily streak: +{XP_REWARDS.daily_streak} XP</div>
            </div>
          }
        >
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">How to earn XP</span>
          </button>
        </Tooltip>
      </div>

      {/* Main Tier Display */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-3xl border border-gray-700/50 p-8">
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: tierInfo.gradient }}
        />

        <div className="relative z-10">
          {/* Tier Badge and Level */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <TierBadge tier={level.tier as keyof typeof TIER_INFO} size="lg" />
              <div>
                <h2 className="text-2xl font-bold text-white">{tierInfo.name} {subLevel}</h2>
                <p className="text-sm text-gray-400">{tierInfo.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Level</p>
              <p className="text-3xl font-bold text-white">{level.level}</p>
            </div>
          </div>

          {/* XP to Next Level - Simplified */}
          <div className="mb-4">
            <div className="text-center mb-3">
              <p className="text-3xl font-bold text-white">{level.xpToNextLevel}</p>
              <p className="text-sm text-gray-400">XP needed to reach next stage</p>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${level.tierProgress}%`,
                  background: tierInfo.gradient,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-gray-500">Current: {level.currentXp} XP</span>
              <span className="text-brand-400 font-medium">{level.tierProgress}% complete</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Tooltip
              content={
                <div className="text-left">
                  <div className="font-medium mb-1">Total XP earned</div>
                  <div className="text-gray-400">Keep completing activities to increase!</div>
                </div>
              }
            >
              <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/40 text-center cursor-help">
                <Sparkles className="w-5 h-5 text-brand-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{level.currentXp}</p>
                <p className="text-xs text-gray-500">Total XP</p>
              </div>
            </Tooltip>
            <Tooltip
              content={
                <div className="text-left">
                  <div className="font-medium mb-1">Your current tier</div>
                  <div className="text-gray-400">{tierInfo.description}</div>
                </div>
              }
            >
              <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/40 text-center cursor-help">
                <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{tierInfo.name}</p>
                <p className="text-xs text-gray-500">Current tier</p>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Next Unlock */}
      <NextUnlock />
    </div>
  )
}
