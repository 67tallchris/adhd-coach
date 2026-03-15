import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import clsx from 'clsx'
import { useQueryClient } from '@tanstack/react-query'
import { useFocusStore } from '../../stores/focusStore'
import { useLevelStore } from '../../stores/levelStore'
import { FOCUS_LEVELS } from '../../types'

interface FocusInputProps {
  onClose?: () => void
  showHeader?: boolean
}

export function FocusInput({ onClose, showHeader = true }: FocusInputProps) {
  const { logFocus, lastFocusLevel, setLastFocusLevel } = useFocusStore()
  const { awardXp } = useLevelStore()
  const qc = useQueryClient()
  const [selectedLevel, setSelectedLevel] = useState<number | null>(lastFocusLevel)
  const [notes, setNotes] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [energy, setEnergy] = useState<'low' | 'medium' | 'high'>('medium')
  const [sleep, setSleep] = useState<'poor' | 'normal' | 'good'>('normal')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clean up the flash timer on unmount
  useEffect(() => () => { if (savedTimerRef.current) clearTimeout(savedTimerRef.current) }, [])

  const handleSubmit = async (level: number) => {
    setIsSubmitting(true)
    try {
      await logFocus(
        level,
        notes || undefined,
        showDetails ? { energy, sleep, mood: [] } : undefined
      )

      const xpAmount = notes ? 30 : 20
      await awardXp(
        xpAmount,
        'focus_checkin',
        `Logged focus level: ${FOCUS_LEVELS.find(f => f.level === level)?.label || level}`,
        { focusLevel: level, withNotes: !!notes }
      )

      setLastFocusLevel(level)
      setSelectedLevel(null)   // reset emoji selection back to default
      setNotes('')
      setShowDetails(false)    // collapse optional details
      setSaved(true)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => setSaved(false), 2500)
      qc.invalidateQueries({ queryKey: ['focus-dashboard'] })
      qc.invalidateQueries({ queryKey: ['focus-daily'] })
      onClose?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-brand-900/30 to-purple-900/30 rounded-2xl border border-brand-700/30 p-5">
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="text-base font-semibold text-white">How's your focus?</h3>
              <p className="text-xs text-gray-400">Track your focus throughout the day</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Saved confirmation */}
      {saved && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-emerald-900/40 border border-emerald-700/50 text-emerald-300 text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Focus logged!
        </div>
      )}

      {/* Focus Level Selection */}
      <div className="mb-4">
        <div className="flex justify-between gap-2">
          {FOCUS_LEVELS.map((focus) => (
            <button
              key={focus.level}
              onClick={() => handleSubmit(focus.level)}
              disabled={isSubmitting}
              className={clsx(
                'flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all flex-1 overflow-hidden min-w-0',
                selectedLevel === focus.level
                  ? 'bg-brand-600/30 border-2 border-brand-500 scale-105'
                  : 'bg-gray-800/40 border-2 border-transparent hover:bg-gray-700/50 hover:border-gray-600'
              )}
            >
              <span className="text-2xl leading-none">{focus.emoji}</span>
              <span className="text-xs font-medium text-gray-300 truncate w-full text-center">{focus.label}</span>
            </button>
          ))}
        </div>
      </div>


      {/* Expandable Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-gray-300 transition-colors mb-3"
      >
        {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showDetails ? 'Less options' : 'Add details (optional)'}
      </button>

      {/* Additional Context */}
      {showDetails && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Energy Level */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Energy level</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setEnergy(e)}
                  className={clsx(
                    'flex-1 text-xs px-3 py-2 rounded-lg transition-colors capitalize',
                    energy === e
                      ? 'bg-brand-800/60 text-brand-300 border border-brand-700/50'
                      : 'bg-gray-800/30 text-gray-500 hover:bg-gray-700/30 hover:text-gray-400'
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Sleep quality</label>
            <div className="flex gap-2">
              {(['poor', 'normal', 'good'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSleep(s)}
                  className={clsx(
                    'flex-1 text-xs px-3 py-2 rounded-lg transition-colors capitalize',
                    sleep === s
                      ? 'bg-purple-800/60 text-purple-300 border border-purple-700/50'
                      : 'bg-gray-800/30 text-gray-500 hover:bg-gray-700/30 hover:text-gray-400'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's affecting your focus today?"
              rows={2}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-600/50 focus:ring-1 focus:ring-brand-600/50 resize-none"
            />
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-500">
          💡 Tip: Log your focus multiple times a day to spot patterns
        </p>
      </div>
    </div>
  )
}
