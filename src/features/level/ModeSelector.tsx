import { useState } from 'react'
import { Timer, Focus, Check } from 'lucide-react'
import clsx from 'clsx'
import { useLevelStore } from '../../stores/levelStore'

interface ModeSelectorProps {
  onComplete?: () => void
}

export function ModeSelector({ onComplete }: ModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<'pomodoro' | 'focus' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setFocusMode } = useLevelStore()

  const modes = [
    {
      id: 'pomodoro' as const,
      icon: Timer,
      title: 'Pomodoro Mode',
      emoji: '🍅',
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
      icon: Focus,
      title: 'Focus Tracking Mode',
      emoji: '🎯',
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

  const handleSubmit = async () => {
    if (!selectedMode) return
    
    setIsSubmitting(true)
    try {
      await setFocusMode(selectedMode)
      onComplete?.()
    } catch (error) {
      console.error('Failed to set focus mode:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl border border-gray-700 w-full max-w-4xl p-8 my-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">
            Welcome to ADHD Coach! 🎉
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Choose your primary focus style to get started. You can unlock the other mode at level 3.
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={clsx(
                'relative p-6 rounded-2xl border-2 text-left transition-all duration-200',
                'bg-gradient-to-br',
                mode.color,
                mode.borderColor,
                selectedMode === mode.id
                  ? `${mode.selectedColor} ring-2 ring-offset-2 ring-offset-gray-900`
                  : 'hover:border-gray-600'
              )}
            >
              {/* Selected Check */}
              {selectedMode === mode.id && (
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}

              {/* Icon */}
              <div className="text-5xl mb-4">{mode.emoji}</div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-white mb-2">{mode.title}</h3>

              {/* Description */}
              <p className="text-sm text-gray-400 mb-4">{mode.description}</p>

              {/* Benefits */}
              <ul className="space-y-2">
                {mode.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-300">
            💡 <strong>Not sure?</strong> Both modes work great! Pomodoro is perfect if you like structure, 
            while Focus Tracking is ideal if you prefer flexibility. You'll unlock both at level 3!
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!selectedMode || isSubmitting}
            className={clsx(
              'px-8 py-4 rounded-xl font-semibold text-lg transition-all',
              selectedMode && !isSubmitting
                ? 'bg-brand-600 text-white hover:bg-brand-500 hover:scale-105'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            )}
          >
            {isSubmitting ? 'Getting Started...' : 'Start My Focus Journey!'}
          </button>
        </div>
      </div>
    </div>
  )
}
