import { useQuery } from '@tanstack/react-query'
import { Trophy, Sparkles, TrendingUp, Clock, Zap, Target, CheckSquare, Brain } from 'lucide-react'
import clsx from 'clsx'
import { levelsApi } from '../../api/levels'
import { TierBadge } from './TierBadge'
import { NextUnlock } from './NextUnlock'
import { TIER_INFO, XP_REWARDS } from '../../types/levels'

export function LevelDashboard() {
  const { data: level, isLoading } = useQuery({
    queryKey: ['user-level'],
    queryFn: () => levelsApi.getLevel(),
    refetchInterval: 1000 * 60, // Refresh every minute
  })

  const { data: xpHistory } = useQuery({
    queryKey: ['xp-history'],
    queryFn: () => levelsApi.getHistory(10),
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
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Your Progress</h1>
        <p className="text-sm text-gray-400">
          Track your level, earn XP, and unlock new features
        </p>
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

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Progress to next level</span>
              <span className="text-white font-medium">{level.tierProgress}%</span>
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
          </div>

          {/* XP Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/40 text-center">
              <Sparkles className="w-5 h-5 text-brand-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{level.currentXp}</p>
              <p className="text-xs text-gray-500">Total XP</p>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/40 text-center">
              <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{level.xpToNextLevel}</p>
              <p className="text-xs text-gray-500">XP to next</p>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/40 text-center">
              <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{tierInfo.name}</p>
              <p className="text-xs text-gray-500">Current tier</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Next Unlock */}
        <NextUnlock />

        {/* XP History */}
        <div className="bg-gray-800/40 rounded-2xl border border-gray-700/40 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-white">Recent XP</h3>
          </div>

          {xpHistory && xpHistory.length > 0 ? (
            <div className="space-y-2">
              {xpHistory.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg border border-gray-700/30"
                >
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      'p-2 rounded-lg',
                      log.source === 'pomodoro_session' ? 'bg-red-900/30 text-red-400' :
                      log.source === 'focus_checkin' ? 'bg-brand-900/30 text-brand-400' :
                      log.source === 'habit_completion' ? 'bg-green-900/30 text-green-400' :
                      log.source === 'task_completion' ? 'bg-blue-900/30 text-blue-400' :
                      'bg-purple-900/30 text-purple-400'
                    )}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{log.description}</p>
                      <p className="text-xs text-gray-500 capitalize">{log.source.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <span className="text-green-400 font-bold">+{log.xpAmount} XP</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No XP earned yet</p>
          )}
        </div>
      </div>

      {/* How to Earn XP */}
      <div className="bg-gradient-to-br from-brand-900/20 to-purple-900/20 rounded-2xl border border-brand-700/30 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-brand-400" />
          <h3 className="text-lg font-semibold text-white">How to Earn XP</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-xl border border-gray-700/40">
            <div className="p-2 rounded-lg bg-red-900/30 text-red-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Complete Pomodoro</p>
              <p className="text-xs text-gray-500">25-minute focus session</p>
            </div>
            <span className="text-green-400 font-bold">+{XP_REWARDS.pomodoro_session} XP</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-xl border border-gray-700/40">
            <div className="p-2 rounded-lg bg-brand-900/30 text-brand-400">
              <Target className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Focus Check-in</p>
              <p className="text-xs text-gray-500">Log your focus level</p>
            </div>
            <span className="text-green-400 font-bold">+{XP_REWARDS.focus_checkin} XP</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-xl border border-gray-700/40">
            <div className="p-2 rounded-lg bg-green-900/30 text-green-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Complete Habit</p>
              <p className="text-xs text-gray-500">Daily habit tracking</p>
            </div>
            <span className="text-green-400 font-bold">+{XP_REWARDS.habit_completion} XP</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-xl border border-gray-700/40">
            <div className="p-2 rounded-lg bg-blue-900/30 text-blue-400">
              <Brain className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Complete Task</p>
              <p className="text-xs text-gray-500">Brain dump task done</p>
            </div>
            <span className="text-green-400 font-bold">+{XP_REWARDS.task_completion} XP</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
          <p className="text-xs text-blue-300">
            💡 <strong>Tip:</strong> You also get +{XP_REWARDS.first_win} XP for your first session of the day 
            and bonus XP for daily streaks!
          </p>
        </div>
      </div>
    </div>
  )
}
