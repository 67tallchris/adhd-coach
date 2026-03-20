import { useState, useEffect, useRef } from 'react'
import { Flame, Trophy, Target, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'
import type { StreakStats, StreakMilestone } from '../types'

interface StreakCardProps {
  stats: StreakStats
  title: string
  subtitle?: string
  icon?: React.ReactNode
  showMilestones?: boolean
}

function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#4f5bff',
  children,
}: {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  children?: React.ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1f2937"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

function MilestoneBadge({
  milestone,
}: {
  milestone: StreakMilestone
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
        milestone.unlocked
          ? 'bg-gradient-to-t from-brand-900/30 to-brand-800/20 border border-brand-700/30'
          : 'bg-gray-800/30 border border-gray-700/20 opacity-50',
      )}
    >
      <div
        className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center',
          milestone.unlocked ? 'bg-brand-600 text-white' : 'bg-gray-700 text-gray-500',
        )}
      >
        <CheckCircle2 className="w-4 h-4" />
      </div>
      <span className={clsx('text-xs font-medium', milestone.unlocked ? 'text-white' : 'text-gray-500')}>
        {milestone.sessions}
      </span>
    </div>
  )
}

function Celebration({ show }: { show: boolean }) {
  if (!show) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {/* Simple particle celebration */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full animate-ping"
            style={{
              background: ['#4f5bff', '#22c55e', '#fbbf24', '#f43f5e'][i % 4],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: '1s',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function StreakCard({
  stats,
  title,
  subtitle,
  icon = <Flame className="w-5 h-5" />,
  showMilestones = true,
}: StreakCardProps) {
  const [justUnlocked, setJustUnlocked] = useState(false)

  const progressColor = stats.isOnTrack ? '#22c55e' : stats.progress >= 50 ? '#fbbf24' : '#4f5bff'

  // Check if a new milestone was just unlocked
  const previouslyUnlocked = useRef<number>(0)

  useEffect(() => {
    const newlyUnlocked = stats.milestones.filter(m => m.unlocked).length
    if (newlyUnlocked > previouslyUnlocked.current && newlyUnlocked > 0) {
      setJustUnlocked(true)
      setTimeout(() => setJustUnlocked(false), 2000)
    }
    previouslyUnlocked.current = newlyUnlocked
  }, [stats.milestones])

  return (
    <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl border border-gray-700/50 p-4 sm:p-5 overflow-hidden">
      <Celebration show={justUnlocked} />

      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-brand-600/20 text-brand-400 shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-white truncate">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>

        {stats.isOnTrack && (
          <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-green-900/30 border border-green-700/30 text-green-400 text-xs font-medium shrink-0 whitespace-nowrap">
            <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">On track!</span>
            <span className="sm:hidden">On track</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Progress ring */}
        <ProgressRing progress={stats.progress} size={100} color={progressColor}>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-white">{Math.round(stats.progress)}%</div>
            <div className="text-xs text-gray-500">of goal</div>
          </div>
        </ProgressRing>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-gray-800/40 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-700/40">
            <div className="flex items-center gap-1.5 sm:gap-2 text-orange-400 mb-1">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs font-medium">This Week</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-white">{stats.currentStreak}</div>
            <div className="text-xs text-gray-500">of {stats.weeklyGoal} goal</div>
          </div>

          <div className="bg-gray-800/40 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-700/40">
            <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-400 mb-1">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs font-medium">Best Week</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-white">{stats.bestStreak}</div>
            <div className="text-xs text-gray-500">Personal record</div>
          </div>

          <div className="bg-gray-800/40 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-700/40 col-span-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-blue-400 mb-1">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs font-medium">All Time</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-white">{stats.totalSessions.toLocaleString()}</div>
            <div className="text-xs text-gray-500 truncate">
              {stats.lastWeekCount > 0 && `Last week: ${stats.lastWeekCount}`}
              {stats.lastWeekCount === 0 && 'Total sessions completed'}
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      {showMilestones && stats.milestones.length > 0 && (
        <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-700/50">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">Milestones</p>
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {stats.milestones.map((milestone) => (
              <MilestoneBadge key={milestone.sessions} milestone={milestone} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
