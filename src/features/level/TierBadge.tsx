import clsx from 'clsx'
import type { TierType } from '../../types/levels'
import { TIER_INFO } from '../../types/levels'

interface TierBadgeProps {
  tier: TierType
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

export function TierBadge({ tier, size = 'md', showName = false, className }: TierBadgeProps) {
  const info = TIER_INFO[tier as keyof typeof TIER_INFO]
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center font-bold shrink-0',
        sizeClasses[size],
        className
      )}
      style={{ background: info.gradient }}
      title={`${info.name}: ${info.description}`}
    >
      <span className="drop-shadow-lg">{info.emoji}</span>
      
      {showName && (
        <span className="ml-2 text-white font-medium">{info.name}</span>
      )}
    </div>
  )
}
