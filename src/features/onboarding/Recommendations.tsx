import { type FeatureRecommendation } from '../../types/onboarding'
import { Check, Clock, Target, Zap, ArrowRight, Lock } from 'lucide-react'
import clsx from 'clsx'

interface RecommendationsProps {
  recommendations: FeatureRecommendation[]
  onComplete: () => void
  onBack: () => void
}

export function Recommendations({ recommendations, onComplete, onBack }: RecommendationsProps) {
  const primaryRecommendation = recommendations.find(r => r.priority === 1)
  const secondaryRecommendations = recommendations.filter(r => r.priority !== 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-brand-900/40 border border-brand-700/50 text-brand-300 px-4 py-2 rounded-full mb-4">
          <Zap className="w-4 h-4" />
          <span className="font-semibold text-sm">Your Personalized Plan</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Here's your path to better focus! 🎉
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Based on your challenges, we recommend starting with these features in order.
          Complete each phase to unlock the next one.
        </p>
      </div>

      {/* Primary Recommendation - Highlighted */}
      {primaryRecommendation && (
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-900/40 to-purple-900/40 border-2 border-brand-600/50 rounded-2xl p-5 sm:p-6">
          {/* Glow Effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl" />
          
          <div className="relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-brand-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">
              <Target className="w-3.5 h-3.5" />
              START HERE
            </div>

            {/* Feature Info */}
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl sm:text-5xl">{primaryRecommendation.icon}</div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {primaryRecommendation.featureName}
                </h3>
                <p className="text-gray-400 text-sm">{primaryRecommendation.description}</p>
              </div>
            </div>

            {/* Reason */}
            <div className="bg-gray-800/60 rounded-xl p-4 mb-4">
              <p className="text-gray-300 text-sm">
                <span className="font-semibold text-brand-400">Why this first:</span> {primaryRecommendation.reason}
              </p>
            </div>

            {/* Usage Goal */}
            <div className="bg-brand-950/50 border border-brand-800/50 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Your commitment:</p>
                  <p className="text-brand-200 text-sm">{primaryRecommendation.usageGoal}</p>
                  <p className="text-gray-400 text-xs mt-2">
                    for {primaryRecommendation.durationWeeks} week{primaryRecommendation.durationWeeks > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-1/4 bg-gradient-to-r from-brand-600 to-brand-400 rounded-full" />
              </div>
              <span>Phase 1 of {recommendations.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Recommendations */}
      {secondaryRecommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white mb-3">Then unlock these features:</h3>
          
          {secondaryRecommendations.map((rec) => (
            <div
              key={rec.featureId}
              className={clsx(
                'bg-gray-800/40 border rounded-xl p-4',
                rec.priority === 2 ? 'border-purple-600/40' : 'border-gray-700/50'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Priority Number */}
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0',
                  rec.priority === 2 
                    ? 'bg-purple-600/20 text-purple-400' 
                    : 'bg-gray-700 text-gray-400'
                )}>
                  {rec.priority}
                </div>

                {/* Icon */}
                <div className="text-2xl">{rec.icon}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-sm sm:text-base mb-1">
                    {rec.featureName}
                  </h4>
                  <p className="text-gray-400 text-xs mb-2">{rec.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {rec.durationWeeks} week{rec.durationWeeks > 1 ? 's' : ''}
                    </span>
                    {rec.sessionsPerDay > 0 && (
                      <span className="flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" />
                        {rec.sessionsPerDay}x daily
                      </span>
                    )}
                    {rec.sessionsPerDay === 0 && (
                      <span className="flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" />
                        Weekly goal
                      </span>
                    )}
                  </div>
                </div>

                {/* Lock Icon */}
                <div className="text-gray-500 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-xl p-4">
        <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-blue-400" />
          How unlocking works:
        </h4>
        <ul className="space-y-2 text-xs text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold shrink-0">1.</span>
            <span>Complete your daily goal with the recommended feature (e.g., 4 Pomodoro sessions)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold shrink-0">2.</span>
            <span>Maintain consistency for the specified duration (tracked automatically)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold shrink-0">3.</span>
            <span>Unlock the next feature and continue building your productivity toolkit!</span>
          </li>
        </ul>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Remember:</strong> You don't need to master everything at once. 
          Focus on one feature at a time, and the rest will unlock naturally as you build consistency.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl font-semibold bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all text-sm sm:text-base"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          className="flex-1 py-3 rounded-xl font-semibold bg-brand-600 text-white hover:bg-brand-500 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          Let's Get Started!
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
