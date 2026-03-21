import { useState } from 'react'
import { AVAILABLE_CHALLENGES, type SelectedChallenge } from '../../types/onboarding'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'

interface ChallengesAssessmentProps {
  selectedChallenges: SelectedChallenge[]
  onChange: (challenges: SelectedChallenge[]) => void
  onNext: () => void
  onBack: () => void
}

export function ChallengesAssessment({ selectedChallenges, onChange, onNext, onBack }: ChallengesAssessmentProps) {
  const [localChallenges, setLocalChallenges] = useState<SelectedChallenge[]>(
    selectedChallenges.length > 0 ? selectedChallenges : []
  )
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null)

  const toggleChallenge = (challengeId: string) => {
    const exists = localChallenges.find(c => c.challengeId === challengeId)
    
    if (exists) {
      // Remove it and renumber priorities
      const updated = localChallenges
        .filter(c => c.challengeId !== challengeId)
        .map((c, index) => ({ ...c, priority: index + 1 }))
      setLocalChallenges(updated)
      onChange(updated)
    } else {
      // Add it with next priority number
      const updated = [...localChallenges, { challengeId, priority: localChallenges.length + 1 }]
      setLocalChallenges(updated)
      onChange(updated)
    }
  }

  const movePriority = (challengeId: string, direction: 'up' | 'down') => {
    const index = localChallenges.findIndex(c => c.challengeId === challengeId)
    if (index === -1) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= localChallenges.length) return
    
    // Swap priorities
    const updated = [...localChallenges]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp
    
    // Renumber all priorities
    updated.forEach((c, i) => {
      c.priority = i + 1
    })
    
    setLocalChallenges(updated)
    onChange(updated)
  }

  const hasSelected = localChallenges.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          What challenges do you want to work on?
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Select up to 3 challenges that resonate most with you. Order them by priority (most important first).
        </p>
      </div>

      {/* Selected Challenges Summary */}
      {localChallenges.length > 0 && (
        <div className="bg-gradient-to-r from-brand-900/30 to-purple-900/30 border border-brand-700/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-brand-300 mb-2">
            <Check className="w-4 h-4" />
            <span className="font-semibold text-sm">
              {localChallenges.length} of 3 selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {localChallenges.map((c) => {
              const challenge = AVAILABLE_CHALLENGES.find(ch => ch.id === c.challengeId)
              return (
                <span
                  key={c.challengeId}
                  className="inline-flex items-center gap-1 bg-brand-800/50 text-brand-200 px-2.5 py-1 rounded-full text-xs font-medium"
                >
                  {challenge?.icon}
                  {challenge?.label}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Challenge Cards */}
      <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
        {AVAILABLE_CHALLENGES.map((challenge) => {
          const isSelected = localChallenges.some(c => c.challengeId === challenge.id)
          const selectedChallenge = localChallenges.find(c => c.challengeId === challenge.id)
          const isExpanded = expandedChallenge === challenge.id
          const canSelectMore = localChallenges.length < 3 || isSelected

          return (
            <div
              key={challenge.id}
              className={clsx(
                'rounded-2xl border transition-all duration-200 overflow-hidden',
                isSelected
                  ? 'bg-brand-900/20 border-brand-600/50'
                  : 'bg-gray-800/40 border-gray-700/50 hover:border-gray-600'
              )}
            >
              {/* Card Header (clickable) */}
              <button
                onClick={() => setExpandedChallenge(isExpanded ? null : challenge.id)}
                className="w-full p-4 flex items-center gap-4 text-left"
              >
                {/* Icon */}
                <div className="text-2xl sm:text-3xl shrink-0">{challenge.icon}</div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className={clsx(
                    'font-semibold text-base sm:text-lg',
                    isSelected ? 'text-white' : 'text-gray-300'
                  )}>
                    {challenge.label}
                  </h3>
                  {!isExpanded && (
                    <p className="text-gray-500 text-sm truncate">{challenge.description}</p>
                  )}
                </div>

                {/* Priority Badge */}
                {isSelected && selectedChallenge && (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-brand-400 font-medium">
                      Priority #{selectedChallenge.priority}
                    </span>
                  </div>
                )}

                {/* Expand Icon */}
                <div className={clsx(
                  'text-gray-400 shrink-0',
                  isExpanded && 'rotate-180'
                )}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  <p className="text-gray-400 text-sm mb-4 pl-[52px]">
                    {challenge.description}
                  </p>
                  
                  <div className="flex items-center gap-2 pl-[52px]">
                    {/* Select Button */}
                    <button
                      onClick={() => toggleChallenge(challenge.id)}
                      disabled={!canSelectMore && !isSelected}
                      className={clsx(
                        'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                        isSelected
                          ? 'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30'
                          : canSelectMore
                            ? 'bg-brand-600 text-white hover:bg-brand-500'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      )}
                    >
                      {isSelected ? 'Remove' : 'Select'}
                    </button>

                    {/* Priority Controls */}
                    {isSelected && selectedChallenge && selectedChallenge.priority > 1 && (
                      <button
                        onClick={() => movePriority(challenge.id, 'up')}
                        className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
                        title="Move up in priority"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                    )}
                    {isSelected && selectedChallenge && selectedChallenge.priority < localChallenges.length && (
                      <button
                        onClick={() => movePriority(challenge.id, 'down')}
                        className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
                        title="Move down in priority"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Choose challenges that feel most relevant to your daily struggles. 
          We'll use these to recommend the best features for you.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-xl font-semibold text-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!hasSelected}
          className={clsx(
            'flex-1 py-4 rounded-xl font-semibold text-lg transition-all',
            hasSelected
              ? 'bg-brand-600 text-white hover:bg-brand-500 hover:scale-[1.02]'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          )}
        >
          See Your Recommendations
        </button>
      </div>
    </div>
  )
}
