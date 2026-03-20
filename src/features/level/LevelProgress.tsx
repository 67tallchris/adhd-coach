import clsx from 'clsx'
import { useLevelStore } from '../../stores/levelStore'
import { TIER_INFO } from '../../types/levels'
import { TierBadge } from './TierBadge'

interface LevelProgressProps {
  onClick?: () => void
  compact?: boolean
}

export function LevelProgress({ onClick, compact = false }: LevelProgressProps) {
  const { level, isLoading } = useLevelStore()

  if (isLoading || !level) {
    return (
      <div className={clsx(
        'flex items-center gap-2',
        compact ? 'px-2 py-1' : 'px-3 py-2'
      )}>
        <div className="w-6 h-6 rounded-full bg-gray-700 animate-pulse" />
        {!compact && <div className="w-20 h-3 bg-gray-700 rounded-full animate-pulse" />}
      </div>
    )
  }

  const tierInfo = TIER_INFO[level.tier as keyof typeof TIER_INFO]
  const subLevel = level.level % 3 || 3

  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 rounded-lg transition-colors hover:bg-gray-800/50',
        compact ? 'px-2 py-1' : 'px-3 py-2'
      )}
    >
      <TierBadge tier={level.tier as keyof typeof TIER_INFO} size={compact ? 'sm' : 'md'} />

      {!compact && (
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-white truncate">
            {tierInfo.name} {subLevel}
          </span>
          <span className="text-xs text-gray-400 truncate">
            {level.xpToNextLevel} XP to next
          </span>
        </div>
      )}

      {compact && (
        <div className="text-xs">
          <span className="font-medium text-white">Lvl {level.level}</span>
        </div>
      )}
    </button>
  )
}
