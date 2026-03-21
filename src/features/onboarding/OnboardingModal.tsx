import { useState } from 'react'
import { type FeatureExperience, type SelectedChallenge, type FeatureRecommendation, generateRecommendations, type OnboardingData } from '../../types/onboarding'
import { ExperienceAssessment } from './ExperienceAssessment'
import { ChallengesAssessment } from './ChallengesAssessment'
import { Recommendations } from './Recommendations'
import { useLevelStore } from '../../stores/levelStore'

interface OnboardingModalProps {
  onComplete?: () => void
}

type OnboardingStep = 'mode' | 'experience' | 'challenges' | 'recommendations'

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('mode')
  const [selectedMode, setSelectedMode] = useState<'pomodoro' | 'focus' | null>(null)
  const [featureExperiences, setFeatureExperiences] = useState<FeatureExperience[]>([])
  const [selectedChallenges, setSelectedChallenges] = useState<SelectedChallenge[]>([])
  const [recommendations, setRecommendations] = useState<FeatureRecommendation[]>([])

  const { setFocusMode, saveOnboardingData } = useLevelStore()

  const handleModeSelect = (mode: 'pomodoro' | 'focus') => {
    setSelectedMode(mode)
  }

  const handleModeSubmit = async () => {
    if (!selectedMode) return
    setCurrentStep('experience')
  }

  const handleExperienceChange = (experiences: FeatureExperience[]) => {
    setFeatureExperiences(experiences)
  }

  const handleChallengesChange = (challenges: SelectedChallenge[]) => {
    setSelectedChallenges(challenges)
  }

  const handleChallengesComplete = () => {
    // Generate recommendations based on challenges and mode
    if (selectedMode) {
      const recs = generateRecommendations(selectedChallenges, selectedMode)
      setRecommendations(recs)
      setCurrentStep('recommendations')
    }
  }

  const handleOnboardingComplete = async () => {
    if (!selectedMode) return

    try {
      // Save onboarding data
      await setFocusMode(selectedMode)
      
      // Create complete onboarding data object
      const onboardingData: OnboardingData = {
        featureExperiences,
        selectedChallenges,
        recommendations,
        completedAt: new Date().toISOString(),
        mode: selectedMode,
      }
      
      // Save to store (and eventually to backend)
      saveOnboardingData(onboardingData)
      
      onComplete?.()
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep === 'recommendations') {
      setCurrentStep('challenges')
    } else if (currentStep === 'challenges') {
      setCurrentStep('experience')
    } else if (currentStep === 'experience') {
      setCurrentStep('mode')
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'mode':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-3">
                Welcome to ADHD Coach! 🎉
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Choose your primary focus style to get started. You can unlock the other mode at level 3.
              </p>
            </div>

            <ModeSelection
              selectedMode={selectedMode}
              onSelect={handleModeSelect}
              onSubmit={handleModeSubmit}
            />
          </div>
        )

      case 'experience':
        return (
          <>
            <ProgressIndicator currentStep={2} totalSteps={4} />
            <ExperienceAssessment
              experiences={featureExperiences}
              onChange={handleExperienceChange}
              onNext={() => setCurrentStep('challenges')}
            />
          </>
        )

      case 'challenges':
        return (
          <>
            <ProgressIndicator currentStep={3} totalSteps={4} />
            <ChallengesAssessment
              selectedChallenges={selectedChallenges}
              onChange={handleChallengesChange}
              onNext={handleChallengesComplete}
              onBack={goToPreviousStep}
            />
          </>
        )

      case 'recommendations':
        return (
          <>
            <ProgressIndicator currentStep={4} totalSteps={4} />
            <Recommendations
              recommendations={recommendations}
              onComplete={handleOnboardingComplete}
              onBack={goToPreviousStep}
            />
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl border border-gray-700 w-full max-w-4xl p-6 sm:p-8 my-8">
        {renderStep()}
      </div>
    </div>
  )
}

interface ModeSelectionProps {
  selectedMode: 'pomodoro' | 'focus' | null
  onSelect: (mode: 'pomodoro' | 'focus') => void
  onSubmit: () => void
}

function ModeSelection({ selectedMode, onSelect, onSubmit }: ModeSelectionProps) {
  const modes = [
    {
      id: 'pomodoro' as const,
      icon: '🍅',
      title: 'Pomodoro Mode',
      description: 'Focus in timed sessions (typically 25 min) with breaks in between',
      benefits: [
        'Structured work/break cycles',
        'Great for deep focus sessions',
        'Builds time awareness',
        'Prevents burnout',
      ],
      color: 'from-red-900/40 to-orange-900/40',
      borderColor: 'border-red-700/40',
      selectedColor: 'border-red-500',
    },
    {
      id: 'focus' as const,
      icon: '🎯',
      title: 'Focus Tracking Mode',
      description: 'Log your focus level throughout the day to discover patterns',
      benefits: [
        'Track focus fluctuations',
        'Discover what helps you focus',
        'Flexible, no timer pressure',
        'Builds self-awareness',
      ],
      color: 'from-brand-900/40 to-purple-900/40',
      borderColor: 'border-brand-700/40',
      selectedColor: 'border-brand-500',
    },
  ]

  return (
    <>
      {/* Mode Cards */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className={`
              relative p-4 sm:p-6 rounded-2xl border-2 text-left transition-all duration-200
              bg-gradient-to-br ${mode.color} ${mode.borderColor}
              ${selectedMode === mode.id 
                ? `${mode.selectedColor} ring-2 ring-offset-2 ring-offset-gray-900` 
                : 'hover:border-gray-600'
              }
            `}
          >
            {selectedMode === mode.id && (
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{mode.icon}</div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{mode.title}</h3>
            <p className="text-sm text-gray-400 mb-4">{mode.description}</p>

            <ul className="space-y-1.5 sm:space-y-2">
              {mode.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-300">
                  <span className="text-green-400 mt-0.5">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-3 sm:p-4 mb-6">
        <p className="text-xs sm:text-sm text-blue-300">
          💡 <strong>Not sure?</strong> Both modes work great! Pomodoro is perfect if you like structure,
          while Focus Tracking is ideal if you prefer flexibility. You'll unlock both at level 3!
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={onSubmit}
          disabled={!selectedMode}
          className={`
            px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all
            ${selectedMode
              ? 'bg-brand-600 text-white hover:bg-brand-500 hover:scale-105'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Continue
        </button>
      </div>
    </>
  )
}

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="mb-6">
      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Step {currentStep} of {totalSteps}</span>
        <div className="flex items-center gap-1">
          {currentStep > 1 && (
            <span>Getting closer!</span>
          )}
        </div>
      </div>
    </div>
  )
}
