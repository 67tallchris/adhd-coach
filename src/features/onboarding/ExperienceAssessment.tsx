import { useState } from 'react'
import { FEATURES_FOR_EXPERIENCE, type FeatureExperience } from '../../types/onboarding'
import { Star } from 'lucide-react'
import clsx from 'clsx'

interface ExperienceAssessmentProps {
  experiences: FeatureExperience[]
  onChange: (experiences: FeatureExperience[]) => void
  onNext: () => void
}

export function ExperienceAssessment({ experiences, onChange, onNext }: ExperienceAssessmentProps) {
  const [localExperiences, setLocalExperiences] = useState<FeatureExperience[]>(
    experiences.length > 0 
      ? experiences 
      : FEATURES_FOR_EXPERIENCE.map(f => ({ featureId: f.id, featureName: f.name, experienceLevel: 0 }))
  )

  const handleRating = (featureId: string, rating: number) => {
    const updated = localExperiences.map(exp =>
      exp.featureId === featureId ? { ...exp, experienceLevel: rating } : exp
    )
    setLocalExperiences(updated)
    onChange(updated)
  }

  const allRated = localExperiences.every(exp => exp.experienceLevel > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Let's understand your experience level
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Rate your familiarity with each feature. There are no wrong answers — this helps us personalize your journey.
        </p>
      </div>

      {/* Experience Cards */}
      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
        {localExperiences.map((exp) => {
          const feature = FEATURES_FOR_EXPERIENCE.find(f => f.id === exp.featureId)
          if (!feature) return null

          return (
            <div
              key={exp.featureId}
              className="bg-gray-800/40 rounded-2xl border border-gray-700/50 p-4 sm:p-5"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-3xl sm:text-4xl shrink-0">{feature.icon}</div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-base sm:text-lg mb-1">
                    {feature.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">{feature.description}</p>
                  
                  {/* Rating Scale */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>No experience</span>
                      <span>Very experienced</span>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRating(exp.featureId, rating)}
                          className={clsx(
                            'flex-1 py-2 rounded-lg border transition-all duration-150',
                            'flex items-center justify-center gap-1 text-xs sm:text-sm font-medium',
                            exp.experienceLevel >= rating
                              ? 'bg-brand-600 border-brand-500 text-white'
                              : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:border-gray-500'
                          )}
                        >
                          <Star
                            className={clsx(
                              'w-3.5 h-3.5 sm:w-4 sm:h-4',
                              exp.experienceLevel >= rating ? 'fill-current' : 'fill-none'
                            )}
                          />
                          <span className="hidden sm:inline">{rating}</span>
                        </button>
                      ))}
                    </div>
                    
                    {/* Selected rating label */}
                    {exp.experienceLevel > 0 && (
                      <div className="text-xs text-brand-400 mt-1.5">
                        {exp.experienceLevel === 1 && "🌱 Just starting out"}
                        {exp.experienceLevel === 2 && "📚 Some familiarity"}
                        {exp.experienceLevel === 3 && "💪 Comfortable using it"}
                        {exp.experienceLevel === 4 && "🎯 Pretty experienced"}
                        {exp.experienceLevel === 5 && "🏆 Very experienced!"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Why we ask:</strong> Your experience levels help us tailor recommendations 
          and avoid suggesting features you've already mastered.
        </p>
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!allRated}
        className={clsx(
          'w-full py-4 rounded-xl font-semibold text-lg transition-all',
          allRated
            ? 'bg-brand-600 text-white hover:bg-brand-500 hover:scale-[1.02]'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        )}
      >
        Next: Tell us about your challenges
      </button>
    </div>
  )
}
