import { useState } from 'react'
import { X, Play, RotateCcw, Square, Coffee, MessageCircle } from 'lucide-react'
import clsx from 'clsx'
import { DISTRACTION_TYPES, type DistractionType, type DistractionAction } from '../../types'

interface DistractionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    distractionType: DistractionType
    notes?: string
    action: DistractionAction
  }) => void
  timeRemaining?: string
}

const ACTIONS: { id: DistractionAction; label: string; icon: React.ReactNode; color: string; description: string }[] = [
  { 
    id: 'resumed', 
    label: 'Resume', 
    icon: <Play className="w-4 h-4" />,
    color: 'brand',
    description: 'Continue where you left off'
  },
  { 
    id: 'restarted', 
    label: 'Restart', 
    icon: <RotateCcw className="w-4 h-4" />,
    color: 'blue',
    description: 'Start a fresh session'
  },
  { 
    id: 'took_break', 
    label: 'Take a Break', 
    icon: <Coffee className="w-4 h-4" />,
    color: 'green',
    description: 'Step away and come back later'
  },
  { 
    id: 'abandoned', 
    label: "That's Enough", 
    icon: <Square className="w-4 h-4" />,
    color: 'gray',
    description: 'End session, no judgment'
  },
]

const ENCOURAGEMENTS = [
  "It's okay! Distractions happen to everyone.",
  "Your brain is learning. This is part of the process.",
  "Notice it, name it, and gently come back.",
  "Every time you notice a distraction, that's a win.",
  "Be kind to yourself. This is hard work.",
  "The fact that you noticed means you're making progress.",
]

export function DistractionModal({ isOpen, onClose, onSubmit, timeRemaining }: DistractionModalProps) {
  const [selectedType, setSelectedType] = useState<DistractionType | null>(null)
  const [notes, setNotes] = useState('')
  const [selectedAction, setSelectedAction] = useState<DistractionAction | null>(null)
  const [showEncouragement, setShowEncouragement] = useState(true)

  if (!isOpen) return null

  const encouragement = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]

  const handleSubmit = () => {
    if (selectedType && selectedAction) {
      onSubmit({
        distractionType: selectedType,
        notes: notes.trim() || undefined,
        action: selectedAction,
      })
      // Reset state
      setSelectedType(null)
      setNotes('')
      setSelectedAction(null)
      onClose()
    }
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      brand: 'bg-brand-600/20 border-brand-600 text-brand-400 hover:bg-brand-600/30',
      blue: 'bg-blue-600/20 border-blue-600 text-blue-400 hover:bg-blue-600/30',
      green: 'bg-green-600/20 border-green-600 text-green-400 hover:bg-green-600/30',
      gray: 'bg-gray-600/20 border-gray-600 text-gray-400 hover:bg-gray-600/30',
      red: 'bg-red-600/20 border-red-600 text-red-400 hover:bg-red-600/30',
      orange: 'bg-orange-600/20 border-orange-600 text-orange-400 hover:bg-orange-600/30',
      purple: 'bg-purple-600/20 border-purple-600 text-purple-400 hover:bg-purple-600/30',
    }
    return colors[color] || colors.brand
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-600/20 text-amber-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Got Distracted?</h2>
              <p className="text-xs text-gray-500">It happens. Let's figure out what helped.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Encouragement */}
          {showEncouragement && (
            <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700/30 rounded-xl p-4">
              <p className="text-sm text-amber-200 italic">{encouragement}</p>
              <button
                onClick={() => setShowEncouragement(false)}
                className="text-xs text-amber-400/60 hover:text-amber-400 mt-2"
              >
                Don't show encouragement
              </button>
            </div>
          )}

          {/* What pulled you away? */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">What pulled you away?</h3>
            <div className="grid grid-cols-2 gap-2">
              {DISTRACTION_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={clsx(
                    'p-3 rounded-xl border text-left transition-all',
                    selectedType === type.id
                      ? getColorClasses('amber')
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  )}
                >
                  <span className="text-xl mb-1 block">{type.icon}</span>
                  <span className={clsx(
                    'text-sm font-medium',
                    selectedType === type.id ? 'text-amber-200' : 'text-gray-300'
                  )}>
                    {type.label}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Optional notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              What happened? <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down what distracted you..."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none"
            />
          </div>

          {/* What would you like to do? */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">What would you like to do?</h3>
            <div className="space-y-2">
              {ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setSelectedAction(action.id)}
                  className={clsx(
                    'w-full p-4 rounded-xl border text-left transition-all',
                    selectedAction === action.id
                      ? getColorClasses(action.color)
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      selectedAction === action.id ? 'bg-white/10' : 'bg-gray-700/50'
                    )}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          'text-sm font-semibold',
                          selectedAction === action.id ? 'text-white' : 'text-gray-300'
                        )}>
                          {action.label}
                        </span>
                        {action.id === 'resumed' && timeRemaining && (
                          <span className="text-xs text-gray-500">
                            ({timeRemaining} left)
                          </span>
                        )}
                      </div>
                      <p className={clsx(
                        'text-xs mt-0.5',
                        selectedAction === action.id ? 'text-white/70' : 'text-gray-500'
                      )}>
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedType || !selectedAction}
            className={clsx(
              'px-6 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedType && selectedAction
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            )}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
